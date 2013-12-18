
define(function(require){ 

var darkdom = require('darkdom'),
    convert = require('mo/template/micro').convertTpl,
    read_state = function(data, state){
        return data && (data.state || {})[state];
    };

var title = darkdom({
    unique: true,
    enableSource: true,
    render: convert(require('../tpl/item/title').template)
});

var title_link = darkdom({
    unique: true,
    enableSource: true,
    render: function(data){
        return data.state.link;
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
        return data.state.link;
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
item.contain({
    title: title,
    titleLink: title_link,
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
    authorPrefix: author_prefix,
    authorSuffix: author_suffix,
    avatar: avatar,
    authorDesc: author_desc,
    authorInfo: author_info,
    authorMeta: author_meta
});

return item;

});
