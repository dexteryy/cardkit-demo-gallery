
define([
    'mo/lang/es5',
    'mo/lang/mix',
    'dollar',
    'eventmaster',
    'mo/template'
], function(es5, _, $, event, tpl){

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
    _dark_lib = {},
    _guard_lib = {},
    _uuid = 0,
    _array_slice = [].slice,
    _array_push = [].push,
    RENDERED_MARK = 'rendered',
    BRIGHT_ID = 'bright-root-id',
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
    this._sourceTarget = opt.sourceTarget;
    this._darkRoots = [];
    this._specs = {};
    this._attrs = _.mix({}, this._modelAttrs);
    this._buffer = [];
    this._sourceData = {};
    this._contextTarget = null;
    this._contextData = null;
    this._sourceGuard = null;
    this.template = tpl.convertTpl(this._modelConfig.template);
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

    update: function(){
        this._darkRoots.forEach(function(target){
            this.updateRoot($(target));
        }, this);
        return this;
    },

    renderRoot: function(target){
        if (target.attr(this._attrs.autorender)
                || target.attr(RENDERED_MARK)) {
            return;
        }
        var data = this.prepareRoot(target);
        target.hide().after(this.template(data));
    },

    bufferRoot: function(target){
        if (target.attr(this._attrs.autorender)) {
            return;
        }
        var data = this.prepareRoot(target);
        this._bufferData(data);
    },

    updateRoot: function(target){
        exports.DarkGuard.update(target);
    },

    prepareRoot: function(target){
        return this._renderData(this.scanRoot(target));
    },

    scanRoot: function(target){
        // @note
        var bright_id = target.attr(BRIGHT_ID);
        if (!bright_id) {
            bright_id = ID_PREFIX + (++_uuid);
            target.attr(BRIGHT_ID, bright_id);
        }
        target.attr(RENDERED_MARK, true);
        _guard_lib[bright_id] = this;
        // @note
        var data = {
            id: bright_id,
            context: this._contextData
        };
        data.attr = {};
        _.each(this._attrs, function(getter, name){
            this[name] = typeof getter === 'string' 
                ? target.attr(getter) 
                : getter && getter(target);
        }, data.attr);
        this._scanComponents(data, target);
        // @note
        if (!this._sourceTarget
                && this._sourceGuard 
                && data.attr.source) {
            this._mergeSource(data, target.attr(data.attr.source));
        }
        return data;
    },

    _scanComponents: function(data, target){
        var re = {};
        _.each(this._modelComponents, function(component, name){
            var guard = component.createGuard();
            guard.changeContext(target, data);
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
                re[name] = guard.dataInBuffer();
            }
            guard.resetBuffer();
        }, this);
        data.componentData = re;
        data.contentData = this._scanContents(target);
    },

    _scanContents: function(target){
        return [].map.call(target.contents(), function(content){
            content = $(content);
            if (content[0].nodeType === 1) {
                var mark = content.attr(RENDERED_MARK),
                    buffer_id = content.attr(BRIGHT_ID),
                    buffer = this.releaseContent(buffer_id);
                return buffer || !mark && content[0].outerHTML || false;
            } else if (content[0].nodeType === 3) {
                content = content.text();
                if (/\S/.test(content)) {
                    return content;
                }
            }
            return false;
        }, this).filter(function(content){
            return content;
        });
    },

    _renderData: function(data){
        data.component = {};
        _.each(data.componentData, function(dataset, name){
            if (Array.isArray(dataset)) {
                this[name] = dataset.map(function(data){
                    return render_data(data);
                });
            } else {
                this[name] = render_data(dataset);
            }
        }, data.component);
        data.content = data.contentData.map(function(data){
            if (typeof data === 'string') {
                return data;
            }
            return render_data(data);
        }).join('');
        _dark_lib[data.id] = data;
        return data;
    },

    changeContext: function(target, data){
        this._contextTarget = target;
        this._contextData = data;
    },

    createSource: function(){
        this._sourceGuard = new exports.DarkGuard({
            sourceTarget: this,
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
        var dataset = 
            this._sourceDataset[selector] = guard.dataInBuffer();
        guard.resetBuffer();
        return dataset;
    },

    _mergeSource: function(data, source_selector){
        var source_dataset = this._sourceDataset[source_selector];
        if (source_dataset === undefined) {
            source_dataset = this.loadSource(source_selector);
        }
        return merge_source(data, source_dataset);
    },

    dataInBuffer: function(){
        var re = this._buffer.slice();
        if (this._modelConfig.unique) {
            re = re[0] || {};
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
            _content_buffer[data.id] = data;
        }, this);
    },

    releaseContent: function(buffer_id){
        var buffer = _content_buffer[buffer_id];
        delete _content_buffer[buffer_id];
        return buffer;
    }

};

DarkGuard.update = function(targets){
    $(targets).forEach(update_target);
};

function update_target(target){
    target = $(target);
    var bright_id = target.attr(BRIGHT_ID);
    var guard = _guard_lib[bright_id];
    if (!guard) {
        return;
    }
    var origin = _dark_lib[bright_id];
    if (!origin) {
        return;
    }
    guard.bufferRoot(target);
    var dataset = guard.dataInBuffer();
    guard.resetBuffer();
    merge_model(origin, 
        Array.isArray(dataset) ? dataset[0] : dataset);
}

function merge_model(origin, data){
    if (!data.id) {
        return origin;
    }
    var abort;
    // @note
    if (!origin.attr) {
        origin.attr = {};
    }
    _.each(data.attr, function(value, name){
        if (this[name] != value) {
            this[name] = value;
            abort = run_updater(data);
            if (abort === false) {
                return false;
            }
        }
    }, origin.attr);
    if (abort === false) {
        return false;
    }
    // @note
    if (!origin.contentData) {
        origin.contentData = [];
    }
    var content_changed = false;
    if (origin.contentData.length !== data.contentData.length) {
        content_changed = true;
    } else {
        _.each(data.contentData, function(content, i){
            if (typeof content === 'string') {
                if (this[i] !== content) {
                    content_changed = true;
                    return false;
                }
            } else {
                merge_model(this[i], content);
            }
        }, origin.contentData);
    }
    if (content_changed) {
        origin.contentData = data.contentData;
        abort = run_updater(data);
        if (abort === false) {
            return false;
        }
    }
    // @note
    if (!origin.componentData) {
        origin.componentData = {};
    }
    _.each(data.componentData, function(dataset, name){
        var originset = this[name];
        if (Array.isArray(dataset)) {
            var larger = originset.length < dataset.length 
                ? dataset
                : originset;
            for (var i = 0, l = larger.length; i < l; i++) {
                merge_model(originset[i], dataset[i]);
            }
        } else {
            merge_model(originset, dataset);
        }
    }, origin.componentData);
}

function run_updater(data){
    var guard = _guard_lib[data.id];
    if (guard) {
        var html = guard.template(data);
        var bright_root = $('#' + data.id);
        if (bright_root[0]) {
            bright_root.replaceWith(html);
            return false;
        }
    }
}

function merge_source(data, source_data){
    if (Array.isArray(source_data)) {
        source_data.forEach(function(source_data){
            merge_source(this, source_data);
        }, data);
        return data;
    }
    if (!source_data.id) {
        return data;
    }
    if (!data.attr) {
        data.attr = {};
    }
    _.merge(data.attr, source_data.attr);
    merge_source_components(data, source_data);
    return data;
}

function merge_source_components(data, source_data){
    if (!data.contentData) {
        data.contentData = [];
    }
    _array_push.apply(data.contentData, source_data.contentData);
    if (!data.componentData) {
        data.componentData = {};
    }
    _.each(source_data.componentData, function(source_com_dataset, name){
        if (!data[name]) {
            data[name] = {};
        }
        merge_source(data[name], source_com_dataset);
    }, data.componentData);
}

function render_data(data){
    if (!data.id) {
        return '';
    }
    var guard = _guard_lib[data.id];
    return guard.template(data);
}

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
exports.update = DarkGuard.update;

return exports;

});
