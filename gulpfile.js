"use strict";

var gulp       = require('gulp');
var _          = require('lodash');
var sass       = require('gulp-sass');
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
var mocha      = require('gulp-mocha');
var nconf      = require('nconf');
var jsdoc      = require('gulp-jsdoc');
var sourcemaps = require("gulp-sourcemaps");

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


var Paths = {
  app_js_src          : 'src/app/js/**.js',
  app_js              : 'app',
  bower               : 'bower_components',
  sass                : clientDir('sass', '**', '*.scss'),
  client_js           : clientDir('js', '**', '*.js'),
  client_js_entry     : clientDir('js', 'index.js'),
  resources_src       : clientDir('resources', '**', '*'),
  tmp                 : tmpDir(),
  dist                : distDir(),
  html_src            : clientDir('html', '**/*.html'),
  html                : distDir(),
  css                 : distDir('css'),
  js                  : distDir('js'),
  resources           : distDir('resources'),
  csslib              : distDir('lib'),
  jslib               : distDir('lib'),
  test                : 'test/**/*.coffee',
  jsonlint_conf       : Path.join(__dirname, 'build-config', 'coffeelint.json'),
  coverage            : 'coverage',
  jsdoc_app           : 'documentation/app',
  jsdoc_client        : 'documentation/client'
};


/* ************************************ Setup ************************************ */
gulp.task('clean', function() {
  del([Paths.dist, Paths.tmp]);
});
/* *********************************** /Setup ************************************ */


/* ******************************** Documentation ******************************** */
/*
//TODO Use ESDoc
gulp.task ('app-jsdoc', function() {
  return gulp.src(Paths.app_js)
    .pipe(jsdoc(Paths.jsdoc_app));
})


gulp.task ('client-jsdoc', function() {
  return gulp.src(Paths.client_js)
    .pipe(jsdoc(Paths.jsdoc_client));
})


gulp.task('jsdoc', ['app-jsdoc', 'client-jsdoc']);
*/
/* ******************************** Documentation ******************************** */


/* ********************************** Build App ********************************** */
gulp.task('build-app', function() {
  return gulp.src('src/app/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('app'));
});
/* ********************************* /Build App ********************************** */


/* ********************************* Build Client ******************************** */
gulp.task('js', function() {
  return browserify(Paths.client_js_entry)
    .transform(babelify.configure({
      optional: ["es7.decorators"]
    }))
    .bundle()
    .pipe(source('horace.js'))
    .pipe(gulp.dest(Paths.js));
});


gulp.task('sass', function() {
  return gulp.src(Paths.sass)
    .pipe(sass())
    .pipe(concat('horace.css'))
    .pipe(gulp.dest(Paths.css));
});


gulp.task('css-lib', function() {
  return gulp.src('./bower.json')
    .pipe(bower())
    .pipe(gulpFilter(['**/*.css']))
    .pipe(concat('lib.css', {newLine: File_Separator}))
    .pipe(gulp.dest(Paths.csslib));
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
    .pipe(gulp.dest(Paths.resources));
});

gulp.task('html', function() {
  return gulp.src(Paths.html_src)
    .pipe(gulp.dest(Paths.html));
});
/* ******************************** /Build Client ******************************** */


/* *********************************** Quality ********************************** * /
// TODO: Migrate tests to JS, Get JSLint
var coffeeTestOptions = {};
var coffeeTestGrep = nconf.get('ct-grep');
console.log('coffeeTestGrep: ', coffeeTestGrep);
if(coffeeTestGrep){
  coffeeTestOptions['grep'] = coffeeTestGrep;
}
console.log('coffeeTestOptions: ', coffeeTestOptions);
gulp.task('coffee-test', function (cb) {
  return gulp.src([Paths.client_coffee, Paths.app_coffee])
    .pipe(istanbul({includeUntested: true}))
    .pipe(istanbul.hookRequire())
    .on('finish', function () {
      gulp.src(Paths.test)
        .pipe(mocha(coffeeTestOptions))
        .pipe(istanbul.writeReports({
          dir: Paths.coverage
        }))
        .on('cnd', cb);
    })
});
/ * ********************************* /Quality *********************************** */


/* ********************************* Top Level *********************************** */
gulp.task('build', ['js', 'sass', 'html', 'resources', 'css-lib', 'js-lib']);
gulp.task('default', ['build']);
/* ******************************** /Top Level *********************************** */


