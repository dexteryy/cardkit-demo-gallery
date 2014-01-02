
define(function(require){ 

var $ = require('dollar'),
    selector = 'ck-card[type="page"][active-page="true"]';

var specs = {
    title: 'ck-part[type="title"]',
    actionbar: actionbar_spec,
    navdrawer: navdrawer_spec,
    box: require('./box'),
    list: require('./list')
};

function navdrawer_spec(guard){
    guard.watch('ck-part[type="navdrawer"]');
}

function actionbar_spec(guard){
    guard.watch('ck-part[type="actionbar"]');
    guard.component('action', action_spec);
    guard.source().component('action', source_action_spec);
}

function action_spec(guard){
    guard.watch('[action-layout]');
    guard.bond('forceOverflow', function(node){
        return 'overflow' === 
            node.attr('action-layout');
    });
    source_action_attr(guard.source());
}

function source_action_spec(source){
    source.watch('.ckd-item, .ckd-overflow-item');
    source_action_attr(source);
}

function source_action_attr(source){
    source.bond('forceOverflow', function(node){
        return node.hasClass('ckd-overflow-item');
    });
}

return function(guard, parent){
    guard.watch($(selector, parent));
    guard.bond({
        isActive: 'active-page',
        cardId: 'id'
    });
    guard.component(specs);
};

});
