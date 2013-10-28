define([
    'mo/lang',
    'dollar',
    'moui/actionview',
    '../bus'
], function(_, $, actionView, bus) {

    var UID = '_ckActionViewUid',
        uid = 0,
        lib = {},
        custom = {
            className: 'ck-actionview',
            confirmText: '确定',
            cancelText: '取消'
        };

    function exports(elm, opt){
        var id = elm;
        if (typeof elm === 'object') {
            elm = $(elm);
            id = elm[0][UID];
        } else {
            elm = false;
        }
        if (id && lib[id]) {
            return lib[id].set(opt);
        }
        if (elm) {
            id = elm[0][UID] = ++uid;
        }
        opt = _.mix({}, custom, opt);
        var view = lib[id] = actionView(opt);
        var eprops = {
            component: view
        };
        view.event.bind('prepareOpen', function(view){
            exports.current = view;
            bus.fire('actionView:prepareOpen', [view]);
        }).bind('cancelOpen', function(view){
            exports.current = null;
            bus.fire('actionView:cancelOpen', [view]);
        }).bind('open', function(view){
            bus.fire('actionView:open', [view]);
            if (elm) {
                elm.trigger('actionView:open', eprops);
            }
        }).bind('close', function(){
            exports.current = null;
            bus.unbind('actionView:confirmOnThis');
            bus.fire('actionView:close', [view]);
            if (elm) {
                elm.trigger('actionView:close', eprops);
            }
        }).bind('cancel', function(){
            if (elm) {
                elm.trigger('actionView:cancel', eprops);
            }
        }).bind('confirm', function(view, picker){
            bus.fire('actionView:confirmOnThis', [view]);
            if (elm) {
                elm.trigger('actionView:confirm', eprops);
            }
            if (picker && picker._lastSelected) {
                var target = picker._lastSelected._node.attr('target');
                if (target) {
                    bus.fire('actionView:jump', [view, picker.val(), target]);
                }
            }
        });
        return view;
    }

    exports.defaults = _.copy(custom);

    return exports;

});
