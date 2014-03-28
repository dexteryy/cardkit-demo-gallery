
define([
    'dollar',
    'prism',
    '../spec/codebox'
], function($, Prism, new_spec){

return function(guard){
    guard.watch('.my-codebox');
    guard.state({
        code: new_spec.codeGetter,
        langName: 'lang'
    });
};

});

