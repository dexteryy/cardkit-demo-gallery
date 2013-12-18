
define([
    'dollar',
    './common/scaffold',
    './common/item'
], function($, scaffold_specs, item_specs){ 

var selector = '.ck-list-unit';

return function(guard, parent){
    guard.watch(parent && $(selector, parent) || selector);
    guard.bond({
        subtype: 'data-style',
        blankContent: 'data-cfg-blank',
        limit: 'data-cfg-limit', 
        col: 'data-cfg-col', 
        paperStyle: 'data-cfg-paper',
        plainStyle: 'data-cfg-plain',
        plainHdStyle: 'data-cfg-plainhd'
    });
    guard.component(scaffold_specs);
    guard.component('item', function(guard){
        guard.watch('.ckd-item');
        guard.bond({
            link: 'href',
            linkTarget: function(node){
                return node.hasClass('ckd-title-link-extern') 
                    && '_blank';
            },
            isAlone: function(node){
                return node.hasClass('ckd-title-link-alone');
            }
        });
        guard.component(item_specs);
        guard.source().component(item_specs);
    });
    guard.source().component(scaffold_specs);
    guard.source().component('item', function(source){
        source.watch('.ckd-item');
        guard.component(item_specs);
    });
};

});

