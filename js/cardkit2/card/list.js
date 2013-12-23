
define(function(require){ 

var darkdom = require('darkdom'),
    convert = require('mo/template/micro').convertTpl;

var scaffold_components = require('./common/scaffold');

var item = require('./item');

var render_list = convert(require('../tpl/list').template);

var list = darkdom({
    enableSource: true,
    render: function(data){
        data.hasSplitHd = data.state.plainStyle === 'true' 
            || data.state.plainHdStyle === 'true'
            || data.state.subtype === 'split';
        return render_list(data);
    }
});
list.contain(scaffold_components);
list.contain('item', item);

return list;

});

