# generator-web-browser-extension

This is a Yeoman generator that scaffolds (typescript) code for a browser extension compatible with browsers that utilize the WebExtensions API (i.e. Chrome/Firefox/Edge). 

# Getting started

cd into your application's folder and run:

```
npm run serve
```

This will create a 'development' folder under 'build-process/dist'.

In Chrome go to chrome://extensions/ and drag the 'development' folder onto the extensions list.

That's it! You can now start writing code. Changes you make will trigger the browser to reload the extension automatically.

# Build Pipeline

To package your application for production run:

```
npm run package:prod --buildVersion=1.0.0
```

This will create a 'package' folder under 'build-process/dist/production'. That folder contains a zip folder with your packaged app, and patched manifest.json with 1.0.0 as the version that can be uploaded to the store. If you leave off the buildVersion argument, the version in your package.json file is used.