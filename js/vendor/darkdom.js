
define([
    'mo/lang/es5',
    'mo/lang/mix',
    'dollar'
], function(es5, _, $){

var _defaults = {
        unique: false,
        enableSource: false,
        template: false
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
    this._updaters = {};
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

    observe: function(subject, handler){
        this._updaters[subject] = handler;
        return this;
    },

    createGuard: function(){
        return new exports.DarkGuard({
            attrs: this._attrs,
            components: this._components,
            contents: this._contents,
            updaters: this._updaters,
            options: this._config
        });
    }

};

function DarkGuard(opt){
    this._attrs = Object.create(opt.attrs);
    this._options = opt.options;
    this._config = _.mix({}, opt);
    this._updaters = {};
    this._darkRoots = [];
    this._specs = {};
    this._buffer = [];
    this._componentGuards = {};
    this._contextData = null;
    this._contextTarget = null;
    this._sourceData = {};
    this._sourceGuard = null;
    if (this._options.enableSource) {
        this.createSource(opt);
    }
}

DarkGuard.prototype = {

    watch: function(targets){
        targets = $(targets, this._contextTarget);
        if (this._options.unique) {
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

    observe: function(target, subject, handler){
        var bright_id = $(target).attr(BRIGHT_ID);
        var updaters = this._updaters[bright_id];
        if (!updaters) {
            updaters = this._updaters[bright_id] = {};
        }
        updaters[subject] = handler;
        return this;
    },

    source: function(){
        if (!this._options.enableSource) {
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
        };
        if (!this._config.sourceTarget) {
            data.context = this._contextData;
        }
        data.attr = {};
        _.each(this._attrs, function(getter, name){
            this[name] = read_attr(target, getter);
        }, data.attr);
        this._scanComponents(data, target);
        // @note
        if (!this._config.sourceTarget
                && this._sourceGuard 
                && data.attr.source) {
            this._mergeSource(data, data.attr.source);
        }
        return data;
    },

    _scanComponents: function(data, target){
        var re = {};
        _.each(this._config.components, function(component, name){
            var guard = this._componentGuards[name];
            if (!guard) {
                guard = component.createGuard();
                this._componentGuards[name] = guard;
            }
            guard._changeContext(data, target);
            guard.resetWatch();
            var spec = this._specs[name];
            if (typeof spec === 'string') {
                guard.watch(spec);
            } else if (spec) {
                spec(guard);
            }
            guard.buffer();
            if (this._config.contents[name]) {
                guard._bufferContent();
            } else {
                re[name] = guard.releaseData();
            }
        }, this);
        data.componentData = re;
        data.contentList = this._scanContents(target);
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
        data.content = data.contentList.map(function(data){
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
        if (this._options.unique) {
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

    resetWatch: function(){
        this._darkRoots.length = 0;
    },

    _changeContext: function(data, target){
        this._contextData = data;
        this._contextTarget = target;
        if (this._sourceGuard) {
            this._sourceGuard._changeContext(data);
        }
    },

    createRoot: function(data){
        var bright_root = $(this.template(data));
        bright_root.attr(this._attrs.autorender, 'true');
        bright_root.attr('id', data.id);
        return bright_root;
    },

    triggerUpdate: function(changes){
        var handler;
        var subject = changes.type;
        var updaters = this._updaters[changes.rootId] 
            || this._config.updaters;
        if (changes.name) {
            subject += ':' + changes.name;
            handler = updaters[subject];
        }
        if (!handler) {
            handler = updaters[changes.type];
        }
        if (!handler) {
            handler = this.defaultUpdater;
        }
        return handler.call(this, changes);
    },

    defaultUpdater: function(changes){
        var abort = changes.type !== 'component';
        if (!changes.data) {
            $(changes.root).remove();
            return abort;
        }
        if (changes.root) {
            this.createRoot(changes.data).replaceAll(changes.root);
            return abort;
        }
    },

    template: function(data){
        return (this._options.template
            || this.defaultTemplate)(data);
    },

    defaultTemplate: function(data){
        return '<span>' + data.content + '</span>';
    },

    gc: function(){
        _.each(_guards, check_gc);
    },

    setSource: function(target, fn){
        var selector = read_attr(target, this._attrs.source);
        var dataset = this._sourceDataset[selector];
        this._sourceDataset[selector] = fn(dataset);
    },

    createSource: function(opt){
        this._sourceGuard = new exports.DarkGuard(_.merge({
            sourceTarget: this,
            options: _.merge({
                enableSource: false 
            }, opt.options)
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

DarkGuard.observe = function(target, subject, handler){
    target = $(target);
    var bright_id = target.attr(BRIGHT_ID);
    var guard = _guards[bright_id];
    if (guard) {
        guard.observe(target, subject, handler);
    }
};

DarkGuard.setSource = function(target, fn){
    target = $(target);
    var bright_id = target.attr(BRIGHT_ID);
    var guard = _guards[bright_id];
    if (guard) {
        guard.setSource(target, fn);
    }
};

function update_target(target){
    target = $(target);
    var bright_id = target.attr(BRIGHT_ID);
    if (!target.parent()[0]) {
        return trigger_update(bright_id, null, {
            type: 'remove'
        });
    }
    var guard = _guards[bright_id];
    var origin = _darkdata[bright_id];
    if (!guard || !origin) {
        delete _guards[bright_id];
        delete _darkdata[bright_id];
        return;
    }
    guard.bufferRoot(target);
    var dataset = guard.releaseData();
    compare_model(origin, 
        Array.isArray(dataset) ? dataset[0] : dataset);
    guard.gc();
}

function compare_model(origin, data){
    if (!data || !data.id) {
        return trigger_update(origin.id, null, {
            type: 'remove'
        });
    }
    var abort;
    _.each(data.attr, function(value, name){
        if (this[name] != value) {
            abort = trigger_update(data.id, data, {
                type: 'attr',
                name: name,
                oldValue: this[name],
                newValue: value
            });
            if (abort === false) {
                return false;
            }
        }
    }, origin.attr || (origin.attr = {}));
    if (abort === false) {
        return;
    }
    if (compare_model_contents(
        origin.contentList || (origin.contentList = []), 
        data.contentList
    )) {
        abort = trigger_update(data.id, data, {
            type: 'content',
            oldValue: origin.contentList,
            newValue: data.contentList
        });
        if (abort === false) {
            return;
        }
    }
    _.each(data.componentData, function(dataset, name){
        var changed = compare_model_components.apply(this, arguments);
        if (changed) {
            abort = trigger_update(data.id, data, {
                type: 'component',
                name: name,
                oldValue: this[name],
                newValue: dataset
            });
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
                   || !content.id
                   || this[i].id !== content.id) {
                changed = true;
                return false;
            }
            compare_model(this[i], content);
        }
    }, origin);
    return changed;
}

function compare_model_components(dataset, name){
    if (!Array.isArray(dataset)) {
        compare_model(this[name] || (this[name] = {}), 
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
            compare_model(originset[i], dataset[i]);
        } else {
            changed = true;
            break;
        }
    }
    return changed;
}

function trigger_update(bright_id, data, changes){
    if (!bright_id) {
        return;
    }
    var bright_root = $('#' + bright_id);
    var guard = _guards[bright_id];
    if (guard) {
        return guard.triggerUpdate(_.mix(changes, {
            data: data,
            root: bright_root[0],
            rootId: bright_id
        }));
    } else if (!data) {
        bright_root.remove();
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
    _.merge(data.attr || (data.attr = {}), 
        source_data.attr || {});
    (source_data.contentList || []).forEach(function(source_data){
        if (typeof source_data !== 'string') {
            fix_source(source_data, data);
        }
        this.push(source_data);
    }, data.contentList || (data.contentList = []));
    _.each(source_data.componentData || [],
        merge_source_components, data);
    return data;
}

function merge_source_components(dataset, name){
    var origin = this.componentData || (this.componentData = {});
    if (Array.isArray(dataset)) {
        var context = this;
        dataset.forEach(function(source_data){
            this.push(fix_source(source_data, context));
        }, origin[name] || (origin[name] = []));
    } else {
        merge_source(origin[name] || (origin[name] = {}),
            dataset);
    }
}

function fix_source(source_data, context){
    if (!source_data.id) {
        source_data.id = ID_PREFIX + (++_uuid);
    }
    source_data.context = context; 
    return source_data;
}

function check_gc(guard, bright_id){
    var is_exist;
    _.each(guard._darkRoots, function(target){
        if ($(target).attr(BRIGHT_ID) === bright_id) {
            is_exist = true;
            return false;
        }
    });
    if (!is_exist) {
        delete _guards[bright_id];
        delete _darkdata[bright_id];
    }
}

function read_attr(target, getter){
    return typeof getter === 'string' 
        ? target.attr(getter) 
        : getter && getter(target);
}

function render_data(data){
    var guard = _guards[data.id];
    if (!guard) {
        return '';
    }
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
exports.observe = DarkGuard.observe;

return exports;

});
