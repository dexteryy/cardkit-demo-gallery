
define([], function(){

return {
    hd: function(source){
        source.watch('.ckd-hd');
        source.bond({
            url: 'href'
        });
    },
    hdLinkExtern: function(source){
        source.watch('.ckd-hd-link-extern');
        source.bond({
            url: 'href'
        });
    },
    hdLink: function(source){
        source.watch('.ckd-hd-link');
        source.bond({
            url: 'href'
        });
    },
    hdOpt: function(source){
        source.watch('.ckd-hdopt');
    },
    ft: function(source){
        source.watch('.ckd-ft');
    }
};

});

