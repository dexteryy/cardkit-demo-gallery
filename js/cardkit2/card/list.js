
define(function(require){ 

var darkdom = require('darkdom'),
    convert = require('mo/template/micro').convertTpl,
    scaffold_components = require('./common/scaffold');

var list = darkdom({
    enableSource: true,
    render: convert(require('../tpl/list').template)
});
scaffold_components(list);
list.contain('item', require('./item'));

return list;

});

