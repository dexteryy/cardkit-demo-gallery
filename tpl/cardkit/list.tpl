<div class="ck-list-card"
        data-style="{%= state.subtype %}"
        {%= state.paperStyle ? 'data-cfg-paper="true" ' : '' %}
        {%= state.plainStyle ? 'data-cfg-plain="true" ' : '' %}
        {%= state.plainHdStyle ? 'data-cfg-plainhd="true" ' : '' %}
        {%= state.blankContent ? 'data-cfg-blank="' + state.blankContent + '" ' : '' %}
        {%= state.limit ? 'data-cfg-limit="' + state.limit+ '" ' : '' %}
        {%= state.col ? 'data-cfg-col="' + state.col + '" ' : '' %}>

    {% if (hasSplitHd) { %}
        {%= hdwrap %}
    {% } %}

    <article class="ck-card-wrap">

        {% if (!hasSplitHd) { %}
            {%= hdwrap %}
        {% } %}
        
        <div class="ck-list-wrap">

            {% if (component.item.length) { %}

                <div class="ck-list">
                {% component.item.forEach(function(item, i){ %}

                    {% if (i && (i % state.col === 0)) { %}
                    </div><div class="ck-list">
                    {% } %}

                    {%= item %}

                {% }); %}
                </div>

            {% } else { %}

                <div class="ck-list">
                    <div class="ck-item blank">
                        <div class="ck-initem">{%=(state.blankContent || '目前还没有内容')%}</div>
                    </div>
                </div>

            {% } %}

        </div>

        {%= component.ft %}

    </article>

</div>

