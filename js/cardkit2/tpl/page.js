define([], function(){

    return {"template":"\n<div class=\"ck-card\" \n        card-id=\"{%= state.cardId %}\">\n    {%= component.title %}\n    {%= component.actionbar %}\n    {%= component.navdrawer %}\n    {%= content %}\n</div>\n\n"}; 

});