<span class="ck-hd {%= (hdLink && 'clickable' || '') %}">
    {% if (hdLink) { %}
    <a href="{%= hdLink %}" 
        target="{%= (context.hdLinkTarget || '_self') %}" 
        class="ck-link ck-link-mask"></a>
    {% } %}
    <span>{%= content %}</span>
</span>
