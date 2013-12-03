
define([
    'mo/lang',
    'dollar',
    '../card/box',
    './common/scaffold'
], function(_, $, component, scaffold_components){

    return function(){

        return component.register($('.ck-box-unit'), {
            configures: {
                subtype: 'data-style',
                paperStyle: 'data-cfg-paper',
                plainStyle: 'data-cfg-plain',
                plainHdStyle: 'data-cfg-plainhd'
            },
            components: _.mix({
                content: function(component){
                    component.register('.ckd-content', {
                        configures: {
                            raw: 'data-source'
                        }
                    });
                }
            }, scaffold_components)
        });

    };

});

