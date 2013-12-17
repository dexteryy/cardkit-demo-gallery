
define([], function(){

return {
    title: function(guard){
        guard.watch('.ckd-title');
        guard.bond({
            url: 'href',
            source: 'data-source'
        });
    },
    titleLink: function(guard){
        guard.watch('.ckd-title-link');
        guard.bond({
            url: 'href',
            source: 'data-source'
        });
    },
    titleLinkAlone: function(guard){
        guard.watch('.ckd-title-link-alone');
        guard.bond({
            url: 'href',
            source: 'data-source'
        });
    },
    titleLinkExtern: function(guard){
        guard.watch('.ckd-title-link-extern');
        guard.bond({
            url: 'href',
            source: 'data-source'
        });
    },
    titlePrefix: function(guard){
        guard.watch('.ckd-title-prefix');
        guard.bond({
            source: 'data-source'
        });
    },
    titleSuffix: function(guard){
        guard.watch('.ckd-title-suffix');
        guard.bond({
            source: 'data-source'
        });
    },
    titleTag: function(guard){
        guard.watch('.ckd-title-tag');
        guard.bond({
            source: 'data-source'
        });
    },
    icon: function(guard){
        guard.watch('.ckd-icon');
        guard.bond({
            imgUrl: 'src',
            source: 'data-source'
        });
    },
    info: function(guard){
        guard.watch('.ckd-info');
        guard.bond({
            source: 'data-source'
        });
    },
    opt: function(guard){
        guard.watch('.ckd-opt');
        guard.bond({
            source: 'data-source'
        });
    },
    desc: function(guard){
        guard.watch('.ckd-desc, .ckd-subtitle');
        guard.bond({
            source: 'data-source'
        });
    },
    content: function(guard){
        guard.watch('.ckd-content');
        guard.bond({
            source: 'data-source'
        });
    },
    meta: function(guard){
        guard.watch('.ckd-meta');
        guard.bond({
            source: 'data-source'
        });
    },
    author: function(guard){
        guard.watch('.ckd-author');
        guard.bond({
            url: 'href',
            source: 'data-source'
        });
    },
    authorLink: function(guard){
        guard.watch('.ckd-author-link');
        guard.bond({
            url: 'href',
            source: 'data-source'
        });
    },
    authorLinkAlone: function(guard){
        guard.watch('.ckd-author-link-alone');
        guard.bond({
            url: 'href',
            source: 'data-source'
        });
    },
    authorLinkExtern: function(guard){
        guard.watch('.ckd-author-link-extern');
        guard.bond({
            url: 'href',
            source: 'data-source'
        });
    },
    authorPrefix: function(guard){
        guard.watch('.ckd-author-prefix');
        guard.bond({
            source: 'data-source'
        });
    },
    authorSuffix: function(guard){
        guard.watch('.ckd-author-suffix');
        guard.bond({
            source: 'data-source'
        });
    },
    avatar: function(guard){
        guard.watch('.ckd-avatar');
        guard.bond({
            imgUrl: 'src',
            source: 'data-source'
        });
    },
    authorInfo: function(guard){
        guard.watch('.ckd-author-info');
        guard.bond({
            source: 'data-source'
        });
    },
    authorDesc: function(guard){
        guard.watch('.ckd-author-desc');
        guard.bond({
            source: 'data-source'
        });
    },
    authorMeta: function(guard){
        guard.watch('.ckd-author-meta');
        guard.bond({
            source: 'data-source'
        });
    }
};

});

