'use strict';

var gulp       = require('gulp');
var del        = require('del');
var Path       = require('path');

//var rename     = require('gulp-rename');


var nconf      = require('nconf');

var esdoc      = require("gulp-esdoc");


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


require('./gfiles/quality.js')(nconf, Paths);
require('./gfiles/css.js')();
require('./gfiles/client.js')(nconf, Paths);
require('./gfiles/server.js')(nconf, Paths);


gulp.task('clean', function() {
  del([Paths.dist, Paths.tmp, Paths.coverage, Paths.test_dest, Paths.plato, Paths.client_js_for_test, Paths.app_js]);
});


gulp.task('esdoc', function() {
  return gulp.src('./src')
    .pipe(esdoc({
      destination: './documentation'
    }));
});


/* ********************************* Top Level *********************************** */
gulp.task('build-fe', ['js', 'style', 'html', 'resources', 'css-lib', 'js-lib']);
gulp.task('micro', ['js', 'style']);
gulp.task('build-all', ['build-fe', 'build-app']);
gulp.task('default', ['micro']);
/* ******************************** /Top Level *********************************** */

