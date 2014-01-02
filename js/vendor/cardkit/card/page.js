
define([
    'darkdom',
    'mo/template/micro',
    '../tpl/page/title',
    '../tpl/page/actionbar/action',
    '../tpl/page/actionbar',
    '../tpl/page/navdrawer',
    '../tpl/page',
    './box',
    './list'
], function(darkdom, tpl, 
    tpl_title, tpl_action, tpl_actionbar, tpl_navdrawer, tpl_page, 
    box, list){ 

var convert = tpl.convertTpl;

var exports = {

    title: function(){
        return darkdom({
            unique: true,
            render: convert(tpl_title.template)
        });
    },

    action: function(){
        return darkdom({
            enableSource: true,
            entireAsContent: true,
            render: convert(tpl_action.template)
        });
    },

    actionbar: function(){
        return darkdom({
            unique: true,
            enableSource: true,
            render: convert(tpl_actionbar.template)
        }).contain('action', exports.action);
    },

    navdrawer: function(){
        return darkdom({
            unique: true,
            render: convert(tpl_navdrawer.template)
        });
    },

    page: function(){
        var page = darkdom({
            render: convert(tpl_page.template)
        });
        page.contain({
            title: exports.title,
            actionbar: exports.actionbar,
            navdrawer: exports.navdrawer
        });
        page.contain({
            box: box.box,
            list: list.list, 
        }, { content: true });
        page.response('state:isActive', function(changes){
            if (changes.newValue === 'true') {
                changes.root.addClass('active');
            } else {
                changes.root.removeClass('active');
            }
            return false;
        });
        return page;
    }

};

return exports;

});

