const gulp = require('gulp');
const nodemon = require('gulp-nodemon');


gulp.task('default', function () {
  nodemon({
    script: 'src/index.js',
    ext: 'js',
    env: { 'NODE_ENV': 'development' }
  })
});
