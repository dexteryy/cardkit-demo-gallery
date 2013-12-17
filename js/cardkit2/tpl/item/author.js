define([], function(){

    return {"template":"{% if (context.itemAuthorLink) { %}\n<a href=\"{%= context.itemAuthorLink %}\" \n    class=\"ck-author ck-link {%= (context.itemAuthorLinkExtern ? 'ck-link-extern' : '') %}\">{%= context %}</a>\n{% } else { %}\n<span class=\"ck-author\">{%= context %}</span>\n{% } %}\n"}; 

});