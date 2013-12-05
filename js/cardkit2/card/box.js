
define([
    'mo/lang',
    'dollar',
    'darkdom',
    'mo/template/micro',
    './common/scaffold',
    '../tpl/box',
    '../tpl/box/content'
], function(_, $, darkdom, tpl, 
    scaffold_components, tpl_box, tpl_box_content){

var content = darkdom({
    enableSource: true,
    template: tpl.convertTpl(tpl_box_content.template)
});

var box = darkdom({
    enableSource: true,
    template: tpl.convertTpl(tpl_box.template)
});
scaffold_components(box);
box.contain('content', content, {
    content: true
});

return box;

});

