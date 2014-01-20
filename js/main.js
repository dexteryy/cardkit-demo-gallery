
require.config({
    baseUrl: 'js/vendor/',
    distUrl: 'static/js/vendor/'
});

define('mo/easing/functions', [], function(){});
define('mo/mainloop', [], function(){});

require([
    'mo/lang',
    'dollar',
    'cardkit',
    'mo/domready'
], function(_, $, cardkit){

    cardkit.init({
        appWrapper: '.my-app',
        supportOldVer: true
    });
    cardkit.openPage();

    if (false) {
        require(['mo/cookie', 'mo/console'], function(){});
    }

});
