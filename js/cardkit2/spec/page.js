
define([
    'mo/lang',
    'dollar',
    './box',
], function(_, $, box_spec){

    return function(guard, source, parent){
        guard.watch($('ck-card[type="page"]', parent));
        guard.bond({
            isFirst: 'firstpage',
            cardId: 'id'
        });
        guard.delegate('title', 'ck-part[type="title"]');
        guard.delegate('actionbar', actionbar_spec);
        guard.delegate('navdrawer', navdrawer_spec);
        guard.delegate('box', box_spec);
    };

    function navdrawer_spec(guard){
        guard.watch('ck-part[type="navdrawer"]');
    }

    function actionbar_spec(guard){
        guard.watch('ck-part[type="actionbar"]');
        guard.delegate('action', action_spec);
        guard.source().delegate('action', source_action_spec);
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

});
