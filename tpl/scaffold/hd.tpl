{% var hd_link = context.component.hdLink || state.url; %}
<span class="ck-hd {%= (hd_link && 'clickable' || '') %}">
    {% if (hd_link) { %}
    <a href="{%= hd_link %}" 
        class="ck-link ck-link-mask {%= (context.component.hdLinkExtern ? 'ck-link-extern' : '') %}"></a>
    {% } %}
    <span>{%= content %}</span>
</span>
