
define([
    'mo/lang',
    'dollar',
    'mo/browsers',
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
], function(_, $, browsers, soviet, 
    momoBase, momoTap,
    control, picker, ranger, stars, modalCard, actionView, growl){

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

    // ranger

    // modalView

    '.ck-modal-link': function(){},

    // actionView

    // growl 

};

var exports = {

    init: function(opt){
        opt = opt || {};
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
    var controller = control(this, {
            disableRequest: check_voodoo(this, handle_control)
        }),
        cfg = controller.data();
    if (cfg.disableUrl || cfg.disableJsonUrl) {
        controller.toggle();
    } else if (!controller.isEnabled) {
        controller.enable();
    }
} 

function toggle_control(){
    control(this, {
        disableRequest: check_voodoo(this, toggle_control)
    }).toggle();
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

function check_voodoo(me, handler){
    var me = $(me);
    if (me.hasClass('ck-overflow-item')
            || me.hasClass('ck-item')) {
        var voodoo = me.data('voodoo');
        if (voodoo) {
            $(voodoo).forEach(function(elm){
                if (elm !== this) {
                    handler.call(elm);
                }
            }, me[0]);
            return true;
        }
    }
    return false;
}

function set_alias_events(events) {
    for (var ev in events) {
        $.Event.aliases[ev] = _soviet_aliases[ev] = 'ck_' + events[ev];
    }
}

function nothing(){}

return exports;

});

