
<div class="ck-page-card" 
        data-style="{%= state.subtype %}"
        data-page-active="{%= state.isPageActive || 'false' %}"
        data-deck-active="{%= state.isDeckActive || 'false' %}"
        data-deck="{%= (state.deck || 'main') %}"
        data-curdeck="{%= state.currentDeck %}"
        data-cardid="{%= state.cardId %}">

    {% if (component.title || component.actionbar) { %}
    <div class="ck-header">
        {%= component.nav %}
        {%= component.title %}
        {%= component.actionbar %}
    </div>
    {% } %}

    <div class="ck-article">
        {%= content %}
    </div>

    {% if (component.footer) { %}
    <div class="ck-footer">{%= component.footer %}</div>
    {% } %}

    <a class="ck-page-link-mask ck-link" href="#{%= state.cardId %}"></a>

</div>

