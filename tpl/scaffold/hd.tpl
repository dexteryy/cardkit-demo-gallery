{% if (attr.url) { %}
<a class="ck-hd" 
    href="{%= attr.url %}">{%= content %}</span>
{% } else { %}
<span class="ck-hd">{%= content %}</span>
{% } %}
