
define(function(require){ 

var darkdom = require('darkdom'),
    convert = require('mo/template/micro').convertTpl;

var title = darkdom({
    unique: true,
    enableSource: true,
    render: convert(require('../tpl/item/title').template)
});

var title_link = darkdom({
    unique: true,
    enableSource: true,
    render: function(data){
        return data.state.url;
    }
});

var title_link_alone = darkdom({
    unique: true,
    enableSource: true,
    render: function(data){
        return data.state.url;
    }
});

var title_link_extern = darkdom({
    unique: true,
    enableSource: true,
    render: function(data){
        return data.state.url;
    }
});

var title_prefix = darkdom({
    enableSource: true,
    entireAsContent: true,
    render: convert(require('../tpl/item/title_prefix').template)
});

var title_suffix = darkdom({
    enableSource: true,
    entireAsContent: true,
    render: convert(require('../tpl/item/title_suffix').template)
});

var title_tag = darkdom({
    enableSource: true,
    render: convert(require('../tpl/item/title_tag').template)
});

var icon = darkdom({
    unique: true,
    enableSource: true,
    render: convert(require('../tpl/item/icon').template)
});

var desc = darkdom({
    enableSource: true,
    entireAsContent: true,
    render: convert(require('../tpl/item/desc').template)
});

var info = darkdom({
    enableSource: true,
    entireAsContent: true,
    render: convert(require('../tpl/item/info').template)
});

var opt = darkdom({
    enableSource: true,
    entireAsContent: true,
    render: convert(require('../tpl/item/opt').template)
});

var content = darkdom({
    enableSource: true,
    entireAsContent: true,
    render: convert(require('../tpl/item/content').template)
});

var meta = darkdom({
    enableSource: true,
    entireAsContent: true,
    render: convert(require('../tpl/item/meta').template)
});

var author = darkdom({
    unique: true,
    enableSource: true,
    render: convert(require('../tpl/item/author').template)
});

var author_link = darkdom({
    unique: true,
    enableSource: true,
    render: function(data){
        return data.state.url;
    }
});

var author_link_extern = darkdom({
    unique: true,
    enableSource: true,
    render: function(data){
        return data.state.url;
    }
});

var author_prefix = darkdom({
    enableSource: true,
    entireAsContent: true,
    render: convert(require('../tpl/item/author_prefix').template)
});

var author_suffix = darkdom({
    enableSource: true,
    entireAsContent: true,
    render: convert(require('../tpl/item/author_suffix').template)
});

var avatar = darkdom({
    unique: true,
    enableSource: true,
    render: convert(require('../tpl/item/avatar').template)
});

var author_desc = darkdom({
    enableSource: true,
    entireAsContent: true,
    render: convert(require('../tpl/item/author_desc').template)
});

var author_info = darkdom({
    enableSource: true,
    entireAsContent: true,
    render: convert(require('../tpl/item/author_info').template)
});

var author_meta = darkdom({
    enableSource: true,
    entireAsContent: true,
    render: convert(require('../tpl/item/author_meta').template)
});

var render_item = convert(require('../tpl/item').template);

var item = darkdom({
    enableSource: true,
    render: function(data){
        var com = data.component;
        data.itemLinkAlone = com.titleLinkAlone;
        data.itemLinkExtern = data.itemLinkAlone
            || com.titleLinkExtern;
        data.itemLink = data.itemLinkExtern
            || com.titleLink
            || ((data.componentData.title 
                 || {}).state || {}).url;
        data.itemAuthorLinkExtern = com.authorLinkExtern;
        data.itemAuthorLink = data.itemAuthorLinkExtern
            || com.authorLink
            || ((data.componentData.author 
                 || {}).state || {}).url;
        return render_item(data);
    }
});
item.contain({
    title: title,
    titleLink: title_link,
    titleLinkAlone: title_link_alone,
    titleLinkExtern: title_link_extern,
    titlePrefix: title_prefix,
    titleSuffix: title_suffix,
    titleTag: title_tag,
    icon: icon,
    desc: desc,
    info: info,
    opt: opt,
    content: content,
    meta: meta,
    author: author,
    authorLink: author_link,
    authorLinkExtern: author_link_extern,
    authorPrefix: author_prefix,
    authorSuffix: author_suffix,
    avatar: avatar,
    authorDesc: author_desc,
    authorInfo: author_info,
    authorMeta: author_meta
});

return item;

});
