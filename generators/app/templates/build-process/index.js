import fs from 'fs';
import path from 'path';
import gulp from 'gulp';
import webpack from 'webpack';
import gulpWebpack from 'webpack-stream';
import chalk from 'chalk';
import io from 'socket.io';
import del from 'del';
import zip from 'gulp-zip';
import { Subject, Observable } from 'rxjs';
import jeditor from 'gulp-json-editor';

const hotReloadSubject = new Subject();
const delayBetweenEventNotifications = 500;

const hotReloadObservable = hotReloadSubject.debounce(() => Observable.timer(delayBetweenEventNotifications));

hotReloadObservable.subscribe(send => {
    global.hotReloadNotificationSocket.emit('onFileChange');
    console.log(chalk.underline.bold.bgRed.yellow('Extension reload request has been sent'));
});

/**
 * 
 */
export class AppRegistry {
	constructor() {
  	this.apps = {};
    this.apps["core"] = this.createAppDefaultValue();
  }
  createAppDefaultValue() {
  	return {initialized: false};
  }
  appIsInitialized(name) {
  	return this.apps[name] && this.apps[name].initialized === true;
  }
  setAppInitialized(name) {
  	if (this.apps[name]) {
    	this.apps[name] = {initialized: true};
    }
  }
  allAppsInitialized() {
  	for (let k in this.apps) {
    	if (this.apps[k].initialized !== true) {
      	return false;
      }
    }
    return true;
  }
}

global.appRegistry = new AppRegistry();

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
    if (global.hotReloadNotificationSocket && global.appRegistry.allAppsInitialized()) {
        hotReloadSubject.next(true);
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
            global.appRegistry.setAppInitialized("core");
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
export function patchManifestJson(opts) {
    return function patchManifestJson() {
        return gulp.src(path.resolve(getEnvironmentDistDirectory(opts.env), 'manifest.json'))
            .pipe(jeditor({
                version: opts.packageVersion
            }))
            .pipe(gulp.dest(path.resolve(getEnvironmentDistDirectory(opts.env))), 'manifest.json');
    }
}

/**
 * 
 */
export function packageDist(opts) {
    return function packageDist() {
        return gulp.src(path.resolve(getEnvironmentDistDirectory(opts.env), '**/*'))
            .pipe(zip(`${opts.packageName}.${opts.packageVersion}.zip`))
            .pipe(gulp.dest(path.resolve(getEnvironmentPackageDirectory(opts.env))));
    };
}
