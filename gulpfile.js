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
    .pipe(gulp.dest('tmp/css'))
});

gulp.task('js', () => {
    return gulp.src(['app/**/*.js', 'reviews.webmanifest'])
    .pipe(gulp.dest('tmp'))
});

gulp.task('sw', function () {
  var bundler = browserify('./app/sw.js'); // ['1.js', '2.js']

  return bundler
    .transform(babelify)    // required for ES6 'import' syntax
    .bundle()               // combine code
    .pipe(source('sw.js'))  // get text stream; set destination filename
    .pipe(buffer())         // required to use stream w/ other plugin
    .pipe(uglify())         // condense & minify
    .pipe(size())           // outputs file size to console
    .pipe(gulp.dest("tmp"));
});

gulp.task('data', () => {
    return gulp.src('app/data/restaurants.json')
    .pipe(gulp.dest('tmp/data'))
});

gulp.task('html', () => {
	return gulp.src('app/**/*.html')
	.pipe(gulp.dest('tmp'))
});

gulp.task('serve', ['clean', 'default'], () => {
  return gulp.src("tmp")
    .pipe(webserver({
      port: 3000,
      livereload: true
    }));
});

gulp.task('images', ['icons'], () => {
	return gulp.src(['app/img/*.jpg'])
	.pipe(imagemin())
	.pipe(gulp.dest('tmp/img'))
});

gulp.task('icons', () => {
  return gulp.src('app/img/icons/**')
    .pipe(gulp.dest('tmp/img/icons'))
});

gulp.task('manifest', () => {
  return gulp.src('app/manifest.json')
    .pipe(gulp.dest('tmp'));
});

gulp.task('clean', () => {
  del(['tmp/*', 'dist/*']);
});

gulp.task('default', ['js', 'sw', 'css', 'html', 'manifest', 'images']);
