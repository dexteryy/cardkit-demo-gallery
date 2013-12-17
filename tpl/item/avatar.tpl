{% if (state.imgUrl) { %}
    {% if (context.itemAuthorLink) { %}
    <a href="{%= context.itemAuthorLink %}" 
            class="ck-avatar ck-link {%= (context.itemAuthorLinkExtern ? 'ck-link-extern' : '') %}">
        <img src="{%= state.imgUrl %}"/>
    </a>
    {% } else { %}
    <span class="ck-avatar">
        <img src="{%= state.imgUrl %}"/>
    </span>
    {% } %}
{% } %}
