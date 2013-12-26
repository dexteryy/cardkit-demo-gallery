
define(function(require){

    return {
        page: [require('./card/page'), require('./spec/page')],
        box: [require('./card/box'), require('./spec/box')],
        list: [require('./card/list'), require('./spec/list')],
    };

});
