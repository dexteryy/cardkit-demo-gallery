/**
 * Momo (MoMotion)
 * A framework and a collection for separate and simple implementation of touch gestures
 * 
 * using AMD (Asynchronous Module Definition) API with OzJS
 * see http://ozjs.org for details
 *
 * Copyright (C) 2010-2012, Dexter.Yy, MIT License
 * vim: et:ts=4:sw=4:sts=4
 */
define('momo/base', [
    'mo/lang/es5',
    'mo/lang/type',
    'mo/lang/mix'
], function(es5, type, _){

    var isFunction = type.isFunction,
        gid = 0,

        SUPPORT_TOUCH = false;

    try {
        document.createEvent("TouchEvent");  
        SUPPORT_TOUCH = true;
    } catch (e) {}

    function MomoBase(elm, opt, cb){
        if (!opt || isFunction(opt)) {
            cb = opt;
            opt = {};
        }
        this._listener = cb;
        var eid = cb && ++gid;
        this.event = {};
        this.EVENTS.forEach(function(ev){
            this[ev] = ev + (cb ? '_' + eid : '');
        }, this.event);
        this.node = elm;
        this._config = {
            event: this.EVENTS[0]
        };
        this.config(opt);
        this.enable();
    }

    MomoBase.prototype = {

        SUPPORT_TOUCH: SUPPORT_TOUCH,

        PRESS: SUPPORT_TOUCH ? 'touchstart' : 'mousedown',
        MOVE: SUPPORT_TOUCH ? 'touchmove' : 'mousemove',
        RELEASE: SUPPORT_TOUCH ? 'touchend' : 'mouseup',
        CANCEL: 'touchcancel',

        EVENTS: [],
        DEFAULT_CONFIG: {
            namespace: ''
        },

        config: function(opt){
            var old_ns = this._config.namespace;
            _.merge(_.mix(this._config, opt), this.DEFAULT_CONFIG);

            var ns = this._config.namespace || '';
            this.EVENTS.forEach(function(ev){
                this[ev] = this[ev].replace(old_ns || /^/, ns);
            }, this.event);

            return this;
        },

        enable: function(){
            var self = this;
            self.bind(self.PRESS, 
                self._press || (self._press = function(e){
                    return self.press.call(self, e.originalEvent || e);
                })
            ).bind(self.MOVE, 
                self._move || (self._move = function(e){
                    return self.move.call(self, e.originalEvent || e);
                })
            ).bind(self.CANCEL, 
                self._cancel || (self._cancel = function(e){
                    return self.cancel.call(self, e.originalEvent || e);
                })
            ).bind(self.RELEASE, 
                self._release || (self._release = function(e){
                    return self.release.call(self, e.originalEvent || e);
                })
            );
            if (self._listener) {
                self.bind(this.event[this._config.event], 
                    self._handler || (self._handler = function(e){
                        return self._listener.call(self, e.originalEvent || e);
                    })
                );
            }
            return self;
        },

        disable: function(){
            var self = this;
            self.unbind(self.PRESS, self._press)
                .unbind(self.MOVE, self._move)
                .unbind(self.CANCEL, self._cancel)
                .unbind(self.RELEASE, self._release);
            if (self._listener && self._handler) {
                self.unbind(this.event[this._config.event], self._handler);
            }
            return self;
        },

        once: function(ev, handler, node){
            var self = this;
            this.bind(ev, fn, node);
            function fn(e){
                self.unbind(ev, fn, node);
                return handler.call(this, e.originalEvent || e);
            }
        },

        // adapter

        bind: nothing,

        unbind: nothing,

        trigger: nothing,

        // hook

        press: nothing,

        move: nothing,

        release: nothing,

        cancel: nothing
    
    };

    function nothing(){ return this; }

    function exports(elm, opt, cb){
        return new exports.Class(elm, opt, cb);
    }

    exports.Class = MomoBase;

    return exports;

});
