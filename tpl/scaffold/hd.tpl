{% if (attr.url) { %}
<a class="ck-hd" 
    href="{%= attr.url %}"
    id="{%= id %}"
    autorender="true">{%= content %}</span>
{% } else { %}
<span class="ck-hd"
    id="{%= id %}"
    autorender="true">{%= content %}</span>
{% } %}
