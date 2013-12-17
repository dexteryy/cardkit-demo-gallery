<div class="ck-list-unit"
        data-style="{%= state.subtype %}"
        data-cfg-blank="{%= state.blankContent %}"
        data-cfg-limit="{%= state.limit %}"
        data-cfg-col="{%= state.col %}"
        data-cfg-paper="{%= state.paperStyle %}"
        data-cfg-plain="{%= state.plainStyle %}"
        data-cfg-plainhd="{%= state.plainHdStyle %}">

    {% if (hasSplitHd) { %}
        {%= hd_wrap(component) %}
    {% } %}

    <article class="ck-unit-wrap">

        {% if (!hasSplitHd) { %}
            {%= hd_wrap(component) %}
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
                        <div class="ck-initem">{%=(state.blank || '目前还没有内容')%}</div>
                    </div>
                </div>

            {% } %}

        </div>

        {%= component.ft %}

    </article>

</div>

{% function hd_wrap(component){ %}

    {% if (!component.hd) { %}
        {% return; %}
    {% } %}

    <header class="ck-hd-wrap">

        {%= component.hd %}

        {% if (component.hdOpt.length) { %}
            <div class="ck-hdopt-wrap">
                {%= component.hdOpt.join('') %}
            </div>
        {% } %}

    </header>

{% } %}


