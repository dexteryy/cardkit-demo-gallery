define([], function(){

    return {"template":"{% if (attr.url) { %}\n<a class=\"ck-hd\" \n    href=\"{%= attr.url %}\"\n    id=\"{%= id %}\"\n    autorender=\"true\">{%= content %}</span>\n{% } else { %}\n<span class=\"ck-hd\"\n    id=\"{%= id %}\"\n    autorender=\"true\">{%= content %}</span>\n{% } %}\n"}; 

});