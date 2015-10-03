"use strict";

var gulp       = require('gulp');
var _          = require('lodash');
var sass       = require('gulp-sass');
var coffee     = require('gulp-coffee');
var haml       = require('gulp-ruby-haml');
var del        = require('del');
var FS         = require('fs');
var Path       = require('path');
var concat     = require('gulp-concat');
var browserify = require('gulp-browserify2');
var rename     = require('gulp-rename');
var bower      = require('gulp-main-bower-files');
var gulpFilter = require('gulp-filter');
var coffeelint = require('gulp-coffeelint');
var istanbul   = require('gulp-coffee-istanbul');
var mocha      = require('gulp-mocha');
var nconf      = require('nconf');
var jsdoc      = require('gulp-jsdoc');

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
  subPath.unshift('client');
  var result = Path.join.apply(null, subPath);
  return result;
}


var Paths = {
  app_coffee          : 'app/**/*.coffee',
  bower               : 'bower_components',
  haml                : clientDir('haml', '**', '*.haml'),
  sass                : clientDir('sass', '**', '*.scss'),
  client_coffee       : clientDir('coffee', '**', '*.coffee'),
  client_coffee_entry : clientDir('coffee', 'index.coffee'),
  resources_src       : clientDir('resources', '**', '*'),
  tmp                 : tmpDir(),
  tmp_client_js       : tmpDir('client_js'),
  tmp_app_js          : tmpDir('app_js'),
  dist                : distDir(),
  html                : distDir(),
  css                 : distDir('css'),
  js                  : distDir('js'),
  resources           : distDir('resources'),
  csslib              : distDir('lib'),
  jslib               : distDir('lib'),
  test                : 'test/**/*.coffee',
  jsonlint_conf       : Path.join(__dirname, 'build-config', 'coffeelint.json'),
  coverage            : 'coverage',
  jsdoc_app           : 'documentation',
  jsdoc_client        : 'documentation'
};


/* ************************************ Setup ************************************ */
gulp.task('clean', function() {
  del([Paths.dist, Paths.tmp]);
});
/* *********************************** /Setup ************************************ */


/* ******************************** Documentation ******************************** */
gulp.task('app-js-for-jsdoc', function() {
  return gulp.src(Paths.app_coffee)
    .pipe(coffee({bare: true}))
    .pipe(gulp.dest(Paths.tmp_app_js));
});


gulp.task('client-js-for-jsdoc', function() {
  return gulp.src(Paths.client_coffee)
    .pipe(coffee({bare: true}))
    .pipe(gulp.dest(Paths.tmp_client_js));
});


gulp.task ('app-jsdoc', ['app-js-for-jsdoc'], function() {
  return gulp.src(Paths.tmp_app_js + '/**/*.js')
    .pipe(jsdoc(Paths.jsdoc_app));
})


gulp.task ('client-jsdoc', ['client-js-for-jsdoc'], function() {
  return gulp.src(Paths.tmp_client_js + '/**/*.js')
    .pipe(jsdoc(Paths.jsdoc_client));
})


gulp.task('jsdoc', ['app-jsdoc', 'client-jsdoc']);
/* ******************************** Documentation ******************************** */


/* ********************************* Build Client ******************************** */
gulp.task('js', function() {
  return gulp.src(Paths.client_coffee_entry)
    .pipe(browserify({
      fileName: 'horace.js',
      transform: [require('coffeeify')]
    }))
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


gulp.task('haml', function() {
  return gulp.src(Paths.haml)
    .pipe(haml())
    .pipe(gulp.dest(Paths.html));
});


gulp.task('resources', function() {
  return gulp.src(Paths.resources_src)
    .pipe(gulp.dest(Paths.resources));
});
/* ******************************** /Build Client ******************************** */


/* *********************************** Quality *********************************** */
gulp.task('coffee-lint', function () {
  return gulp.src([Paths.client_coffee, Paths.app_coffee])
    .pipe(coffeelint(Paths.jsonlint_conf))
    .pipe(coffeelint.reporter());
});


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
/* ********************************** /Quality *********************************** */


/* ********************************* Top Level *********************************** */
gulp.task('build', ['js', 'sass', 'haml', 'resources', 'css-lib', 'js-lib']);
gulp.task('test', ['coffee-lint', 'coffee-test']);
gulp.task('default', ['build']);
/* ******************************** /Top Level *********************************** */


