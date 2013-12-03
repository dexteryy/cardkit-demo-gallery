
define([], function(){

    return {
        hd: function(component){
            component.register('.ckd-hd', {
                configures: {
                    raw: 'data-source',
                    url: 'href'
                }
            });
        },
        hdLinkExtern: function(component){
            component.register('.ckd-hd-link-extern', {
                configures: {
                    raw: 'data-source',
                    url: 'href'
                }
            });
        },
        hdLink: function(component){
            component.register('.ckd-hd-link', {
                configures: {
                    raw: 'data-source',
                    url: 'href'
                }
            });
        },
        hdOpt: function(component){
            component.register('.ckd-hdopt', {
                configures: {
                    raw: 'data-source'
                }
            });
        },
        ft: function(component){
            component.register('.ckd-ft', {
                configures: {
                    raw: 'data-source'
                }
            });
        }
    };

});

