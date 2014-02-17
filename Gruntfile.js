
module.exports = function(grunt) {

    var config;
    try {
        config = require('./config');
    } catch(ex) {
        config = {};
        grunt.log.writeln('WARNING: config.js does not exist');
    }
    config.pubDir = config.pubDir || 'public';
    config.staticDir = config.staticDir || config.pubDir + '/static';

    var pkg = grunt.file.readJSON('package.json');

    grunt.initConfig({
        pkg: pkg,
        meta: {
            pubDir: config.pubDir,
            jsStaticDir: config.jsStaticDir || (config.staticDir + '/js'),
            cssStaticDir: config.cssStaticDir || (config.staticDir + '/css'),
            assetStaticDir: config.assetStaticDir || (config.staticDir + '/pics'),
            targetDir: 'target',
            distDir: 'dist',
            originDir: 'origin',
            tplDir: "tpl/<%= pkg.name %>",
            jsTplDir: "js/<%= pkg.name %>/tpl",
            cardkitTplDir: "tpl/cardkit",
            cardkitJsTplDir: "js/vendor/cardkit/tpl",
            cssVendorDir: "css",
            jsVendorDir: "js/vendor"
        },

        clean: {
            origin: ["<%= meta.originDir %>/"],
            js_vendor: ["<%= meta.jsVendorDir %>/"],
            css_vendor: [
                "<%= meta.cssVendorDir %>/moui", 
                "<%= meta.cssVendorDir %>/cardkit"
            ],
            js_tpl: ["<%= meta.jsTplDir %>"],
            cardkit_tpl: ["<%= meta.cardkitJsTplDir %>"],
            target_js: ["<%= meta.targetDir %>/js"],
            target_css: ["<%= meta.targetDir %>/css"],
            target_pics: ["<%= meta.targetDir %>/pics"],
            dist: ["<%= meta.distDir %>"],
            pub_static: {
                //options: {
                    //force: true
                //},
                src: [
                    "<%= meta.jsStaticDir %>/*", 
                    "<%= meta.cssStaticDir %>/*", 
                    "<%= meta.assetStaticDir %>/*", 
                    "!<%= meta.jsStaticDir %>/.**", 
                    "!<%= meta.cssStaticDir %>/.**", 
                    "!<%= meta.assetStaticDir %>/.**"
                ]
            },
            pub_html: ["<%= meta.pubDir %>/**/*.html"]
        },

        dispatch: {
            options: {
                directory: "bower_components"
            },
            "mo": {
                use: {
                    "<%= meta.jsVendorDir %>/mo/": ["**/*.js", "!**/Gruntfile.js"]
                }
            },
            "darkdom": {
                use: {
                    "<%= meta.jsVendorDir %>/": "darkdom.js"
                }
            },
            "eventmaster": {
                use: {
                    "<%= meta.jsVendorDir %>/": "eventmaster.js"
                }
            },
            "nerv": {
                use: {
                    "<%= meta.jsVendorDir %>/": "nerv.js"
                }
            },
            "dollar": {
                use: {
                    "<%= meta.jsVendorDir %>/": ["**/*.js", "!**/Gruntfile.js"]
                }
            },
            "soviet": {
                use: {
                    "<%= meta.jsVendorDir %>/": "soviet.js"
                }
            },
            "choreo": {
                use: {
                    "<%= meta.jsVendorDir %>/": "choreo.js"
                }
            },
            "momo": {
                use: {
                    "<%= meta.jsVendorDir %>/": ["**/*.js", "!**/Gruntfile.js"]
                }
            },
            "moui": {
                use: [{
                    cwd: "scss/moui",
                    src: ["**"],
                    dest: "<%= meta.cssVendorDir %>/moui/"
                }, {
                    src: ["**/*.js", "!**/Gruntfile.js"],
                    dest: "<%= meta.jsVendorDir %>/moui/"
                }]
            },
            "cardkit": {
                use: [{
                    src: ["**/*.js", "!**/Gruntfile.js"],
                    dest: "<%= meta.jsVendorDir %>/"
                }, {
                    cwd: "tpl/cardkit",
                    src: ["**/*.tpl"],
                    dest: "<%= meta.jsVendorDir %>/cardkit/tpl/"
                }, {
                    cwd: "scss/cardkit",
                    src: ["**"],
                    dest: "<%= meta.cssVendorDir %>/cardkit/"
                }, {
                    src: ["asset"],
                    dest: "pics/"
                }]
            },
            "syntaxhighlighter": {
                use: [{
                    cwd: "compass",
                    src: ["**.scss"],
                    dest: "<%= meta.cssVendorDir %>/syntaxhighlighter/"
                }, {
                    cwd: "scripts",
                    src: ["XRegExp.js", "shCore.js", "shBrushJScript.js", "shBrushXml.js"],
                    dest: "<%= meta.jsVendorDir %>/syntaxhighlighter/"
                }]
            }
        },

        furnace: {
            js_tpl: {
                options: {
                    importas: 'tpl',
                    exportas: 'amd'
                },
                files: [{
                    expand: true,
                    cwd: '<%= meta.tplDir %>',
                    src: ['**/*.tpl'],
                    dest: '<%= meta.jsTtplDir %>',
                    ext: '.js'
                }]
            },
            cardkit_tpl: {
                options: {
                    importas: 'tpl',
                    exportas: 'amd'
                },
                files: [{
                    expand: true,
                    cwd: '<%= meta.cardkitTplDir %>',
                    src: ['**/*.tpl'],
                    dest: '<%= meta.cardkitJsTplDir %>',
                    ext: '.js'
                }]
            }
        },

        ozma: {
            main: {
                saveConfig: false,
                src: 'js/main.js',
                config: {
                    baseUrl: "<%= meta.jsVendorDir %>/",
                    distUrl: "<%= meta.targetDir %>/<%= meta.jsVendorDir %>/",
                    loader: '../../node_modules/ozjs/oz.js',
                    disableAutoSuffix: true
                }
            },
            browsers: {
                src: 'js/browsers_test.js',
                config: {
                    baseUrl: "<%= meta.jsVendorDir %>/",
                    distUrl: "<%= meta.targetDir %>/<%= meta.jsVendorDir %>/",
                    loader: '../../node_modules/ozjs/oz.js',
                    disableAutoSuffix: true
                }
            }
        },

        compass: {
            main: {
                options: {
                    config: 'css/config.rb',
                    sassDir: 'css',
                    cssDir: '<%= meta.targetDir %>/css',
                    imagesDir: '<%= meta.targetDir %>/pics',
                    relativeAssets: true,
                    outputStyle: 'expanded',
                    noLineComments: false,
                    require: [
                        'compass-normalize',
                        'ceaser-easing',
                        'animate',
                        'compass-recipes'
                    ],
                    environment: 'production'
                }
            }
        },

        includereplace: {
            main: {
                options: {
                    globals: {
                        appname: '<%= pkg.name %>'
                    }
                },
                files: [{
                    expand: true,
                    cwd: 'docs/',
                    src: ['**/*.html', '!common/**'],
                    dest: '<%= meta.pubDir %>/',
                    ext: '.orig.html'
                }]
            }
        },

        imagemin: {
            main: {
                options: {
                    optimizationLevel: 3
                },
                files: [{
                    expand: true,
                    cwd: 'pics/',
                    src: ['**/*.{png,jpg}'],
                    dest: '<%= meta.targetDir %>/pics/'
                }]
            }
        },

        htmlmin: {
            main: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= meta.pubDir %>/',
                    src: ['**/*.orig.html'],
                    dest: '<%= meta.pubDir %>/',
                    ext: '.html'
                }]
            }
        },

        concat: {
            options: {
                stripBanners: true,
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> */\n'
            },
            js: {
                files: [{
                    expand: true,
                    cwd: '<%= meta.targetDir %>/js/',
                    src: ['**/*.js'],
                    dest: '<%= meta.distDir %>/js/'
                }]
            },
            css: {
                files: [{
                    expand: true,
                    cwd: '<%= meta.targetDir %>/css/',
                    src: ['**/*.css'],
                    dest: '<%= meta.distDir %>/css/'
                }]
            }
        },

        uglify: {
            main: {
                files: [{
                    expand: true,
                    cwd: '<%= meta.distDir %>/js/',
                    src: ['**/*.js'],
                    dest: '<%= meta.distDir %>/js/',
                    ext: '.min.js'
                }]
            }
        },

        cssmin: {
            main: {
                files: [{
                    expand: true,
                    cwd: '<%= meta.distDir %>/css/',
                    src: ['**/*.css'],
                    dest: '<%= meta.distDir %>/css/',
                    ext: '.min.css'
                }]
            }
        },

        copy: {
            asset_to_target: {
                files: [{
                    expand: true,
                    cwd: 'pics/',
                    src: ['**', '!**/*.{png,jpg}'],
                    dest: '<%= meta.targetDir %>/pics/'
                }]
            },
            asset_to_dist: {
                files: [{
                    expand: true,
                    cwd: '<%= meta.targetDir %>/pics/',
                    src: ['**'],
                    dest: '<%= meta.distDir %>/pics/'
                }]
            },
            target_to_pub: {
                files: [{
                    expand: true,
                    cwd: '<%= meta.targetDir %>/js/',
                    src: ['**'],
                    dest: '<%= meta.jsStaticDir %>/'
                }, {
                    expand: true,
                    cwd: '<%= meta.targetDir %>/css/',
                    src: ['**'],
                    dest: '<%= meta.cssStaticDir %>/'
                }, {
                    expand: true,
                    cwd: '<%= meta.targetDir %>/pics/',
                    src: ['**'],
                    dest: '<%= meta.assetStaticDir %>/'
                }]
            },
            dist_to_pub: {
                files: [{
                    expand: true,
                    cwd: '<%= meta.distDir %>/js/',
                    src: ['**', '!**/*.min.*'],
                    dest: '<%= meta.jsStaticDir %>/'
                }, {
                    expand: true,
                    cwd: '<%= meta.distDir %>/css/',
                    src: ['**', '!**/*.min.*'],
                    dest: '<%= meta.cssStaticDir %>/'
                }, {
                    expand: true,
                    cwd: '<%= meta.distDir %>/pics/',
                    src: ['**'],
                    dest: '<%= meta.assetStaticDir %>/'
                }]
            },
            min_to_pub: {
                files: [{
                    expand: true,
                    cwd: '<%= meta.distDir %>/js/',
                    src: ['**/*.min.*'],
                    dest: '<%= meta.jsStaticDir %>/'
                }, {
                    expand: true,
                    cwd: '<%= meta.distDir %>/css/',
                    src: ['**/*.min.*'],
                    dest: '<%= meta.cssStaticDir %>/'
                }]
            }
        },

        jshint: {
            options: pkg.jshintConfig,
            dev: {
                options: {
                    devel: true,
                    debug: true,
                    asi: true 
                },
                files: {
                    src: [
                        '*.js', 
                        'js/**/*.js', 
                        '!<%= meta.jsVendorDir %>/**', 
                        '!<%= meta.jsTplDir %>/**'
                    ]
                }
            },
            dist: {
                files: {
                    src: [
                        '*.js', 
                        'js/**/*.js', 
                        '!<%= meta.jsVendorDir %>/**', 
                        '!<%= meta.jsTplDir %>/**'
                    ]
                }
            }
        },

        connect: {
            pub: {
                options: {
                    hostname: 'localhost',
                    port: 9001,
                    base: 'public/',
                    keepalive: true
                }
            }
        },

        karma: {
            main: {
                configFile: 'karma.conf.js',
                singleRun: true
            }
        },

        watch: {
            js: {
                files: [
                    'js/**/*.js', 
                    '!<%= meta.jsTplDir %>/**',
                    '!<%= meta.cardkitJsTplDir %>/**',
                    'test/**'
                ],
                tasks: [
                    'dev:js',
                    'test'
                ]
            },
            css: {
                files: ['css/**/*.scss'],
                tasks: [
                    'dev:css',
                    'test'
                ]
            },
            tpl: {
                files: [
                    '<%= meta.tplDir %>/**/*.tpl',
                    '<%= meta.cardkitTplDir %>/**/*.tpl'
                ],
                tasks: [
                    'dev:tpl',
                    'test'
                ]
            },
            asset: {
                files: ['pics/**'],
                tasks: [
                    'dev:asset',
                    'test'
                ]
            },
            html: {
                files: ['docs/**/*.html'],
                tasks: [
                    'dev:html',
                    'test'
                ]
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-include-replace');
    grunt.loadNpmTasks('grunt-furnace');
    grunt.loadNpmTasks('grunt-dispatch');
    grunt.loadNpmTasks('grunt-ozjs');
    grunt.loadNpmTasks('grunt-karma');

    grunt.registerTask('build_components', [
    ]);

    grunt.registerTask('update', [
        'clean:js_vendor',
        'clean:css_vendor',
        'clean:origin',
        'dispatch',
        'build_components'
    ]);

    grunt.registerTask('dev:js', [
        'clean:target_js', 
        'ozma',
    ]);

    grunt.registerTask('dev:css', [
        'clean:target_css', 
        'compass',
    ]);

    grunt.registerTask('dev:asset', [
        'clean:target_pics', 
        'imagemin', 
        'copy:asset_to_target',
        'dev:css'
    ]);

    grunt.registerTask('dev:tpl', [
        'clean:js_tpl',
        'clean:cardkit_tpl',
        'furnace:js_tpl', 
        'furnace:cardkit_tpl', 
        'dev:js'
    ]);

    grunt.registerTask('dev:html', [
        'clean:pub_html',
        'includereplace',
        'htmlmin'
    ]);

    grunt.registerTask('dev', [
        'dev:tpl',
        'dev:asset'
    ]);
    
    grunt.registerTask('build', [
        'clean:dist',
        'concat',
        'copy:asset_to_dist',
        'uglify', 
        'cssmin'
    ]);

    grunt.registerTask('test', [
        'clean:pub_static',
        'copy:target_to_pub',
        'dev:html',
        'karma:main'
    ]);

    grunt.registerTask('default', [
        'build_components',
        'jshint:dist',
        'dev',
        'karma:main',
        'build',
        'clean:pub_static',
        'copy:dist_to_pub',
        'copy:min_to_pub',
        'dev:html'
    ]);

};
