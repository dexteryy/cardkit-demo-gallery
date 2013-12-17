
define(function(require){

    return {
        page: [require('./card/page'), require('./oldspec/page')],
        box: [require('./card/box'), require('./oldspec/box')],
        list: [require('./card/list'), require('./oldspec/list')],
    };

});

