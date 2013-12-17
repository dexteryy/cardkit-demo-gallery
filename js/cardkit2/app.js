
define([
    'mo/lang',
    'dollar',
    'darkdom',
    './spec',
    './oldspec',
    './supports',
    './bus',
    'mo/domready'
], function(_, $, darkdom, 
    specs, oldspecs, supports, bus){

var _components = {},
    _specs = {},
    _defaults = {
        components: ['page', 'box', 'list', 'mini', 'form', 'banner'],
        supportOldVersion: false
    };

var exports = {

    init: function(opt){
        var cfg = this._config = _.config({}, opt, _defaults);
        cfg.components.forEach(function(name){
            var data = specs[name];
            if (data) {
                this.setComponent(name, data[0]);
                this.setSpec(name, data[1]);
            }
        }, this);
        if (cfg.supportOldVersion) {
            cfg.components.forEach(function(name){
                var data = oldspecs[name];
                if (data) {
                    this.setComponent(name, data[0]);
                    this.setSpec(name, data[1]);
                }
            }, this);
        }
    },

    setComponent: function(name, component){
        _components[name] = component;
    },

    setSpec: function(name, spec){
        _specs[name] = spec;
    },

    applySpec: function(name, parent){
        var component = _components[name],
            spec = _specs[name];
        if (!component || !spec) {
            return false;
        }
        var guard = component.createGuard();
        spec(guard, parent);
        guard.mount();
        return true;
    },

    render: function(parent){
        _.each(_components, function(component, name){
            this.applySpec(name, parent);
        }, this);
    },

    event: bus

};

return exports;

});
