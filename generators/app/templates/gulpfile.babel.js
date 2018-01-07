import gulp from 'gulp';
import yargs from 'yargs';
import { clean as coreClean, build as coreBuild, startHotReloadBuild, endHotReloadBuild, packageDist, cleanPackage } from './build-process/index';<% if (customBuildFile && customBuildFile.length > 0) { %>
import { clean as customClean, build as customBuild } from './build-process/<%= customBuildFile %>';<% } %>

let opts = {
    env: yargs.argv.env || 'development',
    packageName: yargs.argv.packageName || 'package'
};

const build = customBuild || coreBuild;
const clean = customClean || coreClean;

gulp.task('clean', clean(opts));
gulp.task('build', build(Object.assign({}, opts, {watch: false})));
gulp.task('build-package', gulp.series(build(Object.assign({}, opts, {watch: false})), cleanPackage(opts), packageDist(opts)));
gulp.task('serve', gulp.series(startHotReloadBuild, build(Object.assign({}, opts, {watch: true}), endHotReloadBuild)));
