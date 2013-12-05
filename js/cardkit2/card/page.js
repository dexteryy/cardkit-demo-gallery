
define([
    'mo/lang',
    'dollar',
    'darkdom',
    'mo/template/micro',
    './box',
    '../tpl/page',
    '../tpl/page/title',
    '../tpl/page/actionbar',
    '../tpl/page/actionbar/action',
    '../tpl/page/navdrawer'
], function(_, $, darkdom, tpl, box,
    tpl_page, tpl_title, tpl_actionbar, tpl_action, tpl_navdrawer){

var title = darkdom({
    unique: true,
    template: tpl.convertTpl(tpl_title.template)
});

var action = darkdom({
    enableSource: true,
    template: tpl.convertTpl(tpl_action.template)
});

var actionbar = darkdom({
    unique: true,
    enableSource: true,
    template: tpl.convertTpl(tpl_actionbar.template)
}).contain('action', action);

var navdrawer = darkdom({
    unique: true,
    template: tpl.convertTpl(tpl_navdrawer.template)
});

var page = darkdom({
    template: tpl.convertTpl(tpl_page.template)
});
page.bond({
    cardId: 'id'
});
page.contain('title', title);
page.contain('actionbar', actionbar);
page.contain('navdrawer', navdrawer);
page.contain('box', box, {
    content: true
});

return page;

});

