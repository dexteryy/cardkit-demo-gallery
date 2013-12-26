define([], function(){

    return {"template":"{% if (context.authorLink) { %}\n<a href=\"{%= context.authorLink %}\" \n    target=\"{%= (context.authorLinkTarget || '_self') %}\" \n    class=\"ck-author\">{%= content %}</a>\n{% } else { %}\n<span class=\"ck-author\">{%= content %}</span>\n{% } %}\n"}; 

});