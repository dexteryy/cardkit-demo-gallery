{% if (context.authorLink) { %}
<a href="{%= context.authorLink %}" 
    target="{%= (context.authorLinkTarget || '_self') %}" 
    class="ck-author">{%= content %}</a>
{% } else { %}
<span class="ck-author">{%= content %}</span>
{% } %}
