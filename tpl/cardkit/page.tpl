
<div class="ck-page-card{%= (state.isActive === 'true' ? ' active' : '') %}" 
        card-id="{%= state.cardId %}">
    {%= component.title %}
    {%= component.actionbar %}
    {%= component.navdrawer %}
    {%= content %}
</div>

