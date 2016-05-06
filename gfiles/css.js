var gulp          = require('gulp');
var postCSS       = require('gulp-postcss');
var concat        = require('gulp-concat');
var bower         = require('gulp-main-bower-files');
var gulpFilter    = require('gulp-filter');
var sourcemaps    = require('gulp-sourcemaps');
var flexBoxMixins = require('./../postcss/flexBox.js');
var _             = require('lodash');
var Path          = require('path');

var File_Separator = '\n\n/* **** **** **** **** **** **** **** **** **** **** **** **** **** */\n\n';


/*
Notes:
- CSS libs come from 3 routes
  - bower (for files which should be collapsed into a single lib.css). We don't always use this, as not everyeone has a
    correct bower.json, or some packages need to be built or whatever.
  - direct download into src/client/lib (for files which should be collapsed into a single lib.css)
  - direct download into src/client/resources (for files which should be loaded separately, like normalize.css)
*/


var Paths = {
  csslib_tmp : 'build-tmp/csslib',
  csslib_src : 'src/client/lib/**/*.css',
  csslib     : 'dist/lib',
  css_src    : 'src/client/css/**/*.css',
  css        : 'dist/css'
};

module.exports = function() {
  var pcPlugins = [
    require('postcss-import'),
    require('postcss-mixins')({
      mixins: _.extend({}, flexBoxMixins)
    }),
    require('postcss-simple-vars'),
    require('postcss-nested')
  ];


  gulp.task('css', function() {
    return gulp.src([Paths.css_src, '!**/_*.css'])
      .pipe(sourcemaps.init())
      .pipe(postCSS(pcPlugins))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(Paths.css));
  });


  gulp.task('sass', function() {
    return gulp.src(['src/client/sass/*.scss'])
      .pipe(require('gulp-sass')())
      .pipe(gulp.dest(Paths.css));
  });


  gulp.task('gather-lib-css', function(){
    return gulp.src('./bower.json')
      .pipe(bower())
      .pipe(gulpFilter(['**/*.css']))
      .pipe(gulp.dest(Paths.csslib_tmp));
  });


  gulp.task('css-lib', ['gather-lib-css'], function() {
    return gulp.src([Path.join(Paths.csslib_tmp, '**', '*.css'), Paths.csslib_src])
      .pipe(concat('lib.css', {newLine: File_Separator}))
      .pipe(gulp.dest(Paths.csslib));
  });


  gulp.task('style', ['css']);
}

