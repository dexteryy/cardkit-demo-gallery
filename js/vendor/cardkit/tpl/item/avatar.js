define([], function(){

    return {"template":"{% if (state.imgUrl) { %}\n    {% if (context.authorLink) { %}\n    <a href=\"{%= context.authorLink %}\" \n            target=\"{%= (context.authorLinkTarget || '_self') %}\" \n            class=\"ck-avatar\">\n        <img src=\"{%= state.imgUrl %}\"/>\n    </a>\n    {% } else { %}\n    <span class=\"ck-avatar\">\n        <img src=\"{%= state.imgUrl %}\"/>\n    </span>\n    {% } %}\n{% } %}\n"}; 

});