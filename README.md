# generator-web-browser-extension

This is a Yeoman generator that scaffolds (typescript) code for a browser extension compatible with browsers that utilize the WebExtensions API (i.e. Chrome/Firefox/Edge). It contains:

- The base project (manifest.json, background, and content script)
- Webpack with hot reload that reloads the extension in the browser automatically
- A build pipeline to build and package your app

Right now, only the base extension with Angular apps for the browser action/page and options pages is supported. By default the action is set to be a browser action in manifest.json, but can be changed to be a page action by modifying that file.

# Getting started

Run:

```
yo generator-web-browser-extension
```

this will scaffold your project and run an NPM install automatically.

Then cd into your application's folder and run:

```
npm run serve
```

This will create a 'development' folder under 'build-process/dist'.

In Chrome go to chrome://extensions/ and drag the 'development' folder onto the extensions list.

That's it! You can now start writing code. Changes you make will trigger the browser to reload the extension automatically.

# Angular

Angular and the Angular CLI is used for the action and options page under the (actions and options folders in src/). Each one is a separate application under the .angular-cli.json config file. Version 1.6+ of the Angular CLI is a prerequisite that must be installed. The orchestration of the build for the apps is automated in Gulp.

To add a new component for your browser/page action run:

```
ng g c mycomponent --app=action
```

To add a new component for your options page run:

```
ng g c mycomponent --app=options
```

# Build Pipeline

To package your application for production run:

```
npm run package:prod --buildVersion=1.0.0
```

This will create a 'package' folder under 'build-process/dist/production'. That folder contains a zip folder with your packaged app, and patched manifest.json with 1.0.0 as the version that can be uploaded to the store. If you leave off the buildVersion argument, the version in your package.json file is used.