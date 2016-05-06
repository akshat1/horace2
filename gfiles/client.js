'use strict';

var gulp       = require('gulp');
var changed    = require('gulp-changed');
var del        = require('del');
var babelify   = require('babelify');
var bower      = require('gulp-main-bower-files');
var concat     = require('gulp-concat');
var browserify = require('browserify');
var gulpFilter = require('gulp-filter');
var changed    = require('gulp-changed');
var source     = require('vinyl-source-stream');


var File_Separator = '\n\n/* **** **** **** **** **** **** **** **** **** **** **** **** **** */\n\n';


module.exports = function(nconf, Paths) {
  gulp.task('js', function() {
    return browserify(Paths.client_js_entry, {
        debug: true
      })
      .transform(babelify.configure())
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
}
