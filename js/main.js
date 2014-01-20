
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
        supportOldVer: true
    });
    cardkit.openPage();

    console.config({
        record: true
    });
    console.enable();

    SyntaxHighlighter.defaults['toolbar'] = false;
    SyntaxHighlighter.all();

});
