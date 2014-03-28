
define([
    'dollar',
    'prism'
], function($, Prism){

var prism_lib = {
    'HTML': Prism.languages.markup,
    'JS': Prism.languages.javascript
};

function exports(guard){
    guard.watch('my-codebox');
    guard.state({
        code: exports.codeGetter,
        langName: 'lang'
    });
}

exports.codeGetter = function(node){
    var lang = node.attr('lang');
    var grammar = prism_lib[lang];
    var sel = node.attr('code-selector');
    if (node.attr('parent-scope') === "true") {
        var parent = node.parent();
        if (sel) {
            sel = parent.find(sel);
        }
        if (!sel || !sel[0]) {
            sel = parent;
        }
    } else {
        sel = $(sel);
    }
    if (!sel[0]) {
        return '';
    }
    var code = node.attr('only-content') === 'true'
        ? sel[0].innerHTML
        : sel[0].outerHTML;
    code = code.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/\u00a0/g, ' ');
    if (lang === 'HTML') {
        code = code//.replace(/\s+([\w\-]+\=['"])/g, '\n  $1')
            .replace(/>\s*(\&lt;)/g, '>\n$1');
    }
    return Prism.highlight(code, grammar);
};

return exports;

});

