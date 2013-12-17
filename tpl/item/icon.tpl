{% if (state.imgUrl) { %}
    {% if (context.itemLinkAlone) { %}
    <a href="{%= context.itemLinkAlone %}" 
            class="ck-icon ck-link {%= (context.itemLinkExtern ? 'ck-link-extern' : '') %}">
        <img src="{%= state.imgUrl %}"/>
    </a>
    {% } else { %}
    <span class="ck-icon">
        <img src="{%= state.imgUrl %}"/>
    </span>
    {% } %}
{% } %}
