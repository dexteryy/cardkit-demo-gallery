
define([
    'darkdom',
    'mo/template/micro',
    '../tpl/codebox'
], function(darkdom, tpl, codebox_tpl){

return darkdom({
    render: tpl.convertTpl(codebox_tpl.template)
});

});
