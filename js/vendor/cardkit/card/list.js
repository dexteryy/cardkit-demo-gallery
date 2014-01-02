
define([
    'darkdom',
    'mo/template/micro',
    '../tpl/list',
    './common/scaffold',
    './item'
], function(darkdom, tpl, 
    tpl_list, scaffold_components, item){ 

var convert = tpl.convertTpl,
    render_list = convert(tpl_list.template);

var exports = {

    item: item.item,

    list: function(){
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
        list.contain('item', exports.item);
        return list;
    }

};

return exports;

});

