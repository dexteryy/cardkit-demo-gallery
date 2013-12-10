
define([
    'mo/lang',
    'dollar',
    '../card/box',
    './common/scaffold'
], function(_, $, box_card, 
        scaffold_specs){

var selector = '.ck-box-unit';

return function(guard, parent){
    guard.watch(parent && $(selector, parent) || selector);
    guard.bond({
        subtype: 'data-style',
        paperStyle: 'data-cfg-paper',
        plainStyle: 'data-cfg-plain',
        plainHdStyle: 'data-cfg-plainhd'
    });
    guard.component('content', function(guard){
        guard.watch('.ckd-content');
    });
    _.each(scaffold_specs, function(spec, name){
        guard.component(name, spec);
    });
    guard.source().component('content', function(source){
        source.watch('.ckd-content');
    });
    _.each(scaffold_specs, function(spec, name){
        this.component(name, spec);
    }, guard.source());
};

});
