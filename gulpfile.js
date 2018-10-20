const gulp = require('gulp');
const minify = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const autoprifixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const size = require('gulp-size');

gulp.task('css', () => {
    return gulp.src('app/css/**/*.css')
    .pipe(sourcemaps.init())
    .pipe(autoprifixer({
        browsers: ['last 2 versions'],
        cascade: false
    }))
    .pipe(minify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/css'))
});

gulp.task('js', () => {
    gulp.src(['app/**/*.js', 'app/sw.js'])
    .pipe(sourcemaps.init())
    .pipe(babel({
        presets: ['@babel/env']
    }))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist'))
});

gulp.task('html', () => {
	return gulp.src('app/**/*.html')
	.pipe(gulp.dest('dist'))
});

gulp.task('images', () => {
	return gulp.src(['app/img/*.jpg'])
	.pipe(imagemin())
	.pipe(gulp.dest('dist/img'))
});

gulp.task('manifest', () => {
	return gulp.src(['app/manifest/*'])
	.pipe(gulp.dest('dist/manifest'))
});

gulp.task('sw', function () {
  var bundler = browserify('./app/sw.js');

  return bundler
    .transform(babelify)
    .bundle()
    .pipe(source('sw.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(size())
    .pipe(gulp.dest("dist"));
});

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

gulp.task('default', ['js', 'css', 'html', 'manifest', 'images', 'watch']);
