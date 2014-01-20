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
define('momo/scroll', [
    'mo/lang',
    'momo/base'
], function(_, momoBase){

    var MomoScroll = _.construct(momoBase.Class),
        _map = Array.prototype.map,
        _foreach = Array.prototype.forEach;

    _.mix(MomoScroll.prototype, {

        EVENTS: [
            'scrolldown', 
            'scrollup', 
            'scrollstart', 
            'scrollmove',
            'scrollend'
        ],
        DEFAULT_CONFIG: {
            'enableMoveEvent': false,
            'directThreshold': 5,
            'scrollEndGap': 5
        },

        watchScroll: function(elm){
            this.scrollingNode = elm.nodeName === 'BODY' ? document : elm;
            this.scrollPosNode = 'scrollTop' in elm ? elm : document.body;
        },

        checkScollDirection: function(changes){
            var d = 0;
            changes.forEach(function(change){
                if (change.identifier in this) {
                    d += change.clientY - this[change.identifier];
                }
            }, this._lastY);
            var node = { target: this.node },
                ev = this.event,
                threshold = this._config.directThreshold;
            if (!this._started 
                    && (d < 0 - threshold
                        || d > threshold)) {
                this._scrollStart();
            }
            if (d < 0 - threshold) {
                if (this._scrollDown !== true) {
                    this.trigger(node, ev.scrolldown);
                }
                changes.forEach(update_lastdata, this._lastY);
                this._scrollDown = true;
            } else if (d > threshold) {
                if (this._scrollDown !== false) {
                    this.trigger(node, ev.scrollup);
                }
                changes.forEach(update_lastdata, this._lastY);
                this._scrollDown = false;
            }
        },

        press: function(e){
            var self = this;
            if (!self.scrollingNode) {
                return;
            }
            if (self.SUPPORT_TOUCH) {
                if (!self._pressed) {
                    self._lastY = {};
                }
                _foreach.call(e.touches, init_lastdata, self._lastY);
            }
            if (self._pressed) {
                return;
            }
            if (!self.SUPPORT_TOUCH) {
                self._lastY = {};
                self._lastY[e.identifier || 'mouse'] = e.clientY;
            }
            self._pressed = true;
            self._scrollDown = null;
            self._scrollY = null;
            self._ended = false;
            var scrolling = self._scrolling;
            self._scrolling = false;
            var tm = self._tm = e.timeStamp;
            self.once(self.MOVE, function(){
                self.once('scroll', once_scroll, self.scrollingNode);
            });
            function once_scroll(){
                if (tm !== self._tm || scrolling) {
                    return;
                }
                if (!self._started) {
                    self._scrollStart();
                }
                if (self._ended) {
                    self._ended = false;
                    self._scrollEnd();
                }
            }
        },

        move: function(e){
            if (!this.scrollingNode) {
                return;
            }
            var changes = _map.call(this.SUPPORT_TOUCH 
                    ? e.touches : [e],
                changes_data);
            this.checkScollDirection(changes);
            this._scrollY = this.scrollPosNode.scrollTop;
            if (this._config.enableMoveEvent && this._started) {
                this.trigger({ 
                    target: this.node 
                }, this.event.scrollmove);
            }
        },

        release: function(e){
            var self = this;
            if (!self.scrollingNode
                    || self.SUPPORT_TOUCH && e.touches[0]) {
                return;
            }
            // up/down
            var changes = _map.call(this.SUPPORT_TOUCH 
                    ? e.changedTouches : [e],
                changes_data);
            self.checkScollDirection(changes);
            // end
            self._pressed = false;
            if (self._scrollY === null) {
                if (self._started) {
                    self._scrollEnd();
                }
                return;
            }
            var vp = self.scrollPosNode,
                gap = Math.abs(vp.scrollTop - self._scrollY) || 0;
            if (self._scrollY >= 0 
                    && (self._scrollY <= vp.scrollHeight + vp.offsetHeight)
                    && gap < self._config.scrollEndGap) {
                if (self._started) {
                    self._scrollEnd();
                } else {
                    self._ended = true;
                }
            } else {
                var tm = self._tm;
                self._scrolling = true;
                self.once('scroll', function(){
                    if (tm !== self._tm) {
                        return;
                    }
                    self._scrolling = false;
                    self._scrollEnd();
                }, self.scrollingNode);
            }
            self._scrollY = null;
        },
    
        _scrollStart: function(){
            this._started = true;
            this.trigger({ target: this.node }, this.event.scrollstart);
        },

        _scrollEnd: function(){
            this._started = false;
            this._tm = +new Date();
            this.trigger({ target: this.node }, this.event.scrollend);
        }

    });

    function changes_data(touch){
        return { 
            identifier: touch.identifier || 'mouse',
            clientY: touch.clientY
        };
    }

    function init_lastdata(touch){
        var tid = touch.identifier || 'mouse';
        if (!(tid in this)) {
            this[tid] = touch.clientY;
        }
    }
    
    function update_lastdata(change){
        if (change.identifier in this) {
            this[change.identifier] = change.clientY;
        }
    }

    function exports(elm, opt, cb){
        return new exports.Class(elm, opt, cb);
    }

    exports.Class = MomoScroll;

    return exports;

});
