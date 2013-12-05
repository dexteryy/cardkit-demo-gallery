define([], function(){

    return {"template":"{% if (attr.url) { %}\n<a class=\"ck-hd\" \n    href=\"{%= attr.url %}\">{%= content %}</span>\n{% } else { %}\n<span class=\"ck-hd\">{%= content %}</span>\n{% } %}\n"}; 

});