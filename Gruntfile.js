
module.exports = function(grunt) {

    var config;
    try {
        config = require('./config');
    } catch(ex) {
        config = {};
        grunt.log.writeln('WARNING: config.js does not exist');
    }
    config.staticDir = config.staticDir || 'public/static';

    var pkg = grunt.file.readJSON('package.json');

    grunt.initConfig({
        pkg: pkg,
        meta: {
            targetDir: 'target',
            distDir: '.dist',
            releaseDir: 'dist',
            originDir: 'origin',
            examplesDir: 'examples',
            examplesStaticDir: 'examples/static',
            tplDir: "tpl",
            jstplDir: "js/<%= pkg.name %>/tpl",
            jsVendorDir: "js/vendor",
            jsStaticDir: config.jsStaticDir || (config.staticDir + '/<%= pkg.name %>/js'),
            cssStaticDir: config.cssStaticDir || (config.staticDir + '/<%= pkg.name %>/css'),
            assetStaticDir: config.assetStaticDir || (config.staticDir + '/<%= pkg.name %>/pics'),
        },

        clean: {
            jstpl: ["<%= meta.jstplDir %>/"],
            jsVendor: ["<%= meta.jsVendorDir %>/"],
            cssVendor: ["css/*/**", "!css/<%= pkg.name %>/**"],
            origin: ["<%= meta.originDir %>/"],
            examples_static: ["<%= meta.examplesStaticDir %>"],
            pub_static: {
                options: {
                    force: true,
                },
                src: [
                    "<%= meta.jsStaticDir %>/*", 
                    "<%= meta.cssStaticDir %>/*", 
                    "<%= meta.assetStaticDir %>/*", 
                    "!<%= meta.jsStaticDir %>/.**", 
                    "!<%= meta.cssStaticDir %>/.**", 
                    "!<%= meta.assetStaticDir %>/.**"
                ]
            },
            target_js: ["<%= meta.targetDir %>/js"],
            target_css: ["<%= meta.targetDir %>/css"],
            target_pics: ["<%= meta.targetDir %>/pics"],
            release: ["<%= meta.releaseDir %>"],
            dist: ["<%= meta.distDir %>"]
        },

        dispatch: {
            options: {
                directory: "bower_components"
            },
            "ozjs": {
                use: {
                    "<%= meta.jsVendorDir %>/": "oz.js"
                }
            },
            "mo": {
                use: {
                    "<%= meta.jsVendorDir %>/mo/": ["**/*.js", "!**/Gruntfile.js"]
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
                    dest: "css/moui/"
                }, {
                    src: ["**/*.js", "!**/Gruntfile.js"],
                    dest: "<%= meta.jsVendorDir %>/moui/"
                }]
            }
        },

        furnace: {
            tpl: {
                options: {
                    importas: 'tpl',
                    exportas: 'amd'
                },
                files: [{
                    expand: true,     // Enable dynamic expansion.
                    cwd: '<%= meta.tplDir %>/',
                    src: ['**/*.tpl'], // Actual pattern(s) to match.
                    dest: '<%= meta.jstplDir %>/',   // Destination path prefix.
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
                    loader: "oz.js",
                    disableAutoSuffix: true
                }
            },
            browsers: {
                src: 'examples/js/browsers_test.js',
                config: {
                    baseUrl: "<%= meta.jsVendorDir %>/",
                    loader: "oz.js"
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
            target_to_examples: {
                files: [{
                    expand: true,
                    cwd: '<%= meta.targetDir %>/',
                    src: ['**'],
                    dest: '<%= meta.examplesStaticDir %>/'
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
            release_to_pub: {
                files: [{
                    expand: true,
                    cwd: '<%= meta.releaseDir %>/js/',
                    src: ['**', '!**/*.min.*'],
                    dest: '<%= meta.jsStaticDir %>/'
                }, {
                    expand: true,
                    cwd: '<%= meta.releaseDir %>/css/',
                    src: ['**', '!**/*.min.*'],
                    dest: '<%= meta.cssStaticDir %>/'
                }, {
                    expand: true,
                    cwd: '<%= meta.releaseDir %>/pics/',
                    src: ['**'],
                    dest: '<%= meta.assetStaticDir %>/'
                }]
            },
            release_to_examples: {
                files: [{
                    expand: true,
                    cwd: '<%= meta.releaseDir %>/',
                    src: ['**'],
                    dest: '<%= meta.examplesStaticDir %>/'
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
            },
            restore: {
                files: [{
                    expand: true,
                    cwd: '<%= meta.releaseDir %>/',
                    src: ['**'],
                    dest: '<%= meta.distDir %>/'
                }]
            },
            release: {
                files: [{
                    expand: true,
                    cwd: '<%= meta.distDir %>/',
                    src: ['**'],
                    dest: '<%= meta.releaseDir %>/'
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
                    src: ['./*.js', 'js/**/*.js', '!<%= meta.jsVendorDir %>/**', '!<%= meta.jstplDir %>/**']
                }
            },
            dist: {
                files: {
                    src: ['./*.js', 'js/**/*.js', '!<%= meta.jsVendorDir %>/**', '!<%= meta.jstplDir %>/**']
                }
            }
        },

        complexity: {
            generic: {
                src: ['js/<%= pkg.name %>/**/*.js', '!<%= meta.jstplDir %>/**'],
                options: {
                    cyclomatic: 10,
                    halstead: 25,
                    maintainability: 100
                }
            }
        },

        connect: {
            examples: {
                options: {
                    hostname: 'localhost',
                    port: 9001,
                    base: 'examples/',
                    keepalive: true
                }
            }
        },

        karma: {
            main: {
                configFile: 'karma.conf.js',
                singleRun: true
                //autoWatch: false,
                //background: true,
            }
        },

        watch: {
            js: {
                files: [
                    'js/**/*.js', 
                    '!<%= meta.jstplDir %>/**',
                    'test/**',
                    'examples/js/**/*.js',
                    '!examples/js/**/*_pack.js'
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
                files: ['<%= meta.tplDir %>/**/*.tpl'],
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
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-complexity');
    grunt.loadNpmTasks('grunt-furnace');
    grunt.loadNpmTasks('grunt-dispatch');
    grunt.loadNpmTasks('grunt-ozjs');
    grunt.loadNpmTasks('grunt-karma');

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
        'clean:jstpl',
        'furnace:tpl', 
        'dev:js'
    ]);

    grunt.registerTask('build_components', [
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
        'copy:target_to_examples',
        'copy:target_to_pub',
        "karma:main"
    ]);

    grunt.registerTask('restore', [
        //'clean:pub_static',
        'copy:release_to_pub',
        'clean:examples_static',
        'copy:release_to_examples',
        'clean:dist',
        'copy:restore'
    ]);

    grunt.registerTask('default', [
        'build_components',
        'jshint:dist',
        'dev',
        'restore'
    ]);

    grunt.registerTask('deploy', [
        //'clean:pub_static',
        'copy:dist_to_pub'
    ]);

    grunt.registerTask('update', [
        //'clean:jsVendor',
        'clean:cssVendor',
        'clean:origin',
        'dispatch',
        'build_components'
    ]);

    grunt.registerTask('publish', [
        'build_components',
        'jshint:dist',
        'dev',
        'build',
        'copy:release',
        'restore'
    ]);

};
