<div class="ck-top-actions">

    {% if (overflowActions.length) { %}
    <button type="button" class="ck-top-overflow"></button>
    {% } %}

    {% visibleActions.forEach(function(action){ %}
        {%= action %}
    {% }); %}

    <div class="ck-top-overflow-items">
        {% overflowActions.forEach(function(action){ %}
            {%= action %}
        {% }); %}
    </div>

</div>
