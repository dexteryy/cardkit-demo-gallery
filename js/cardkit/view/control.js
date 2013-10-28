define([
    'mo/lang',
    'dollar',
    'mo/network',
    'moui/control'
], function(_, $, net, control) {

    var UID = '_ckControlUid',
    
        uid = 0,
        lib = {},

        default_config = {
            loadingLabel: '稍等...',
            disableRequest: false,
            enableUrl: '',
            enableJsonUrl: '',
            enableMethod: 'post',
            disableUrl: '',
            disableJsonUrl: '',
            disableMethod: 'post'
        };

    var CkControl = _.construct(control.Control);

    _.mix(CkControl.prototype, {

        _defaults: _.mix({}, CkControl.prototype._defaults, default_config),

        enable: function(){
            var cfg = this._config;
            return this.request({
                method: cfg.enableMethod,
                url: cfg.enableUrl,
                jsonUrl: cfg.enableJsonUrl
            }, function(){
                this.superClass.enable.call(this);
            });
        },

        disable: function(){
            var cfg = this._config;
            return this.request({
                method: cfg.disableMethod,
                url: cfg.disableUrl,
                jsonUrl: cfg.disableJsonUrl
            }, function(){
                this.superClass.disable.call(this);
            });
        },

        request: function(cfg, fn){
            var self = this,
                url = cfg.jsonUrl || cfg.url;
            if (!this._config.disableRequest && url) {
                var data;
                url = url.replace(/\?(.+)$/, function($0, $1) {
                    data = $1.replace(/#.*/, '');
                    return '';
                });
                self.showLoading();
                net.ajax({
                    url: url,
                    data: data,
                    type: cfg.method,
                    dataType: cfg.jsonUrl ? 'json' : 'text',
                    success: function(data){
                        self.hideLoading();
                        self.responseData = data;
                        fn.call(self);
                    }
                });
            } else {
                fn.call(self);
            }
            return this;
        }
    
    });

    function exports(elm, opt){
        elm = $(elm);
        var id = elm[0][UID];
        if (id && lib[id]) {
            return lib[id].set(opt);
        }
        id = elm[0][UID] = ++uid;
        var controller = lib[id] = new exports.Control(elm, opt);
        controller.event.bind('enable', function(controller){
            elm.trigger('control:enable', {
                component: controller
            });
        }).bind('disable', function(controller){
            elm.trigger('control:disable', {
                component: controller
            });
        });
        return controller;
    }

    exports.Control = CkControl;

    exports.gc = function(check){
        for (var i in lib) {
            if (check(lib[i])) {
                delete lib[i];
            }
        }
    };

    return exports;

});
