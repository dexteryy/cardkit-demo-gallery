
define([
    'darkdom',
    'mo/template/micro',
    '../tpl/box',
    '../tpl/box/content',
    '../tpl/scaffold/hdwrap',
    './common/scaffold'
], function(darkdom, tpl, 
    tpl_box, tpl_content, tpl_hdwrap, scaffold_components){ 

var convert = tpl.convertTpl,
    render_hdwrap = convert(tpl_hdwrap.template),
    render_box = convert(tpl_box.template);

var exports = {

    content: function(){
        return darkdom({
            enableSource: true,
            sourceAsContent: true,
            render: convert(tpl_content.template)
        });
    },

    box: function(){
        var box = darkdom({
            enableSource: true,
            render: function(data){
                data.hasSplitHd = data.state.plainStyle === 'true'
                    || data.state.plainHdStyle === 'true';
                data.hdwrap = render_hdwrap(data);
                return render_box(data);
            }
        });
        box.contain(scaffold_components);
        box.contain('content', exports.content, {
            content: true
        });
        return box;
    }

};

return exports;

});

