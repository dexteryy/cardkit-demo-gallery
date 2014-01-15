
define([
    'darkdom',
    'dollar',
    'mo/lang/mix',
    'mo/template/micro',
    '../tpl/page/title',
    '../tpl/page/actionbar/action',
    '../tpl/page/actionbar',
    '../tpl/page/nav',
    '../tpl/page',
    './box',
    './list'
], function(darkdom, $, _, tpl, 
    tpl_title, tpl_action, tpl_actionbar, tpl_nav, tpl_page, 
    box, list){ 

var convert = tpl.convertTpl,
    actionbar_render = convert(tpl_actionbar.template);

var exports = {

    title: function(){
        return darkdom({
            unique: true,
            render: convert(tpl_title.template)
        });
    },

    nav: function(){
        return darkdom({
            unique: true,
            render: convert(tpl_nav.template)
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
            render: function(data){
                var limit = data.state.limit || 1;
                data.visibleActions = [];
                data.overflowActions = [];
                data.componentData.action.forEach(function(action, i){
                    var action_html = data.component.action[i];
                    if (this.length < limit
                            && !action.state.forceOverflow) {
                        this.push(action_html);
                    } else {
                        data.overflowActions.push(action_html);
                    }
                }, data.visibleActions);
                return actionbar_render(data);
            }
        }).contain('action', exports.action);
    },

    footer: function(){
        return darkdom({
            unique: true,
            enableSource: true,
            render: function(data){
                return data.content;
            }
        });
    },

    page: function(){
        var page = darkdom({
            render: convert(tpl_page.template)
        });
        var parts = _.copy(exports);
        delete parts.page;
        page.contain(parts);
        page.contain({
            box: box.box,
            list: list.list, 
        }, { content: true });
        page.response('state:isPageActive', when_page_active);
        page.response('state:isDeckActive', when_deck_active);
        page.response('state:currentDeck', when_deck_change);
        return page;
    }

};

function when_page_active(changes){
    if (changes.newValue === 'true') {
        changes.root.css('min-height', window.innerHeight + 'px')
            .attr('data-page-active', true);
        setTimeout(function(){
            changes.root.addClass('topbar-enabled');
        }, 100);
    } else {
        unwrap_deactive(changes.root)
            .attr('data-page-active', false)
            .removeClass('topbar-enabled');
    }
    return false;
}

function when_deck_active(changes){
    if (changes.newValue === 'true') {
        changes.root.attr('data-deck-active', true);
        setTimeout(function(){
            unwrap_deactive(changes.root);
        }, 400);
    } else {
        changes.root.attr('data-deck-active', false);
        setTimeout(function(){
            wrap_deactive(changes.root);
        }, 400);
    }
    return false;
}

function when_deck_change(changes){
    changes.root.attr('data-curdeck', changes.newValue);
    return false;
}

function wrap_deactive(node){
    $('<div class="ck-narrow-wrapper"><a class="ck-narrow-mask ck-link" href="#' 
        + (node.attr('data-cardid') || '')
        + '"></a></div>')
            .insertBefore(node).append(node);
}

function unwrap_deactive(node){
    var p = node.parent();
    if (p.hasClass('ck-narrow-wrapper')) {
        p.before(node).remove();
    }
    window.scrollTo(0, 0);
    return node;
}

return exports;

});

