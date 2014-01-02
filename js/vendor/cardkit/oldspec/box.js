
define([
    'dollar',
    './common/scaffold'
], function($, scaffold_specs){ 

var selector = '.ck-box-card',
    selector_old = '.ck-box-unit';

return function(guard, parent){
    guard.watch(parent && $(selector, parent) || selector);
    guard.watch(parent && $(selector_old, parent) || selector_old);
    guard.bond({
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