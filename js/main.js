
require.config({
    baseUrl: 'js/vendor/',
    distUrl: 'static/js/vendor/',
    aliases: {
        'cardkit': '../cardkit2/'
    }
});

//define('mo/lang/es5', [], function(){});
define('mo/easing/functions', [], function(){});
define('mo/mainloop', [], function(){});

define('cardkit/pageready', [
    'finish', 
    'cardkit/bus'
], function(finish, bus){
    bus.once('readycardchange', function(){
        setTimeout(finish, 500);
    });
});

require([
    'dollar', 
    'cardkit/bus',
    'cardkit/app'
], function(){

    if (false) {
        require(['mo/cookie', 'mo/console'], function(){});
    }

});
