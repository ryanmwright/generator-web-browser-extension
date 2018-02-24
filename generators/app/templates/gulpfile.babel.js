import gulp from 'gulp';
import yargs from 'yargs';
import { clean as coreClean, build as coreBuild, startHotReloadBuild, endHotReloadBuild, packageDist, cleanPackage, patchManifestJson } from './build-process/index';<% if (customBuildFile && customBuildFile.length > 0) { %>
import { clean as customClean, build as customBuild } from './build-process/<%= customBuildFile %>';<% } %>

let opts = {
    env: yargs.argv.env || 'development',
    packageName: yargs.argv.packageName || 'package',

    // This is a bit hacky, but the cross-var script sends the $npm_ variable name through as-is when its undefined, so we want to account for when that happens
    packageVersion: yargs.argv.buildVersion && yargs.argv.buildVersion.toLowerCase().indexOf('buildversion') == -1 ?
                        yargs.argv.buildVersion
                        : (
                            yargs.argv.defaultBuildVersion && yargs.argv.defaultBuildVersion.toLowerCase().indexOf('buildversion') == -1 ?
                                yargs.argv.defaultBuildVersion : '0.0.1'
                        )
};

const build = customBuild || coreBuild;
const clean = customClean || coreClean;

gulp.task('clean', clean(opts));
gulp.task('build', build(Object.assign({}, opts, {watch: false})));
gulp.task('build-package', gulp.series(build(Object.assign({}, opts, {watch: false, uglify: true})), cleanPackage(opts), patchManifestJson(opts), packageDist(opts)));
gulp.task('serve', gulp.series(startHotReloadBuild, build(Object.assign({}, opts, {watch: true}), endHotReloadBuild)));
