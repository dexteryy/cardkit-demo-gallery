
define([], function(){

return function(guard){
    guard.component({
        hd: function(guard){
            guard.watch('.ckd-hd');
            guard.bond({
                source: 'data-source',
                url: 'href',
                isExternUrl: function(node){
                    return node.hasClass('ckd-hd-link-extern');
                }
            });
        },
        hdLink: function(guard){
            guard.watch('.ckd-hd-link:not(.ckd-hd)');
            guard.bond({
                source: 'data-source',
                url: 'href'
            });
        },
        hdLinkExtern: function(guard){
            guard.watch('.ckd-hd-link-extern:not(.ckd-hd)');
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
    });
};

});

