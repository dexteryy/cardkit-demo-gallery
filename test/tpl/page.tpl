<ck-card type="page" firstpage="true">

    <ck-part type="title">New style card</ck-part>

    <ck-part type="actionbar">
        <button type="button" action-layout="auto">Reload</button>
        <button type="button" action-layout="overflow" class="switchstyle">切换界面风格</button>
        <button type="button" action-layout
            source-selector=".ckd-source.btn1"></button>
    </ck-part>

    <ck-part type="navdrawer">
    </ck-part>

    <p>This is normal text</p>

    <ck-card type="box"
            source-selector=".ckd-source.box1"
            subtype=""
            plain-style="true"
            plain-hd-style="true">
        <ck-part type="hd">This is box's head</ck-part>
        This is box's content
        <p>This is box's content</p>
        <div id="elmInBox" class="elm-in-box"></div>
    </ck-card>

    <p>This is normal text</p>

    <ck-card type="box"
            subtype="">
        <ck-part type="content" 
            source-selector=".ckd-source.content1"></ck-part>
        This is box's content
        <ck-part type="content" 
            source-selector=".ckd-source.content1"></ck-part>
        <ck-part type="content"></ck-part>
    </ck-card>

</ck-card>

