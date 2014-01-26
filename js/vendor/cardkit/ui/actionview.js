define([
    'moui/actionview',
    '../bus',
    './util'
], function(actionView, bus, util) {

var exports = util.singleton({

    flag: '_ckActionViewUid',

    forceOptions: {
        className: 'ck-actionview'
    },

    factory: function(elm, opt){
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
        }).bind('confirm', function(o){
            bus.fire('actionView:confirmOnThis', [o]);
            if (source) {
                source.trigger('actionView:confirm', eprops);
            }
        });
    }

});

return exports;

});
