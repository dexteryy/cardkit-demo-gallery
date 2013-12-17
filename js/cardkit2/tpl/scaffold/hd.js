define([], function(){

    return {"template":"{% var hd_link = context.component.hdLink || state.url; %}\n<span class=\"ck-hd {%= (hd_link && 'clickable' || '') %}\">\n    {% if (hd_link) { %}\n    <a href=\"{%= hd_link %}\" \n        class=\"ck-link ck-link-mask {%= (context.component.hdLinkExtern ? 'ck-link-extern' : '') %}\"></a>\n    {% } %}\n    <span>{%= content %}</span>\n</span>\n"}; 

});