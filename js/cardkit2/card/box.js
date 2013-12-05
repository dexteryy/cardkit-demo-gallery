
define([
    'mo/lang',
    'dollar',
    'darkdom',
    'mo/template/micro',
    './common/scaffold',
    '../tpl/box'
], function(_, $, darkdom, tpl, scaffold_components, tpl_box){

var content = darkdom({
    enableSource: true,
    template: ''
});

var box = darkdom({
    enableSource: true,
    template: tpl.convertTpl(tpl_box.template)
});
scaffold_components(box);
box.contain('content', content);

return box;

});

