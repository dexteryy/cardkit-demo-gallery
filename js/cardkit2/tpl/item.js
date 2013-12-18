define([], function(){

    return {"template":"<div class=\"ck-item {%= (itemLink && 'clickable' || '') %}\" \n        style=\"width:{%= (context.state.col ? Math.floor(1000/context.state.col)/10 + '%' : '') %};\">\n\n    <div class=\"ck-initem\">\n\n        {% if (itemLink && !isItemLinkAlone) { %}\n        <a href=\"{%= itemLink %}\" \n            target=\"{%= (itemLinkTarget || '_self') %}\"\n            class=\"ck-link ck-link-mask\"></a>\n        {% } %}\n\n        <div class=\"ck-title-box\">\n\n            {%= component.opt.join('') %}\n            {%= component.icon %}\n\n            <div class=\"ck-title-set\">\n\n                {% if (component.title) { %}\n                <div class=\"ck-title-line\">\n                    {%= component.titlePrefix.join('') %}\n                    {%= component.title %}\n                    {%= component.titleSuffix.join('') %}\n                    {%= component.titleTag.join('') %}\n                </div>\n                {% } %}\n\n                {% if (component.info.length) { %}\n                <div class=\"ck-info-wrap\">\n                    {%= component.info.join('') %}\n                </div>\n                {% } %}\n\n                {% if (component.desc.length) { %}\n                <div class=\"ck-desc-wrap\">\n                    {%= component.desc.join('') %}\n                </div>\n                {% } %}\n\n            </div>\n\n            {% if (component.content.length) { %}\n            <div class=\"ck-content-wrap\">\n                {%= component.content.join('') %}\n            </div>\n            {% } %}\n\n            {% if (component.meta.length) { %}\n            <div class=\"ck-meta-wrap\">\n                {%= component.meta.join('') %}\n            </div>\n            {% } %}\n\n        </div>\n\n        {% if (component.author || component.authorDesc.length || component.authorMeta.length) { %}\n        <div class=\"ck-author-box\">\n\n            {%= component.avatar %}\n\n            <div class=\"ck-author-set\">\n\n                <div class=\"ck-author-line\">\n                    {%= component.authorPrefix.join('') %}\n                    {%= component.author %}\n                    {%= component.authorSuffix.join('') %}\n                </div>\n\n                {% if (component.authorInfo.length) { %}\n                <div class=\"ck-author-info-wrap\">\n                    {%= component.authorInfo.join('') %}\n                </div>\n                {% } %}\n\n                {% if (component.authorDesc.length) { %}\n                <div class=\"ck-author-desc-wrap\">\n                    {%= component.authorDesc.join('') %}\n                </div>\n                {% } %}\n\n            </div>\n\n            {% if (component.authorMeta.length) { %}\n            <div class=\"ck-author-meta-wrap\">\n                {%= component.authorMeta.join('') %}\n            </div>\n            {% } %}\n\n        </div>\n        {% } %}\n\n    </div>\n\n</div>\n\n"}; 

});