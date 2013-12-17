
define(function(require){ 

var darkdom = require('darkdom'),
    convert = require('mo/template/micro').convertTpl,
    scaffold_components = require('./common/scaffold');

var content = darkdom({
    enableSource: true,
    entireAsContent: true,
    render: convert(require('../tpl/box/content').template)
});

var box = darkdom({
    enableSource: true,
    render: convert(require('../tpl/box').template)
});
scaffold_components(box);
box.contain('content', content, {
    content: true
});

return box;

});

