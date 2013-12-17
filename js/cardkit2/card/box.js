
define(function(require){ 

var darkdom = require('darkdom'),
    convert = require('mo/template/micro').convertTpl;

var scaffold_components = require('./common/scaffold');

var content = darkdom({
    enableSource: true,
    entireAsContent: true,
    render: convert(require('../tpl/box/content').template)
});

var render_box = convert(require('../tpl/box').template);

var box = darkdom({
    enableSource: true,
    render: function(data){
        data.hasSplitHd = data.state.plain 
            || data.state.plainhd;
        return render_box(data);
    }
});
box.contain(scaffold_components);
box.contain('content', content, {
    content: true
});

return box;

});

