
define([
    'mo/lang',
    'dollar',
    './common/scaffold'
], function(_, $, scaffold_specs){

var selector = '.ck-box-unit';

return function(guard, parent){
    guard.watch(parent && $(selector, parent) || selector);
    guard.bond({
        subtype: 'data-style',
        paperStyle: 'data-cfg-paper',
        plainStyle: 'data-cfg-plain',
        plainHdStyle: 'data-cfg-plainhd'
    });
    scaffold_specs(guard);
    scaffold_specs(guard.source());
    guard.component('content', function(guard){
        guard.watch('.ckd-content');
    });
    guard.source().component('content', function(source){
        source.watch('.ckd-content');
    });
};

});
