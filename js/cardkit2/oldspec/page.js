
define(function(require){ 

var $ = require('dollar');
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
    guard.bond('source', 'data-source');
    guard.component('action', action_spec);
    guard.source().component('action', action_spec);
}

function action_spec(guard){
    guard.watch('.ckd-item, .ckd-overflow-item');
    guard.bond('source', 'data-source');
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

return function(guard, source, parent){
    guard.watch($('.ck-card', parent));
    guard.bond({
        isFirst: function(node){
            return node.attr('id') === 'ckDefault';
        },
        cardId: 'id'
    });
    guard.component(specs);
};

});

