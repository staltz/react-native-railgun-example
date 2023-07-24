# React Native Railgun example

This repo contains an example (or template) of a React Native app that uses the
Railgun Wallet SDK.  This was derived from a simple `npx react-native init`
project, with the simple addition of the Wallet SDK.

You can either fork this repo, or follow the steps we used (see below).


## Installing Railgun Wallet

In a React Native project, first add these dev dependencies:

```
npm install --save-dev @babel/plugin-proposal-private-methods @babel/plugin-transform-flow-strip-types
```

And modify your `babel.config.js` like this:

```diff
 module.exports = {
   presets: ['module:metro-react-native-babel-preset'],
+  plugins: [
+    ['@babel/plugin-transform-flow-strip-types', {loose: true}],
+    ['@babel/plugin-proposal-private-methods', {loose: true}],
+    ['@babel/plugin-transform-private-methods', {loose: true}],
+    ['@babel/plugin-transform-class-properties', {loose: true}],
+    ['@babel/plugin-transform-private-property-in-object', {loose: true}],
+  ],
 };
```

Then add a dependency to shim `getRandomValues` (important for generating cryptographic keys):

```
npm install --save react-native-get-random-values
```

And *then* add the Wallet SDK:

```
npm install --save @railgun-community/wallet
```

If you want to support iOS, then make sure to run (on a macOS computer):

```
npx pod-install
```

Finally, at the top of your entry file (typically `App.tsx`), import the following:

```js
import '@railgun-community/wallet/react-native-shims';
```
