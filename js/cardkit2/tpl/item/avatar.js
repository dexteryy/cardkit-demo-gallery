define([], function(){

    return {"template":"{% if (state.imgUrl) { %}\n    {% if (context.itemAuthorLink) { %}\n    <a href=\"{%= context.itemAuthorLink %}\" \n            class=\"ck-avatar ck-link {%= (context.itemAuthorLinkExtern ? 'ck-link-extern' : '') %}\">\n        <img src=\"{%= state.imgUrl %}\"/>\n    </a>\n    {% } else { %}\n    <span class=\"ck-avatar\">\n        <img src=\"{%= state.imgUrl %}\"/>\n    </span>\n    {% } %}\n{% } %}\n"}; 

});