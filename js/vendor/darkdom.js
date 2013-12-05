
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
    _darkdata = {},
    _guards = {},
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

    createGuard: function(opt){
        return new exports.DarkGuard(_.mix(opt || {}, {
            attrs: this._attrs,
            components: this._components,
            contents: this._contents,
            config: this._config
        }));
    }

};

function DarkGuard(opt){
    this._modelConfig = opt.config;
    this._modelAttrs = opt.attrs;
    this._modelComponents = opt.components;
    this._modelContents = opt.contents;
    this._sourceTarget = opt.sourceTarget;
    this._contextTarget = opt.contextTarget;
    this._contextData = opt.contextData;
    this._darkRoots = [];
    this._specs = {};
    this._attrs = _.mix({}, this._modelAttrs);
    this._buffer = [];
    this._sourceData = {};
    this._sourceGuard = null;
    this.template = tpl.convertTpl(this._modelConfig.template);
    if (this._modelConfig.enableSource) {
        this.createSource(opt);
    }
}

DarkGuard.prototype = {

    watch: function(targets){
        targets = $(targets, this._contextTarget);
        if (this._modelConfig.unique) {
            targets = targets.eq(0);
        }
        _array_push.apply(this._darkRoots, 
            _array_slice.apply(targets));
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
        target.hide().after(this.createRoot(data));
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
        _guards[bright_id] = this;
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
            var guard = component.createGuard({
                contextData: data,
                contextTarget: target
            });
            var spec = this._specs[name];
            if (typeof spec === 'string') {
                guard.watch(spec);
            } else if (spec) {
                spec(guard);
            }
            guard.buffer();
            if (this._modelContents[name]) {
                guard._bufferContent();
            } else {
                re[name] = guard.releaseData();
            }
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
                    buffer = this._releaseContent(buffer_id);
                return buffer 
                    || !mark && content[0].outerHTML 
                    || false;
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
        _darkdata[data.id] = data;
        return data;
    },

    _bufferData: function(data){
        this._buffer.push(data);
    },

    releaseData: function(){
        var re = this._buffer.slice();
        if (this._modelConfig.unique) {
            re = re[0] || {};
        }
        this.resetBuffer();
        return re;
    },

    _bufferContent: function(){
        this._buffer.forEach(function(data){
            _content_buffer[data.id] = data;
        }, this);
        this.resetBuffer();
    },

    _releaseContent: function(buffer_id){
        var buffer = _content_buffer[buffer_id];
        delete _content_buffer[buffer_id];
        return buffer;
    },

    resetBuffer: function(){
        this._buffer.length = 0;
        return this;
    },

    createRoot: function(data){
        var bright_root = $(this.template(data));
        bright_root.attr(this._attrs.autorender, 'true');
        bright_root.attr('id', data.id);
        return bright_root;
    },

    createSource: function(opt){
        this._sourceGuard = new exports.DarkGuard(_.merge({
            sourceTarget: this,
            contextTarget: null,
            config: _.merge({
                enableSource: false 
            }, opt.config)
        }, opt));
        return this._sourceGuard;
    },

    scanSource: function(selector){
        if (!selector) {
            return;
        }
        var guard = this._sourceGuard;
        guard.watch(selector);
        guard.buffer();
        var dataset = guard.releaseData();
        this._sourceDataset[selector] = dataset;
        return dataset;
    },

    _mergeSource: function(data, source_selector){
        var source_dataset = this._sourceDataset[source_selector];
        if (source_dataset === undefined) {
            source_dataset = this.scanSource(source_selector);
        }
        return merge_source(data, source_dataset);
    }

};

DarkGuard.update = function(targets){
    $(targets).forEach(update_target);
};

//DarkGuard.updateData = function(target, fn){
    //target = $(target);
    //var bright_id = target.attr(BRIGHT_ID);
    //var old_data = _darkdata[bright_id];
    //fn({
        
    //});
//};

function update_target(target){
    target = $(target);
    var bright_id = target.attr(BRIGHT_ID);
    var guard = _guards[bright_id];
    if (!guard) {
        return;
    }
    var origin = _darkdata[bright_id];
    if (!origin) {
        return;
    }
    guard.bufferRoot(target);
    var dataset = guard.releaseData();
    merge_model(origin, 
        Array.isArray(dataset) ? dataset[0] : dataset);
}

function merge_model(origin, data){
    if (!data || !data.id) {
        run_updater(origin.id);
        return false;
    }
    var abort;
    _.each(data.attr, function(value, name){
        if (this[name] != value) {
            this[name] = value;
            abort = run_updater(origin.id, data);
            if (abort === false) {
                return false;
            }
        }
    }, origin.attr || (origin.attr = {}));
    if (abort === false) {
        return false;
    }
    if (compare_model_contents(
        origin.contentData || (origin.contentData = []), 
        data.contentData
    )) {
        origin.contentData = data.contentData;
        abort = run_updater(origin.id, data);
        if (abort === false) {
            return false;
        }
    }
    _.each(data.componentData, function(){
        var changed = merge_model_components.apply(this, arguments);
        if (changed) {
            abort = run_updater(origin.id, data);
            if (abort === false) {
                return false;
            }
        }
    }, origin.componentData || (origin.componentData = {}));
}

function compare_model_contents(origin, data){
    if (origin.length !== data.length) {
        return true;
    }
    var changed = false;
    _.each(data, function(content, i){
        if (typeof content === 'string') {
            if (this[i] !== content) {
                changed = true;
                return false;
            }
        } else {
            if (typeof this[i] === 'string'
                   || this[i].id !== content.id) {
                changed = true;
                return false;
            }
            merge_model(this[i], content);
        }
    }, origin);
    return changed;
}

function merge_model_components(dataset, name){
    if (!Array.isArray(dataset)) {
        merge_model(this[name] || (this[name] = {}), 
            dataset);
        return;
    }
    var changed;
    var originset = this[name] || (this[name] = []);
    var larger = originset.length < dataset.length 
        ? dataset
        : originset;
    for (var i = 0, l = larger.length; i < l; i++) {
        if (!originset[i]) {
            changed = true;
            break;
        }
        if (!dataset[i] 
                || originset[i].id === dataset[i].id) {
            merge_model(originset[i], dataset[i]);
        } else {
            changed = true;
            break;
        }
    }
    return changed;
}

function run_updater(bright_id, data){
    var old_root = $('#' + bright_id);
    if (!data) {
        old_root.remove();
        return false;
    }
    var guard = _guards[bright_id];
    if (guard && old_root[0]) {
        guard.createRoot(data).replaceAll(old_root);
        return false;
    }
}

function merge_source(data, source_data){
    if (Array.isArray(source_data)) {
        source_data.forEach(function(source_data){
            merge_source(this, source_data);
        }, data);
        return data;
    }
    if (!source_data.attr) {
        return data;
    }
    _.merge(data.attr || (data.attr = {}), 
        source_data.attr);
    _array_push.apply(data.contentData || (data.contentData = []), 
        source_data.contentData);
    _.each(source_data.componentData,
        merge_source_components, 
        data.componentData || (data.componentData = {}));
    return data;
}

function merge_source_components(dataset, name){
    if (Array.isArray(dataset)) {
        _array_push.apply(this[name] || (this[name] = []), 
            dataset);
    } else {
        merge_source(this[name] || (this[name] = {}),
            dataset);
    }
}

function render_data(data){
    if (!data.id) {
        return '';
    }
    var guard = _guards[data.id];
    return guard.createRoot(data)[0].outerHTML;
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
