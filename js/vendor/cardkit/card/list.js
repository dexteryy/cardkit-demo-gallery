
define([
    'darkdom',
    'mo/template/micro',
    '../tpl/list',
    '../tpl/scaffold/hdwrap',
    './common/scaffold',
    './item'
], function(darkdom, tpl, 
    tpl_list, tpl_hdwrap, scaffold_components, item){ 

var convert = tpl.convertTpl,
    render_hdwrap = convert(tpl_hdwrap.template),
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
                data.hdwrap = render_hdwrap(data);
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

