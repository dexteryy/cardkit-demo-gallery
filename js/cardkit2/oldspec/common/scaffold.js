
define([], function(){

return {
    hd: function(guard){
        guard.watch('.ckd-hd');
        guard.bond({
            source: 'data-source',
            url: 'href'
        });
    },
    hdLinkExtern: function(guard){
        guard.watch('.ckd-hd-link-extern');
        guard.bond({
            source: 'data-source',
            url: 'href'
        });
    },
    hdLink: function(guard){
        guard.watch('.ckd-hd-link');
        guard.bond({
            source: 'data-source',
            url: 'href'
        });
    },
    hdOpt: function(guard){
        guard.watch('.ckd-hdopt');
        guard.bond({
            source: 'data-source'
        });
    },
    ft: function(guard){
        guard.watch('.ckd-ft');
    }
};

});

