
/* @source mo/browsers.js */;

/**
 * Standalone jQuery.browsers supports skin browsers popular in China 
 *
 * using AMD (Asynchronous Module Definition) API with OzJS
 * see http://ozjs.org for details
 *
 * Copyright (C) 2010-2012, Dexter.Yy, MIT License
 * vim: et:ts=4:sw=4:sts=4
 */
define("mo/browsers", [], function(){

    var match, skin, os, is_mobile, is_webview,
        ua = this.navigator.userAgent.toLowerCase(),
        rank = { 
            "360ee": 2,
            "maxthon/3": 2,
            "qqbrowser": 2,
            "metasr": 2,
            "360se": 1,
            "theworld": 1,
            "maxthon": 1,
            "tencenttraveler": -1
        };

    try {
        var rwindows = /(windows) nt ([\w.]+)/,
            rmac = /(mac) os \w+ ([\w.]+)/,
            riphone = /(iphone) os ([\w._]+)/,
            ripad = /(ipad) os ([\w.]+)/,
            randroid = /(android)[ ;]([\w.]*)/,
            rmobilewebkit = /(\w+)[ \/]([\w.]+)[ \/]mobile/,
            rsafari = /(\w+)[ \/]([\w.]+)[ \/]safari/,
            rmobilesafari = /[ \/]mobile.*safari/,
            rwebview = /[ \/]mobile/,
            rwebkit = /(webkit)[ \/]([\w.]+)/,
            ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/,
            rmsie = /(msie) ([\w.]+)/,
            rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/;

        var r360se = /(360se)/,
            r360ee = /(360ee)/,
            r360phone = /(360) \w+phone/,
            rtheworld = /(theworld)/,
            rmaxthon3 = /(maxthon\/3)/,
            rmaxthon = /(maxthon)/,
            rtt = /(tencenttraveler)/,
            rqq = /(qqbrowser)/,
            rbaidu = /(baidubrowser)/,
            ruc = /(ucbrowser)/,
            rsogou = /(sogou\w*browser)/,
            rmetasr = /(metasr)/;

        os = riphone.exec(ua) 
            || ripad.exec(ua) 
            || randroid.exec(ua) 
            || rmac.exec(ua) 
            || rwindows.exec(ua) 
            || [];

        skin = r360se.exec(ua) 
            || r360ee.exec(ua) 
            || r360phone.exec(ua) 
            || ruc.exec(ua) 
            || rtheworld.exec(ua) 
            || rmaxthon3.exec(ua) 
            || rmaxthon.exec(ua) 
            || rtt.exec(ua) 
            || rqq.exec(ua) 
            || rbaidu.exec(ua) 
            || rsogou.exec(ua) 
            || rmetasr.exec(ua) 
            || [];

        match =  rwebkit.exec(ua) 
            || ropera.exec(ua) 
            || rmsie.exec(ua) 
            || ua.indexOf("compatible") < 0 && rmozilla.exec(ua) 
            || [];

        is_mobile = rmobilesafari.exec(ua) 
            || (is_webview = rwebview.exec(ua));

        if (match[1] === 'webkit') {
            var vendor = (is_mobile ? rmobilewebkit.exec(ua)
                : rsafari.exec(ua)) || [];
            match[3] = match[1];
            match[4] = match[2];
            match[1] = vendor[1] === 'version' 
                && ((os[1] === 'iphone' 
                        || os[1] === 'ipad')
                        && 'mobilesafari'
                    || os[1] === 'android' 
                        && 'aosp' 
                    || 'safari')
                || skin[1]
                || is_webview && 'webview'
                || vendor[1];
            match[2] = vendor[2];
        }

    } catch (ex) {
        match = [];
        skin = [];
    }

    var result = { 
        browser: match[1] || skin[1] || "", 
        version: match[2] || "0",
        engine: match[3],
        engineversion: match[4] || "0",
        os: os[1],
        osversion: os[2] || "0",
        isMobile: os[1] === 'iphone'
            || os[1] === 'android' && !!is_mobile,
        skin: skin[1] || "",
        ua: ua
    };

    if (match[1]) {
        result[match[1]] = parseInt(result.version, 10) || true;
    }
    if (skin[1]) {
        result.rank = rank[result.skin] || 0;
    }
    result.shell = result.skin;

    return result;

});

