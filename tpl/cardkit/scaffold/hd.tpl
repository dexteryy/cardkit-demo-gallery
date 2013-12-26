<span class="ck-hd {%= (hdLink && 'clickable' || '') %}">
    {% if (hdLink) { %}
    <a href="{%= hdLink %}" 
        target="{%= (hdLinkTarget || '_self') %}" 
        class="ck-link-mask"></a>
    {% } %}
    <span>{%= content %}</span>
</span>
