
define([
    'mo/lang',
    'dollar',
    '../card/list',
    './common/item',
    './common/scaffold'
], function(_, $, component, item_components, scaffold_components){

    return function(){

        return component.register($('ck-card[type="list"]'), {
            configures: {
                subtype: 'subtype',
                blankContent: 'blank-content',
                limit: 'limit', 
                col: 'col', 
                paperStyle: 'paper-style',
                plainStyle: 'plain-style',
                plainHdStyle: 'plain-hd-style'
            },
            components: _.mix({
                item: function(component){
                    component.register('ck-part[type="item"]', {
                        configures: {
                            raw: 'raw'
                        },
                        components: item_components
                    });
                }
            }, scaffold_components)
        });

    };

});

