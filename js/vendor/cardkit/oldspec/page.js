
define(function(require){ 

var $ = require('dollar'),
    selector = '.ck-page-card',
    selector_old = '.ck-card',
    willopen = '.ck-page-willopen',
    get_source = function(node){
        return '.' + node.data('source');
    };

var specs = {
    title: '.ckcfg-card-title',
    actionbar: actionbar_spec,
    navdrawer: navdrawer_spec,
    box: require('./box'),
    list: require('./list')
};

function navdrawer_spec(guard){
    guard.watch('.ckcfg-navdrawer');
}

function actionbar_spec(guard){
    guard.watch('.ckcfg-card-actions');
    guard.bond('source', get_source);
    guard.component('action', action_spec);
    guard.source().component('action', action_spec);
}

function action_spec(guard){
    guard.watch('.ckd-item, .ckd-overflow-item');
    guard.bond('source', get_source);
    action_attr(guard);
    action_attr(guard.source());
}

function action_attr(guard){
    if (!guard) {
        return;
    }
    guard.bond('forceOverflow', function(node){
        return node.hasClass('ckd-overflow-item');
    });
}

return function(guard, parent){
    guard.watch($(selector + willopen, parent));
    guard.watch($(selector_old + willopen, parent));
    guard.bond({
        isActive: 'active-page',
        cardId: 'id'
    });
    guard.component(specs);
};

});

