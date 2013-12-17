
define([
    'mo/lang',
    'dollar',
    './common/scaffold',
    './common/source_scaffold'
], function(_, $, scaffold_specs, source_scaffold_specs){

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
    scaffold_specs(guard);
    source_scaffold_specs(guard.source());
    guard.component('item', function(guard){
        guard.watch('ck-part[type="item"]');
    });
    guard.source().component('item', function(source){
        source.watch('.ckd-item');
    });
};

});

