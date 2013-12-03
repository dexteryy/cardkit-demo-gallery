define([], function(){

    return {"template":"\n<div class=\"ck-card\" \n        id=\"{%= id %}\"\n        autorender=\"true\"\n        card-id=\"{%= attr.cardId %}\">\n    {%= component.title %}\n    {%= component.actionbar %}\n    {%= component.navdrawer %}\n    {%= content %}\n</div>\n\n"}; 

});