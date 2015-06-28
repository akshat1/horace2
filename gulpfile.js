// TODO: Clarify the situation with Sources.COFFEE and the full path in browserify

var gulp       = require('gulp');
var _          = require('lodash');
var sass       = require('gulp-sass');
var coffee     = require('gulp-coffee');
var haml       = require('gulp-ruby-haml');
var del        = require('del');
var FS         = require('fs');
var concat     = require('gulp-concat');
var browserify = require('gulp-browserify2');
var rename     = require('gulp-rename');
var bower      = require('gulp-main-bower-files');
var gulpFilter = require('gulp-filter');


var Sources = {
  BOWER     : 'bower_components',
  HAML      : 'src/haml/**/*.haml',
  SASS      : 'src/sass/**/*.scss',
  COFFEE    : 'src/coffee/**/*.coffee',
  RESOURCES : 'src/resources/**/*'
};

var Destinations = {
  HTML      : 'dist/',
  CSS       : 'dist/css/',
  JS        : 'dist/js/',
  RESOURCES : 'dist/resources/',
  CSSLIB    : 'dist/lib'
};


gulp.task('clean', function(cb) {
  del(_.values(Destinations), cb);
});


gulp.task('mkdir-setup', ['clean'], function(cb) {
  var directories = _.values(Destinations);
  for(var i = 0; i < directories.length; i++) {
    var d = directories[i];
    if(!FS.existsSync(d))
      FS.mkdirSync(d);
  }
  cb();
});


gulp.task('js', ['mkdir-setup'], function() {
  return gulp.src('src/coffee/index.coffee')
    .pipe(browserify({
      fileName: 'horace.js',
      transform: [require('coffeeify')]
    }))
    .pipe(gulp.dest(Destinations.JS));
});


gulp.task('sass', ['mkdir-setup'], function() {
  return gulp.src(Sources.SASS)
    .pipe(sass())
    .pipe(concat('horace.css'))
    .pipe(gulp.dest(Destinations.CSS));
});


gulp.task('css-lib', ['mkdir-setup'], function() {
  return gulp.src('./bower.json')
    .pipe(bower())
    .pipe(gulpFilter(['**/*.css']))
    .pipe(concat('lib.css', {newLine: '\r\n/* ******************************************************* */\r\n'}))
    .pipe(gulp.dest(Destinations.CSSLIB));
});


gulp.task('js-lib', ['mkdir-setup'], function() {
  return gulp.src('./bower.json')
    .pipe(bower())
    .pipe(gulpFilter(['**/*.js']))
    .pipe(concat('lib.js', {newLine: '\r\n/* ******************************************************* */\r\n'}))
    .pipe(gulp.dest(Destinations.CSSLIB));
});


gulp.task('haml', ['mkdir-setup'], function() {
  return gulp.src(Sources.HAML)
    .pipe(haml())
    .pipe(gulp.dest(Destinations.HTML));
});


gulp.task('resources', ['mkdir-setup'], function() {
  return gulp.src(Sources.RESOURCES)
    .pipe(gulp.dest(Destinations.RESOURCES));
});


gulp.task('build', ['js', 'sass', 'haml', 'resources', 'css-lib', 'js-lib']);


gulp.task('default', ['build']);


