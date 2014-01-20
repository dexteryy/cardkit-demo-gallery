
define([
    'mo/lang'
], function(){

var exports = {

    readState: function(data, state){
        return data && (data.state || {})[state];
    },

    readSource: function(node){
        var source = node.data('source');
        return source && ('.' + source);
    },

    isBlank: function(content){
        return !content || !/\S/m.test(content);
    }

};

return exports;

});
