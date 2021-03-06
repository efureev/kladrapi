var gulp = require('gulp'),
	csso = require('gulp-csso'),
	uglify = require('gulp-uglify'),
	concat = require('gulp-concat'),
	rename = require('gulp-rename'),
	watch = require('gulp-watch');

gulp.task('default', function () {

	// Javascript
	gulp.src([
		'./kladr/js/core.js',
		'./kladr/js/kladr.js',
		'./kladr/js/kladr_zip.js'
	])
		.pipe(concat('jquery.kladr.js'))
		.pipe(uglify())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('./dist/'));

	// CSS
	gulp.src('./kladr/css/style.css')
		.pipe(csso())
		.pipe(rename('jquery.kladr.min.css'))
		.pipe(gulp.dest('./dist/'));
});




gulp.task('watch', function () {

	gulp.watch([
		'./kladr/js/core.js',
		'./kladr/js/kladr.js',
		'./kladr/js/kladr_zip.js',
		'./kladr/css/style.css'
	], ['default']);
});