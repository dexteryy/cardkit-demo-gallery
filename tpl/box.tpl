<div class="ck-box-unit"
        data-style="{%= state.subtype %}"
        data-cfg-paper="{%= state.paperStyle %}"
        data-cfg-plain="{%= state.plainStyle %}"
        data-cfg-plainhd="{%= state.plainHdStyle %}">

    {% var has_split_hd = state.plain || state.plainhd; %}

    {% if (has_split_hd) { %}
        {%= hd_wrap(component) %}
    {% } %}

    <article class="ck-unit-wrap">

        {% if (!has_split_hd) { %}
            {%= hd_wrap(component) %}
        {% } %}

        {% if (content && new RegExp('\S', 'm').test(content)) { %}
            <section>
                {%= content %}
            </section>
        {% } %}

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

