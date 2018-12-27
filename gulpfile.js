const gulp = require('gulp');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const imagemin = require('gulp-imagemin');
const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const size = require('gulp-size');
const webserver = require('gulp-webserver');
const del = require('del');

gulp.task('css', () => {
    return gulp.src('app/css/**/*.css')
    .pipe(gulp.dest('dist/css'))
});

gulp.task('js', () => {
    return gulp.src(['app/**/*.js', 'reviews.webmanifest'])
    .pipe(gulp.dest('dist'))
});

gulp.task('sw', () => {
  var bundler = browserify(['./app/sw.js', './app/js/idbhelper.js'],
    { debug: false });

  return bundler
    .transform(babelify, {sourceMaps: false})
    .bundle()
    .pipe(source('sw.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(size())
    .pipe(gulp.dest("dist"));
});

gulp.task('dbhelper', function () {
  var bundler = browserify([
    './app/js/idbhelper.js',
    './app/js/dbhelper.js'
  ], { debug: false });

  return bundler
    .transform(babelify, {sourceMaps: false})
    .bundle()
    .pipe(source('dbhelper.min.js'))
    .pipe(buffer())
    .pipe(gulp.dest('dist/js'));
});

gulp.task('data', () => {
    return gulp.src('app/data/restaurants.json')
    .pipe(gulp.dest('dist/data'))
});

gulp.task('html', () => {
	return gulp.src('app/**/*.html')
	.pipe(gulp.dest('dist'))
});

gulp.task('serve', ['clean', 'default'], () => {
  return gulp.src("dist")
    .pipe(webserver({
      port: 8000,
      livereload: true
    }));
});

gulp.task('images', ['icons'], () => {
	return gulp.src(['app/img/*.jpg'])
	.pipe(imagemin())
	.pipe(gulp.dest('dist/img'))
});

gulp.task('icons', () => {
  return gulp.src('app/img/icons/**')
    .pipe(gulp.dest('dist/img/icons'))
});

gulp.task('manifest', () => {
  return gulp.src('app/manifest.json')
    .pipe(gulp.dest('dist'));
});

gulp.task('clean', () => {
  del(['tmp/*', 'dist/*']);
});

gulp.task('default', ['js', 'sw', 'dbhelper', 'css', 'html', 'manifest', 'images']);
