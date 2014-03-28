
require.config({
    baseUrl: 'js/vendor/',
    distUrl: 'static/js/vendor/',
    aliases: {
        galleryapp: '../galleryapp/'
    }
});

define('prism-src', 'prism.js');
define('prism', [], function(){
    return window.Prism;
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
    'galleryapp/component/codebox',
    'galleryapp/spec/codebox',
    'galleryapp/oldspec/codebox',
    'mo/console',
    'mo/domready'
], function(){

    if (false) {
        require(['mo/cookie', 'prism-src'], function(){});
    }

});
