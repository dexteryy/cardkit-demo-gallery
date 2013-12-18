{% if (context.authorLink) { %}
<a href="{%= context.authorLink %}" 
    target="{%= (context.authorLinkTarget || '_self') %}" 
    class="ck-author ck-link">{%= context %}</a>
{% } else { %}
<span class="ck-author">{%= context %}</span>
{% } %}
