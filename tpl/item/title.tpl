{% if (context.itemLinkAlone) { %}
<a href="{%= context.itemLinkAlone %}" 
    class="ck-link {%= (context.itemLinkExtern ? 'ck-link-extern' : '') %}">{%= content %}</a>
{% } else { %}
<span class="ck-title">{%= content %}</span>
{% } %}

