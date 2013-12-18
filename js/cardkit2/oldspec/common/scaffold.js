
define([], function(){

var get_source = function(node){
    return '.' + node.data('source');
};

return {
    hd: function(guard){
        guard.watch('.ckd-hd');
        guard.bond({
            link: 'href',
            linkTarget: function(node){
                return node.hasClass('ckd-hd-link-extern') 
                    && '_blank';
            },
            source: get_source
        });
    },
    hdLink: function(guard){
        guard.watch('.ckd-hd-link:not(.ckd-hd)');
        guard.bond({
            link: 'href',
            linkTarget: function(node){
                return node.hasClass('ckd-hd-link-extern') 
                    && '_blank';
            },
            source: get_source
        });
    },
    hdOpt: function(guard){
        guard.watch('.ckd-hdopt');
        guard.bond({
            source: get_source
        });
    },
    ft: function(guard){
        guard.watch('.ckd-ft');
    }
};

});

