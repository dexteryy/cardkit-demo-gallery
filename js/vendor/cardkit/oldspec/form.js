
define([
    'mo/lang',
    'dollar',
    '../card/form',
    './common/scaffold'
], function(_, $, component, scaffold_components){

    return function(){

        return component.register($('.ck-form-unit'), {
            configures: {
                subtype: 'data-style',
                blankContent: 'data-cfg-blank',
                plainHdStyle: 'data-cfg-plainhd'
            },
            components: _.mix({
                item: function(component){
                    component.register('.ckd-item', {
                        configures: {
                            raw: 'data-source'
                        },
                        components: {
                            content: function(component){
                                component.register('.ckd-content', {
                                    configures: {
                                        raw: 'data-source'
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

