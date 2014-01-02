
define([
    'mo/lang/mix',
    'darkdom',
    'mo/template/micro',
    '../tpl/item',
    '../tpl/item/title',
    '../tpl/item/title_prefix',
    '../tpl/item/title_suffix',
    '../tpl/item/title_tag',
    '../tpl/item/icon',
    '../tpl/item/desc',
    '../tpl/item/info',
    '../tpl/item/opt',
    '../tpl/item/content',
    '../tpl/item/meta',
    '../tpl/item/author',
    '../tpl/item/author_prefix',
    '../tpl/item/author_suffix',
    '../tpl/item/avatar',
    '../tpl/item/author_desc',
    '../tpl/item/author_info',
    '../tpl/item/author_meta',
], function(_, darkdom, tpl, 
    tpl_item, tpl_title, tpl_title_prefix, tpl_title_suffix, tpl_title_tag, 
    tpl_icon, tpl_desc, tpl_info, tpl_opt, tpl_content, tpl_meta,
    tpl_author, tpl_author_prefix, tpl_author_suffix, 
    tpl_avatar, tpl_author_desc, tpl_author_info, tpl_author_meta){ 

var convert = tpl.convertTpl,
    read_state = function(data, state){
        return data && (data.state || {})[state];
    },
    render_item = convert(tpl_item.template);

var exports = {

    title: function(){
        return darkdom({
            unique: true,
            enableSource: true,
            render: convert(tpl_title.template)
        });
    },

    titleLink: function(){
        return darkdom({
            unique: true,
            enableSource: true,
            render: function(data){
                return data.state.link;
            }
        });
    },

    titlePrefix: function(){
        return darkdom({
            enableSource: true,
            entireAsContent: true,
            render: convert(tpl_title_prefix.template)
        });
    },

    titleSuffix: function(){
        return darkdom({
            enableSource: true,
            entireAsContent: true,
            render: convert(tpl_title_suffix.template)
        });
    },

    titleTag: function(){
        return darkdom({
            enableSource: true,
            render: convert(tpl_title_tag.template)
        });
    },

    icon: function(){
        return darkdom({
            unique: true,
            enableSource: true,
            render: convert(tpl_icon.template)
        });
    },

    desc: function(){
        return darkdom({
            enableSource: true,
            entireAsContent: true,
            render: convert(tpl_desc.template)
        });
    },

    info: function(){
        return darkdom({
            enableSource: true,
            entireAsContent: true,
            render: convert(tpl_info.template)
        });
    },

    opt: function(){
        return darkdom({
            enableSource: true,
            entireAsContent: true,
            render: convert(tpl_opt.template)
        });
    },

    content: function(){
        return darkdom({
            enableSource: true,
            entireAsContent: true,
            render: convert(tpl_content.template)
        });
    },

    meta: function(){
        return darkdom({
            enableSource: true,
            entireAsContent: true,
            render: convert(tpl_meta.template)
        });
    },

    author: function(){
        return darkdom({
            unique: true,
            enableSource: true,
            render: convert(tpl_author.template)
        });
    },

    authorLink: function(){
        return darkdom({
            unique: true,
            enableSource: true,
            render: function(data){
                return data.state.link;
            }
        });
    },

    authorPrefix: function(){
        return darkdom({
            enableSource: true,
            entireAsContent: true,
            render: convert(tpl_author_prefix.template)
        });
    },

    authorSuffix: function(){
        return darkdom({
            enableSource: true,
            entireAsContent: true,
            render: convert(tpl_author_suffix.template)
        });
    },

    avatar: function(){
        return darkdom({
            unique: true,
            enableSource: true,
            render: convert(tpl_avatar.template)
        });
    },

    authorDesc: function(){
        return darkdom({
            enableSource: true,
            entireAsContent: true,
            render: convert(tpl_author_desc.template)
        });
    },

    authorInfo: function(){
        return darkdom({
            enableSource: true,
            entireAsContent: true,
            render: convert(tpl_author_info.template)
        });
    },

    authorMeta: function(){
        return darkdom({
            enableSource: true,
            entireAsContent: true,
            render: convert(tpl_author_meta.template)
        });
    },

    item: function(){
        var item = darkdom({
            enableSource: true,
            render: function(data){
                var com = data.component;
                var comdata = data.componentData;
                var link_data = com.titleLink 
                    ? comdata.titleLink : comdata.title;
                data.itemLinkTarget = read_state(link_data, 'linkTarget');
                data.isItemLinkAlone = read_state(link_data, 'isAlone');
                data.itemLink = com.titleLink
                    || read_state(comdata.title, 'link');
                var author_data = com.authorLink 
                    ? comdata.authorLink : comdata.author;
                data.authorLinkTarget = read_state(author_data, 'linkTarget');
                data.authorLink = com.authorLink
                    || read_state(comdata.author, 'link');
                return render_item(data);
            }
        });
        var parts = _.copy(exports);
        delete parts.item;
        item.contain(parts);
        return item;
    }

};

return exports;

});
