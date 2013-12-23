<div class="ck-box-card"
        data-style="{%= state.subtype %}"
        {%= state.paperStyle ? 'data-cfg-paper="true" ' : '' %}
        {%= state.plainStyle ? 'data-cfg-plain="true" ' : '' %}
        {%= state.plainHdStyle ? 'data-cfg-plainhd="true" ' : '' %}>

    {% if (hasSplitHd) { %}
        {%= hd_wrap(component) %}
    {% } %}

    <article class="ck-card-wrap">

        {% if (!hasSplitHd) { %}
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

