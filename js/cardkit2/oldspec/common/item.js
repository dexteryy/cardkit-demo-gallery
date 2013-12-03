
define([], function(){

    return {
        title: function(component){
            component.register('.ckd-title', {
                configures: {
                    url: 'href',
                    raw: 'raw'
                }
            });
        },
        titleLink: function(component){
            component.register('.ckd-title-link', {
                configures: {
                    url: 'href',
                    raw: 'raw'
                }
            });
        },
        titleLinkAlone: function(component){
            component.register('.ckd-title-link-alone', {
                configures: {
                    url: 'href',
                    raw: 'raw'
                }
            });
        },
        titleLinkExtern: function(component){
            component.register('.ckd-title-link-extern', {
                configures: {
                    url: 'href',
                    raw: 'raw'
                }
            });
        },
        titlePrefix: function(component){
            component.register('.ckd-title-prefix', {
                configures: {
                    raw: 'raw'
                }
            });
        },
        titleSuffix: function(component){
            component.register('.ckd-title-suffix', {
                configures: {
                    raw: 'raw'
                }
            });
        },
        titleTag: function(component){
            component.register('.ckd-title-tag', {
                configures: {
                    raw: 'raw'
                }
            });
        },
        icon: function(component){
            component.register('.ckd-icon', {
                configures: {
                    imgUrl: 'src',
                    raw: 'raw'
                }
            });
        },
        info: function(component){
            component.register('.ckd-info', {
                configures: {
                    raw: 'raw'
                }
            });
        },
        opt: function(component){
            component.register('.ckd-opt', {
                configures: {
                    raw: 'raw'
                }
            });
        },
        desc: function(component){
            component.register('.ckd-desc, .ckd-subtitle', {
                configures: {
                    raw: 'raw'
                }
            });
        },
        content: function(component){
            component.register('.ckd-content', {
                configures: {
                    raw: 'raw'
                }
            });
        },
        meta: function(component){
            component.register('.ckd-meta', {
                configures: {
                    raw: 'raw'
                }
            });
        },
        author: function(component){
            component.register('.ckd-author', {
                configures: {
                    url: 'href',
                    raw: 'raw'
                }
            });
        },
        authorLink: function(component){
            component.register('.ckd-author-link', {
                configures: {
                    url: 'href',
                    raw: 'raw'
                }
            });
        },
        authorLinkAlone: function(component){
            component.register('.ckd-author-link-alone', {
                configures: {
                    url: 'href',
                    raw: 'raw'
                }
            });
        },
        authorLinkExtern: function(component){
            component.register('.ckd-author-link-extern', {
                configures: {
                    url: 'href',
                    raw: 'raw'
                }
            });
        },
        authorPrefix: function(component){
            component.register('.ckd-author-prefix', {
                configures: {
                    raw: 'raw'
                }
            });
        },
        authorSuffix: function(component){
            component.register('.ckd-author-suffix', {
                configures: {
                    raw: 'raw'
                }
            });
        },
        avatar: function(component){
            component.register('.ckd-avatar', {
                configures: {
                    imgUrl: 'src',
                    raw: 'raw'
                }
            });
        },
        authorInfo: function(component){
            component.register('.ckd-author-info', {
                configures: {
                    raw: 'raw'
                }
            });
        },
        authorDesc: function(component){
            component.register('.ckd-author-desc', {
                configures: {
                    raw: 'raw'
                }
            });
        },
        authorMeta: function(component){
            component.register('.ckd-author-meta', {
                configures: {
                    raw: 'raw'
                }
            });
        }
    };

});

