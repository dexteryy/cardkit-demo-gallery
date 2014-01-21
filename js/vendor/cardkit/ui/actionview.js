define([
    'moui/actionview',
    '../bus',
    './util'
], function(actionView, bus, util) {

var exports = util.singleton({

    flag: '_ckActionViewUid',

    factory: function(elm, opt){
        opt.className = 'ck-actionview';
        return actionView(opt);
    },

    config: function(o, opt){
        o.set(opt);
    },

    extend: function(o, source){
        var eprops = {
            component: o
        };
        o.event.bind('prepareOpen', function(o){
            exports.current = o;
            bus.fire('actionView:prepareOpen', [o]);
        }).bind('cancelOpen', function(o){
            exports.current = null;
            bus.fire('actionView:cancelOpen', [o]);
        }).bind('open', function(o){
            bus.fire('actionView:open', [o]);
            if (source) {
                source.trigger('actionView:open', eprops);
            }
        }).bind('close', function(){
            exports.current = null;
            bus.unbind('actionView:confirmOnThis');
            bus.fire('actionView:close', [o]);
            if (source) {
                source.trigger('actionView:close', eprops);
            }
        }).bind('cancel', function(){
            if (source) {
                source.trigger('actionView:cancel', eprops);
            }
        }).bind('confirm', function(o, picker){
            bus.fire('actionView:confirmOnThis', [o]);
            if (source) {
                source.trigger('actionView:confirm', eprops);
            }
            if (picker && picker._lastSelected) {
                var target = picker._lastSelected._node.attr('target');
                if (target) {
                    bus.fire('actionView:jump', [o, picker.val(), target]);
                }
            }
        });
    }

});

return exports;

});
