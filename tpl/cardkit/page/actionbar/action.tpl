
{% if (state.forceOverflow) { %}
<button type="button" class="ck-option" 
    value="{%= state.customId ? '#' + state.customId : id %}">{%= state.label %}</button>
{% } else { %}
<span class="ck-item">{%= content %}</span>
{% } %}
