
require.config({
    baseUrl: 'js/vendor/',
    distUrl: 'static/js/vendor/'
});

define('mo/easing/functions', [], function(){});
define('mo/mainloop', [], function(){});

//define('cardkit/pageready', [
    //'finish', 
    //'cardkit/bus'
//], function(finish, bus){
    //bus.once('readycardchange', function(){
        //setTimeout(finish, 500);
    //});
//});

require([
    'mo/lang',
    'dollar',
    'cardkit'
], function(_, $, cardkit){

cardkit.init({
    supportOldVersion: true
});
cardkit.openPage();

if (false) {
    require(['mo/cookie', 'mo/console'], function(){});
}

});
