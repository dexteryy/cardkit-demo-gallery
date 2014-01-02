
define('cardkit', [
    'mo/lang',
    'dollar',
    'darkdom',
    'cardkit/spec',
    'cardkit/oldspec',
    'cardkit/supports',
    'cardkit/bus'
], function(_, $, darkdom, 
    specs, oldspecs, supports, bus){

var _components = {},
    _specs = {},
    _guards = {},
    _last_page,
    _defaults = {
        defaultPage: 'ckDefault',
        supportOldVersion: false
    };

var exports = {

    init: function(opt){
        this._config = _.config({}, opt, _defaults);
        this.initSpec();
    },

    initSpec: function(){
        _.each(specs, function(data, name){
            this.component(name, data[0][name]());
            this.spec(name, data[1]);
        }, this);
        if (this._config.supportOldVersion) {
            _.each(oldspecs, function(data, name){
                this.component(name, data[0][name]());
                this.spec(name, data[1]);
            }, this);
        }
    },

    component: function(name, component){
        if (component) {
            _components[name] = component;
        } else {
            return _components[name];
        }
    },

    spec: function(name, spec){
        if (spec) {
            _specs[name] = spec;
        } else {
            return _specs[name];
        }
    },

    guard: function(name){
        var guard = _guards[name];
        if (!guard) {
            var component = this.component(name);
            if (component) {
                guard = component.createGuard();
            }
        }
        return guard;
    },

    render: function(name, parent){
        if (typeof name !== 'string') {
            parent = name;
            Object.keys(_components).forEach(function(name){
                this.render(name, parent);
            }, this);
            return;
        }
        var spec = this.spec(name);
        if (!spec) {
            return;
        }
        var guard = this.guard(name);
        spec(guard, parent);
        guard.mount();
    },

    openPage: function(pid){
        pid = pid || this._config.defaultPage;
        if (_last_page) {
            _last_page.attr('active-page', 'false').updateDarkDOM();
        }
        var page = $('#' + pid);
        page.attr('active-page', 'true');
        if (!page[0].isMountedDarkDOM) {
            this.render('page');
        } else {
            page.updateDarkDOM();
        }
        _last_page = page;
    },

    event: bus

};

return exports;

});
