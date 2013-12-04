
define([
    'mo/lang',
    'dollar',
    'darkdom',
    './common/scaffold',
    '../tpl/box'
], function(_, $, darkdom, scaffold_components, tpl_box){

var content = darkdom({
    enableSource: true,
    template: ''
});

var box = darkdom({
    enableSource: true,
    template: tpl_box.template
});
scaffold_components(box);
box.contain('content', content);

return box;

});

