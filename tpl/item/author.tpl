{% if (context.itemAuthorLink) { %}
<a href="{%= context.itemAuthorLink %}" 
    class="ck-author ck-link {%= (context.itemAuthorLinkExtern ? 'ck-link-extern' : '') %}">{%= context %}</a>
{% } else { %}
<span class="ck-author">{%= context %}</span>
{% } %}
