define([], function(){

    return {"template":"{% if (context.itemLinkAlone) { %}\n<a href=\"{%= context.itemLinkAlone %}\" \n    class=\"ck-link {%= (context.itemLinkExtern ? 'ck-link-extern' : '') %}\">{%= content %}</a>\n{% } else { %}\n<span class=\"ck-title\">{%= content %}</span>\n{% } %}\n\n"}; 

});