
define([
    'darkdom'
], function(darkdom){

    var hd = darkdom({
        unique: true,
        enableSource: true,
        //template: ''
    });

    var hd_link = darkdom({
        unique: true,
        enableSource: true,
        //template: ''
    });

    var hd_link_extern = darkdom({
        unique: true,
        enableSource: true,
        //template: ''
    });

    var hd_opt = darkdom({
        enableSource: true,
        //template: ''
    });

    var ft = darkdom({
        unique: true,
        enableSource: true,
        //template: ''
    });

    return function(root){
        root.contain('hd', hd);
        root.contain('hdLink', hd_link);
        root.contain('hdLinkExtern', hd_link_extern);
        root.contain('hdOpt', hd_opt);
        root.contain('ft', ft);
    };

});

