define([], function(){

    return {"template":"\n<div class=\"ck-actionbar\">\n{% component.action.forEach(function(action){ %}\n    {%= action %}\n{% }); %}\n</div>\n"}; 

});