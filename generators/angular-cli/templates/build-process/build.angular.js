import gulp from 'gulp';
import path from 'path';
import chalk from 'chalk';
import childProcess from 'child_process';
import { build as coreBuild, sendHotReloadChangeNotification, getEnvironmentDistDirectory, AppRegistry } from './index';

/**
 * Override the app registry to include the action and options pages. 
 * This we ensure we only send reload requests to the browser after all apps are initially loaded.
 */
export class AngularAppRegistry extends AppRegistry {
	constructor() {
  	super();
    this.apps["action"] = this.createAppDefaultValue();
    this.apps["options"] = this.createAppDefaultValue();
  }
}

global.appRegistry = new AngularAppRegistry();

/**
 * 
 */
function _getBuildDirectory() {
    return path.resolve(__dirname);
}

/**
 * 
 */
function _build(opts) {
    let fn = function() {
        return new Promise((resolve, reject) => {
            const cmd = /^win/.test(process.platform) ? 'npm.cmd' : 'npm';
            const env = opts.env.toLowerCase();
            
            const args = [
                'run',
                'ng',
                'build',
                '--'
            ];
    
            if (opts.watch) {
                args.push('--watch');
            } else {
                if (env == 'prod' || env == 'production' || env == 'release') {
                    args.push('--prod');
                } else {
                    args.push('--aot');
                }
            }
    
            args.push('--app=' + opts.app);
            args.push('--deploy-url=' + opts.app + '/');
            args.push('--output-path=' + path.join(getEnvironmentDistDirectory(opts.env), opts.app));
    
            const handle = childProcess.spawn(cmd, args);
            handle.stdout.pipe(process.stdout);
            handle.stderr.pipe(process.stderr);
    
            if (opts.watch) {
                handle.stdout.on('data', data => {
                    let dataStr = data.toString();
                    if (dataStr.indexOf("Hash: ") > -1) {
                        global.appRegistry.setAppInitialized(opts.app.toLowerCase());
                        console.log(chalk.underline.bold.bgRed.yellow('The angular app "' + opts.app + '" has been reloaded'));
                        sendHotReloadChangeNotification();
                    }
                });
            }

            handle.on('close', (code, signal) => {
                resolve();
            });

            handle.on('error', (err) => {
                reject(err);
            });
        });
    }
    fn.displayName = 'Angular Build for app "' + opts.app + '"';
    return fn;
}

export function build(opts) {
    return gulp.parallel(
        coreBuild(opts), 
        _build(Object.assign({}, opts, {app: 'action'})), 
        _build(Object.assign({}, opts, {app: 'options'}))
    );
}
