
define([
    'mo/lang',
    'dollar',
    '../card/banner'
], function(_, $, component){

    return function(){

        return component.register($('.ck-banner-unit'), {
            configures: {
            }
        });

    };

});

