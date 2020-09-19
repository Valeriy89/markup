const {src, dest, series, watch} = require('gulp')
const sass = require('gulp-sass')
const csso = require('gulp-csso')
const include = require('gulp-file-include')
const htmlmin = require('gulp-htmlmin')
const image = require('gulp-image')
const svgSprite = require('gulp-svg-sprite')
const svgmin = require('gulp-svgmin')
const cheerio = require('gulp-cheerio')
const replace = require('gulp-replace')
const del = require('del')
const concat = require('gulp-concat')
const rename = require('gulp-rename')
const uglify = require('gulp-uglify')
const sourcemaps = require('gulp-sourcemaps')
const autoprefixer = require('gulp-autoprefixer')
const sync = require('browser-sync').create()

function html() {
  return src('src/**.html')
    //.pipe(include({
    //  prefix: '@@'
    //}))
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(dest('dist'))
}

function compression() {
  return src('src/images/*')
    .pipe(image())
    .pipe(dest('./dist/images'))
}

function svg_sprite() {
  return src('src/images/icon/*.svg')
    .pipe(svgmin({
      js2svg: {
        pretty: true
      }
    }))
    .pipe(cheerio({
      run: function ($) {
        $('[fill]').removeAttr('fill');
        $('[stroke]').removeAttr('stroke');
        $('[style]').removeAttr('style');
      },
      parserOptions: {xmlMode: true}
    }))
    .pipe(replace('&gt;', '>'))  
    .pipe(svgSprite({
              mode: {
                  stack: {
                      sprite: "../sprite.svg"
                  }
              }
          }
      ))
    .pipe(dest('dist/images/'))
}

function js() {
  return src('src/js/**.js')
  .pipe(sourcemaps.init())
  //.pipe(uglify())
  .pipe(sourcemaps.write('../js'))
  .pipe(dest('dist/js'))
}

function scss() {
  return src('src/scss/**.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'extend'}).on('error', sass.logError))
    .pipe(autoprefixer({
      overrideBrowserslist:  ['last 5 versions'],
      cascade: false
    }))
    //.pipe(csso())
    .pipe(sourcemaps.write('../css'))
    .pipe(dest('dist/css'))
}

function fonts() {
  return src('src/fonts/**')
    .pipe(dest('dist/fonts'))
}

function normalize() {
  return src('node_modules/normalize.css/normalize.css')
    .pipe(rename('_normalize.scss'))
    .pipe(dest('src/scss/vendors'))
}

function media() {
  return src('node_modules/include-media/dist/_include-media.scss')
    .pipe(dest('src/scss/vendors'))
}

function jquery(){
  return src('node_modules/jquery/dist/jquery.min.js')
    .pipe(dest('src/js'))
}

function flexgrid() {
  return src('node_modules/flexboxgrid/dist/flexboxgrid.css')
    .pipe(rename('flexboxgrid.scss'))
    .pipe(dest('src/scss'))
}

function clear() {
  return del('dist')
}

function serve() {
  sync.init({
    server: './dist'
  })

  watch('src/**.html', series(html)).on('change', sync.reload)
  watch('src/scss/**.scss', series(scss)).on('change', sync.reload)
  watch('src/js/**.js', series(js)).on('change', sync.reload)
  watch('src/images/*', series(compression))
  watch('src/images/icon/*.svg', series(svg_sprite))
}

exports.transfer = series(normalize, media, jquery, flexgrid)
exports.build = series(clear, scss, html, js, compression, svg_sprite, fonts)
exports.serve = series(normalize, media, jquery, flexgrid, clear, scss, html, js, compression, svg_sprite, fonts, serve)
exports.clear = clear