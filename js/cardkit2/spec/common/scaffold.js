
define([], function(){

    return {
        hd: function(guard){
            guard.watch('ck-part[type="hd"]');
            guard.bond({
                url: 'href'
            });
        },
        hdLinkExtern: function(guard){
            guard.watch('ck-part[type="hdLinkExtern"]');
            guard.bond({
                url: 'href'
            });
        },
        hdLink: function(guard){
            guard.watch('ck-part[type="hdLink"]');
            guard.bond({
                url: 'href'
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

