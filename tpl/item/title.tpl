{% if (context.isItemLinkAlone) { %}
<a href="{%= context.itemLink %}" 
    target="{%= (context.itemLinkTarget || '_self') %}" 
    class="ck-link">{%= content %}</a>
{% } else { %}
<span class="ck-title">{%= content %}</span>
{% } %}

