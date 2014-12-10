// save in root directory as gulpfile.js
var gulp = require('gulp');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

gulp.task('default', function(){
	
});

gulp.task('serve', function(){
	browserSync({
		server: {
			baseDir: ['./','app']
		}
	});

	gulp.watch(['**/*.html', '**/*.css', '**/*.js'], {cwd: 'app'}, reload);
});