const gulp = require('gulp')
const less = require('gulp-less')
const pug = require('gulp-pug')
const notify = require('gulp-notify')
const plumber = require('gulp-plumber')
const concat = require('gulp-concat')
const autoprefixer = require('gulp-autoprefixer')
const cleanCSS = require('gulp-clean-css')
const del = require('del')
const webpack = require('webpack-stream')
const sourcemap = require('gulp-sourcemaps')
const gulpIf = require('gulp-if')
const browserSync = require('browser-sync').create()


let isDev = true
let isProd = !isDev
//Порядок подключения css файлов
const cssFiles = [
    './src/css/main.css' //    './src/css/media.css'
]
const conf = {
    src: './src',
    dest: './build'
}
const webpackConfig = {
    output: {
        filename: 'main.js'
    },
    module: {
        rules: [{
            test: /\.js$/,
            loader: 'babel-loader',
            exclude: '/node_modules/'
        }]
    },
    mode: isDev ? 'development' : 'production',
    devtool: isDev ? 'eval-source-map' : 'none'
}

function html() {
    return gulp.src(conf.src + '/**/*.html')
        .pipe(plumber({
            errorHandler: notify.onError(function (err) {
                return {
                    title: 'html',
                    message: err.message
                }
            })
        }))
        .pipe(gulp.dest(conf.dest))
        .pipe(browserSync.stream())
}

//Таск на стили CSS
function styles() {
    return gulp.src(cssFiles)
        //.pipe(concat('style.css'))
        // .pipe(autoprefixer({
        //     browsers: ['last 2 versions'],
        //     cascade: false
        // }))
        // .pipe(cleanCSS({
        //     level: 2
        // }))
        .pipe(plumber({
            errorHandler: notify.onError(function (err) {
                return {
                    title: 'styles',
                    message: err.message
                }
            })
        }))
        .pipe(gulp.dest(conf.dest + '/css'))
        .pipe(browserSync.stream())
}

function scripts() {
    return gulp.src('./src/js/main.js')
        .pipe(webpack(webpackConfig))
        .pipe(gulp.dest('./build/js'))
        .pipe(browserSync.stream())
}

function clean() {
    return del(['build/*'])
}

function watch() {
    browserSync.init({
        server: {
            baseDir: "./build/"
        }
    });
    gulp.watch('./src/css/**/*.css', styles)
    gulp.watch('./src/js/**/*.js', scripts)
    gulp.watch("./src/*.html").on('change', browserSync.reload);
}

gulp.task('styles', styles)
gulp.task('scripts', scripts)
gulp.task('del', clean)
gulp.task('watch', watch);
gulp.task('build', gulp.series(clean, gulp.parallel(styles, scripts, html)))
gulp.task('default', gulp.series('build', 'watch'))