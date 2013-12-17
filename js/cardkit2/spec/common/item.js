
define([], function(){

return function(guard){
    guard.component({
        title: function(guard){
            guard.watch('ck-part[type="title"]');
            guard.bond({
                url: 'href'
            });
        },
        titleLink: function(guard){
            guard.watch('ck-part[type="titleLink"]');
            guard.bond({
                url: 'href'
            });
        },
        titleLinkAlone: function(guard){
            guard.watch('ck-part[type="titleLinkAlone"]');
            guard.bond({
                url: 'href'
            });
        },
        titleLinkExtern: function(guard){
            guard.watch('ck-part[type="titleLinkExtern"]');
            guard.bond({
                url: 'href'
            });
        },
        titlePrefix: function(guard){
            guard.watch('ck-part[type="titlePrefix"]');
        },
        titleSuffix: function(guard){
            guard.watch('ck-part[type="titleSuffix"]');
        },
        titleTag: function(guard){
            guard.watch('ck-part[type="titleTag"]');
        },
        icon: function(guard){
            guard.watch('ck-part[type="icon"]');
            guard.bond({
                imgUrl: 'src'
            });
        },
        info: function(guard){
            guard.watch('ck-part[type="info"]');
        },
        opt: function(guard){
            guard.watch('ck-part[type="opt"]');
        },
        desc: function(guard){
            guard.watch('ck-part[type="desc"]');
        },
        content: function(guard){
            guard.watch('ck-part[type="content"]');
        },
        meta: function(guard){
            guard.watch('ck-part[type="meta"]');
        },
        author: function(guard){
            guard.watch('ck-part[type="author"]');
            guard.bond({
                url: 'href'
            });
        },
        authorLink: function(guard){
            guard.watch('ck-part[type="authorLink"]');
            guard.bond({
                url: 'href'
            });
        },
        authorLinkAlone: function(guard){
            guard.watch('ck-part[type="authorLinkAlone"]');
            guard.bond({
                url: 'href'
            });
        },
        authorLinkExtern: function(guard){
            guard.watch('ck-part[type="authorLinkExtern"]');
            guard.bond({
                url: 'href'
            });
        },
        authorPrefix: function(guard){
            guard.watch('ck-part[type="authorPrefix"]');
        },
        authorSuffix: function(guard){
            guard.watch('ck-part[type="authorSuffix"]');
        },
        avatar: function(guard){
            guard.watch('ck-part[type="avatar"]');
            guard.bond({
                imgUrl: 'src'
            });
        },
        authorInfo: function(guard){
            guard.watch('ck-part[type="authorInfo"]');
        },
        authorDesc: function(guard){
            guard.watch('ck-part[type="authorDesc"]');
        },
        authorMeta: function(guard){
            guard.watch('ck-part[type="authorMeta"]');
        }
    });
};

});

