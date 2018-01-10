# generator-web-browser-extension

This project scaffolds a browser extension that's compatible with browsers that utilize the WebExtensions API (i.e. Chrome/Firefox/Edge). It contains:

- The base project
- Webpack with hot reload that reloads the extension in the browser automatically
- A build pipeline to build and package your app

Right now, only a base extension with Angular for the browser action and options page is supported.

# Getting started

Run:

```
yo generator-web-browser-extension
```

this will scaffold your project and run an NPM install.

Then cd into your application's folder and run:

```
npm run serve
```

This will create a 'development' folder under 'build-process/dist'.

In Chrome go to chrome://extensions/ and drag the 'development' folder onto the extensions list.

That's it! You can now start writing code. Changes you make will trigger the browser to reload the extension automatically.

# Angular

Angular and the Angular CLI is used for the action and options page under the (actions and options folders in src/). Each one is a separate application under the .angular-cli.json config file. Version 1.6+ of the Angular CLI is a prerequisite that must be installed. The building of them is automated in Gulp.

To add a new component for your browser action run:

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

This will create a 'package' folder under 'build-process/dist/production'. That folder contains a zip folder with your packaged app, and patched manifest.json that can be uploaded to the store. If you leave off the buildVersion argument, the version in your package.json file is used.