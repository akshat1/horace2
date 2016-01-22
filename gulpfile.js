'use strict';

var gulp       = require('gulp');
var changed    = require('gulp-changed');
var del        = require('del');
var FS         = require('fs');
var Path       = require('path');
var concat     = require('gulp-concat');
var browserify = require('browserify');
var babel      = require('gulp-babel');
var babelify   = require('babelify');
var source     = require('vinyl-source-stream');
var rename     = require('gulp-rename');
var bower      = require('gulp-main-bower-files');
var gulpFilter = require('gulp-filter');
var nconf      = require('nconf');
var sourcemaps = require('gulp-sourcemaps');
var esdoc      = require("gulp-esdoc");

// MISC
var File_Separator = '\n\n/* **** **** **** **** **** **** **** **** **** **** **** **** **** */\n\n';

// Initialise config
nconf.argv()

// Paths (and some over-engineered path-building)
function tmpDir (subDir) {
  return Path.join('build-tmp', subDir || '');
}


function distDir (subDir) {
  return Path.join('dist', subDir || '');
}


function clientDir() {
  var subPath = Array.prototype.slice.apply(arguments);
  subPath = ['src', 'client'].concat(subPath);
  var result = Path.join.apply(null, subPath);
  return result;
}


// TODO: This is getting a bit silly. Simplify this
var Paths = {
  app_js_src          : 'src/app/**/*.js',
  app_js              : 'app',
  bower               : 'bower_components',
  client_js           : clientDir('js', '**', '*.js'),
  client_jsx          : clientDir('js', '**', '*.jsx'),
  client_js_entry     : clientDir('js', 'index.js'),
  client_js_for_test  : 'compiled-fe',
  resources_src       : clientDir('resources', '**', '*'),
  tmp                 : tmpDir(),
  dist                : distDir(),
  html_src            : clientDir('html', '**/*.html'),
  html                : distDir(),
  js                  : distDir('js'),
  resources           : distDir('resources'),
  jslib               : distDir('lib'),
  test_src            : 'test-src/**/*.js',
  test_dest           : 'test',
  test                : 'test/**/*.js',
  jsonlint_conf       : Path.join(__dirname, 'build-config', 'coffeelint.json'),
  coverage            : 'coverage',
  jsdoc_app           : 'documentation/app',
  jsdoc_client        : 'documentation/client',
  coverage            : 'coverage',
  plato               : 'plato'
};


var BabelOptions = {
  optional: ['es7.decorators']
}

require('./gulpfile-quality.js')(nconf, Paths, BabelOptions);
require('./gulpfile-css.js');


/* ************************************ Setup ************************************ */
gulp.task('clean', function() {
  del([Paths.dist, Paths.tmp, Paths.coverage, Paths.test_dest, Paths.plato, Paths.client_js_for_test, Paths.app_js]);
});
/* *********************************** /Setup ************************************ */


/* ********************************** Build App ********************************** */
gulp.task('build-app', function() {
  return gulp.src(Paths.app_js_src)
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(Paths.app_js));
});
/* ********************************* /Build App ********************************** */


/* ********************************* Build Client ******************************** */
gulp.task('js', function() {
  return browserify(Paths.client_js_entry, {
      debug: true
    })
    .transform(babelify.configure(BabelOptions))
    .bundle()
    .pipe(source('horace.js'))
    .pipe(gulp.dest(Paths.js));
});


gulp.task('js-lib', function() {
  return gulp.src('./bower.json')
    .pipe(bower())
    .pipe(gulpFilter(['**/*.js']))
    .pipe(concat('lib.js', {newLine: File_Separator}))
    .pipe(gulp.dest(Paths.jslib));
});


gulp.task('resources', function() {
  return gulp.src(Paths.resources_src)
    .pipe(changed(Paths.resources))
    .pipe(gulp.dest(Paths.resources));
});

gulp.task('html', function() {
  return gulp.src(Paths.html_src)
    .pipe(changed(Paths.html))
    .pipe(gulp.dest(Paths.html));
});
/* ******************************** /Build Client ******************************** */


/* ************************************* Doc ************************************ */

gulp.task('esdoc', function() {
  return gulp.src('./src')
    .pipe(esdoc({
      destination: './documentation'
    }));
});

/* ************************************ /Doc ************************************ */


/* ********************************* Top Level *********************************** */
gulp.task('build', ['js', 'style', 'html', 'resources', 'css-lib', 'js-lib']);
gulp.task('micro', ['js', 'style']);
gulp.task('default', ['micro']);
/* ******************************** /Top Level *********************************** */


