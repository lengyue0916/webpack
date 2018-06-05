const templates = 'templates'
const Create = 'Create'
const Exhibition = 'Exhibition'
const Services = 'services'
const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const del = require('del')
const path = require('path')
const combiner = require('stream-combiner2');
const minimist = require('minimist');
const runSequence = require('run-sequence')
var knownOptions = {
    string: 'env',
    default: { env: process.env.NODE_ENV || 'production' }
};
var options = minimist(process.argv.slice(2), knownOptions);
gulp.task('clean', function() {
    return del('./dist/**').then(paths => {
        $.util.log(colors.yellow('文件清除完毕！'))
    });
});
gulp.task('default', ['build']);

const colors = $.util.colors;
var handleError = function(err) {
    // console.log(err)
    console.log('-----------------------')
    var title = colors.red('哎呦，出错了!\n');
    var name = '文件名: ' + colors.red(err.fileName || err.file) + '\n';
    var lineNumber = '行数: ' + colors.red(err.loc && err.loc.line || err.line) + '\n';
    var columnNumber = '列数: ' + colors.red(err.loc && err.loc.column || err.column) + '\n';
    var msg = '错误信息: ' + err.message + '\n';
    var msg = '详情: ' + err.codeFrame + '\n';
    var plugin = '插件名: ' + colors.yellow(err.plugin);
    $.util.log(title + name + lineNumber + columnNumber + msg + plugin)
    console.log('-----------------------\n')
}



gulp.task('watch', () => {
    gulp.watch('src/**/*', function(event) {
        var paths = $.watchPath(event, 'src/', 'dist/');
        // 文件类型
        //  console.log(paths)
        // console.log(file_type)
        var eventType;
        switch (event.type) {
            case 'changed':
                eventType = '修改';
                break;
            case 'added':
                eventType = '新增';
                break;
            case 'deleted':
                eventType = '删除';
                break;
            default:
                eventType = event.type;
                break;
        }
        var file_type = paths.srcFilename.substr(paths.srcFilename.lastIndexOf('.') + 1);
        var combined;
        //判断事件类型
        if (event.type == 'added' || event.type == 'changed') { //新增或者修改
            // 判断文件或者文件夹
            if (paths.srcPath.charAt(paths.srcPath.length - 1) == '/') { //文件夹

                $.util.log(colors.green(eventType + '文件夹') + paths.srcPath);
                gulp.src(paths.srcPath)
                    .pipe(gulp.dest(paths.distPath));

            } else { //文件

                if (file_type == 'js' || file_type == 'wxs') {
                    $.util.log(colors.green(eventType) + ' ' + paths.srcPath);
                    if (paths.srcFilename == 'app.js') {
                        combined = combiner.obj([
                            gulp.src(['config.js', paths.srcPath]),
                            $.concat('app.js'),
                            $.babel(),
                            gulp.dest(paths.distDir)
                        ]);
                    } else {
                        combined = combiner.obj([
                            gulp.src(paths.srcPath),
                            $.babel(),
                            $.if(file_type == 'wxs', $.rename((path) => path.extname = '.wxs')),
                            gulp.dest(paths.distDir)
                        ]);
                    }


                } else if (file_type == 'scss' || file_type == 'css') {

                    $.util.log(colors.green(eventType) + ' ' + paths.srcPath);
                    combined = combiner.obj([
                        gulp.src(paths.srcPath),
                        $.sass(),
                        $.autoprefixer([
                            'iOS >= 8',
                            'Android >= 4.1'
                        ]),
                        $.rename((path) => path.extname = '.wxss'),
                        gulp.dest(paths.distDir)
                    ])

                } else if (file_type == 'wxml') {

                    $.util.log(colors.green(eventType) + ' ' + paths.srcPath);
                    combined = combiner.obj([
                        gulp.src(paths.srcPath),

                        gulp.dest(paths.distDir),
                    ])

                } else if (file_type == 'json') {


                    $.util.log(colors.green(eventType) + ' ' + paths.srcPath);
                    combined = combiner.obj([
                        gulp.src(paths.srcPath),
                        gulp.dest(paths.distDir)
                    ])
                }
                combined.on('error', handleError);
            }
        } else { //删除
            $.util.log(colors.green(eventType) + ' ' + paths.srcPath);
            del(paths.distPath);
        }
    });
});

gulp.task('scripts', () => {
    var combined = combiner.obj([
        gulp.src(['src/**/*.js', '!src/app.js']),
        $.babel(),
        $.if(options.env === 'production', $.uglify()),
        gulp.dest('./dist')
    ]);
    //监听错误
    combined.on('error', handleError);
    return combined;
})
gulp.task('mergeConfig', () => {
    var combined = combiner.obj([
        gulp.src(['config.js', 'src/app.js']),
        $.concat('app.js'),
        $.babel(),
        $.if(options.env === 'production', $.uglify()),
        gulp.dest('./dist')
    ]);
    //监听错误
    combined.on('error', handleError);
    return combined;
})
// gulp.task('wxs', () => {
//     var combined = combiner.obj([
//         gulp.src('src/**/*.wxs'),
//         $.babel(),
//         $.if(options.env === 'production', $.uglify()),
//         $.rename((path) => path.extname = '.wxs')
//         gulp.dest('./dist')
//     ]);

//     //监听错误
//     combined.on('error', handleError);
//     return combined;
// })


gulp.task('wxml', () => {
    var combined = combiner.obj([
        gulp.src('src/**/*.wxml'),
        $.if(options.env === 'production', $.htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            keepClosingSlash: true
        })),
        gulp.dest('./dist')
    ]);

    //监听错误
    combined.on('error', handleError);
    return combined;

});


gulp.task('wxss', () => {
    var combined = combiner.obj([
        gulp.src('src/**/*.{scss,css}'),
        $.sass(),
        $.autoprefixer([
            'iOS >= 8',
            'Android >= 4.1'
        ]),
        $.if(options.env === 'production', $.cleanCss()),
        $.rename((path) => path.extname = '.wxss'),
        gulp.dest('./dist')
    ]);
    //监听错误
    combined.on('error', handleError);
    return combined;
});


//json压缩
gulp.task('json', () => {
    var combined = combiner.obj([
        gulp.src('src/**/*.json'),
        $.if(options.env === 'production', $.jsonminify2()),
        gulp.dest('./dist')
    ]);
    //监听错误
    combined.on('error', handleError);
    return combined;
})
// 图片文件转移
gulp.task('other', () => {
    var combined = combiner.obj([
        gulp.src('src/**/*.{png,jpeg,jpg,gif}'),
        gulp.dest('./dist')
    ]);
    //监听错误
    combined.on('error', handleError);
    return combined;
});


gulp.task('dev:clean', function(cp)  {
    runSequence('clean',['scripts', 'mergeConfig', 'wxml', 'wxss', 'json', 'other'], 'watch',cp)
});
gulp.task('dev', function(cp)  {
    runSequence(['scripts', 'mergeConfig', 'wxml', 'wxss', 'json', 'other'], 'watch',cp)

});
gulp.task('build', function (cp)  {
    runSequence('clean',['scripts', 'mergeConfig', 'wxml', 'wxss', 'json', 'other'],cp)
});