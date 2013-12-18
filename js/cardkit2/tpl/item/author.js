define([], function(){

    return {"template":"{% if (context.authorLink) { %}\n<a href=\"{%= context.authorLink %}\" \n    target=\"{%= (context.authorLinkTarget || '_self') %}\" \n    class=\"ck-author ck-link\">{%= context %}</a>\n{% } else { %}\n<span class=\"ck-author\">{%= context %}</span>\n{% } %}\n"}; 

});