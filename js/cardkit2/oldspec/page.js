
define([
    'mo/lang',
    'dollar',
    '../card/page'
], function(_, $, component){

    return function(){

        return component.register($('.ck-card'), {
            attrs: {
                isFirst: function(node){
                    return node[0].id === 'ckDefault';
                },
                cardId: 'id'
            },
            components: {
                title: '.ckcfg-card-title',
                actionbar: function(component, node){
                    var actions = node.find('.ckcfg-card-actions');
                    component.register(actions, {
                        attrs: {
                            raw: 'data-source'
                        },
                        components: {
                            action: function(component){
                                component.register('.ckd-item, .ckd-overflow-item', {
                                    configures: {
                                        raw: 'data-source',
                                        forceOverflow: function(node){
                                            return node.hasClass('ckd-overflow-item');
                                        }
                                    }
                                });
                            }
                        }
                    });
                },
                navdrawer: function(component){
                    component.register($('.ckcfg-navdrawer'));
                }
            },
        });

    };

});

