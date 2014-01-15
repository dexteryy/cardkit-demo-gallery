
define([], function(){

var get_source = function(node){
    var source = node.data('source');
    return source && ('.' + source);
};

return {
    title: function(guard){
        guard.watch('.ckd-title');
        guard.state({
            link: 'href',
            linkTarget: function(node){
                return node.hasClass('ckd-title-link-extern') 
                    && (node.attr('target') || '_blank');
            },
            isAlone: function(node){
                return node.hasClass('ckd-title-link-alone');
            },
            source: get_source
        });
    },
    titleLink: function(guard){
        guard.watch('.ckd-title-link');
        guard.state({
            link: 'href',
            linkTarget: function(node){
                return node.hasClass('ckd-title-link-extern') 
                    && (node.attr('target') || '_blank');
            },
            isAlone: function(node){
                return node.hasClass('ckd-title-link-alone');
            },
            source: get_source
        });
    },
    titlePrefix: function(guard){
        guard.watch('.ckd-title-prefix');
        guard.state({
            source: get_source
        });
    },
    titleSuffix: function(guard){
        guard.watch('.ckd-title-suffix');
        guard.state({
            source: get_source
        });
    },
    titleTag: function(guard){
        guard.watch('.ckd-title-tag');
        guard.state({
            source: get_source
        });
    },
    icon: function(guard){
        guard.watch('.ckd-icon');
        guard.state({
            imgUrl: 'src',
            source: get_source
        });
    },
    info: function(guard){
        guard.watch('.ckd-info');
        guard.state({
            source: get_source
        });
    },
    opt: function(guard){
        guard.watch('.ckd-opt');
        guard.state({
            source: get_source
        });
    },
    desc: function(guard){
        guard.watch('.ckd-desc, .ckd-subtitle');
        guard.state({
            source: get_source
        });
    },
    content: function(guard){
        guard.watch('.ckd-content');
        guard.state({
            source: get_source
        });
    },
    meta: function(guard){
        guard.watch('.ckd-meta');
        guard.state({
            source: get_source
        });
    },
    author: function(guard){
        guard.watch('.ckd-author');
        guard.state({
            link: 'href',
            linkTarget: function(node){
                return node.hasClass('ckd-author-link-extern') 
                    && (node.attr('target') || '_blank');
            },
            source: get_source
        });
    },
    authorLink: function(guard){
        guard.watch('.ckd-author-link');
        guard.state({
            link: 'href',
            linkTarget: function(node){
                return node.hasClass('ckd-author-link-extern') 
                    && (node.attr('target') || '_blank');
            },
            source: get_source
        });
    },
    authorPrefix: function(guard){
        guard.watch('.ckd-author-prefix');
        guard.state({
            source: get_source
        });
    },
    authorSuffix: function(guard){
        guard.watch('.ckd-author-suffix');
        guard.state({
            source: get_source
        });
    },
    avatar: function(guard){
        guard.watch('.ckd-avatar');
        guard.state({
            imgUrl: 'src',
            source: get_source
        });
    },
    authorInfo: function(guard){
        guard.watch('.ckd-author-info');
        guard.state({
            source: get_source
        });
    },
    authorDesc: function(guard){
        guard.watch('.ckd-author-desc');
        guard.state({
            source: get_source
        });
    },
    authorMeta: function(guard){
        guard.watch('.ckd-author-meta');
        guard.state({
            source: get_source
        });
    }
};

});

