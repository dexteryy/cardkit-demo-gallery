{% if (context.isItemLinkAlone) { %}
<a href="{%= context.itemLink %}" 
    target="{%= (context.itemLinkTarget || '_self') %}">{%= content %}</a>
{% } else { %}
<span class="ck-title">{%= content %}</span>
{% } %}

