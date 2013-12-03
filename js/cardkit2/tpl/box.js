define([], function(){

    return {"template":"\n\n<div class=\"ck-box-unit\"\n        data-style=\"{%= attr.subtype %}\"\n        data-cfg-paper=\"{%= attr.paperStyle %}\"\n        data-cfg-plain=\"{%= attr.plainStyle %}\"\n        data-cfg-plainhd=\"{%= attr.plainHdStyle %}\"\n        id=\"{%= id %}\"\n        autorender=\"true\">\n    {%= component.hd %}\n    {%= content %}\n    {%= component.ft %}\n</div>\n"}; 

});