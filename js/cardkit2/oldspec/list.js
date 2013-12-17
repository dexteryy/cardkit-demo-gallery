
define([
    'mo/lang',
    'dollar',
    './common/scaffold'
], function(_, $, scaffold_specs){

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
    scaffold_specs(guard);
    scaffold_specs(guard.source());
    guard.component('item', function(guard){
        guard.watch('.ckd-item');
    });
    guard.source().component('item', function(source){
        source.watch('.ckd-item');
    });
};

});

