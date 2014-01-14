
define(function(require){ 

var $ = require('dollar'),
    UNMOUNT_FLAG = '.unmount-page',
    get_source = function(node){
        var source = node.data('source');
        return source && ('.' + source);
    };

var specs = {
    title: '.ckcfg-card-title',
    actionbar: actionbar_spec,
    nav: nav_spec,
    footer: footer_spec,
    box: require('./box'),
    list: require('./list')
};

function nav_spec(guard){
    guard.watch('.ckcfg-card-nav');
    guard.state({
        link: 'href'
    });
}

function actionbar_spec(guard){
    guard.watch('.ckcfg-card-actions');
    guard.state({
        limit: 'data-cfg-limit',
        source: get_source
    });
    guard.component('action', action_spec);
    guard.source().component('action', action_spec);
}

function footer_spec(guard){
    guard.watch('.ckcfg-card-footer');
    guard.state('source', get_source);
}

function action_spec(guard){
    guard.watch('.ckd-item, .ckd-overflow-item');
    guard.state('source', get_source);
    action_attr(guard);
    action_attr(guard.source());
}

function action_attr(guard){
    if (!guard) {
        return;
    }
    guard.state('forceOverflow', function(node){
        return node.hasClass('ckd-overflow-item');
    });
}

function exports(guard, parent){
    guard.watch($(exports.SELECTOR + UNMOUNT_FLAG, parent));
    guard.watch($(exports.SELECTOR_OLD + UNMOUNT_FLAG, parent));
    guard.state({
        isPageActive: 'data-active-page',
        isDeckActive: 'data-active-deck',
        currentDeck: 'data-current-deck',
        deck: 'data-deck',
        cardId: 'id'
    });
    guard.component(specs);
}

exports.SELECTOR = '.ck-page-card';
exports.SELECTOR_OLD = '.ck-card';

return exports;

});

