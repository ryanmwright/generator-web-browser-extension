import fs from 'fs';
import path from 'path';
import gulp from 'gulp';
import webpack from 'webpack';
import gulpWebpack from 'webpack-stream';
import chalk from 'chalk';
import io from 'socket.io';
import del from 'del';
import zip from 'gulp-zip';

/**
 * 
 */
export function getBuildDirectory() {
    return path.resolve(__dirname);
}

/**
 * 
 */
export function getDistDirectory() {
    return path.resolve(__dirname, 'dist');
}

/**
 * 
 */
export function getEnvironmentDistDirectory(env) {
    return path.resolve(__dirname, 'dist', env);
}

/**
 * 
 */
export function getEnvironmentPackageDirectory(env) {
    return path.resolve(__dirname, 'dist', env, 'package');
}

/**
 * 
 */
export function startHotReloadBuild() {
    if (!global.hotReloadNotificationSocket) {
        global.hotReloadNotificationSocket = io.listen('8090');
        console.log(chalk.underline.bold.bgRed.yellow('Started hot reload websocket'));
    }
    return Promise.resolve({});
}

/**
 * 
 */
export function sendHotReloadChangeNotification(done) {
    if (global.hotReloadNotificationSocket) {
        global.hotReloadNotificationSocket.emit('onFileChange');
    }
    return Promise.resolve({});
}

/**
 * 
 */
export function endHotReloadBuild() {
    if (global.hotReloadNotificationSocket) {
        global.hotReloadNotificationSocket.server.close();
        global.hotReloadNotificationSocket = null;
        console.log(chalk.underline.bold.bgRed.yellow('Stopped hot reload websocket'));
    }
    return Promise.resolve({});
}

/**
 * 
 */
export function clean() {
    return function clean() {
        return del(getDistDirectory());
    };
}

/**
 * 
 */
export function build(opts) {
    let fn = function () {

        let configFileName = !opts.env || !fs.existsSync('./webpack.extension.config.' + opts.env.toLowerCase() + '.js')
            ? './webpack.extension.config.js' : './webpack.extension.config.' + opts.env.toLowerCase() + '.js';

        let config = require(configFileName)(opts.env, opts.watch);
        
        let changeHandler = (err, stats) => {
            console.log(chalk.underline.bold.bgRed.yellow('Core source has been reloaded'));
            sendHotReloadChangeNotification();
        };

        return gulp.src('../src/content/main.ts', {allowEmpty: true})
            .pipe(gulpWebpack(config, webpack, opts.watch ? changeHandler : undefined))
            .pipe(gulp.dest(getEnvironmentDistDirectory(opts.env)));
    };

    fn.displayName = "Core Build";
    return fn;
}

/**
 * 
 */
export function cleanPackage(opts) {
    return function clean() {
        return del(getEnvironmentPackageDirectory(opts.env));
    };
}

/**
 * 
 */
export function packageDist(opts) {
    return function packageDist() {
        return gulp.src(path.resolve(getEnvironmentDistDirectory(opts.env), '**/*'))
            .pipe(zip(`${opts.packageName}.zip`))
            .pipe(gulp.dest(path.resolve(getEnvironmentPackageDirectory(opts.env))));
    };
}
