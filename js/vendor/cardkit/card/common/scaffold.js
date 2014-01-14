
define([
    'darkdom',
    'mo/template/micro',
    '../../tpl/scaffold/hd',
    '../../tpl/scaffold/hd_opt',
    '../../tpl/scaffold/ft',
], function(darkdom, tpl, 
    tpl_hd, tpl_hd_opt, tpl_ft){ 

var convert = tpl.convertTpl,
    read_state = function(data, state){
        return data && (data.state || {})[state];
    },
    render_hd = convert(tpl_hd.template);

var exports = {

    hd: function(){
        return darkdom({
            unique: true,
            enableSource: true,
            render: function(data){
                var hdlink_data = data.context.componentData.hdLink;
                var hd_link = read_state(hdlink_data, 'link');
                data.hdLink = hd_link
                    || data.state.link;
                data.hdLinkTarget = hd_link 
                    ? read_state(hdlink_data, 'linkTarget')
                    : data.state.linkTarget;
                return render_hd(data);
            }
        });
    },

    hdLink: function(){
        return darkdom({
            unique: true,
            enableSource: true,
            render: function(data){
                return data.state.link;
            }
        });
    },

    hdOpt: function(){
        return darkdom({
            enableSource: true,
            sourceAsContent: true,
            render: convert(tpl_hd_opt.template)
        });
    },

    ft: function(){
        return darkdom({
            unique: true,
            enableSource: true,
            render: convert(tpl_ft.template)
        });
    }

};

return exports;

});

