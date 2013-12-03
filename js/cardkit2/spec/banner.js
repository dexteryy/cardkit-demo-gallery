
define([
    'mo/lang',
    'dollar',
    '../card/banner'
], function(_, $, component){

    return function(){

        return component.register($('ck-card[type="banner"]'), {
            configures: {
            }
        });

    };

});

