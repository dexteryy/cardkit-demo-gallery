
require.config({
    baseUrl: 'js/vendor/',
    distUrl: 'static/js/vendor/'
});

// @deprecated
define('cardkit/app', ['cardkit'], function(cardkit){
    return cardkit;
});

// @deprecated
define('cardkit/pageready', [
    'cardkit', 
    'finish'
], function(cardkit, finish){
    cardkit.event.once('ready', finish);
});

define('env', [], function(){
    return {
        oldStyle: false
    };
});

require([
    'mo/lang',
    'dollar',
    'cardkit',
    'mo/console',
    'env',
    'mo/domready'
], function(_, $, cardkit, console, env){

    if (false) {
        require(['mo/cookie', 'mo/console'], function(){});
    }

    cardkit.init({
        appWrapper: '.my-app',
        defaultPage: 'ckDefault',
        oldStyle: env.oldStyle
    });
    cardkit.openPage();

    console.config({
        record: true
    });
    console.enable();

});
