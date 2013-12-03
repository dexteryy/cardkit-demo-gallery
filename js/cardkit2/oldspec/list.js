
define([
    'mo/lang',
    'dollar',
    '../card/list',
    './common/item',
    './common/scaffold'
], function(_, $, component, item_components, scaffold_components){

    return function(){

        return component.register($('.ck-list-unit'), {
            configures: {
                subtype: 'data-style',
                blankContent: 'data-cfg-blank',
                limit: 'data-cfg-limit', 
                col: 'data-cfg-col', 
                paperStyle: 'data-cfg-paper',
                plainStyle: 'data-cfg-plain',
                plainHdStyle: 'data-cfg-plainhd'
            },
            components: _.mix({
                item: function(component){
                    component.register('.ckd-item', {
                        configures: {
                            raw: 'data-source'
                        },
                        components: item_components
                    });
                }
            }, scaffold_components)
        });

    };

});

