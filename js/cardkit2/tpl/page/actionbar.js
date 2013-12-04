define([], function(){

    return {"template":"\n<div class=\"ck-actionbar\"\n    id=\"{%= id %}\"\n    autorender=\"true\">\n{% component.action.forEach(function(action){ %}\n    {%= action %}\n{% }); %}\n</div>\n"}; 

});