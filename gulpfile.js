// TODO        : Clarify the situation with Sources.COFFEE and the full path in browserify

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
var coffeelint = require('gulp-coffeelint');
var istanbul   = require('gulp-coffee-istanbul');
var mocha      = require('gulp-mocha');
var nconf      = require('nconf');
var jsdoc      = require('gulp-jsdoc');
nconf.argv()




var Sources = {
  BOWER               : 'bower_components',
  HAML                : 'client/haml/**/*.haml',
  SASS                : 'client/sass/**/*.scss',
  CLIENT_COFFEE       : 'client/coffee/**/*.coffee',
  CLIENT_COFFEE_ENTRY : 'client/coffee/index.coffee',
  APP_COFFEE          : 'app/**/*.coffee',
  RESOURCES           : 'client/resources/**/*',
  TEST                : 'test/**/*.coffee',
  TMPJS               : 'tmpjs'
};

var Destinations = {
  HTML      : 'dist/',
  CSS       : 'dist/css/',
  JS        : 'dist/js/',
  RESOURCES : 'dist/resources/',
  CSSLIB    : 'dist/lib',
  COVERAGE  : 'coverage',
  TMPJS     : 'tmpjs',
  JSDOC     : 'documentation'
};


gulp.task('clean', function(cb) {
  del(_.values(Destinations), cb);
});


gulp.task('mkdir-setup', function(cb) {
  var directories = _.values(Destinations);
  for(var i = 0; i < directories.length; i++) {
    var d = directories[i];
    if(!FS.existsSync(d))
      FS.mkdirSync(d);
  }
  cb();
});


gulp.task('app-js-for-jsdoc', ['mkdir-setup'], function() {
  return gulp.src(Sources.APP_COFFEE)
    .pipe(coffee({bare: true}))
    //destination, template, infos, buildOptions
    .pipe(gulp.dest(Destinations.TMPJS + '/app', null, null, {}));
});

gulp.task('client-js-for-jsdoc', ['mkdir-setup'], function() {
  return gulp.src(Sources.CLIENT_COFFEE)
    .pipe(coffee({bare: true}))
    .pipe(gulp.dest(Destinations.TMPJS + '/client'));
});

gulp.task ('app-jsdoc', ['app-js-for-jsdoc'], function() {
  return gulp.src(Destinations.TMPJS + '/app/**/*.js')
    .pipe(jsdoc(Destinations.JSDOC + '/app'));
})

gulp.task ('client-jsdoc', ['client-js-for-jsdoc'], function() {
  return gulp.src(Destinations.TMPJS + '/client/**/*.js')
    .pipe(jsdoc(Destinations.JSDOC + '/client'));
})

gulp.task('jsdoc', ['app-jsdoc', 'client-jsdoc']);

gulp.task('js', ['mkdir-setup'], function() {
  return gulp.src(CLIENT_COFFEE_ENTRY)
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


gulp.task('coffee-lint', function () {
  return gulp.src([Sources.CLIENT_COFFEE, Sources.APP_COFFEE])
    //TODO User Path.join etc. to get this correct.
    .pipe(coffeelint(__dirname + '/build-config/coffeelint.json'))
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
  return gulp.src([Sources.CLIENT_COFFEE, Sources.APP_COFFEE])
    .pipe(istanbul({includeUntested: true}))
    .pipe(istanbul.hookRequire())
    .on('finish', function () {
      gulp.src(Sources.TEST)
        .pipe(mocha(coffeeTestOptions))
        .pipe(istanbul.writeReports({
          dir: Destinations.COVERAGE
        }))
        .on('cnd', cb);
    })
});


gulp.task('build', ['js', 'sass', 'haml', 'resources', 'css-lib', 'js-lib']);
gulp.task('test', ['coffee-lint', 'coffee-test']);

gulp.task('default', ['build']);


