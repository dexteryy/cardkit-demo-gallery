define([], function(){

    return {"template":"<div class=\"ck-list-unit\"\n        data-style=\"{%= state.subtype %}\"\n        data-cfg-blank=\"{%= state.blankContent %}\"\n        data-cfg-limit=\"{%= state.limit %}\"\n        data-cfg-col=\"{%= state.col %}\"\n        data-cfg-paper=\"{%= state.paperStyle %}\"\n        data-cfg-plain=\"{%= state.plainStyle %}\"\n        data-cfg-plainhd=\"{%= state.plainHdStyle %}\">\n\n    {% if (hasSplitHd) { %}\n        {%= hd_wrap(component) %}\n    {% } %}\n\n    <article class=\"ck-unit-wrap\">\n\n        {% if (!hasSplitHd) { %}\n            {%= hd_wrap(component) %}\n        {% } %}\n        \n        <div class=\"ck-list-wrap\">\n\n            {% if (component.item.length) { %}\n\n                <div class=\"ck-list\">\n                {% component.item.forEach(function(item, i){ %}\n\n                    {% if (i && (i % state.col === 0)) { %}\n                    </div><div class=\"ck-list\">\n                    {% } %}\n\n                    {%= item %}\n\n                {% }); %}\n                </div>\n\n            {% } else { %}\n\n                <div class=\"ck-list\">\n                    <div class=\"ck-item blank\">\n                        <div class=\"ck-initem\">{%=(state.blank || '目前还没有内容')%}</div>\n                    </div>\n                </div>\n\n            {% } %}\n\n        </div>\n\n        {%= component.ft %}\n\n    </article>\n\n</div>\n\n{% function hd_wrap(component){ %}\n\n    {% if (!component.hd) { %}\n        {% return; %}\n    {% } %}\n\n    <header class=\"ck-hd-wrap\">\n\n        {%= component.hd %}\n\n        {% if (component.hdOpt.length) { %}\n            <div class=\"ck-hdopt-wrap\">\n                {%= component.hdOpt.join('') %}\n            </div>\n        {% } %}\n\n    </header>\n\n{% } %}\n\n\n"}; 

});