
require.config({
    baseUrl: 'js/vendor/',
    distUrl: 'static/js/vendor/'
});

define('mo/easing/functions', [], function(){});
define('mo/mainloop', [], function(){});

define('syntaxhighlighter/shCore', ['syntaxhighlighter/XRegExp']);
define('sh/core', ['syntaxhighlighter/shCore'], function(){
    return window.SyntaxHighlighter;
});
define('sh/js', ['sh/core']);
define('sh/xml', ['sh/core']);

// @deprecated
define('cardkit/app', ['cardkit'], function(cardkit){
    return cardkit;
});

// @deprecated
define('cardkit/pageready', [
    'dollar', 
    'cardkit', 
    'finish'
], function($, cardkit, finish){
    var default_page = $('#ckDefault');
    if (default_page[0].isMountedDarkDOM) {
        finish();
    } else {
        default_page.once('pageCard:opened', finish);
    }
});

require([
    'mo/lang',
    'dollar',
    'cardkit',
    'mo/console',
    'sh/core',
    'mo/domready'
], function(_, $, cardkit, console, SyntaxHighlighter){

    if (false) {
        require(['mo/cookie', 'mo/console'], function(){});
    }

    cardkit.init({
        appWrapper: '.my-app',
        defaultPage: 'ckDefault',
        oldStyle: true
    });
    cardkit.openPage();

    console.config({
        record: true
    });
    console.enable();

    SyntaxHighlighter.defaults['toolbar'] = false;
    SyntaxHighlighter.all();

});
