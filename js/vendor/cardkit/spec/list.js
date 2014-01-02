
define([
    'dollar',
    './common/scaffold',
    './common/source_scaffold',
    './common/item',
    './common/source_item'
], function($, 
    scaffold_specs, source_scaffold_specs, item_specs, source_item_specs){ 

var selector = 'ck-card[type="list"]';

return function(guard, parent){
    guard.watch(parent && $(selector, parent) || selector);
    guard.bond({
        subtype: 'subtype',
        blankContent: 'blank-content',
        limit: 'limit', 
        col: 'col', 
        paperStyle: 'paper-style',
        plainStyle: 'plain-style',
        plainHdStyle: 'plain-hd-style'
    });
    guard.component(scaffold_specs);
    guard.component('item', function(guard){
        guard.watch('ck-part[type="item"]');
        guard.bond({
            link: 'href',
            linkTarget: 'target',
            isAlone: 'alone-mode'
        });
        guard.component(item_specs);
        guard.source().component(source_item_specs);
    });
    guard.source().component(source_scaffold_specs);
    guard.source().component('item', function(source){
        source.watch('.ckd-item');
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
        source.component(source_item_specs);
    });
};

});