/* @source mo/console.js */;


define('mo/console', [
  "mo/lang",
  "mo/browsers",
  "mo/template/string",
  "mo/domready"
], function(_, browsers, tpl){

    var console = this.console = this.console || {},
        origin_console = {
            log: console.log,
            info: console.info,
            warn: console.warn,
            error: console.error
        },
        RE_CODE = /^function[^(]*\([^)]*\)[^{]*\{([.\s\S]*)\}$/;

    console._ccBuffer = [];

    console.config = function(opt){

        if (opt.output) {
            this._ccOutput = opt.output;
            this._ccOutput.innerHTML = this._ccBuffer.join('');
        }

        if (opt.record !== undefined) {
            this._recording = opt.record;
            if (!opt.record) {
                console.cc();
            }
        }

        return this;
    };

    console.enable = function(){
        for (var i in origin_console) {
            console[i] = console_api(i);
        }
        console.run = run;
        return this;
    };

    console.disable = function(){
        for (var i in origin_console) {
            console[i] = origin_console[i];
        }
        console.run = console.log;
        return this;
    };

    console.cc = function(newlog){
        if (newlog === undefined) {
            return this._ccBuffer.join('');
        } else {
            this._ccBuffer.push(newlog);
            var result = this._ccBuffer.join('');
            if (!this._recording) {
                //if (!this._ccOutput) {
                    //this._ccOutput = default_output();
                //}
                if (this._ccOutput) {
                    this._ccOutput.innerHTML = result;
                }
            }
            return result;
        }
    };

    function run(fn, opt){
        opt = opt || {};
        var code = fn.toString().trim()
            .match(RE_CODE)[1]
            .trim()
            .replace(/return\s+/, '')
            .replace(/;$/, '');
        console.info('run `' + code + '`');
        try {
            console.info(fn());
        } catch(ex) {
            console.error(opt.showStack ? ex : ex.message);
        }
    }

    function console_api(method){
        return function(){
            if (_.isFunction(origin_console[method])) {
                origin_console[method].apply(console, arguments);
            }
            console.cc('<p>'
                + '<span class="type type-' + method + '"></span>'
                + '<span class="log">'
                + Array.prototype.slice.call(arguments)
                    .map(escape_log, method).join('</span><span class="log">')
                + '</span></p>');
        };
    }

    //function default_output(){
        //var output = document.createElement('DIV');
        //output.setAttribute('id', 'console');
        //document.body.insertBefore(output, document.body.firstChild);
        //return output;
    //}

    function escape_log(text){
        var method = this;
        if (text instanceof Error) {
            text = text.stack ? text.stack.split(/at\s/) : [text.message];
            return text.map(function(msg){
                return escape_log('at ' + msg, method);
            }).join('<br>');
        } else if (method.toString() !== 'log' 
                && text 
                && typeof text === 'object'
                && (!browsers.aosp || text.nodeType !== 1)) {
            text = [
                '<span class="obj-start">' + tpl.escapeHTML('{') + '</span>', 
                Object.keys(text).map(function(key){
                    var v;
                    try {
                        v = this[key];
                    } catch(ex) {
                        v = ex.message;
                    }
                    if (typeof v === 'string') {
                        v = '"' + v + '"';
                    } else {
                        v = String(v);
                    }
                    return '<span class="obj-item">' 
                        + '<span class="obj-k">'
                        + escape_log(key, method) 
                        + ': </span><span class="obj-v">'
                        + (typeof v === 'string' ? tpl.escapeHTML(v) : v)
                        + '</span>,</span>';
                }, text).join(''), 
                '<span class="obj-end">' + tpl.escapeHTML('}') + '</span>'
            ].join('');
            return '<span class="obj-wrap"><span class="obj-overview">' 
                + text
                + '</span><span class="obj-end">...}</span><span class="obj-detail">' 
                + text 
                + '</span></span></span>';
        }
        text = String(text);
        return typeof text === 'string' ? tpl.escapeHTML(text) : text;
    }

    return console;

});
