
/* @source oz.js */;

/**
 * OzJS: microkernel for modular javascript
 * compatible with AMD (Asynchronous Module Definition)
 * see http://ozjs.org for details
 *
 * Copyright (C) 2010-2012, Dexter.Yy, MIT License
 * vim: et:ts=4:sw=4:sts=4
 */
(function(window, exports){

    if (!exports || window.window) {
        exports = {};
    }

    var _toString = Object.prototype.toString,
        _RE_PLUGIN = /(.*)!(.+)/,
        _RE_DEPS = /\Wrequire\((['"]).+?\1\)/g, //'
        _RE_SUFFIX = /\.(js|json)$/,
        _RE_RELPATH = /^\.+?\/.+/,
        _RE_DOT = /(^|\/)\.\//g,
        _RE_ALIAS_IN_MID = /^([\w\-]+)\//,
        _builtin_mods = { "require": 1, "exports": 1, "module": 1, 
            "host": 1, "finish": 1 },

        _config = {
            mods: {}
        },
        _scripts = {},
        _delays = {},
        _refers = {},
        _waitings = {},
        _latest_mod,
        _scope,
        _resets = {},

        forEach = Array.prototype.forEach || function(fn, sc){
            for(var i = 0, l = this.length; i < l; i++){
                if (i in this)
                    fn.call(sc, this[i], i, this);
            }
        };

    function is_function(obj) {
        return _toString.call(obj) === "[object Function]";
    }

    function is_array(obj) {
        return _toString.call(obj) === "[object Array]";
    }

    function is_global(obj) {
        return "setInterval" in obj;
    }

    function clone(obj) { // be careful of using `delete`
        function NewObj(){}
        NewObj.prototype = obj;
        return new NewObj();
    }

    /**
     * @public define / register a module and its meta information
     * @param {string} module name. optional as unique module in a script file
     * @param {string[]} dependencies
     * @param {function} module code, execute only once on the first call
     *
     * @note
     *
     * define('', [""], func)
     * define([""], func)
     * define('', func)
     * define(func)
     *
     * define('', "")
     * define('', [""], "")
     * define('', [""])
     *
     */
    exports.define = function(name, deps, block){
        var is_remote = typeof block === 'string';
        if (!block) {
            if (deps) {
                if (is_array(deps)) {
                    block = exports.filesuffix(
                        exports.realname(
                            exports.basename(name)
                        )
                    );
                } else {
                    block = deps;
                    deps = null;
                }
            } else {
                block = name;
                name = "";
            }
            if (typeof name !== 'string') {
                deps = name;
                name = "";
            } else {
                is_remote = typeof block === 'string';
                if (!is_remote && !deps) {
                    deps = exports.seek(block);
                }
            }
        }
        name = name && exports.realname(name);
        var mod = name && _config.mods[name];
        if (!_config.debug && mod && mod.name
                && (is_remote && mod.loaded == 2 || mod.exports)) {
            return;
        }
        if (is_remote && _config.enable_ozma) {
            deps = null;
        }
        var host = is_global(this) ? this : window;
        mod = _config.mods[name] = {
            name: name,
            url: mod && mod.url,
            host: host,
            deps: deps || []
        };
        if (name === "") { // capture anonymous module
            _latest_mod = mod;
        }
        if (typeof block !== 'string') {
            mod.block = block;
            mod.loaded = 2;
        } else { // remote module
            var alias = _config.aliases;
            if (alias) {
                block = block.replace(/\{(\w+)\}/g, function(e1, e2){
                    return alias[e2] || "";
                });
            }
            mod.url = block;
        }
        if (mod.block && !is_function(mod.block)) { // json module
            mod.exports = block;
        }
    };

    exports.define.amd = {};

    /**
     * @public run a code block its dependencies
     * @param {string[]} [module name] dependencies
     * @param {function}
     */
    exports.require = function(deps, block, _self_mod) {
        if (typeof deps === 'string') {
            if (!block) {
                deps = exports.realname(exports.basename(deps, _scope));
                return (_config.mods[deps] || {}).exports;
            }
            deps = [deps];
        } else if (!block) {
            block = deps;
            deps = exports.seek(block);
        }
        var host = is_global(this) ? this : window;
        if (!_self_mod) {
            _self_mod = { url: _scope && _scope.url };
        }
        var m, remotes = 0, // counter for remote scripts
            // calculate dependencies, find all required modules
            list = exports.scan.call(host, deps, _self_mod);
        for (var i = 0, l = list.length; i < l; i++) {
            m = list[i];
            if (m.is_reset) {
                m = _config.mods[m.name];
            }
            if (m.url && m.loaded !== 2) { // remote module
                remotes++;
                m.loaded = 1; // status: loading
                exports.fetch(m, function(){
                    this.loaded = 2; // status: loaded
                    var lm = _latest_mod;
                    if (lm) { // capture anonymous module
                        lm.name = this.name;
                        lm.url = this.url;
                        _config.mods[this.name] = lm;
                        _latest_mod = null;
                    }
                    // loaded all modules, calculate dependencies all over again
                    if (--remotes <= 0) {
                        exports.require.call(host, deps, block, _self_mod);
                    }
                });
            }
        }
        if (!remotes) {
            _self_mod.deps = deps;
            _self_mod.host = host;
            _self_mod.block = block;
            setTimeout(function(){
                exports.tidy(deps, _self_mod);
                list.push(_self_mod);
                exports.exec(list.reverse());
            }, 0);
        }
    };

    exports.require.config = function(opt){
        for (var i in opt) {
            if (i === 'aliases') {
                if (!_config[i]) {
                    _config[i] = {};
                }
                for (var j in opt[i]) {
                    _config[i][j] = opt[i][j];
                }
                var mods = _config.mods;
                for (var k in mods) {
                    mods[k].name = exports.realname(k);
                    mods[mods[k].name] = mods[k];
                }
            } else {
                _config[i] = opt[i];
            }
        }
    };

    /**
     * @private execute modules in a sequence of dependency
     * @param {object[]} [module object]
     */
    exports.exec = function(list){
        var mod, mid, tid, result, isAsync, deps,
            depObjs, exportObj, moduleObj, rmod,
            wt = _waitings;
        while (mod = list.pop()) {
            if (mod.is_reset) {
                rmod = clone(_config.mods[mod.name]);
                rmod.host = mod.host;
                rmod.newname = mod.newname;
                mod = rmod;
                if (!_resets[mod.newname]) {
                    _resets[mod.newname] = [];
                }
                _resets[mod.newname].push(mod);
                mod.exports = undefined;
            } else if (mod.name) {
                mod = _config.mods[mod.name] || mod;
            }
            if (!mod.block || !mod.running && mod.exports !== undefined) {
                continue;
            }
            depObjs = [];
            exportObj = {}; // for "exports" module
            moduleObj = { id: mod.name, filename: mod.url, exports: exportObj };
            deps = mod.deps.slice();
            deps[
                mod.block.hiddenDeps ? 'unshift' : 'push'
            ]("require", "exports", "module");
            for (var i = 0, l = deps.length; i < l; i++) {
                mid = deps[i];
                switch(mid) {
                    case 'require':
                        depObjs.push(exports.require);
                        break;
                    case 'exports':
                        depObjs.push(exportObj);
                        break;
                    case 'module':
                        depObjs.push(moduleObj);
                        break;
                    case 'host': // deprecated
                        depObjs.push(mod.host);
                        break;
                    case 'finish':  // execute asynchronously
                        tid = mod.name;
                        if (!wt[tid]) // for delay execute
                            wt[tid] = [list];
                        else
                            wt[tid].push(list);
                        depObjs.push(function(result){
                            // HACK: no guarantee that this function will be invoked 
                            //       after while() loop termination in Chrome/Safari
                            setTimeout(function(){
                                // 'mod' equal to 'list[list.length-1]'
                                if (result !== undefined) {
                                    mod.exports = result;
                                }
                                if (!wt[tid])
                                    return;
                                forEach.call(wt[tid], function(list){
                                    this(list);
                                }, exports.exec);
                                delete wt[tid];
                                mod.running = 0;
                            }, 0);
                        });
                        isAsync = 1;
                        break;
                    default:
                        depObjs.push((
                            (_resets[mid] || []).pop()
                            || _config.mods[exports.realname(mid)]
                            || {}
                        ).exports);
                        break;
                }
            }
            if (!mod.running) {
                // execute module code. arguments: 
                // [dep1, dep2, ..., require, exports, module]
                _scope = mod;
                result = mod.block.apply(mod.host, depObjs) || null;
                _scope = false;
                exportObj = moduleObj.exports;
                mod.exports = result !== undefined ? result 
                    : exportObj; // use empty exportObj for "finish"
                for (var v in exportObj) {
                    if (v) {
                        mod.exports = exportObj;
                    }
                    break;
                }
            }
            if (isAsync) { // skip, wait for finish()
                mod.running = 1;
                return false;
            }
        }
        return true;
    };

    /**
     * @private observer for script loader, prevent duplicate requests
     * @param {object} module object
     * @param {function} callback
     */
    exports.fetch = function(m, cb){
        var url = m.url,
            observers = _scripts[url];
        if (!observers) {
            var mname = m.name, delays = _delays;
            if (m.deps && m.deps.length && delays[mname] !== 1) {
                delays[mname] = [m.deps.length, cb];
                forEach.call(m.deps, function(dep){
                    var d = _config.mods[exports.realname(dep)];
                    if (this[dep] !== 1 && d.url && d.loaded !== 2) {
                        if (!this[dep]) {
                            this[dep] = [];
                        }
                        this[dep].push(m);
                    } else {
                        delays[mname][0]--;
                    }
                }, _refers);
                if (delays[mname][0] > 0) {
                    return;
                } else {
                    delays[mname] = 1;
                }
            }
            observers = _scripts[url] = [[cb, m]];
            var true_url = /^\w+:\/\//.test(url) ? url
                : (_config.enable_ozma && _config.distUrl || _config.baseUrl || '')
                    + (_config.enableAutoSuffix ? exports.namesuffix(url) : url);
            exports.load.call(m.host || window, true_url, function(){
                forEach.call(observers, function(args){
                    args[0].call(args[1]);
                });
                _scripts[url] = 1;
                if (_refers[mname] && _refers[mname] !== 1) {
                    forEach.call(_refers[mname], function(dm){
                        var b = this[dm.name];
                        if (--b[0] <= 0) {
                            this[dm.name] = 1;
                            exports.fetch(dm, b[1]);
                        }
                    }, delays);
                    _refers[mname] = 1;
                }
            });
        } else if (observers === 1) {
            cb.call(m);
        } else {
            observers.push([cb, m]);
        }
    };

    /**
     * @public non-blocking script loader
     * @param {string}
     * @param {object} config
     */
    exports.load = function(url, op){
        var doc = is_global(this) ? this.document : window.document,
            s = doc.createElement("script");
        s.type = "text/javascript";
        s.async = "async"; //for firefox3.6
        if (!op)
            op = {};
        else if (is_function(op))
            op = { callback: op };
        if (op.charset)
            s.charset = op.charset;
        s.src = url;
        var h = doc.getElementsByTagName("head")[0];
        s.onload = s.onreadystatechange = function(__, isAbort){
            if (isAbort 
                    || !s.readyState 
                    || /loaded|complete/.test(s.readyState)) {
                s.onload = s.onreadystatechange = null;
                if (h && s.parentNode) {
                    h.removeChild(s);
                }
                s = undefined;
                if (!isAbort && op.callback) {
                    op.callback();
                }
            }
        };
        h.insertBefore(s, h.firstChild);
    };

    /**
     * @private search and sequence all dependencies, based on DFS
     * @param {string[]} a set of module names
     * @param {object[]}
     * @param {object[]} a sequence of modules, for recursion
     * @return {object[]} a sequence of modules
     */
    exports.scan = function(m, file_mod, list){
        list = list || [];
        if (!m[0]) {
            return list;
        }
        var deps,
            history = list.history;
        if (!history) {
            history = list.history = {};
        }
        if (m[1]) {
            deps = m;
            m = false;
        } else {
            var truename,
                _mid = m[0],
                plugin = _RE_PLUGIN.exec(_mid);
            if (plugin) {
                _mid = plugin[2];
                plugin = plugin[1];
            }
            var mid = exports.realname(_mid);
            if (!_config.mods[mid] && !_builtin_mods[mid]) {
                var true_mid = exports.realname(exports.basename(_mid, file_mod));
                if (mid !== true_mid) {
                    _config.mods[file_mod.url + ':' + mid] = true_mid;
                    mid = true_mid;
                }
                if (!_config.mods[true_mid]) {
                    exports.define(true_mid, exports.filesuffix(true_mid));
                }
            }
            m = file_mod = _config.mods[mid];
            if (m) {
                if (plugin === "new") {
                    m = {
                        is_reset: true,
                        deps: m.deps,
                        name: mid,
                        newname: plugin + "!" + mid,
                        host: this
                    };
                } else {
                    truename = m.name;
                }
                if (history[truename]) {
                    return list;
                }
            } else {
                return list;
            }
            if (!history[truename]) {
                deps = m.deps || [];
                // find require information within the code
                // for server-side style module
                //deps = deps.concat(seek(m));
                if (truename) {
                    history[truename] = true;
                }
            } else {
                deps = [];
            }
        }
        for (var i = deps.length - 1; i >= 0; i--) {
            if (!history[deps[i]]) {
                exports.scan.call(this, [deps[i]], file_mod, list);
            }
        }
        if (m) {
            exports.tidy(deps, m);
            list.push(m);
        }
        return list;
    };

    /**
     * @experiment
     * @private analyse module code
     *          to find out dependencies which have no explicit declaration
     * @param {object} module object
     */
    exports.seek = function(block){
        var hdeps = block.hiddenDeps || [];
        if (!block.hiddenDeps) {
            var code = block.toString(),
                h = null;
            hdeps = block.hiddenDeps = [];
            while (h = _RE_DEPS.exec(code)) {
                hdeps.push(h[0].slice(10, -2));
            }
        }
        return hdeps.slice();
    };

    exports.tidy = function(deps, m){
        forEach.call(deps.slice(), function(dep, i){
            var true_mid = this[m.url + ':' + exports.realname(dep)];
            if (typeof true_mid === 'string') {
                deps[i] = true_mid;
            }
        }, _config.mods);
    };

    /**
     * @note naming pattern:
     * _g_src.js
     * _g_combo.js
     *
     * jquery.js
     * jquery_pack.js
     *
     * _yy_src.pack.js
     * _yy_combo.js
     *
     * _yy_bak.pack.js
     * _yy_bak.pack_pack.js
     */
    exports.namesuffix = function(file){
        return file.replace(/(.+?)(_src.*)?(\.\w+)$/, function($0, $1, $2, $3){
            return $1 + ($2 && '_combo' || '_pack') + $3;
        });
    };

    exports.filesuffix = function(mid){
        return _RE_SUFFIX.test(mid) ? mid : mid + '.js';
    };

    exports.realname = function(mid){
        var alias = _config.aliases;
        if (alias) {
            mid = mid.replace(_RE_ALIAS_IN_MID, function(e1, e2){
                return alias[e2] || (e2 + '/');
            });
        }
        return mid;
    };

    exports.basename = function(mid, file_mod){
        var rel_path = _RE_RELPATH.exec(mid);
        if (rel_path && file_mod) { // resolve relative path in Module ID
            mid = (file_mod.url || '').replace(/[^\/]+$/, '') + rel_path[0];
        }
        return exports.resolvename(mid);
    };

    exports.resolvename = function(url){
        url = url.replace(_RE_DOT, '$1');
        var dots, dots_n, url_dup = url, RE_DOTS = /(\.\.\/)+/g;
        while (dots = (RE_DOTS.exec(url_dup) || [])[0]) {
            dots_n = dots.match(/\.\.\//g).length;
            dots = dots.replace(/\./, '\\.');
            url = url.replace(new RegExp('([^/\\.]+/){' + dots_n + '}' + dots), '');
        }
        return url.replace(/\/\//g, '/');
    };

    var origin = {};
    for (var i in exports) {
        origin[i] = exports[i];
    }

    exports.origin = origin;
    exports.cfg = _config;

    window.oz = exports;
    window.define = exports.define;
    window.require = exports.require;

})(this, typeof exports !== 'undefined' && exports);

require.config({ enable_ozma: true });


/* @source mo/domready.js */;

/**
 * Non-plugin implementation of cross-browser DOM ready event
 * Based on OzJS's built-in module -- 'finish'
 *
 * using AMD (Asynchronous Module Definition) API with OzJS
 * see http://ozjs.org for details
 *
 * Copyright (C) 2010-2012, Dexter.Yy, MIT License
 * vim: et:ts=4:sw=4:sts=4
 */
define("mo/domready", [
  "finish"
], function(finish){
    var loaded, 
        w = this, 
        doc = w.document, 
        ADD = "addEventListener",
        IEADD = "attachEvent",
        READY = "DOMContentLoaded", 
        CHANGE = "onreadystatechange";

    if (doc.readyState === "complete") {
        setTimeout(finish, 1);
    } else {
        if (doc[ADD]){
            loaded = function(){
                doc.removeEventListener("READY", loaded, false);
                finish();
            };
            doc[ADD](READY, loaded, false);
            w[ADD]("load", finish, false);
        } else if (doc[IEADD]) {
            loaded = function(){
                if (doc.readyState === "complete") {
                    doc.detachEvent(CHANGE, loaded);
                    finish();
                }
            };
            doc[IEADD](CHANGE, loaded);
            w[IEADD]("load", finish);
            var toplevel = false;
            try {
                toplevel = w.frameElement == null;
            } catch(e) {}

            if (doc.documentElement.doScroll && toplevel) {
                var check = function(){
                    try {
                        doc.documentElement.doScroll("left");
                    } catch(e) {
                        setTimeout(check, 1);
                        return;
                    }
                    finish();
                };
                check();
            }
        }
    }
});

/* @source mo/lang/es5.js */;

/**
 * using AMD (Asynchronous Module Definition) API with OzJS
 * see http://ozjs.org for details
 *
 * Copyright (C) 2010-2012, Dexter.Yy, MIT License
 * vim: et:ts=4:sw=4:sts=4
 */
define("mo/lang/es5", [], function(){

    var host = this,
        Array = host.Array,
        String = host.String,
        Object = host.Object,
        Function = host.Function,
        //window = host.window,
        _objproto = Object.prototype,
        _arrayproto = Array.prototype,
        _fnproto = Function.prototype;

    function Empty() {}

    if (!_fnproto.bind) {
        _fnproto.bind = function (that) {
            var target = this,
                args = _arrayproto.slice.call(arguments, 1),
                bound = function () {
                    var arglist = args.concat(_arrayproto.slice.call(arguments));
                    if (this instanceof bound) {
                        var result = target.apply(this, arglist);
                        if (Object(result) === result) {
                            return result;
                        }
                        return this;
                    } else {
                        return target.apply(that, arglist);
                    }
                };
            if(target.prototype) {
                Empty.prototype = target.prototype;
                bound.prototype = new Empty();
                Empty.prototype = null;
            }
            return bound;
        };
    }

    var _call = _fnproto.call,
        _hasOwnProperty = _call.bind(_objproto.hasOwnProperty),
        _toString = _call.bind(_objproto.toString);

    if (!_arrayproto.filter) {
        _arrayproto.filter = function(fn, sc){
            var r = [];
            for (var i = 0, l = this.length; i < l; i++){
                if (i in this && fn.call(sc, this[i], i, this)) {
                    r.push(this[i]);
                }
            }
            return r;
        };
    }
        
    if (!_arrayproto.forEach) {
        _arrayproto.forEach = function(fn, sc){
            for(var i = 0, l = this.length; i < l; i++){
                if (i in this)
                    fn.call(sc, this[i], i, this);
            }
        };
    }

    if (!_arrayproto.map) {
        _arrayproto.map = function(fn, sc){
            for (var i = 0, copy = [], l = this.length; i < l; i++) {
                if (i in this) {
                    copy[i] = fn.call(sc, this[i], i, this);
                }
            }
            return copy;
        };
    }

    if (!_arrayproto.reduce) {
        _arrayproto.reduce = function(fn, sc){
            for (var i = 1, prev = this[0], l = this.length; i < l; i++) {
                if (i in this) {
                    prev = fn.call(sc, prev, this[i], i, this);
                }
            }
            return prev;
        };
    }

    if (!_arrayproto.some) {
        _arrayproto.some = function(fn, sc){
            for (var i = 0, l = this.length; i < l; i++){
                if (i in this && fn.call(sc, this[i], i, this)) {
                    return true;
                }
            }
            return false;
        };
    }

    if (!_arrayproto.every) {
        _arrayproto.every = function(fn, sc){
            for (var i = 0, l = this.length; i < l; i++){
                if (i in this && !fn.call(sc, this[i], i, this)) {
                    return false;
                }
            }
            return true;
        };
    }

    if (!_arrayproto.indexOf) {
        _arrayproto.indexOf = function(elt, from){
            var l = this.length;
            from = parseInt(from, 10) || 0;
            if (from < 0)
                from += l;
            for (; from < l; from++) {
                if (from in this && this[from] === elt)
                    return from;
            }
            return -1;
        };
    }

    if (!_arrayproto.lastIndexOf) {
        _arrayproto.lastIndexOf = function(elt, from){
            var l = this.length;
            from = parseInt(from, 10) || l - 1;
            if (from < 0)
                from += l;
            for (; from > -1; from--) {
                if (from in this && this[from] === elt)
                    return from;
            }
            return -1;
        };
    }

    if (!Array.isArray) {
        Array.isArray = function(obj) {
            return _toString(obj) === "[object Array]";
        };
    }

    var rnotwhite = /\S/,
        trimLeft = /^\s+/,
        trimRight = /\s+$/;
    if (rnotwhite.test( "\xA0")) {
        trimLeft = /^[\s\xA0]+/;
        trimRight = /[\s\xA0]+$/;
    }
    if (!String.prototype.trim) {
        String.prototype.trim = function() {
            return this.replace(trimLeft, "").replace(trimRight, "");
        };
    }

    if (!Object.keys) {
        Object.keys = function(obj) {
            var keys = [];
            for (var prop in obj) {
                if (_hasOwnProperty(obj, prop)) {
                    keys.push(prop);
                }
            }
            return keys;
        };
    }

    if (!Object.create) {
        Object.create = function(obj) {
            function NewObj(){}
            NewObj.prototype = obj;
            return new NewObj();
        };
    }

    if (!Object.getPrototypeOf) {
        Object.getPrototypeOf = function (obj) {
            return obj.__proto__ || obj.constructor.prototype;
        };
    }
    
});

/* @source mo/lang/type.js */;

/**
 * using AMD (Asynchronous Module Definition) API with OzJS
 * see http://ozjs.org for details
 *
 * Copyright (C) 2010-2012, Dexter.Yy, MIT License
 * vim: et:ts=4:sw=4:sts=4
 */
define("mo/lang/type", [
  "mo/lang/es5"
], function(_0, require, exports){

    var _toString = Object.prototype.toString,
        _aproto = Array.prototype,
        _typeMap = {};

    _aproto.forEach.call("Boolean Number String Function Array Date RegExp Object".split(" "), function(name){
        this[ "[object " + name + "]" ] = name.toLowerCase();
    }, _typeMap);

    function type(obj) {
        return obj == null ?
            String(obj) :
            _typeMap[ _toString.call(obj) ] || "object";
    }

    exports.type = type;

    exports.isFunction = function(obj) {
        return _toString.call(obj) === "[object Function]";
    };

    exports.isWindow = function(obj) {
		return obj && obj === obj.window;
    };

	exports.isEmptyObject = function(obj) {
        for (var name in obj) {
            name = null;
            return false;
        }
        return true;
	};

    exports.isArraylike = function(obj){
        var l = obj.length;
        return !exports.isWindow(obj) 
            && (typeof obj !== 'function' 
                || obj.constructor !== Function)
            && (l === 0 
                || typeof l === "number"
                && l > 0 
                && (l - 1) in obj);
    };

});

/* @source mo/lang/mix.js */;

/**
 * using AMD (Asynchronous Module Definition) API with OzJS
 * see http://ozjs.org for details
 *
 * Copyright (C) 2010-2012, Dexter.Yy, MIT License
 * vim: et:ts=4:sw=4:sts=4
 */
define("mo/lang/mix", [
  "mo/lang/es5",
  "mo/lang/type"
], function(_0, _, require, exports){

    var type = _.type;

    function mix(origin) {
        var objs = arguments, ol = objs.length, 
            VALTYPE = { 'number': 1, 'boolean': 2, 'string': 3 },
            obj, lvl, i, l;
        if (typeof objs[ol - 1] !== 'object') {
            lvl = objs[ol - 1] || 0;
            ol--;
        } else {
            lvl = 0;
        }
        for (var n = 1; n < ol; n++) {
            obj = objs[n];
            if (Array.isArray(obj)) {
                origin = !VALTYPE[typeof origin] && origin || [];
                l = obj.length;
                for (i = 0; i < l; i++) {
                    if (lvl >= 1 && obj[i] && typeof obj[i] === 'object') {
                        origin[i] = mix(origin[i], obj[i], lvl - 1);
                    } else {
                        origin[i] = obj[i];
                    }
                }
            } else {
                origin = !VALTYPE[typeof origin] && origin || {};
                for (i in obj) {
                    if (lvl >= 1 && obj[i] && typeof obj[i] === 'object') {
                        origin[i] = mix(origin[i], obj[i], lvl - 1);
                    } else {
                        origin[i] = obj[i];
                    }
                }
            }
        }
        return origin;
    }

    function merge(origin) {
        var objs = arguments, ol = objs.length, 
            ITERTYPE = { 'object': 1, 'array': 2 },
            obj, lvl, i, k, lib, marked, mark;
        if (typeof objs[ol - 1] !== 'object') {
            lvl = objs[ol - 1] || 0;
            ol--;
        } else {
            lvl = 0;
        }
        for (var n = 1; n < ol; n++) {
            obj = objs[n];
            if (typeof obj !== 'object') {
                continue;
            }
            if (Array.isArray(origin)) {
                if (!Array.isArray(obj)) {
                    continue;
                }
                origin = origin || [];
                lib = {};
                marked = [];
                mark = '__oz_uniqmark_' + (+new Date() + Math.random());
                obj = obj.concat(origin);
                origin.length = 0;
                obj.forEach(function(i){
                    if (i && typeof i === 'object') {
                        if (!i[mark]) {
                            if (lvl >= 1 && Array.isArray(i)) {
                                origin.push(merge(i, [], lvl - 1));
                            } else {
                                origin.push(i);
                            }
                            i[mark] = 1;
                            marked.push(i);
                        }
                    } else {
                        k = (typeof i) + '_' + i;
                        if (!this[k]) {
                            origin.push(i);
                            this[k] = 1;
                        }
                    }
                }, lib);
                marked.forEach(function(i){
                    delete i[mark];
                });
            } else {
                origin = origin || {};
                for (i in obj) {
                    if (!origin.hasOwnProperty(i)) {
                        origin[i] = obj[i];
                    } else if (lvl >= 1 && i 
                            // avoid undefined === undefined
                            && ITERTYPE[type(origin[i])] + 0 === ITERTYPE[type(obj[i])] + 0) {
                        origin[i] = merge(origin[i], obj[i], lvl - 1);
                    }
                }
            }
        }
        return origin;
    }

    function interset(origin) {
        var objs = arguments, ol = objs.length, 
            ITERTYPE = { 'object': 1, 'array': 2 },
            obj, lvl, i, k, lib, marked, mark;
        if (typeof objs[ol - 1] !== 'object') {
            lvl = objs[ol - 1] || 0;
            ol--;
        } else {
            lvl = 0;
        }
        for (var n = 1; n < ol; n++) {
            obj = objs[n];
            if (typeof obj !== 'object') {
                continue;
            }
            if (Array.isArray(origin)) {
                if (!Array.isArray(obj)) {
                    continue;
                }
                origin = origin || [];
                lib = {};
                marked = [];
                mark = '__oz_uniqmark_' + (+new Date() + Math.random());
                origin.forEach(function(i){
                    if (i && typeof i === 'object' && !i[mark]) {
                        i[mark] = 1;
                        marked.push(i);
                    } else {
                        k = (typeof i) + '_' + i;
                        this[k] = 1;
                    }
                }, lib);
                origin.length = 0;
                obj.forEach(function(i){
                    if (i && typeof i === 'object') {
                        if (i[mark] === 1) {
                            origin.push(i);
                            i[mark] = 2;
                        }
                    } else {
                        k = (typeof i) + '_' + i;
                        if (this[k] === 1) {
                            origin.push(i);
                            this[k] = 2;
                        }
                    }
                }, lib);
                marked.forEach(function(i){
                    delete i[mark];
                });
            } else {
                origin = origin || {};
                for (i in origin) {
                    if (!obj.hasOwnProperty(i)) {
                        delete origin[i];
                    } else if (lvl >= 1 && i 
                            && ITERTYPE[type(origin[i])] + 0 === ITERTYPE[type(obj[i])] + 0) {
                        origin[i] = interset(origin[i], obj[i], lvl - 1);
                    }
                }
            }
        }
        return origin;
    }

    exports.mix = mix;
    exports.merge = merge;
    exports.interset = interset;

    exports.copy = function(obj, lvl) {
        return mix(null, obj, lvl);
    };

    exports.occupy = function(origin, obj, lvl) {
        return mix(interset(origin, obj, lvl), obj, lvl);
    };

    exports.defaults = merge;

    exports.config = function(cfg, opt, default_cfg, lvl){
        return mix(merge(cfg, default_cfg, lvl), interset(mix(null, opt, lvl), default_cfg, lvl), lvl);
    };

    exports.unique = function(origin, lvl) {
        return merge(origin, [], lvl);
    };

    exports.each = function(obj, fn, context){
        var i = 0, l = obj.length, re;
        if (_.isArraylike(obj)) {
            for (; i < l; i++) {
                re = fn.call(context, obj[i], i);
                if (re === false) {
                    break;
                }
            }
        } else {
            for (i in obj) {
                re = fn.call(context, obj[i], i);
                if (re === false) {
                    break;
                }
            }
        }
        return obj;
    };

});


/* @source mo/lang/struct.js */;

/**
 * using AMD (Asynchronous Module Definition) API with OzJS
 * see http://ozjs.org for details
 *
 * Copyright (C) 2010-2012, Dexter.Yy, MIT License
 * vim: et:ts=4:sw=4:sts=4
 */
define("mo/lang/struct", [
  "mo/lang/es5",
  "mo/lang/mix"
], function(_0, _, require, exports){

    var mix = _.mix;

    exports.index = function(list, key) {
        var obj = {}, item;
        for (var i = 0, l = list.length; i < l; i++) {
            item = list[i];
            if (key && typeof item === 'object') {
                obj[item[key]] = item;
            } else {
                obj[item] = true;
            }
        }
        return obj;
    };

    exports.fnQueue = function(){
        var queue = [], dup = false;
        function getCallMethod(type){
            return function(){
                var re, fn;
                dup = this.slice().reverse();
                while (fn = dup.pop()) {
                    re = fn[type].apply(fn, arguments);
                }
                dup = false;
                return re;
            };
        }
        mix(queue, {
            call: getCallMethod('call'),
            apply: getCallMethod('apply'),
            clear: function(func){
                if (!func) {
                    this.length = 0;
                } else {
                    var size = this.length,
                        popsize = size - dup.length;
                    for (var i = this.length - 1; i >= 0; i--) {
                        if (this[i] === func) {
                            this.splice(i, 1);
                            if (dup && i >= popsize)
                                dup.splice(size - i - 1, 1);
                        }
                    }
                    if (i < 0)
                        return false;
                }
                return true;
            }
        });
        return queue;
    };

});


/* @source eventmaster.js */;

/**
 * EventMaster
 * A simple, compact and consistent implementation of a variant of CommonJS's Promises and Events
 * Provide both Promise/Deferred/Flow pattern and Event/Notify/Observer/PubSub pattern
 *
 * using AMD (Asynchronous Module Definition) API with OzJS
 * see http://ozjs.org for details
 *
 * Copyright (C) 2010-2012, Dexter.Yy, MIT License
 * vim: et:ts=4:sw=4:sts=4
 */
define("eventmaster", [
  "mo/lang/es5",
  "mo/lang/mix",
  "mo/lang/struct"
], function(es5, _, struct){

    var fnQueue = struct.fnQueue,
        slice = Array.prototype.slice,
        pipes = ['notify', 'fire', 'error', 
            'resolve', 'reject', 'reset', 'disable', 'enable'];

    function Promise(opt){
        var self = this;
        if (opt) {
            this.subject = opt.subject;
            this.trace = opt.trace;
            this.traceStack = opt.traceStack || [];
        }
        this.doneHandlers = fnQueue();
        this.failHandlers = fnQueue();
        this.observeHandlers = fnQueue();
        this._alterQueue = fnQueue();
        this._lastDoneQueue = [];
        this._lastFailQueue = [];
        this.status = 0;
        this._argsCache = [];
        this.pipe = {};
        pipes.forEach(function(i){
            this[i] = function(){
                return self[i].call(self, slice.call(arguments));
            };
        }, this.pipe);
    }

    var actors = Promise.prototype = {

        then: function(handler, errorHandler){
            var _status = this.status;
            if (errorHandler) { // error, reject
                if (_status === 2) {
                    this._resultCache = errorHandler.apply(this, this._argsCache);
                } else if (!_status) {
                    this.failHandlers.push(errorHandler);
                    this._lastFailQueue = this.failHandlers;
                }
            } else {
                this._lastFailQueue = [];
            }
            if (handler) { // fire, resolve
                if (_status === 1) {
                    this._resultCache = handler.apply(this, this._argsCache);
                } else if (!_status) {
                    this.doneHandlers.push(handler);
                    this._lastDoneQueue = this.doneHandlers;
                }
            } else {
                this._lastDoneQueue = [];
            }
            return this;
        },

        done: function(handler){ // fire, resolve
            return this.then(handler);
        },

        fail: function(handler){ // error, reject
            return this.then(false, handler);
        },

        cancel: function(handler, errorHandler){ // then
            if (handler) { // done
                this.doneHandlers.clear(handler);
            }
            if (errorHandler) { // fail
                this.failHandlers.clear(errorHandler);
            }
            return this;
        },

        bind: function(handler){
            if (this.status) { // resolve, reject
                handler.apply(this, this._argsCache);
            }
            this.observeHandlers.push(handler); // notify, fire, error
            return this;
        },

        unbind: function(handler){ // bind
            this.observeHandlers.clear(handler);
            return this;
        },

        progress: function(handler){ // notify, fire?, error?
            var self = this;
            this.observeHandlers.push(function(){
                if (!self.status) {
                    handler.apply(this, arguments);
                }
            });
            return this;
        },

        notify: function(args){ // progress, bind
            if (this._disalbed) {
                return this;
            }
            this.status = 0;
            this.observeHandlers.apply(this, args || []);
            return this;
        },

        fire: function(args){ // bind, progress?, then, done
            if (this._disalbed) {
                return this;
            }
            if (this.trace) {
                this._trace();
            }
            args = args || [];
            var onceHandlers = this.doneHandlers;
            this.doneHandlers = this._alterQueue;
            this.failHandlers.length = 0;
            this.observeHandlers.apply(this, args);
            onceHandlers.apply(this, args);
            onceHandlers.length = 0;
            this._alterQueue = onceHandlers;
            return this;
        },

        error: function(args){ // bind, progress?, then, fail 
            if (this._disalbed) {
                return this;
            }
            if (this.trace) {
                this._trace();
            }
            args = args || [];
            var onceHandlers = this.failHandlers;
            this.failHandlers = this._alterQueue;
            this.doneHandlers.length = 0;
            this.observeHandlers.apply(this, args);
            onceHandlers.apply(this, args);
            onceHandlers.length = 0;
            this._alterQueue = onceHandlers;
            return this;
        },

        resolve: function(args){ // bind, then, done 
            this.status = 1;
            this._argsCache = args || [];
            return this.fire(args);
        },

        reject: function(args){ // bind, then, fail 
            this.status = 2;
            this._argsCache = args || [];
            return this.error(args);
        },

        reset: function(){ // resolve, reject
            this.status = 0;
            this._argsCache = [];
            this.doneHandlers.length = 0;
            this.failHandlers.length = 0;
            return this;
        },

        disable: function(){
            this._disalbed = true;
        },

        enable: function(){
            this._disalbed = false;
        },

        merge: function(promise){ // @TODO need testing
            _.merge(this.doneHandlers, promise.doneHandlers);
            _.merge(this.failHandlers, promise.failHandlers);
            _.merge(this.observeHandlers, promise.observeHandlers);
            var subject = promise.subject;
            _.mix(promise, this);
            promise.subject = subject;
        },

        _trace: function(){
            this.traceStack.unshift(this.subject);
            if (this.traceStack.length > this.trace) {
                this.traceStack.pop();
            }
        },

        follow: function(){
            var next = new Promise();
            next._prevActor = this;
            if (this.status) {
                pipe(this._resultCache, next);
            } else {
                var doneHandler = this._lastDoneQueue.pop();
                if (doneHandler) {
                    this._lastDoneQueue.push(function(){
                        return pipe(doneHandler.apply(this, arguments), next);
                    });
                }
                var failHandler = this._lastFailQueue.pop();
                if (failHandler) {
                    this._lastFailQueue.push(function(){
                        return pipe(failHandler.apply(this, arguments), next);
                    });
                }
            }
            return next;
        },

        end: function(){
            return this._prevActor;
        },

        all: function(){
            var fork = when.apply(this, this._when);
            return fork;
        },

        any: function(){
            var fork = when.apply(this, this._when);
            fork._count = fork._total = 1;
            return fork;
        },

        some: function(n){
            var fork = when.apply(this, this._when);
            fork._count = fork._total = n;
            return fork;
        }

    };

    function when(){
        var mutiArgs = [],
            completed = [],
            mutiPromise = new Promise();
        mutiPromise._when = [];
        mutiPromise._count = mutiPromise._total = arguments.length;
        Array.prototype.forEach.call(arguments, function(promise, i){
            var mutiPromise = this;
            mutiPromise._when.push(promise.bind(callback));
            function callback(args){
                if (!completed[i]) {
                    completed[i] = true;
                    mutiArgs[i] = args;
                    if (--mutiPromise._count === 0) {  // @TODO
                        completed.length = 0;
                        mutiPromise._count = mutiPromise._total;
                        mutiPromise.resolve.call(mutiPromise, mutiArgs);
                    }
                }
            }
        }, mutiPromise);
        return mutiPromise;
    }

    function pipe(prev, next){
        if (prev && prev.then) {
            prev.then(next.pipe.resolve, next.pipe.reject)
                .progress(next.pipe.notify);
        } else if (prev !== undefined) {
            next.resolve([prev]);
        }
        return prev;
    }

    function dispatchFactory(i){
        return function(subject){
            var promise = this.lib[subject];
            if (!promise) {
                promise = this.lib[subject] = new Promise({
                    subject: subject,
                    trace: this.trace,
                    traceStack: this.traceStack
                });
            }
            promise[i].apply(promise, slice.call(arguments, 1));
            return this;
        };
    }

    function Event(opt){
        if (opt) {
            this.trace = opt.trace;
            this.traceStack = opt.traceStack;
        }
        this.lib = {};
    }

    var EventAPI = Event.prototype = (function(methods){
        for (var i in actors) {
            methods[i] = dispatchFactory(i);
        }
        return methods;
    })({});

    EventAPI.once = EventAPI.wait = EventAPI.then;
    EventAPI.on = EventAPI.bind;
    EventAPI.off = EventAPI.unbind;

    EventAPI.promise = function(subject){
        var promise = this.lib[subject];
        if (!promise) {
            promise = this.lib[subject] = new Promise({
                subject: subject,
                trace: this.trace,
                traceStack: this.traceStack
            });
        }
        return promise;
    };

    EventAPI.when = function(){
        var args = [];
        for (var i = 0, l = arguments.length; i < l; i++) {
            args.push(this.promise(arguments[i]));
        }
        return when.apply(this, args);
    };

    function exports(opt){
        return new Event(opt);
    }

    exports.Promise = Promise;
    exports.Event = Event;
    exports.when = when;
    exports.pipe = pipe;

    exports.VERSION = '2.1.0';

    return exports;
});

/* @source ../cardkit2/bus.js */;


define("../cardkit2/bus", [
  "eventmaster"
], function(event){

    return event();

});


/* @source mo/browsers.js */;

/**
 * Standalone jQuery.browsers supports skin browsers popular in China 
 *
 * using AMD (Asynchronous Module Definition) API with OzJS
 * see http://ozjs.org for details
 *
 * Copyright (C) 2010-2012, Dexter.Yy, MIT License
 * vim: et:ts=4:sw=4:sts=4
 */
define("mo/browsers", [], function(){

    var match, skin, os, is_mobile_webkit, is_touch, is_webview,
        ua = this.navigator.userAgent.toLowerCase(),
        rank = { 
            "360ee": 2,
            "maxthon/3": 2,
            "qqbrowser": 2,
            "metasr": 2,
            "360se": 1,
            "theworld": 1,
            "maxthon": 1,
            "tencenttraveler": -1
        };

    try {
        var rwindows = /(windows) nt ([\w.]+)/,
            rmac = /(mac) os \w+ ([\w.]+)/,
            rwindowsphone = /(windows phone)[\sos]* ([\w.]+)/,
            riphone = /(iphone).*? os ([\w.]+)/,
            ripad = /(ipad).*? os ([\w.]+)/,
            randroid = /(android)[ ;]([\w.]*)/,
            rmobilewebkit = /(\w+)[ \/]([\w.]+)[ \/]mobile/,
            rsafari = /(\w+)[ \/]([\w.]+)[ \/]safari/,
            rmobilesafari = /[ \/]mobile.*safari/,
            rwebview = /[ \/]mobile/,
            rtouch = / touch/,
            rwebkit = /(webkit)[ \/]([\w.]+)/,
            ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/,
            rmsie = /(msie) ([\w.]+)/,
            rie11 = /(trident).*? rv:([\w.]+)/,
            rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/;

        var r360se = /(360se)/,
            r360ee = /(360ee)/,
            r360phone = /(360) \w+phone/,
            rtheworld = /(theworld)/,
            rmaxthon3 = /(maxthon\/3)/,
            rmaxthon = /(maxthon)/,
            rtt = /(tencenttraveler)/,
            rqq = /(qqbrowser)/,
            rbaidu = /(baidubrowser)/,
            ruc = /(ucbrowser)/,
            rsogou = /(sogou\w*browser)/,
            rmetasr = /(metasr)/;

        os = riphone.exec(ua) 
            || ripad.exec(ua) 
            || randroid.exec(ua) 
            || rmac.exec(ua) 
            || rwindowsphone.exec(ua) 
            || rwindows.exec(ua) 
            || [];

        skin = r360se.exec(ua) 
            || r360ee.exec(ua) 
            || r360phone.exec(ua) 
            || ruc.exec(ua) 
            || rtheworld.exec(ua) 
            || rmaxthon3.exec(ua) 
            || rmaxthon.exec(ua) 
            || rtt.exec(ua) 
            || rqq.exec(ua) 
            || rbaidu.exec(ua) 
            || rsogou.exec(ua) 
            || rmetasr.exec(ua) 
            || [];

        match =  rwebkit.exec(ua) 
            || ropera.exec(ua) 
            || rmsie.exec(ua) 
            || rie11.exec(ua)
            || ua.indexOf("compatible") < 0 && rmozilla.exec(ua) 
            || [];

        is_mobile_webkit = rmobilesafari.exec(ua) 
            || (is_webview = rwebview.exec(ua));

        is_touch = rtouch.exec(ua);

        if (match[1] === 'trident') {
            match[1] = 'msie';
        }

        if (match[1] === 'webkit') {
            var vendor = (is_mobile_webkit ? rmobilewebkit.exec(ua)
                : rsafari.exec(ua)) || [];
            match[3] = match[1];
            match[4] = match[2];
            match[1] = vendor[1] === 'version' 
                && ((os[1] === 'iphone' 
                        || os[1] === 'ipad')
                        && 'mobilesafari'
                    || os[1] === 'android' 
                        && 'aosp' 
                    || 'safari')
                || skin[1]
                || is_webview && 'webview'
                || vendor[1];
            match[2] = vendor[2];
        }

    } catch (ex) {
        match = [];
        skin = [];
    }

    var result = { 
        browser: match[1] || skin[1] || "", 
        version: match[2] || "0",
        engine: match[3],
        engineversion: match[4] || "0",
        os: os[1],
        osversion: os[2] || "0",
        isMobile: os[1] === 'iphone'
            || os[1] === 'windows phone'
            || os[1] === 'android' && !!is_mobile_webkit,
        isTouch: os[1] === 'iphone'
            || os[1] === 'windows phone'
            || os[1] === 'android'
            || os[1] === 'windows' && is_touch,
        skin: skin[1] || "",
        ua: ua
    };

    if (match[1]) {
        result[match[1]] = parseInt(result.version, 10) || true;
    }
    if (skin[1]) {
        result.rank = rank[result.skin] || 0;
    }
    result.shell = result.skin;

    return result;

});

/* @source ../cardkit2/supports.js */;


define("../cardkit2/supports", [
  "mo/browsers"
], function(browsers){

    var div = document.createElement('div');

    var exports = {
        touch: browsers.isTouch,
        overflowScroll: "webkitOverflowScrolling" in document.body.style,
        JSON: !!window.JSON,
        dataset: 'dataset' in div
    };

    return exports;

});


/* @source ../cardkit2/oldspec.js */;


define("../cardkit2/oldspec", [], function(require){

    return {
    };

});


/* @source ../cardkit2/spec/common/source_scaffold.js */;


define("../cardkit2/spec/common/source_scaffold", [], function(){

return {
    hd: function(source){
        source.watch('.ckd-hd');
        source.bond({
            url: 'href'
        });
    },
    hdLinkExtern: function(source){
        source.watch('.ckd-hd-link-extern');
        source.bond({
            url: 'href'
        });
    },
    hdLink: function(source){
        source.watch('.ckd-hd-link');
        source.bond({
            url: 'href'
        });
    },
    hdOpt: function(source){
        source.watch('.ckd-hdopt');
    },
    ft: function(source){
        source.watch('.ckd-ft');
    }
};

});


/* @source ../cardkit2/spec/common/scaffold.js */;


define("../cardkit2/spec/common/scaffold", [], function(){

return {
    hd: function(guard){
        guard.watch('ck-part[type="hd"]');
        guard.bond({
            url: 'href'
        });
    },
    hdLinkExtern: function(guard){
        guard.watch('ck-part[type="hdLinkExtern"]');
        guard.bond({
            url: 'href'
        });
    },
    hdLink: function(guard){
        guard.watch('ck-part[type="hdLink"]');
        guard.bond({
            url: 'href'
        });
    },
    hdOpt: function(guard){
        guard.watch('ck-part[type="hdOpt"]');
    },
    ft: function(guard){
        guard.watch('ck-part[type="ft"]');
    }
};

});


/* @source ../cardkit2/tpl/box/content.js */;

define("../cardkit2/tpl/box/content", [], function(){

    return {"template":"<div class=\"ck-content\">{%= content %}</div>\n"}; 

});
/* @source ../cardkit2/tpl/box.js */;

define("../cardkit2/tpl/box", [], function(){

    return {"template":"<div class=\"ck-box-unit\"\n        data-style=\"{%= attr.subtype %}\"\n        data-cfg-paper=\"{%= attr.paperStyle %}\"\n        data-cfg-plain=\"{%= attr.plainStyle %}\"\n        data-cfg-plainhd=\"{%= attr.plainHdStyle %}\">\n    {%= component.hd %}\n    {%= content %}\n    {%= component.ft %}\n</div>\n"}; 

});
/* @source ../cardkit2/card/../tpl/scaffold/ft.js */;

define("../cardkit2/card/../tpl/scaffold/ft", [], function(){

    return {"template":"<span class=\"ck-ft\">{%= content %}</span>\n"}; 

});
/* @source ../cardkit2/card/../tpl/scaffold/hd.js */;

define("../cardkit2/card/../tpl/scaffold/hd", [], function(){

    return {"template":"{% if (attr.url) { %}\n<a class=\"ck-hd\" \n    href=\"{%= attr.url %}\">{%= content %}</span>\n{% } else { %}\n<span class=\"ck-hd\">{%= content %}</span>\n{% } %}\n"}; 

});
/* @source mo/template/string.js */;

/**
 * using AMD (Asynchronous Module Definition) API with OzJS
 * see http://ozjs.org for details
 *
 * Copyright (C) 2010-2012, Dexter.Yy, MIT License
 * vim: et:ts=4:sw=4:sts=4
 */
define("mo/template/string", [], function(require, exports){

    exports.format = function(tpl, op){
        return tpl.replace(/\{\{(\w+)\}\}/g, function(e1,e2){
            return op[e2] != null ? op[e2] : "";
        });
    };

    exports.escapeHTML = function(str){
        str = str || '';
        var xmlchar = {
            //"&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "'": "&#39;",
            '"': "&quot;",
            "{": "&#123;",
            "}": "&#125;",
            "@": "&#64;"
        };
        return str.replace(/[<>'"\{\}@]/g, function($1){
            return xmlchar[$1];
        });
    };

    exports.substr = function(str, limit, cb){
        if(!str || typeof str !== "string")
            return '';
        var sub = str.substr(0, limit).replace(/([^\x00-\xff])/g, '$1 ').substr(0, limit).replace(/([^\x00-\xff])\s/g, '$1');
        return cb ? cb.call(sub, sub) : (str.length > sub.length ? sub + '...' : sub);
    };

    exports.strsize = function(str){
        return str.replace(/([^\x00-\xff]|[A-Z])/g, '$1 ').length;
    };

});


/* @source mo/lang/oop.js */;

/**
 * using AMD (Asynchronous Module Definition) API with OzJS
 * see http://ozjs.org for details
 *
 * Copyright (C) 2010-2012, Dexter.Yy, MIT License
 * vim: et:ts=4:sw=4:sts=4
 */
define("mo/lang/oop", [
  "mo/lang/es5",
  "mo/lang/mix"
], function(es5, _, require, exports){

    var mix = _.mix;

    exports.construct = function(base, mixes, factory){
        if (mixes && !Array.isArray(mixes)) {
            factory = mixes;
            mixes = null;
        }
        if (!factory) {
            factory = function(){
                this.superConstructor.apply(this, arguments);
            };
        }
        if (!base.__constructor) {
            base.__constructor = base;
            base.__supr = base.prototype;
        }
        var proto = Object.create(base.prototype),
            supr = Object.create(base.prototype),
            current_supr = supr;
        supr.__super = base.__supr;
        var sub = function(){
            this.superMethod = sub.__superMethod;
            this.superConstructor = su_construct;
            this.constructor = sub.__constructor;
            this.superClass = supr; // deprecated!
            return factory.apply(this, arguments);
        };
        sub.__supr = supr;
        sub.__constructor = sub;
        sub.__superMethod = function(name, args){
            var mysupr = current_supr;
            current_supr = mysupr.__super;
            var re = mysupr[name].apply(this, args);
            current_supr = mysupr;
            return re;
        };
        sub.prototype = proto;
        if (mixes) {
            mixes = mix.apply(this, mixes);
            mix(proto, mixes);
            mix(supr, mixes);
        }
        function su_construct(){
            var cache_constructor = base.__constructor,
                cache_super_method = base.__superMethod;
            base.__constructor = sub;
            base.__superMethod = sub.__superMethod;
            _apply.prototype = base.prototype;
            var su = new _apply(base, this, arguments);
            for (var i in su) {
                if (!this[i]) {
                    this[i] = supr[i] = su[i];
                }
            }
            base.__constructor = cache_constructor;
            base.__superMethod = cache_super_method;
            this.superConstructor = su_construct;
        }
        return sub;
    };

    function _apply(base, self, args){
        base.apply(self, args);
    }

});

/* @source mo/lang.js */;

/**
 * ES5/6 shim and minimum utilities for language enhancement
 *
 * using AMD (Asynchronous Module Definition) API with OzJS
 * see http://ozjs.org for details
 *
 * Copyright (C) 2010-2012, Dexter.Yy, MIT License
 * vim: et:ts=4:sw=4:sts=4
 */
define("mo/lang", [
  "mo/lang/es5",
  "mo/lang/type",
  "mo/lang/mix",
  "mo/lang/struct",
  "mo/lang/oop"
], function(es5, detect, _, struct, oo, require, exports){

    var host = this,
        window = host.window;

    _.mix(exports, detect, _, struct, oo);

    exports.ns = function(namespace, v, parent){
        var i, p = parent || window, n = namespace.split(".").reverse();
        while ((i = n.pop()) && n.length > 0) {
            if (typeof p[i] === 'undefined') {
                p[i] = {};
            } else if (typeof p[i] !== "object") {
                return false;
            }
            p = p[i];
        }
        if (typeof v !== 'undefined')
            p[i] = v;
        return p[i];
    };

});

/* @source mo/template/micro.js */;

/**
 * using AMD (Asynchronous Module Definition) API with OzJS
 * see http://ozjs.org for details
 *
 * Copyright (C) 2010-2012, Dexter.Yy, MIT License
 * vim: et:ts=4:sw=4:sts=4
 */
define("mo/template/micro", [
  "mo/lang",
  "mo/template/string"
], function(_, stpl, require, exports){

    var document = this.document;

    exports.tplSettings = {
        _cache: {},
        comment: /\{\*([\s\S]+?)\*\}/g,
        evaluate: /\{%([\s\S]+?)%\}/g,
        interpolate: /\{%=([\s\S]+?)%\}/g
    };
    exports.tplHelpers = {
        mix: _.mix,
        escapeHTML: stpl.escapeHTML,
        substr: stpl.substr,
        include: convertTpl,
        _has: function(obj){
            return function(name){
                return _.ns(name, undefined, obj);
            };
        }
    };

    function convertTpl(str, data, namespace){
        var func, c  = exports.tplSettings, suffix = namespace ? '#' + namespace : '';
        if (!/[\t\r\n% ]/.test(str)) {
            func = c._cache[str + suffix];
            if (!func) {
                var tplbox = document.getElementById(str);
                if (tplbox) {
                    func = c._cache[str + suffix] = convertTpl(tplbox.innerHTML, false, namespace);
                }
            }
        } else {
            var tplfunc = new Function(namespace || 'obj', 'api', 'var __p=[];' 
                + (namespace ? '' : 'with(obj){')
                    + 'var mix=api.mix,escapeHTML=api.escapeHTML,substr=api.substr,include=api.include,has=api._has(' + (namespace || 'obj') + ');'
                    + '__p.push(\'' +
                    str.replace(/\\/g, '\\\\')
                        .replace(/'/g, "\\'")
                        .replace(c.comment, '')
                        .replace(c.interpolate, function(match, code) {
                            return "'," + code.replace(/\\'/g, "'") + ",'";
                        })
                        .replace(c.evaluate || null, function(match, code) {
                            return "');" + code.replace(/\\'/g, "'")
                                                .replace(/[\r\n\t]/g, ' ') + "__p.push('";
                        })
                        .replace(/\r/g, '\\r')
                        .replace(/\n/g, '\\n')
                        .replace(/\t/g, '\\t')
                    + "');" 
                + (namespace ? "" : "}")
                + "return __p.join('');");
            func = function(data, helpers){
                return tplfunc.call(this, data, _.mix({}, exports.tplHelpers, helpers));
            };
        }
        return !func ? '' : (data ? func(data) : func);
    }

    exports.convertTpl = convertTpl;
    exports.reloadTpl = function(str){
        delete exports.tplSettings._cache[str];
    };

});


/* @source dollar/origin.js */;

/**
 * DollarJS
 * A jQuery-compatible and non-All-in-One library which is more "Zepto" than Zepto.js
 * Focus on DOM operations and mobile platform, wrap native API wherever possible.
 *
 * using AMD (Asynchronous Module Definition) API with OzJS
 * see http://ozjs.org for details
 *
 * Copyright (C) 2010-2012, Dexter.Yy, MIT License
 * vim: et:ts=4:sw=4:sts=4
 */
define("dollar/origin", [
  "mo/lang/es5",
  "mo/lang/mix",
  "mo/lang/type"
], function(es5, _, detect){

    var window = this,
        doc = window.document,
        NEXT_SIB = 'nextElementSibling',
        PREV_SIB = 'previousElementSibling',
        FIRST_CHILD = 'firstElementChild',
        MATCHES_SELECTOR = [
            'webkitMatchesSelector', 
            'mozMatchesSelector', 
            'msMatchesSelector', 
            'matchesSelector'
        ].map(function(name){
            return this[name] && name;
        }, doc.body).filter(pick)[0],
        MOUSE_EVENTS = { click: 1, mousedown: 1, mouseup: 1, mousemove: 1 },
        TOUCH_EVENTS = { touchstart: 1, touchmove: 1, touchend: 1, touchcancel: 1 },
        SPECIAL_TRIGGERS = { submit: 1, focus: 1, blur: 1 },
        CSS_NUMBER = {
            'column-count': 1,
            'columns': 1,
            'font-weight': 1,
            'line-height': 1,
            'opacity': 1,
            'z-index': 1,
            'zoom': 1
        },
        RE_HTMLTAG = /^\s*<(\w+|!)[^>]*>/,
        is_function = detect.isFunction,
        is_window = detect.isWindow,
        _array_map = Array.prototype.map,
        _array_push = Array.prototype.push,
        _array_slice = Array.prototype.slice,
        _elm_display = {},
        _html_containers = {};


    function $(selector, context){
        if (selector) {
            if (selector.constructor === $) {
                return selector;
            } else if (typeof selector !== 'string') {
                var nodes = new $();
                if (detect.isArraylike(selector)) {
                    _array_push.apply(nodes, _array_slice.call(selector));
                } else {
                    _array_push.call(nodes, selector);
                }
                return nodes;
            } else {
                selector = selector.trim();
                if (RE_HTMLTAG.test(selector)) {
                    return $.createNodes(selector);
                } else if (context) {
                    return $(context).find(selector);
                } else {
                    return ext.find(selector);
                }
            }
        } else if (is_window(this)) {
            return new $();
        }
    }

    var ext = $.fn = $.prototype = [];

    ['map', 'filter', 'slice', 'reverse', 'sort'].forEach(function(method){
        var origin = this['_' + method] = this[method];
        this[method] = function(){
            return $(origin.apply(this, arguments));
        };
    }, ext);

    var origin_concat = ext._concat = ext.concat;
    ext.concat = function(){
        return $(origin_concat.apply(this._slice(), check_array_argument(arguments)));
    };

    var origin_splice = ext._splice = ext.splice;
    ext.splice = function(){
        return $(origin_splice.apply(this, check_array_argument(arguments)));
    };

    _.mix(ext, {

        constructor: $,

        toString: function(){
            return this.join(',');
        },

        // Traversing

        find: function(selector){
            var nodes = new $(), contexts;
            if (this === ext) {
                contexts = [doc];
            } else {
                nodes.prevObject = contexts = this;
            }
            if (/^#[\w_]+$/.test(selector)) {
                var elm = ((contexts[0] || doc).getElementById 
                    || doc.getElementById).call(doc, selector.substr(1));
                if (elm) {
                    nodes.push(elm);
                }
            } else {
                if (contexts[1]) {
                    contexts.forEach(function(context){
                        _array_push.apply(this, 
                            $._querySelector(context, selector));
                    }, nodes);
                } else if (contexts[0]) {
                    _array_push.apply(nodes, 
                        $._querySelector(contexts[0], selector));
                }
            }
            return nodes;
        },

        eq: function(i){
            i = parseInt(i, 10);
            return i === -1 ? this.slice(-1) : this.slice(i, i + 1);
        },

        not: function(selector){
            return this.filter(function(node){
                return node && !this(node, selector);
            }, $.matchesSelector);
        },

        has: function(selector){
            return this.filter(function(node){
                return this(node, selector);
            }, $.matchesSelector);
        },

        parent: find_near('parentNode'),

        parents: function(selector){
            var ancestors = new $(), p = this,
                finding = selector 
                    ? find_selector(selector, 'parentNode') 
                    : function(node){
                        return this[this.push(node.parentNode) - 1];
                    };
            while (p.length) {
                p = p.map(finding, ancestors);
            }
            return ancestors;
        },

        closest: function(selector){
            var ancestors = new $(), p = this, 
                finding = find_selector(selector, 'parentNode');
            while (p.length && !ancestors.length) {
                p = p.map(finding, ancestors);
            }
            return ancestors.length && ancestors || this;
        },

        siblings: find_sibs(NEXT_SIB, FIRST_CHILD),

        next: find_near(NEXT_SIB),

        nextAll: find_sibs(NEXT_SIB),

        nextUntil: find_sibs(NEXT_SIB, false, true),

        prev: find_near(PREV_SIB),

        prevAll: find_sibs(PREV_SIB),

        prevUntil: find_sibs(PREV_SIB, false, true),

        children: function(){
            var r = new $();
            this.forEach(function(node){
                this(r, $(node.children));
            }, _.merge);
            return r;
        },

        contents: function(){
            var r = new $();
            this.forEach(function(node){
                this(r, $(node.childNodes));
            }, _.merge);
            return r;
        },

        // Detection

        is: function(selector){
            return this.some(function(node){
                return $.matchesSelector(node, selector);
            });
        },

        hasClass: function(cname){
            for (var i = 0, l = this.length; i < l; i++) {
                if (this[i].classList.contains(cname)) {
                    return true;
                }
            }
            return false;
        },

        // Properties

        addClass: function(cname){
            return nodes_access.call(this, cname, function(node, value){
                node.classList.add(value);
            }, function(node){
                return node.className;
            });
        },

        removeClass: function(cname){
            return nodes_access.call(this, cname, function(node, value){
                node.classList.remove(value);
            }, function(node){
                return node.className;
            });
        },

        toggleClass: function(cname, force){
            return nodes_access.call(this, cname, function(node, value){
                node.classList[force === undefined && 'toggle'
                    || force && 'add' || 'remove'](value);
            }, function(node){
                return node.className;
            });
        },

        attr: kv_access(function(node, name, value){
            node.setAttribute(name, value);
        }, function(node, name){
            return node.getAttribute(name);
        }),

        removeAttr: function(name){
            this.forEach(function(node){
                node.removeAttribute(this);
            }, name);
            return this;
        },

        prop: kv_access(function(node, name, value){
            node[name] = value;
        }, function(node, name){
            return node[name];
        }),

        removeProp: function(name){
            this.forEach(function(node){
                delete node[this];
            }, name);
            return this;
        },

        data: kv_access(function(node, name, value){
            node.dataset[css_method(name)] = value;
        }, function(node, name){
            var data = node.dataset;
            if (!data) {
                return;
            }
            return name ? data[css_method(name)] 
                : _.mix({}, data);
        }),

        removeData: function(name){
            this.forEach(function(node){
                delete node.dataset[this];
            }, name);
            return this;
        },

        val: v_access(function(node, value){
            node.value = value;
        }, function(node){
            if (this.multiple) {
                return $('option', this).filter(function(item){
                    return item.selected;
                }).map(function(item){
                    return item.value;
                });
            }
            return node.value;
        }),

        empty: function(){
            this.forEach(function(node){
                node.innerHTML = '';
            });
            return this;
        },

        html: v_access(function(node, value){
            if (RE_HTMLTAG.test(value)) {
                $(node).empty().append(value);
            } else {
                node.innerHTML = value;
            }
        }, function(node){
            return node.innerHTML;
        }),

        text: v_access(function(node, value){
            node.textContent = value;
        }, function(node){
            return node.textContent;
        }),

        clone: function(){
            return this.map(function(node){
                return node.cloneNode(true);
            });
        },

        css: kv_access(function(node, name, value){
            var prop = css_prop(name);
            if (!value && value !== 0) {
                node.style.removeProperty(prop);
            } else {
                node.style.cssText += ';' + prop + ":" + css_unit(prop, value);
            }
        }, function(node, name){
            return node.style[css_method(name)] 
                || $.getPropertyValue(node, name);
        }, function(dict){
            var prop, value, css = '';
            for (var name in dict) {
                value = dict[name];
                prop = css_prop(name);
                if (!value && value !== 0) {
                    this.forEach(function(node){
                        node.style.removeProperty(this);
                    }, prop);
                } else {
                    css += prop + ":" + css_unit(prop, value) + ';';
                }
            }
            this.forEach(function(node){
                node.style.cssText += ';' + this;
            }, css);
        }),

        hide: function(){
            return this.css("display", "none");
        },

        show: function(){
            this.forEach(function(node){
                if (node.style.display === "none") {
                    node.style.display = null;
                }
                if (this(node, "display") === "none") {
                    node.style.display = default_display(node.nodeName);
                }
            }, $.getPropertyValue);
            return this;
        },

        // Dimensions

        offset: function(){
            if (!this[0]) {
                return;
            }
            var set = this[0].getBoundingClientRect();
            return {
                left: set.left + window.pageXOffset,
                top: set.top + window.pageYOffset,
                width: set.width,
                height: set.height
            };
        },

        width: dimension('Width'),

        height: dimension('Height'),

        scrollLeft: scroll_offset(),

        scrollTop: scroll_offset(true),

        // Manipulation

        appendTo: operator_insert_to(1),

        append: operator_insert(1),

        prependTo: operator_insert_to(3),

        prepend: operator_insert(3),

        insertBefore: operator_insert_to(2),

        before: operator_insert(2),

        insertAfter: operator_insert_to(4),

        after: operator_insert(4),

        replaceAll: function(targets){
            var t = $(targets);
            this.insertBefore(t);
            t.remove();
            return this;
        },

        replaceWith: function(contents){
            return $(contents).replaceAll(this);
        },

        wrap: function(boxes){
            return nodes_access.call(this, boxes, function(node, value){
                $(value).insertBefore(node).append(node);
            });
        },

        wrapAll: function(boxes){
            $(boxes).insertBefore(this.eq(0)).append(this);
            return this;
        },

        wrapInner: function(boxes){
            return nodes_access.call(this, boxes, function(node, value){
                $(node).contents().wrapAll(value);
            });
        },

        unwrap: function(){
            this.parent().forEach(function(node){
                this(node).children().replaceAll(node);
            }, $);
            return this;
        },

        remove: function(){
            this.forEach(function(node){
                var parent = node.parentNode;
                if (parent) {
                    parent.removeChild(node);
                }
            });
            return this;
        },

        // Event

        on: event_access('add'),

        off: event_access('remove'),

        once: function(subject, cb){
            var fn = function(){
                $(this).off(subject, fn);
                return cb.apply(this, arguments);
            };
            return $(this).on(subject, fn);
        },

        trigger: trigger,

        // Miscellaneous

        end: function(){
            return this.prevObject || new $();
        },

        each: function(fn){
            for (var i = 0, l = this.length; i < l; i++){
                var re = fn.call(this[i], i);
                if (re === false) {
                    break;      
                }
            }
            return this;
        }

    });

    ext.bind = ext.on;
    ext.unbind = ext.off;
    ext.one = ext.once;

    // private

    function pick(v){ 
        return v; 
    }

    function find_selector(selector, attr){
        return function(node){
            if (attr) {
                node = node[attr];
            }
            if ($.matchesSelector(node, selector)) {
                this.push(node);
            }
            return node;
        };
    }

    function find_near(prop){
        return function(selector){
            return $(_.unique([undefined, doc, null].concat(
                this._map(selector ? function(node){
                    var n = node[prop];
                    if (n && $.matchesSelector(n, selector)) {
                        return n;
                    }
                } : function(node){
                    return node[prop];
                })
            )).slice(3));
        };
    }

    function find_sibs(prop, start, has_until){
        return function(target, selector){
            if (!has_until) {
                selector = target;
            }
            var sibs = new $();
            this.forEach(function(node){
                var until,
                    n = start ? node.parentNode[start] : node;
                if (has_until) {
                    until = $(target, node.parentNode);
                }
                do {
                    if (until && until.indexOf(n) > -1) {
                        break;
                    }
                    if (node !== n && (!selector 
                        || $.matchesSelector(n, selector))) {
                        this.push(n);
                    }
                } while (n = n[prop]);
            }, sibs);
            return _.unique(sibs);
        };
    }

    function nodes_access(value, setter, getter, name){
        if (value === null || value === undefined) {
            return this;
        }
        var is_fn_arg = is_function(value);
        this.forEach(function(node, i){
            if (!node) {
                return;
            }
            var v = !is_fn_arg 
                ? value 
                : value.call(this, i, 
                    getter && getter.call(this, node, name));
            setter.call(this, node, name || v, v);
        }, this);
        return this;
    }

    function v_access(setter, getter){
        return function(value){
            if (arguments.length > 0) {
                return nodes_access.call(this, value, setter, getter);
            } else {
                return this[0] ? getter.call(this, this[0]) : undefined;
            }
            return this;
        };
    }

    function kv_access(setter, getter, map){
        return function(name, value){
            if (typeof name === 'object') {
                if (map) {
                    map.call(this, name);
                } else {
                    for (var k in name) {
                        this.forEach(function(node){
                            if (!node) {
                                return;
                            }
                            setter.call(this, node, k, name[k]);
                        }, this);
                    }
                }
            } else {
                if (arguments.length > 1) {
                    return nodes_access.call(this, value, setter, getter, name);
                } else {
                    return this[0] ? getter.call(this, this[0], name) : undefined;
                }
            }
            return this;
        };
    }

    function event_access(action){
        function access(subject, cb){
            if (typeof subject === 'object') {
                for (var i in subject) {
                    access.call(this, [i, subject[i]]);
                }
            } else if (cb) {
                subject = $.Event.aliases[subject] || subject;
                this.forEach(function(node){
                    node[action + 'EventListener'](subject, this, false);
                }, cb);
            }  // not support 'removeAllEventListener'
            return this;
        }
        return access;
    }

    function trigger(me, event, data){
        if (this === $) {
            me = $(me);
        } else {
            data = event;
            event = me;
            me = this;
        }
        if (typeof event === 'string') {
            event = $.Event(event);
        }
        _.mix(event, data);
        me.forEach((SPECIAL_TRIGGERS[event.type]
                && !event.defaultPrevented) 
            ? function(node){
                node[event.type]();
            } : function(node){
                if ('dispatchEvent' in node) {
                    node.dispatchEvent(this);
                }
            }, event);
        return this;
    }

    function css_method(name){
        return name.replace(/-+(.)?/g, function($0, $1){
            return $1 ? $1.toUpperCase() : '';
        }); 
    }

    function css_prop(name) {
        return name.replace(/::/g, '/')
            .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
            .replace(/([a-z\d])([A-Z])/g, '$1_$2')
            .replace(/_/g, '-')
            .toLowerCase();
    }

    function css_unit(name, value) {
        return typeof value == "number" && !CSS_NUMBER[name] 
            && value + "px" || value;
    }

    function default_display(tag) {
        var display = _elm_display[tag];
        if (!display) {
            var tmp = document.createElement(tag);
            doc.body.appendChild(tmp);
            display = $.getPropertyValue(tmp, "display");
            tmp.parentNode.removeChild(tmp);
            if (display === "none") {
                display = "block";
            }
            _elm_display[tag] = display;
        }
        return display;
    }

    function dimension(method){
        return function(){
            var node = this[0];
            if (!node) {
                return;
            }
            return is_window(node)
                ? node['inner' + method]
                : node.nodeType === 9 
                    ? node.documentElement['offset' + method] 
                    : (this.offset() || {})[method.toLowerCase()];
        };
    }

    function scroll_offset(is_top){
        var method = 'scroll' + is_top ? 'Top' : 'Left',
            prop = 'page' + (is_top ? 'Y' : 'X') + 'Offset';
        return function(){
            var node = this[0];
            if (!node) {
                return;
            }
            return is_window(node) ? node[prop] : node[method];
        };
    }

    function insert_node(target, node, action){
        if (node.nodeName.toUpperCase() === 'SCRIPT' 
                && (!node.type || node.type === 'text/javascript')) {
            window['eval'].call(window, node.innerHTML);
        }
        switch(action) {
        case 1:
            target.appendChild(node);
            break;
        case 2: 
            target.parentNode.insertBefore(node, target);
            break;
        case 3:
            target.insertBefore(node, target.firstChild);
            break;
        case 4:
            target.parentNode.insertBefore(node, target.nextSibling);
            break;
        default:
            break;
        }
    }

    function insert_nodes(action, is_reverse){
        var fn = is_reverse ? function(target){
            insert_node(target, this, action);
        } : function(content){
            insert_node(this, content, action);
        };
        return function(selector){
            this.forEach(function(node){
                this.forEach(fn, node);
            }, is_reverse 
                    || typeof selector !== 'string'
                    || RE_HTMLTAG.test(selector)
                ? $(selector)
                : $.createNodes(selector));
            return this;
        };
    }

    function operator_insert_to(action){
        return insert_nodes(action, true);
    }

    function operator_insert(action){
        return insert_nodes(action);
    }

    function check_array_argument(args){
        return _array_map.call(args, function(i){
            if (typeof i === 'object') {
                return i._slice();
            } else {
                return i;
            }
        });
    }

    // public static API

    $.find = $;

    $._querySelector = function(context, selector){
        try {
            return _array_slice.call(context.querySelectorAll(selector));
        } catch (ex) {
            return [];
        }
    };

    $.matchesSelector = function(elm, selector){
        return elm && elm.nodeType === 1 && elm[MATCHES_SELECTOR](selector);
    };

    $.createNodes = function(str, attrs){
        var tag = (RE_HTMLTAG.exec(str) || [])[0] || str;
        var temp = _html_containers[tag];
        if (!temp) {
            temp = _html_containers[tag] = tag === 'tr' 
                    && document.createElement('tbody')
                || (tag === 'tbody' || tag === 'thead' || tag === 'tfoot') 
                    && document.createElement('table')
                || (tag === 'td' || tag === 'th') 
                    && document.createElement('tr')
                || document.createElement('div');
        }
        temp.innerHTML = str;
        var nodes = new $();
        _array_push.apply(nodes, _array_slice.call(temp.childNodes));
        nodes.forEach(function(node){
            this.removeChild(node);
        }, temp);
        if (attrs) {
            for (var k in attrs) {
                nodes.attr(k, attrs[k]);
            }
        }
        return nodes;
    };

    $.getStyles = window.getComputedStyle && function(elm){
        return window.getComputedStyle(elm, null);
    } || document.documentElement.currentStyle && function(elm){
        return elm.currentStyle;
    };

    $.getPropertyValue = function(elm, name){
        var styles = $.getStyles(elm);
        return styles.getPropertyValue 
            && styles.getPropertyValue(name) || styles[name];
    };

    $.Event = function(type, props) {
        var real_type = $.Event.aliases[type] || type;
        var bubbles = true,
            is_touch = TOUCH_EVENTS[type],
            event = document.createEvent(is_touch && 'TouchEvent' 
                || MOUSE_EVENTS[type] && 'MouseEvents' 
                || 'Events');
        if (props) {
            if ('bubbles' in props) {
                bubbles = !!props.bubbles;
                delete props.bubbles;
            }
            _.mix(event, props);
        }
        event[is_touch && 'initTouchEvent' 
            || 'initEvent'](real_type, bubbles, true);
        return event;
    };

    $.Event.aliases = {};

    $.trigger = trigger;

    $.camelize = css_method;
    $.dasherize = css_prop;
    $._vAccess = v_access;
    $._kvAccess = kv_access;
    $._nodesAccess = nodes_access;

    return $;

});

/* @source dollar.js */;

/**
 * DollarJS
 * A jQuery-compatible and non-All-in-One library which is more "Zepto" than Zepto.js
 * Focus on DOM operations and mobile platform, wrap native API wherever possible.
 *
 * using AMD (Asynchronous Module Definition) API with OzJS
 * see http://ozjs.org for details
 *
 * Copyright (C) 2010-2012, Dexter.Yy, MIT License
 * vim: et:ts=4:sw=4:sts=4
 */
define("dollar", [
  "dollar/origin"
], function($){
    return $;
});

/* @source darkdom.js */;


define("darkdom", [
  "mo/lang/es5",
  "mo/lang/mix",
  "dollar"
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
    _sourcedata = {},
    _darkdata = {},
    _guards = {},
    _updaters = {},
    _uuid = 0,
    _to_string = Object.prototype.toString,
    RENDERED_MARK = 'rendered',
    BRIGHT_ID = 'bright-root-id',
    ID_PREFIX = '_brightRoot';

var dom_ext = {

    updateDarkDOM: function(){
        update_target(this);
        exports.DarkGuard.gc();
    },

    feedDarkDOM: function(fn){
        var bright_id = $(this).attr(BRIGHT_ID),
            guard = _guards[bright_id];
        if (guard) {
            var user_data = is_function(fn) 
                ? fn(_sourcedata[bright_id]) : fn;
            fix_userdata(user_data, guard);
            _sourcedata[bright_id] = user_data;
        }
    },

    observeDarkDOM: function(subject, handler){
        var target = $(this),
            bright_id = target.attr(BRIGHT_ID),
            updaters = _updaters[bright_id];
        if (!updaters) {
            updaters = _updaters[bright_id] = {};
        }
        updaters[subject] = handler;
    }

};

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
        if (!this._options.enableSource) {
            return;
        }
        return this._sourceGuard;
    },

    watch: function(targets){
        targets = $(targets, this._contextTarget);
        if (this._options.unique) {
            targets = targets.eq(0);
        }
        targets.forEach(function(target){
            this.registerRoot($(target));
        }, this);
        return this;
    },

    render: function(){
        this._darkRoots.forEach(function(target){
            this.renderRoot(target);
        }, this);
        return this;
    },

    buffer: function(){
        this._darkRoots.forEach(function(target){
            this.bufferRoot(target);
        }, this);
        return this;
    },

    update: function(){
        this._darkRoots.forEach(function(target){
            this.updateRoot(target);
        }, this);
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
        _.each(dom_ext, function(method, name){
            this[name] = method;
        }, target[0]);
        this._darkRoots.push(target);
        return bright_id;
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
            guard._resetWatch();
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

    releaseData: function(){
        var re = this._buffer.slice();
        if (this._options.unique) {
            re = re[0] || {};
        }
        this._resetBuffer();
        return re;
    },

    _bufferData: function(data){
        this._buffer.push(data);
    },

    _bufferContent: function(){
        this._buffer.forEach(function(data){
            _content_buffer[data.id] = data;
        }, this);
        this._resetBuffer();
    },

    _releaseContent: function(buffer_id){
        var buffer = _content_buffer[buffer_id];
        delete _content_buffer[buffer_id];
        return buffer;
    },

    _resetBuffer: function(){
        this._buffer.length = 0;
        return this;
    },

    _resetWatch: function(){
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

    template: function(data){
        return (this._options.template
            || '<span>' + data.content + '</span>')(data);
    },

    triggerUpdate: function(changes){
        var handler;
        var subject = changes.type;
        var updaters = _updaters[changes.rootId] 
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
        _sourcedata[bright_id] = dataset;
        return dataset;
    },

    _mergeSource: function(data){
        var source_dataset = _sourcedata[data.id];
        if (!source_dataset) {
            source_dataset = this.scanSource(data.id, 
                data.attr.source);
        }
        if (source_dataset) {
            merge_source(data, source_dataset, data.context);
        }
    }

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
            delete _sourcedata[bright_id];
            delete _updaters[bright_id];
        }
    }, current);
};

init_plugins($);

function init_plugins($){
    _.each(dom_ext, function(method, name){
        this[name] = function(){
            _.each(this, function(target){
                method.apply(target, this);
            }, arguments);
            return this;
        };
    }, $.fn);
}

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
    return _to_string.call(obj) === "[object Function]";
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
exports.gc = DarkGuard.gc;
exports.initPlugins = init_plugins;

return exports;

});

/* @source ../cardkit2/card/common/scaffold.js */;


define("../cardkit2/card/common/scaffold", [
  "darkdom",
  "mo/template/micro",
  "../cardkit2/card/../tpl/scaffold/hd",
  "../cardkit2/card/../tpl/scaffold/ft"
], function(darkdom, tpl,
    tpl_hd, tpl_ft){

var hd = darkdom({
    unique: true,
    enableSource: true,
    template: tpl.convertTpl(tpl_hd.template)
});

var hd_link = darkdom({
    unique: true,
    enableSource: true,
    //template: ''
});

var hd_link_extern = darkdom({
    unique: true,
    enableSource: true,
    //template: ''
});

var hd_opt = darkdom({
    enableSource: true,
    //template: ''
});

var ft = darkdom({
    unique: true,
    enableSource: true,
    template: tpl.convertTpl(tpl_ft.template)
});

return function(root){
    root.contain('hd', hd);
    root.contain('hdLink', hd_link);
    root.contain('hdLinkExtern', hd_link_extern);
    root.contain('hdOpt', hd_opt);
    root.contain('ft', ft);
};

});


/* @source ../cardkit2/card/box.js */;


define("../cardkit2/card/box", [
  "mo/lang",
  "dollar",
  "darkdom",
  "mo/template/micro",
  "../cardkit2/card/common/scaffold",
  "../cardkit2/tpl/box",
  "../cardkit2/tpl/box/content"
], function(_, $, darkdom, tpl, 
    scaffold_components, tpl_box, tpl_box_content){

var content = darkdom({
    enableSource: true,
    template: tpl.convertTpl(tpl_box_content.template)
});

var box = darkdom({
    enableSource: true,
    template: tpl.convertTpl(tpl_box.template)
});
scaffold_components(box);
box.contain('content', content, {
    content: true
});

return box;

});


/* @source ../cardkit2/spec/box.js */;


define("../cardkit2/spec/box", [
  "mo/lang",
  "dollar",
  "../cardkit2/card/box",
  "../cardkit2/spec/common/scaffold",
  "../cardkit2/spec/common/source_scaffold"
], function(_, $, box_card, 
        scaffold_specs, source_scaffold_specs){

var selector = 'ck-card[type="box"]';

return function(guard, parent){
    guard.watch(parent && $(selector, parent) || selector);
    guard.bond({
        subtype: 'subtype',
        paperStyle: 'paper-style',
        plainStyle: 'plain-style',
        plainHdStyle: 'plain-hd-style'
    });
    guard.delegate('content', function(guard){
        guard.watch('ck-part[type="content"]');
    });
    _.each(scaffold_specs, function(spec, name){
        guard.delegate(name, spec);
    });
    guard.source().delegate('content', function(source){
        source.watch('.ckd-content');
    });
    _.each(source_scaffold_specs, function(spec, name){
        this.delegate(name, spec);
    }, guard.source());
};

});


/* @source ../cardkit2/spec/page.js */;


define("../cardkit2/spec/page", [
  "mo/lang",
  "dollar",
  "../cardkit2/spec/box"
], function(_, $, box_spec){

return function(guard, source, parent){
    guard.watch($('ck-card[type="page"]', parent));
    guard.bond({
        isFirst: 'firstpage',
        cardId: 'id'
    });
    guard.delegate('title', 'ck-part[type="title"]');
    guard.delegate('actionbar', actionbar_spec);
    guard.delegate('navdrawer', navdrawer_spec);
    guard.delegate('box', box_spec);
};

function navdrawer_spec(guard){
    guard.watch('ck-part[type="navdrawer"]');
}

function actionbar_spec(guard){
    guard.watch('ck-part[type="actionbar"]');
    guard.delegate('action', action_spec);
    guard.source().delegate('action', source_action_spec);
}

function action_spec(guard){
    guard.watch('[action-layout]');
    guard.bond('forceOverflow', function(node){
        return 'overflow' === 
            node.attr('action-layout');
    });
    source_action_attr(guard.source());
}

function source_action_spec(source){
    source.watch('.ckd-item, .ckd-overflow-item');
    source_action_attr(source);
}

function source_action_attr(source){
    source.bond('forceOverflow', function(node){
        return node.hasClass('ckd-overflow-item');
    });
}

});

/* @source ../cardkit2/tpl/page/navdrawer.js */;

define("../cardkit2/tpl/page/navdrawer", [], function(){

    return {"template":"\n<div class=\"ck-navdrawer\"></div>\n"}; 

});
/* @source ../cardkit2/tpl/page/actionbar/action.js */;

define("../cardkit2/tpl/page/actionbar/action", [], function(){

    return {"template":"\n<button class=\"ck-action\">{%= content %}</button>\n"}; 

});
/* @source ../cardkit2/tpl/page/actionbar.js */;

define("../cardkit2/tpl/page/actionbar", [], function(){

    return {"template":"\n<div class=\"ck-actionbar\">\n{% component.action.forEach(function(action){ %}\n    {%= action %}\n{% }); %}\n</div>\n"}; 

});
/* @source ../cardkit2/tpl/page/title.js */;

define("../cardkit2/tpl/page/title", [], function(){

    return {"template":"\n<div class=\"ck-title\"></div>\n"}; 

});
/* @source ../cardkit2/tpl/page.js */;

define("../cardkit2/tpl/page", [], function(){

    return {"template":"\n<div class=\"ck-card\" \n        card-id=\"{%= attr.cardId %}\">\n    {%= component.title %}\n    {%= component.actionbar %}\n    {%= component.navdrawer %}\n    {%= content %}\n</div>\n\n"}; 

});
/* @source ../cardkit2/card/page.js */;


define("../cardkit2/card/page", [
  "mo/lang",
  "dollar",
  "darkdom",
  "mo/template/micro",
  "../cardkit2/card/box",
  "../cardkit2/tpl/page",
  "../cardkit2/tpl/page/title",
  "../cardkit2/tpl/page/actionbar",
  "../cardkit2/tpl/page/actionbar/action",
  "../cardkit2/tpl/page/navdrawer"
], function(_, $, darkdom, tpl, box,
    tpl_page, tpl_title, tpl_actionbar, tpl_action, tpl_navdrawer){

var title = darkdom({
    unique: true,
    template: tpl.convertTpl(tpl_title.template)
});

var action = darkdom({
    enableSource: true,
    template: tpl.convertTpl(tpl_action.template)
});

var actionbar = darkdom({
    unique: true,
    enableSource: true,
    template: tpl.convertTpl(tpl_actionbar.template)
}).contain('action', action);

var navdrawer = darkdom({
    unique: true,
    template: tpl.convertTpl(tpl_navdrawer.template)
});

var page = darkdom({
    template: tpl.convertTpl(tpl_page.template)
});
page.bond({
    cardId: 'id'
});
page.contain('title', title);
page.contain('actionbar', actionbar);
page.contain('navdrawer', navdrawer);
page.contain('box', box, {
    content: true
});

return page;

});


/* @source ../cardkit2/spec.js */;


define("../cardkit2/spec", [
  "../cardkit2/card/page",
  "../cardkit2/spec/page",
  "../cardkit2/card/box",
  "../cardkit2/spec/box"
], function(__oz0, __oz1, __oz2, __oz3, require){

    return {
        page: [require("../cardkit2/card/page"), require("../cardkit2/spec/page")],
        box: [require("../cardkit2/card/box"), require("../cardkit2/spec/box")]
    };

});

/* @source ../cardkit2/app.js */;


define("../cardkit2/app", [
  "mo/lang",
  "dollar",
  "darkdom",
  "../cardkit2/spec",
  "../cardkit2/oldspec",
  "../cardkit2/supports",
  "../cardkit2/bus",
  "mo/domready"
], function(_, $, darkdom, 
    specs, oldspecs, supports, bus){

var _components = {},
    _specs = {},
    _defaults = {
        components: ['page', 'box', 'list', 'mini', 'form', 'banner'],
        supportOldVersion: false
    };

var exports = {

    init: function(opt){
        var cfg = this._config = _.config({}, opt, _defaults);
        cfg.components.forEach(function(name){
            var data = specs[name];
            if (data) {
                this.setComponent(name, data[0]);
                this.setSpec(name, data[1]);
            }
        }, this);
        if (cfg.supportOldVersion) {
            cfg.components.forEach(function(name){
                var data = oldspecs[name];
                if (data) {
                    this.setComponent(name, data[0]);
                    this.setSpec(name, data[1]);
                }
            }, this);
        }
    },

    setComponent: function(name, component){
        _components[name] = component;
    },

    setSpec: function(name, spec){
        _specs[name] = spec;
    },

    applySpec: function(name, parent){
        var component = _components[name],
            spec = _specs[name];
        if (!component || !spec) {
            return false;
        }
        var guard = component.createGuard();
        spec(guard, parent);
        guard.render();
        return true;
    },

    render: function(parent){
        _.each(_components, function(component, name){
            this.applySpec(name, parent);
        }, this);
    },

    event: bus

};

return exports;

});

/* @source  */;


require.config({
    baseUrl: 'js/vendor/',
    distUrl: 'static/js/vendor/',
    aliases: {
        'cardkit': '../cardkit2/'
    }
});

//define('mo/lang/es5', [], function(){});
define('mo/easing/functions', [], function(){});
define('mo/mainloop', [], function(){});

define('cardkit/pageready', [
    'finish', 
    'cardkit/bus'
], function(finish, bus){
    bus.once('readycardchange', function(){
        setTimeout(finish, 500);
    });
});

require([
    'dollar', 
    'cardkit/bus',
    'cardkit/app'
], function(){

    if (false) {
        require(['mo/cookie', 'mo/console'], function(){});
    }

});
