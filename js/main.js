
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

require([
    'cardkit',
    'mo/console',
    'mo/domready'
], function(){

    if (false) {
        require(['mo/cookie'], function(){});
    }

});
