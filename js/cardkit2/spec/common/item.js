
define([], function(){

    return {
        title: function(component){
            component.register('ck-part[type="title"]', {
                configures: {
                    url: 'href',
                    raw: 'raw'
                }
            });
        },
        titleLink: function(component){
            component.register('ck-part[type="titleLink"]', {
                configures: {
                    url: 'href',
                    raw: 'raw'
                }
            });
        },
        titleLinkAlone: function(component){
            component.register('ck-part[type="titleLinkAlone"]', {
                configures: {
                    url: 'href',
                    raw: 'raw'
                }
            });
        },
        titleLinkExtern: function(component){
            component.register('ck-part[type="titleLinkExtern"]', {
                configures: {
                    url: 'href',
                    raw: 'raw'
                }
            });
        },
        titlePrefix: function(component){
            component.register('ck-part[type="titlePrefix"]', {
                configures: {
                    raw: 'raw'
                }
            });
        },
        titleSuffix: function(component){
            component.register('ck-part[type="titleSuffix"]', {
                configures: {
                    raw: 'raw'
                }
            });
        },
        titleTag: function(component){
            component.register('ck-part[type="titleTag"]', {
                configures: {
                    raw: 'raw'
                }
            });
        },
        icon: function(component){
            component.register('ck-part[type="icon"]', {
                configures: {
                    imgUrl: 'src',
                    raw: 'raw'
                }
            });
        },
        info: function(component){
            component.register('ck-part[type="info"]', {
                configures: {
                    raw: 'raw'
                }
            });
        },
        opt: function(component){
            component.register('ck-part[type="opt"]', {
                configures: {
                    raw: 'raw'
                }
            });
        },
        desc: function(component){
            component.register('ck-part[type="desc"]', {
                configures: {
                    raw: 'raw'
                }
            });
        },
        content: function(component){
            component.register('ck-part[type="content"]', {
                configures: {
                    raw: 'raw'
                }
            });
        },
        meta: function(component){
            component.register('ck-part[type="meta"]', {
                configures: {
                    raw: 'raw'
                }
            });
        },
        author: function(component){
            component.register('ck-part[type="author"]', {
                configures: {
                    url: 'href',
                    raw: 'raw'
                }
            });
        },
        authorLink: function(component){
            component.register('ck-part[type="authorLink"]', {
                configures: {
                    url: 'href',
                    raw: 'raw'
                }
            });
        },
        authorLinkAlone: function(component){
            component.register('ck-part[type="authorLinkAlone"]', {
                configures: {
                    url: 'href',
                    raw: 'raw'
                }
            });
        },
        authorLinkExtern: function(component){
            component.register('ck-part[type="authorLinkExtern"]', {
                configures: {
                    url: 'href',
                    raw: 'raw'
                }
            });
        },
        authorPrefix: function(component){
            component.register('ck-part[type="authorPrefix"]', {
                configures: {
                    raw: 'raw'
                }
            });
        },
        authorSuffix: function(component){
            component.register('ck-part[type="authorSuffix"]', {
                configures: {
                    raw: 'raw'
                }
            });
        },
        avatar: function(component){
            component.register('ck-part[type="avatar"]', {
                configures: {
                    imgUrl: 'src',
                    raw: 'raw'
                }
            });
        },
        authorInfo: function(component){
            component.register('ck-part[type="authorInfo"]', {
                configures: {
                    raw: 'raw'
                }
            });
        },
        authorDesc: function(component){
            component.register('ck-part[type="authorDesc"]', {
                configures: {
                    raw: 'raw'
                }
            });
        },
        authorMeta: function(component){
            component.register('ck-part[type="authorMeta"]', {
                configures: {
                    raw: 'raw'
                }
            });
        }
    };

});

