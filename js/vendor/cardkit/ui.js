
define([
    'mo/lang',
    'dollar',
    'mo/browsers',
    'mo/template',
    'soviet',
    'momo/base',
    'momo/tap',
    './ui/control',
    './ui/picker',
    './ui/ranger',
    './ui/stars',
    './ui/modalcard',
    './ui/actionview',
    './ui/growl',
    './supports',
    './bus'
], function(_, $, browsers, tpl, soviet, 
    momoBase, momoTap,
    control, picker, ranger, stars, 
    modalCard, actionView, growl, supports, bus){

var doc = document,
    _soviet_aliases = {},
    components = {
        control: control,
        picker: picker,
        ranger: ranger,
        stars: stars,
        modalCard: modalCard,
        actionView: actionView, 
        growl: growl
    };

_.mix(momoBase.Class.prototype, {
    bind: function(ev, handler, elm){
        $(elm || this.node).bind(ev, handler);
        return this;
    },
    unbind: function(ev, handler, elm){
        $(elm || this.node).unbind(ev, handler);
        return this;
    },
    trigger: function(e, ev){
        delete e.layerX;
        delete e.layerY;
        $(e.target).trigger(ev, e);
        return this;
    }
});

var tap_events = {

    '.ck-link': link_handler,
    '.ck-link *': link_handler,

    // control

    '.ck-post-link': handle_control,

    '.ck-post-button, .ck-post-button span': tap_ck_post,

    '.ck-folder header': function(){
        control(this.parentNode).toggle();
    },

    '.ck-switch, .ck-switch span': tap_ck_switch,

    // picker

    '.ck-segment .ck-option, .ck-segment .ck-option span': function(){
        var btn = $(this);
        if (!btn.hasClass('ck-option')) {
            btn = btn.closest('.ck-option');
        }
        var p = picker(btn.parent());
        p.select(btn);
    },

    '.ck-select, .ck-select span, .ck-select .enabled': function(){
        var me = $(this);
        if (!me.hasClass('ck-select')) {
            me = me.parent();
        }
        var p = picker(me);
        show_actions(me);
        bus.bind('actionView:confirmOnThis', function(actions){
            p.select(actions.val());
        });
    },

    '.ck-tagselector .ck-option': function(){
        var p = picker(this.parentNode);
        p.select(this);
    },

    '.ck-actions .ck-option': function(){
        var actions = $(this).closest('.ck-actions');
        var p = picker(actions, {
            ignoreStatus: actions.data("ignoreStatus") !== 'false' && true
        });
        p.select(this);
    },

    '.ck-actions-button, .ck-actions-button span': function(){
        var me = $(this);
        if (!me.hasClass('ck-actions-button')) {
            me = me.parent();
        }
        show_actions(me);
    },

    // ranger

    // modalView

    '.ck-modal-link': function(){},

    // actionView

    '.ck-actionview article > .ck-option, .ck-actionview article > .ck-option > *': function(){
        var me = $(this);
        if (!me.hasClass('ck-option')) {
            me = me.parent();
        }
        actionView.current.select(me);
    },

    '.ck-actionview > footer .confirm': function(){
        actionView.current.confirm();
    },

    '.ck-actionview > footer .cancel': function(){
        actionView.current.cancel();
    },

    '.ck-top-overflow': function(){
        show_actions($(this));
    },

    // growl 

    '.ck-growl-button': function(){
        growl(this).open();
    }

};

var exports = {

    init: function(opt){
        opt = opt || {};
        var wrapper = $(opt.appWrapper);
        actionView.forceOptions.parent = wrapper;
        growl.forceOptions.parent = wrapper;
        modalCard.set({
            parent: wrapper
        });
        var tapGesture = momoTap(doc, {
            tapThreshold: 20 
        });
        set_alias_events(tapGesture.event);
        var prevent_click_events = {};
        Object.keys(tap_events).forEach(function(selector){
            this[selector] = nothing;
        }, prevent_click_events);
        this.delegate = soviet(doc, {
            aliasEvents: _soviet_aliases,
            autoOverride: true,
            matchesSelector: true,
            preventDefault: true
        }).on('tap', tap_events)
            .on('click', prevent_click_events);
    },

    alert: function(text, opt) {
        actionView('ckAlert', _.mix({
            title: '提示',
            content: text || '',
            cancelText: '关闭',
            multiselect: false
        }, opt)).open();
    },

    confirm: function(text, cb, opt) {
        actionView('ckAlert', _.mix({
            title: '提示',
            content: text || '',
            confirmText: '确认',
            cancelText: '取消',
            multiselect: true
        }, opt)).open();
        bus.bind('actionView:confirmOnThis', cb);
    },

    notify: function(content, opt) {
        growl(_.mix({
            content: content
        }, opt)).open();
    },

    openLink: function(href, opt){
        opt = opt || {};
        if (typeof href !== 'string') {
            var node = href;
            href = node.href;
            opt.target = node.target;
        }
        if (opt.target && opt.target !== '_self') {
            window.open(href, opt.target);
        } else {
            location.href = href;
        }
    },

    component: components

};

function link_handler(){
    exports.openLink(this);
}

function handle_control(){
    var controller = control(this),
        cfg = controller.data();
    if (cfg.disableUrl || cfg.disableJsonUrl) {
        controller.toggle();
    } else if (!controller.isEnabled) {
        controller.enable();
    }
} 

function toggle_control(){
    control(this).toggle();
} 

function tap_ck_post(){
    if (!$(this).hasClass('ck-post-button')) {
        return tap_ck_post.call(this.parentNode);
    }
    handle_control.call(this);
}

function tap_ck_switch(){
    if (!$(this).hasClass('ck-switch')) {
        return tap_ck_switch.call(this.parentNode);
    }
    toggle_control.call(this);
}

function show_actions(me){
    var opt = _.mix({
        confirmText: '确认',
        cancelText: '取消',
        multiselect: false
    }, me.data());
    opt.options = $(opt.options || '.ck-option', me);
    return actionView(me, opt).open();
}

function set_alias_events(events) {
    for (var ev in events) {
        $.Event.aliases[ev] = _soviet_aliases[ev] = 'ck_' + events[ev];
    }
}

function nothing(){}

return exports;

});

