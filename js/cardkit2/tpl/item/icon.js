define([], function(){

    return {"template":"{% if (state.imgUrl) { %}\n    {% if (context.isItemLinkAlone) { %}\n    <a href=\"{%= context.itemLink %}\" \n            target=\"{%= (context.itemLinkTarget || '_self') %}\" \n            class=\"ck-icon ck-link\">\n        <img src=\"{%= state.imgUrl %}\"/>\n    </a>\n    {% } else { %}\n    <span class=\"ck-icon\">\n        <img src=\"{%= state.imgUrl %}\"/>\n    </span>\n    {% } %}\n{% } %}\n"}; 

});