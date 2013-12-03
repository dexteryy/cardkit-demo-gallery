
define([
    'mo/lang',
    'dollar',
    '../card/form',
    './common/scaffold'
], function(_, $, component, scaffold_components){

    return function(){

        return component.register($('ck-card[type="form"]'), {
            configures: {
                subtype: 'subtype',
                blankContent: 'blank-content',
                plainHdStyle: 'plain-hd-style'
            },
            components: _.mix({
                item: function(component){
                    component.register('ck-part[type="item"]', {
                        configures: {
                            raw: 'raw'
                        },
                        components: {
                            content: function(component){
                                component.register('ck-part[type="content"]', {
                                    configures: {
                                        raw: 'raw'
                                    }
                                });
                            }
                        }
                    });
                }
            }, scaffold_components)
        });

    };

});

