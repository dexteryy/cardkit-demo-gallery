define([], function(){

    return {"template":"{% if (state.imgUrl) { %}\n    {% if (context.itemLinkAlone) { %}\n    <a href=\"{%= context.itemLinkAlone %}\" \n            class=\"ck-icon ck-link {%= (context.itemLinkExtern ? 'ck-link-extern' : '') %}\">\n        <img src=\"{%= state.imgUrl %}\"/>\n    </a>\n    {% } else { %}\n    <span class=\"ck-icon\">\n        <img src=\"{%= state.imgUrl %}\"/>\n    </span>\n    {% } %}\n{% } %}\n"}; 

});