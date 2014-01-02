
define([
    'dollar',
    './common/scaffold',
    './common/source_scaffold'
], function($, scaffold_specs, source_scaffold_specs){ 

var selector = 'ck-card[type="box"]';

return function(guard, parent){
    guard.watch(parent && $(selector, parent) || selector);
    guard.bond({
        subtype: 'subtype',
        paperStyle: 'paper-style',
        plainStyle: 'plain-style',
        plainHdStyle: 'plain-hd-style'
    });
    guard.component(scaffold_specs);
    guard.component('content', function(guard){
        guard.watch('ck-part[type="content"]');
    });
    guard.source().component(source_scaffold_specs);
    guard.source().component('content', function(source){
        source.watch('.ckd-content');
    });
};

});

