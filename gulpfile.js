var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var prefix = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();

var paths = {
  scss: 'styles/scss/**/*.scss',
  css: 'styles/css/**/*.css',
  scssRoot: 'styles/scss/',
  cssRoot: 'styles/css/',
  html: './**/*.html'
};

gulp.task('serve', ['sass'], function() {
  browserSync.init({
    server: {
      baseDir: './'
    }
  });

  gulp.watch(paths.scss, ['sass']);
  gulp.watch(paths.html).on('change', browserSync.reload);
});


function compileSass(browserSyncStream, compress) {
  var result = gulp.src(paths.scss)
        .pipe(sourcemaps.init())
        .pipe(sass({
          includePaths: paths.scssRoot,
          outputStyle: compress ? 'compressed' : 'nested',
          onError: browserSync.notify
        }))
        .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(sourcemaps.write('.', { includeContent: false, sourceRoot: '../../'+ paths.scssRoot }))
        .pipe(gulp.dest(paths.cssRoot));

  if (browserSyncStream) {
    result = result.pipe(browserSync.stream( { match: '**/*.css' } ));
  }

  return result;
}

gulp.task('sass', function() {
  return compileSass(true);
});

gulp.task('dev', ['serve']);
gulp.task('default', ['dev']);
gulp.task('build', function() {
  return compileSass(false, true);
});
