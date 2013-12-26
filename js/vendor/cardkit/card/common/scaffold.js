
define(function(require){ 

var darkdom = require('darkdom'),
    convert = require('mo/template/micro').convertTpl,
    read_state = function(data, state){
        return data && (data.state || {})[state];
    };

var render_hd = convert(require('../../tpl/scaffold/hd').template);

var hd = darkdom({
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

var hd_link = darkdom({
    unique: true,
    enableSource: true,
    render: function(data){
        return data.state.link;
    }
});

var hd_opt = darkdom({
    enableSource: true,
    entireAsContent: true,
    render: convert(require('../../tpl/scaffold/hd_opt').template)
});

var ft = darkdom({
    unique: true,
    enableSource: true,
    render: convert(require('../../tpl/scaffold/ft').template)
});

return {
    hd: hd,
    hdLink: hd_link,
    hdOpt: hd_opt,
    ft: ft
};

});

