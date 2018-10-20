const gulp = require('gulp');
// const minify = require('gulp-clean-css');
// const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
// const autoprifixer = require('gulp-autoprefixer');
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

gulp.task('serve', ['clean', 'default'], function () {
  return gulp.src("tmp")
    .pipe(webserver({
      port: 3000,
      livereload: true
    }));
});

gulp.task('images', () => {
	return gulp.src(['app/img/*.jpg'])
	.pipe(imagemin())
	.pipe(gulp.dest('tmp/img'))
});

gulp.task('manifest', () => {
	return gulp.src(['app/manifest/*'])
	.pipe(gulp.dest('tmp/manifest'))
});

gulp.task('clean', function () {
  del(['tmp/*', 'dist/*']); // del files rather than dirs to avoid error
});

// gulp.task('sw', function () {
//   var bundler = browserify('./app/sw.js');
//
//   return bundler
//     .transform(babelify)
//     .bundle()
//     .pipe(source('sw.js'))
//     .pipe(buffer())
//     .pipe(uglify())
//     .pipe(size())
//     .pipe(gulp.dest("dist"));
// });

// gulp.task('serve', function () {
//   runSequence(['clean'], ['images', 'html', 'sw'], function() {
//     browserSync.init({
//       server: '.tmp',
//       port: 8001
//     });
//
//     gulp.watch(['app/*.html'], ['html', reload]);
//     gulp.watch(['app/css/*.css'], ['html', reload]);
//     gulp.watch(['app/js/*.js'], ['lint', 'html', reload]);
//     gulp.watch(['app/sw.js'], ['lint', 'sw', reload]);
//   });
// });

gulp.task('watch', () => {
    gulp.watch(['app/*.html', 'app/**/*.js', 'app/sw.js', 'app/css/*.css', 'app/reviews.webmanifest'], ['default'])
});

// gulp.task('default', ['js', 'css', 'html', 'manifest', 'images', 'watch']);
gulp.task('default', ['js', 'sw', 'css', 'html', 'manifest', 'images']);
