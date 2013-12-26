
define([], function(){

return {
    hd: function(guard){
        guard.watch('ck-part[type="hd"]');
        guard.bond({
            link: 'href',
            linkTarget: 'target'
        });
    },
    hdLink: function(guard){
        guard.watch('ck-part[type="hdLink"]');
        guard.bond({
            link: 'href',
            linkTarget: 'target'
        });
    },
    hdOpt: function(guard){
        guard.watch('ck-part[type="hdOpt"]');
    },
    ft: function(guard){
        guard.watch('ck-part[type="ft"]');
    }
};

});

