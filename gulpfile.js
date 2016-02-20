const gulp = require('gulp');
const path = require('path');
const fs = require('fs');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const prefix = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const shell = require('gulp-shell');
const webpack = require('gulp-webpack');
const forever = require('forever-monitor');

const paths = {
  scss: 'static/styles/scss/**/*.scss',
  css: 'static/styles/css/**/*.css',
  scssRoot: 'static/styles/scss/',
  cssRoot: 'static/styles/css/',
  html: './**/*.hbs',
  jsEntry: 'static/js/src/main.js',
  jsOut: 'static/js/dist/'
};

gulp.task('serve', ['sass'], function () {
  browserSync.init({
    proxy: 'http://localhost:8000',
    serverStatic: ['.']
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

function compileWebpack(dev) {
  const webpackConfig = require('./webpack.config.js');
  return gulp.src(paths.jsEntry)
    .pipe(webpack(dev ? webpackConfig.dev : webpackConfig.prod, null, function (err, stats) {
      const main = Object.keys(stats.compilation.assets)[0];
      const file = JSON.stringify({ scripts: [ main ] });

      fs.writeFile('./webpack-stats.json', file, (err) => {
        if (err) {
          console.warn('couldn\'t write webpack stats file');
        }

        console.log('webpack stats file written');
      });
    }))
    .pipe(gulp.dest(paths.jsOut));
};


gulp.task('sass', function () {
  return compileSass(true);
});

gulp.task('app', function () {
  const child = new (forever.Monitor)('index.js', {
    env: { DEBUG: '*' }
  });

  child.on('exit', function () {
    console.log('index.js has exited');
  });

  child.start();
});

gulp.task('email-templates', shell.task([
  'node email/build'
]));

gulp.task('clientjs', function () {
  compileWebpack(true);
})

gulp.task('clientjs-prod', function () {
  compileWebpack(false);
});

gulp.task('server', ['app']);
gulp.task('dev', ['email-templates', 'clientjs', 'server', 'serve']);
gulp.task('default', ['dev']);
gulp.task('build', ['email-templates', 'clientjs-prod'], function () {
  return compileSass(false, true);
});
