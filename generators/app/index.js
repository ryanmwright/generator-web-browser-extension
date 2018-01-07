var Generator = require('yeoman-generator');

module.exports = class extends Generator {

    prompting() {
        return this.prompt([{
            type     : 'input',
            name     : 'extension_name',
            message  : 'What is the name of your extension?'
        }, {
            type     : 'input',
            name     : 'extension_short_name',
            message  : 'What is the (short) name of your extension?'
        }, {
            type     : 'input',
            name     : 'extension_description',
            message  : 'What is the description of your extension?'
        }, {
            type     : 'input',
            name     : 'extension_license',
            message  : 'What is the license of your extension?'
        }, {
            type     : 'input',
            name     : 'extension_homepage_url',
            message  : 'What is the homepage URL of your extension?'
        }]).then(answers => {
            this.answers = answers;

            // Add angular
            this.composeWith(require.resolve('../angular-cli'), this.answers);
            this.answers.customBuildFile = 'build.angular';
        });
    }

    writing() {

        let templateData = Object.assign({
            // Add any other static data here
        }, this.answers);

        this.fs.copyTpl(
            this.templatePath('**/*.ts'),
            this.destinationRoot(),
            templateData
        );

        this.fs.copyTpl(
            this.templatePath('**/*.js'),
            this.destinationRoot(),
            templateData
        );

        this.fs.copyTpl(
            this.templatePath('**/*.html'),
            this.destinationRoot(),
            templateData
        );

        this.fs.copyTpl(
            this.templatePath('**/*.json'),
            this.destinationRoot(),
            templateData
        );

        this.fs.copy(
            this.templatePath('**/*.png'),
            this.destinationRoot()
        );

        this.fs.copy(
            this.templatePath('**/.*'),
            this.destinationRoot()
        );

    }

    install() {
        this.installDependencies({
            npm: true,
            bower: false,
            yarn: false
        });
    }
};