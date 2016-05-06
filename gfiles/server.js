var gulp       = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var babel      = require('gulp-babel');


module.exports = function (nconf, Paths) {
  gulp.task('build-app', function() {
    return gulp.src(Paths.app_js_src)
      .pipe(sourcemaps.init())
      .pipe(babel())
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(Paths.app_js));
  });
}