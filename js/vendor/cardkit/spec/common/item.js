
define([], function(){

return {
    title: function(guard){
        guard.watch('ck-part[type="title"]');
        guard.bond({
            link: 'href',
            linkTarget: 'target',
            isAlone: 'alone-mode'
        });
    },
    titleLink: function(guard){
        guard.watch('ck-part[type="titleLink"]');
        guard.bond({
            link: 'href',
            linkTarget: 'target',
            isAlone: 'alone-mode'
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
            link: 'href',
            linkTarget: 'target'
        });
    },
    authorLink: function(guard){
        guard.watch('ck-part[type="authorLink"]');
        guard.bond({
            link: 'href',
            linkTarget: 'target'
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
};

});

