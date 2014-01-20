
define([
    'dollar',
    '../helper',
    './common/scaffold',
    './common/item'
], function($, helper, scaffold_specs, item_specs){ 

var source_states = {
        source: helper.readSource
    },
    SEL = '.ck-list-card',
    SEL_OLD = '.ck-list-unit'; // @deprecated

return function(guard, parent){
    guard.watch($(SEL, parent));
    guard.watch($(SEL_OLD, parent));
    guard.state({
        subtype: 'data-style',
        blankText: 'data-cfg-blank',
        limit: 'data-cfg-limit', 
        col: 'data-cfg-col', 
        paperStyle: 'data-cfg-paper',
        plainStyle: 'data-cfg-plain',
        plainHdStyle: 'data-cfg-plainhd'
    });
    guard.component(scaffold_specs);
    guard.component('item', function(guard){
        guard.watch('.ckd-item');
        guard.state(source_states);
        guard.state({
            link: 'href',
            linkTarget: function(node){
                return node.hasClass('ckd-title-link-extern') 
                    && (node.attr('target') || '_blank');
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

