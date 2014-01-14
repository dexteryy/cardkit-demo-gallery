
define([
    'dollar',
    './common/scaffold'
], function($, scaffold_specs){ 

var SEL = '.ck-box-card',
    SEL_OLD = '.ck-box-unit';

return function(guard, parent){
    guard.watch($(SEL, parent));
    guard.watch($(SEL_OLD, parent));
    guard.state({
        subtype: 'data-style',
        paperStyle: 'data-cfg-paper',
        plainStyle: 'data-cfg-plain',
        plainHdStyle: 'data-cfg-plainhd'
    });
    guard.component(scaffold_specs);
    guard.component('content', function(guard){
        guard.watch('.ckd-content');
    });
    guard.source().component(scaffold_specs);
    guard.source().component('content', function(source){
        source.watch('.ckd-content');
    });
};

});
