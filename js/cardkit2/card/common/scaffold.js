
define(function(require){ 

var darkdom = require('darkdom'),
    convert = require('mo/template/micro').convertTpl;

var hd = darkdom({
    unique: true,
    enableSource: true,
    render: convert(require('../../tpl/scaffold/hd').template)
});

var hd_link = darkdom({
    unique: true,
    enableSource: true,
    render: function(data){
        return data.state.url;
    }
});

var hd_link_extern = darkdom({
    unique: true,
    enableSource: true,
    render: function(data){
        return data.state.url;
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

return function(card){
    card.contain({
        hd: hd,
        hdLink: hd_link,
        hdLinkExtern: hd_link_extern,
        hdOpt: hd_opt,
        ft: ft
    });
};

});

