define([], function(){

    return {"template":"<div class=\"ck-box-unit\"\n        data-style=\"{%= attr.subtype %}\"\n        data-cfg-paper=\"{%= attr.paperStyle %}\"\n        data-cfg-plain=\"{%= attr.plainStyle %}\"\n        data-cfg-plainhd=\"{%= attr.plainHdStyle %}\">\n    {%= component.hd %}\n    {%= content %}\n    {%= component.ft %}\n</div>\n"}; 

});