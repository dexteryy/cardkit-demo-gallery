
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
    _sourceDataset = {},
    _darkdata = {},
    _guards = {},
    _uuid = 0,
    _array_slice = [].slice,
    _array_push = [].push,
    _toString = Object.prototype.toString,
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

    createGuard: function(opt){
        return new exports.DarkGuard(_.mix({
            attrs: this._attrs,
            components: this._components,
            contents: this._contents,
            updaters: this._updaters,
            options: this._config
        }, opt));
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
        targets.forEach(function(target){
            this.registerRoot($(target));
        }, this);
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
            return this;
        }
        var data = render_root(this.scanRoot(target));
        target.hide().after(this.createRoot(data));
        return this;
    },

    bufferRoot: function(target){
        if (target.attr(this._attrs.autorender)) {
            return this;
        }
        var data = this.scanRoot(target); 
        this._bufferData(data);
        return this;
    },

    updateRoot: function(target){
        exports.DarkGuard.update(target);
        return this;
    },

    registerRoot: function(target){
        var bright_id = target.attr(BRIGHT_ID);
        if (!bright_id) {
            bright_id = ID_PREFIX + (++_uuid);
            if (!this._config.isSource) {
                target.attr(BRIGHT_ID, bright_id);
            }
        }
        _guards[bright_id] = this;
        return bright_id;
    },

    scanRoot: function(target){
        var is_source = this._config.isSource;
        var bright_id = this.registerRoot(target);
        target.attr(RENDERED_MARK, true);
        var data = {
            id: bright_id,
        };
        if (!is_source) {
            data.context = this._contextData;
        }
        data.attr = {};
        _.each(this._attrs, function(getter, name){
            this[name] = read_attr(target, getter);
        }, data.attr);
        this._scanComponents(data, target);
        if (!is_source
                && this._sourceGuard) {
            this._mergeSource(data);
        }
        return data;
    },

    _scanComponents: function(data, target){
        var re = {};
        _.each(this._config.components, function(component, name){
            var guard = this._componentGuards[name];
            if (!guard) {
                guard = component.createGuard({
                    isSource: this._config.isSource
                });
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

    renderBuffer: function(){
        this._buffer.forEach(function(data){
            render_root(data);
        });
        return this;
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
        var abort = changes.name 
                && changes.type === 'component';
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

    createSource: function(opt){
        this._sourceGuard = new exports.DarkGuard(_.merge({
            isSource: true,
            options: _.merge({
                enableSource: false 
            }, opt.options)
        }, opt));
        return this._sourceGuard;
    },

    scanSource: function(bright_id, selector){
        if (!selector) {
            return;
        }
        var guard = this._sourceGuard;
        guard.watch(selector);
        guard.buffer();
        var dataset = guard.releaseData();
        _sourceDataset[bright_id] = dataset;
        return dataset;
    },

    _mergeSource: function(data){
        var source_dataset = _sourceDataset[data.id];
        if (!source_dataset) {
            source_dataset = this.scanSource(data.id, 
                data.attr.source);
        }
        if (source_dataset) {
            merge_source(data, source_dataset, data.context);
        }
    }

};

DarkGuard.update = function(targets){
    $(targets).forEach(update_target);
    exports.DarkGuard.gc();
};

DarkGuard.observe = function(target, subject, handler){
    target = $(target);
    var bright_id = target.attr(BRIGHT_ID);
    var guard = _guards[bright_id];
    if (guard) {
        guard.observe(target, subject, handler);
    }
};

DarkGuard.fill = function(target, fn){
    target = $(target);
    var bright_id = target.attr(BRIGHT_ID),
        dataset = _sourceDataset[bright_id],
        guard = _guards[bright_id],
        user_data = is_function(fn) ? fn(dataset) : fn;
    if (guard) {
        fix_userdata(user_data, guard);
    }
    _sourceDataset[bright_id] = user_data;
};

DarkGuard.gc = function(){
    var current = {};
    $('[' + BRIGHT_ID + ']').forEach(function(target){
        this[$(target).attr(BRIGHT_ID)] = true;
    }, current);
    Object.keys(_guards).forEach(function(bright_id){
        if (!this[bright_id]) {
            delete _guards[bright_id];
            delete _darkdata[bright_id];
            delete _sourceDataset[bright_id];
        }
    }, current);
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
        return;
    }
    var dataset = guard.bufferRoot(target)
        .renderBuffer()
        .releaseData();
    compare_model(origin, 
        Array.isArray(dataset) ? dataset[0] : dataset);
}

function compare_model(origin, data){
    if (!data || !data.id) {
        return trigger_update(origin.id, null, {
            type: 'remove'
        });
    }
    if (!origin.id) {
        data = data.context;
        return trigger_update(data.id, data, {
            type: 'component'
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
    if (compare_contents(
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
        var changed = compare_components.apply(this, arguments);
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

function compare_contents(origin, data){
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

function compare_components(dataset, name){
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

function merge_source(data, source_data, context){
    if (Array.isArray(source_data)) {
        source_data.forEach(function(source_data){
            merge_source(this, source_data, context);
        }, data);
        return data;
    }
    if (!data.id) {
        data.id = source_data.id;
    }
    data.context = context;
    _.each(source_data.attr || {}, function(value, name){
        if (this[name] === undefined) {
            this[name] = value;
        }
    }, data.attr || (data.attr = {}));
    // @note
    var content_list = data.contentList || [];
    if (!content_list.length) {
        content_list = (source_data.contentList || []).slice();
    }
    data.contentList = content_list;
    // @note
    if (!data.componentData) {
        data.componentData = {};
    }
    _.each(source_data.componentData || [],
        merge_source_components, data);
    return data;
}

function merge_source_components(dataset, name){
    var origin = this.componentData;
    if (Array.isArray(dataset)) {
        dataset.forEach(function(source_data){
            this.push(source_data);
        }, origin[name] || (origin[name] = []));
    } else {
        merge_source(origin[name] || (origin[name] = {}),
            dataset, this);
    }
}

function fix_userdata(data, guard){
    if (!data.id) {
        data.id = ID_PREFIX + (++_uuid);
        _guards[data.id] = guard;
    }
    if (data.componentData) {
        _.each(guard._config.components, 
            fix_userdata_component, 
            data.componentData);
    }
}

function fix_userdata_component(component, name){
    var dataset = this[name];
    if (!dataset) {
        return;
    }
    if (!Array.isArray(dataset)) {
        dataset = [dataset];
    }
    dataset.forEach(function(data){
        fix_userdata(data, this.createGuard({
            isSource: true
        }));
    }, component);
}

function render_root(data){
    _.each(data.componentData, function(dataset, name){
        if (Array.isArray(dataset)) {
            this[name] = dataset.map(function(data){
                return render_data(data);
            });
        } else {
            this[name] = render_data(dataset);
        }
    }, data.component || (data.component = {}));
    data.content = data.contentList.map(function(data){
        if (typeof data === 'string') {
            return data;
        }
        return render_data(data);
    }).join('');
    _darkdata[data.id] = data;
    return data;
}

function render_data(data){
    var guard = _guards[data.id];
    if (!guard) {
        return '';
    }
    if (!data.component) {
        data = render_root(data);
    }
    return guard.createRoot(data)[0].outerHTML;
}

function read_attr(target, getter){
    return (typeof getter === 'string' 
        ? target.attr(getter) 
        : getter && getter(target)) || undefined;
}

function is_function(obj) {
    return _toString.call(obj) === "[object Function]";
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
exports.fill = DarkGuard.fill;

return exports;

});
