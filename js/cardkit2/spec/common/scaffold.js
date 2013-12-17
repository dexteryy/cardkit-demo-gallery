
define([], function(){

return function(guard){
    guard.component({
        hd: function(guard){
            guard.watch('ck-part[type="hd"]');
            guard.bond({
                url: 'href',
                isExternUrl: function(node){
                    var t = node.attr('target');
                    return t && t !== '_self';
                }
            });
        },
        hdOpt: function(guard){
            guard.watch('ck-part[type="hdOpt"]');
        },
        ft: function(guard){
            guard.watch('ck-part[type="ft"]');
        }
    });
};

});

