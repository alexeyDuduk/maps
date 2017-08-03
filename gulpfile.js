/* globals require: false */
(function () {
    'use strict';

    var jsFiles         = [ 'app/*.index.js', 'app/**/*.index.js', 'app/*.js', 'app/**/*.js' ];
    var jsVendor        = [];
    var jsVendorExcl    = [ '!app/**/vendor/**/*.js' ];
    var stylesFiles     = 'app/**/*.scss';
    var stylesVendors   = [ ];

    var gulp            = require('gulp');
    var sass            = require('gulp-sass');
    var autoprefixer    = require('gulp-autoprefixer');
    var cssnano         = require('gulp-cssnano');
    var uglify          = require('gulp-uglify');
    var rename          = require('gulp-rename');
    var concat          = require('gulp-concat');
    var babel           = require('gulp-babel');
    var inject          = require('gulp-inject');

    // env specific dependencies
    var notify          = null;
    var browserSync     = null;

    // dev specific dependencies
    var jshint          = null;
    var jshintStylish   = null;


    function registerInitEnvTasks() {
        notify          = require('gulp-notify');
        browserSync     = require('browser-sync');
        jshint          = require('gulp-jshint');
        jshintStylish   = require('jshint-stylish');
    }

    function registerBuildTasks() {
        gulp.task('build-styles', function () {
            return gulp.src(stylesFiles)
                .pipe(sass({ errorLogToConsole: true }))
                .pipe(autoprefixer('last 2 version'))
                .pipe(concat('styles.css'))
                .pipe(gulp.dest('dist/styles'))
                .pipe(rename({ suffix: '.min' }))
                .pipe(cssnano())
                .pipe(gulp.dest('dist/styles'))
                .pipe(browserSync.stream());
        });

        gulp.task('build-scripts', function () {
            var stream = gulp.src(jsFiles)
                //.pipe(concat('app.js'))
                .pipe(babel({
                    presets: ['es2015']
                }));

            //stream = stream.pipe(uglify());

            return stream
                .pipe(gulp.dest('dist/scripts'))
                .pipe(browserSync.reload({ stream: true }));
        });

        gulp.task('lint', function () {
            gulp.src([...jsFiles, ...jsVendorExcl])
                .pipe(jshint('.jshintrc'))
                .pipe(jshint.reporter('jshint-stylish'))
                .pipe(jshint.reporter('fail'))
                .on('error', function () {});
        });

        gulp.task('copy-html', function () {
            var options = {
                starttag: '<!-- inject:dojoConfig -->',
                transform: function (filePath, file) {
                    return [
                        '<script>',
                        file.contents.toString('utf8')
                            .replace(/%NAME%/g, 'app')
                            .replace(/%PATH%/g, '/scripts/src')
                            .replace(/%MAIN%/g, '../app.index'),
                        '</script>'
                        ].join('\n');
                }
            };

            return gulp.src('app/*.html')
                .pipe(inject(gulp.src(['dojoConfig.js']), options))
                .pipe(gulp.dest('dist/'));
        });

        gulp.task('copy-assets', function () {
            return gulp.src('app/assets/**/*')
                .pipe(gulp.dest('dist/assets/'))
                .pipe(browserSync.stream());
        });

        gulp.task('copy-stubs', function () {
            return gulp.src('app/stubs/**/*')
                .pipe(gulp.dest('dist/stubs/'))
                .pipe(browserSync.stream());
        });

        gulp.task('copy', function () {
            gulp.start('copy-html', 'copy-assets', 'copy-stubs');
        });

        gulp.task('build-vendor-scripts', function () {
            return gulp.src(jsVendor)
                .pipe(concat('libs.min.js'))
                .pipe(gulp.dest('dist/scripts'));
        });

        gulp.task('build-vendor-styles', function () {
            return gulp.src(stylesVendors)
                .pipe(concat('vendor-styles.min.css'))
                .pipe(gulp.dest('dist/styles'));
        });

        gulp.task('build-vendors', [ 'build-vendor-scripts', 'build-vendor-styles' ]);

        gulp.task('build', [
            'build-vendors',
            'copy',
            'build-styles',
            'build-scripts'
        ]);
    }

    function registerSyncTasks() {
        gulp.task('watch', function () {
            gulp.watch(stylesFiles, [ 'build-styles' ]);
            gulp.watch(jsFiles, [ 'lint', 'build-scripts' ]);
            gulp.watch('app/*.html', [ 'copy' ]);
            gulp.watch('app/assets/**/*', [ 'copy-assets' ]);
            gulp.watch('app/stubs/**/*', [ 'copy-stubs' ]);
        });

        gulp.task('browser-sync', function () {
            browserSync.init({
                server: {
                    baseDir: './dist/'
                },
                port: 3003,
                open: true,
                notify: false
            });
        });
    }

    function registerCompositeTasks() {
        gulp.task('default', [ 'lint', 'build', 'watch' ], () => gulp.start('browser-sync'));
    }

    registerInitEnvTasks();
    registerBuildTasks();
    registerSyncTasks();
    registerCompositeTasks();
})();
