
define(function(require){ 

var darkdom = require('darkdom'),
    convert = require('mo/template/micro').convertTpl;

var title = darkdom({
    unique: true,
    render: convert(require('../tpl/page/title').template)
});

var action = darkdom({
    enableSource: true,
    entireAsContent: true,
    render: convert(require('../tpl/page/actionbar/action').template)
});

var actionbar = darkdom({
    unique: true,
    enableSource: true,
    render: convert(require('../tpl/page/actionbar').template)
});
actionbar.contain('action', action);

var navdrawer = darkdom({
    unique: true,
    render: convert(require('../tpl/page/navdrawer').template)
});

var page = darkdom({
    render: convert(require('../tpl/page').template)
});
page.contain({
    title: title,
    actionbar: actionbar,
    navdrawer: navdrawer
});
page.contain({
    box: require('./box'),
    list: require('./list') 
}, { content: true });

return page;

});

