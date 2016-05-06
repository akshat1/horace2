'use strict';

/* Gulp file containing quality, testing related tasks */

var gulp     = require('gulp');
var babel    = require('gulp-babel');
var eslint   = require('gulp-eslint');
var replace  = require('gulp-replace');
var mocha    = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var Path     = require('path');
var chilProcess = require('child_process');
var plato    = require('gulp-plato');


module.exports = function(nconf, Paths, BabelOptions) {

  // We define all tasks here so that we can get access to stuff like various Paths
  gulp.task('eslint', function() {
    return gulp.src([Paths.app_js_src, Paths.client_js, Paths.client_jsx])
      .pipe(replace('@autobind', '')) //ESlint doesn't support ES7 features. So no decorators
      .pipe(replace(/import autobind.*;/, '')) //ESlint doesn't support ES7 features. So no decorators
      .pipe(eslint({
        config: 'eslint-config.json'
      }))
      .pipe(eslint.format())
      .pipe(eslint.failAfterError());
  });


  gulp.task('compile-fe-for-test', function() {
    return gulp.src([Paths.client_js, Paths.client_jsx])
      .pipe(babel(BabelOptions))
      .pipe(gulp.dest(Paths.client_js_for_test));
  });


  gulp.task('compile-tests', function() {
    return gulp.src([Paths.test_src])
      .pipe(babel())
      .pipe(gulp.dest(Paths.test_dest))
  });


  var testOptions = {};
  gulp.task('test', ['compile-tests', 'build-app', 'compile-fe-for-test'], function () {
    return gulp.src([Path.join(Paths.app_js, '**', '*.js'), Path.join(Paths.client_js_for_test, '**', '*.js')])
      .pipe(istanbul({
        includeUntested: true
      }))
      .pipe(istanbul.hookRequire())
      .on('finish', function() {
        return gulp.src([Paths.test])
          .pipe(mocha(testOptions))
          .pipe(istanbul.writeReports({
            dir: Paths.coverage
          }));
      });
  });


  gulp.task('plato', function(done) {
    var platoDestination = nconf.get('plato-dest') || 'plato';
    return gulp.src([Path.join(Paths.app_js, '**', '*.js'), Path.join(Paths.client_js_for_test, '**', '*.js')])
      .pipe(plato(platoDestination, {
        title: 'XCompiled. Take it with salt.',
        complexity: {
          trycatch: true
        }
      }));
  });


  // END
}


