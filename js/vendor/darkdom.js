
define([
    'mo/lang/es5',
    'mo/lang/mix',
    'dollar',
    'nerv',
    'mo/template'
], function(es5, _, $, nerv, tpl){

var _defaults = {
        unique: false,
        enableSource: false,
        template: '{%= content %}'
    },
    _default_attrs = {
        autorender: 'autorender',
        source: 'source-selector'
    },
    _content_buffer = {},
    _uuid = 0,
    _array_slice = [].slice,
    _array_push = [].push,
    RENDERED_MARK = 'rendered',
    BRIGHT_ROOT_ID = 'bright-root-id',
    ID_PREFIX = '_brightRoot';

function DarkDOM(opt){
    opt = opt || {};
    this._config = _.config({}, opt, _defaults);
    this._attrs = _.mix({}, _default_attrs);
    this._components = {};
    this._contents = {};
    this.set(this._config);
}

DarkDOM.prototype = {

    set: function(opt){
        if (!opt) {
            return this;
        }
        _.config(this._config, opt, this._defaults);
        return this;
    },

    bond: function(attr, elem_attr){
        var attrs = kv_dict(attr, elem_attr);
        _.mix(this._attrs, attrs);
        return this;
    },

    contain: function(name, component, opt){
        opt = opt || {};
        if (opt.content) {
            this._contents[name] = true;
        }
        this._components[name] = component; 
        return this;
    },

    createGuard: function(){
        return new exports.DarkGuard({
            attrs: this._attrs,
            components: this._components,
            contents: this._contents,
            config: this._config
        });
    }

};

function DarkGuard(opt){
    this._modelConfig = opt.config;
    this._modelAttrs = opt.attrs;
    this._modelComponents = opt.components;
    this._modelContents = opt.contents;
    this._darkRoots = [];
    this._specs = {};
    this._attrs = _.mix({}, this._modelAttrs);
    this._buffer = [];
    this._sourceData = {};
    this._contextTarget = null;
    this._contextAttrs = null;
    this._sourceGuard = null;
    this._template = tpl.convertTpl(this._modelConfig.template);
    if (this._modelConfig.enableSource) {
        this.createSource();
    }
}

DarkGuard.prototype = {

    watch: function(targets){
        targets = $(targets, this._contextTarget);
        if (this._modelConfig.unique) {
            targets = targets.eq(0);
        }
        _array_push.apply(this._darkRoots, _array_slice.apply(targets));
        return this;
    },

    bond: function(attr, elem_attr){
        var attrs = kv_dict(attr, elem_attr);
        _.mix(this._attrs, attrs);
        return this;
    },

    delegate: function(name, spec){
        var components = kv_dict(name, spec);
        _.mix(this._specs, components);
        return this;
    },

    source: function(){
        if (!this._modelConfig.enableSource) {
            return;
        }
        return this._sourceGuard;
    },

    render: function(){
        this._darkRoots.forEach(function(target){
            this.renderRoot($(target));
        }, this);
        return this;
    },

    buffer: function(){
        this._darkRoots.forEach(function(target){
            this.bufferRoot($(target));
        }, this);
        return this;
    },

    renderRoot: function(target){
        if (target.attr(this._attrs.autorender)
                || target.attr(RENDERED_MARK)) {
            return;
        }
        var data = this.scanRoot(target);
        target.hide().after(this._template(data));
    },

    bufferRoot: function(target){
        if (target.attr(this._attrs.autorender)) {
            return;
        }
        var data = this.scanRoot(target);
        this._bufferData(data);
    },

    scanRoot: function(target){
        // @note
        var bright_root_id = ID_PREFIX + (++_uuid);
        target.attr(RENDERED_MARK, true);
        target.attr(BRIGHT_ROOT_ID, bright_root_id);
        // @note
        var attrs_data = {
            context: this._contextAttrs
        };
        _.each(this._attrs, function(getter, name){
            attrs_data[name] = typeof getter === 'string' 
                ? target.attr(getter) 
                : getter && getter(target);
        });
        // @note
        var components_data = this.componentsData(target, attrs_data);
        var contents_data = this.contentsData(target);
        // @note
        var data = {
            id: bright_root_id,
            attr: attrs_data,
            content: contents_data.join(''),
            component: components_data.html,
            componentData: components_data.data
        };
        if (this._sourceGuard && data.attr.source) {
            this._mergeSource(data, target.attr(data.attr.source));
        }
        return data;
    },

    componentsData: function(target, attrs_data){
        var re = { html: {}, data: {} };
        _.each(this._modelComponents, function(component, name){
            var guard = component.createGuard();
            guard.changeContext(target, attrs_data);
            var spec = this._specs[name];
            if (typeof spec === 'string') {
                guard.watch(spec);
            } else if (spec) {
                spec(guard);
            }
            guard.buffer();
            if (this._modelContents[name]) {
                guard.bufferContent();
            } else {
                re.html[name] = guard.htmlInBuffer();
                re.data[name] = guard.dataInBuffer();
            }
            guard.resetBuffer();
        }, this);
        return re;
    },

    contentsData: function(target){
        return [].map.call(target.contents(), function(content){
            content = $(content);
            if (content[0].nodeType === 1) {
                var mark = content.attr(RENDERED_MARK),
                    buffer_id = content.attr(BRIGHT_ROOT_ID),
                    buffer = this.releaseContent(buffer_id);
                return buffer || !mark && content[0].outerHTML || '';
            } else if (content[0].nodeType === 3) {
                return content.text();
            }
            return '';
        }, this);
    },

    changeContext: function(target, attrs){
        this._contextTarget = target;
        this._contextAttrs = attrs;
    },

    createSource: function(){
        this._sourceGuard = new exports.DarkGuard({
            attrs: this._modelAttrs,
            components: this._modelComponents,
            contents: this._modelContents,
            config: _.merge({
                enableSource: false
            }, this._modelConfig)
        });
        return this._sourceGuard;
    },

    loadSource: function(selector){
        if (!selector) {
            return;
        }
        var guard = this._sourceGuard;
        guard.watch(selector);
        guard.buffer();
        var data = this._sourceData[selector] = guard.dataInBuffer();
        guard.resetBuffer();
        return data;
    },

    _mergeSource: function(data, source_selector){
        var source_data = this._sourceData[source_selector];
        if (!source_data) {
            source_data = this.loadSource(source_selector);
        }
        _.merge(data.attr, source_data.attr);
        var merged_source_data = source_data.length 
            && source_data.reduce(function(re, data){
                if (data) {
                    re.content += data.content;
                }
                return re;
            });
        if (merged_source_data) {
            data.content += merged_source_data.content;
        }
        _.mix(data._components, source_data.components);
        return data;
    },

    dataInBuffer: function(){
        return this._buffer;
    },

    htmlInBuffer: function(){
        var re = this._buffer.map(function(data){
            return this._template(data);
        }, this);
        if (this._modelConfig.unique) {
            re = re[0];
        }
        return re;
    },

    resetBuffer: function(){
        this._buffer.length = 0;
        return this;
    },

    _bufferData: function(data){
        this._buffer.push(data);
    },

    bufferContent: function(){
        this._buffer.forEach(function(data){
            _content_buffer[data.id] = this._template(data);
        }, this);
    },

    releaseContent: function(buffer_id){
        var buffer = _content_buffer[buffer_id];
        delete _content_buffer[buffer_id];
        return buffer;
    }

};

function kv_dict(key, value){
    var dict = key;
    if (typeof dict !== 'object') {
        dict = {};
        dict[key] = value;
    }
    return dict;
}

function exports(opt){
    return new exports.DarkDOM(opt);
}

exports.DarkDOM = DarkDOM;
exports.DarkGuard = DarkGuard;

return exports;

});
