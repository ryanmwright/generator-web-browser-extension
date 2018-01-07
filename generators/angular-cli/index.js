const Generator = require('yeoman-generator');
const MergeJson = require('merge-json');

module.exports = class extends Generator {

    writing() {
        this.fs.copy(
            [this.templatePath('**/*'), '!**/package.json'],
            this.destinationRoot()
        );

        this.fs.copy(
            this.templatePath('**/.*'),
            this.destinationRoot()
        );

        let existingPackageFile = this.fs.readJSON(this.destinationPath('package.json'));
        let packageFile = this.fs.readJSON(this.templatePath('package.json'));
        let merged = MergeJson.merge(existingPackageFile, packageFile);
        this.fs.write(this.destinationPath('package.json'), JSON.stringify(merged, null, 2));
    }

};