define([], function(){

    return {"template":"<span class=\"ck-hd {%= (hdLink && 'clickable' || '') %}\">\n    {% if (hdLink) { %}\n    <a href=\"{%= hdLink %}\" \n        target=\"{%= (context.hdLinkTarget || '_self') %}\" \n        class=\"ck-link ck-link-mask\"></a>\n    {% } %}\n    <span>{%= content %}</span>\n</span>\n"}; 

});