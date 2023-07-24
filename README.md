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

## Using Wallet SDK

Now you can finally use the Wallet APIs, like the [Getting Started guide](https://docs.railgun.org/developer-guide/wallet/getting-started) shows.
However, some steps of that guide need special treatment for React Native.

**Start the RAILGUN Privacy Engine:** in this step, you cannot use `level-js` in React Native, so you need to use a different storage engine, such as `memdown`, like this:

```
npm install --save memdown
```

```diff
 import '@railgun-community/wallet/react-native-shims';
 import { startRailgunEngine } from '@railgun-community/wallet';
+import memdown from 'memdown';

 // ...

 startRailgunEngine(
   'RNRailgunExample',
+  memdown(),
   shouldDebug,
   artifactStore,
   useNativeArtifacts,
   skipMerkletreeScans,
 );
```

**Build a persistent store for artifact downloads:** in this step, you can use `react-native-fs` to implement the
ArtifactStore, by first installing it:

```
npm install --save react-native-fs
```

And then, in your code, import it to create your ArtifactStore with the functions `getFile`, `storeFile`, and `fileExists`:

```diff
 import '@railgun-community/wallet/react-native-shims';
+import fs from 'react-native-fs';
-import { startRailgunEngine } from '@railgun-community/wallet';
+import { startRailgunEngine, ArtifactStore } from '@railgun-community/wallet';
 import memdown from 'memdown';

 // ...

+const getFile = async (path: string) =>
+  fs.readFile(`${fs.DocumentDirectoryPath}/${path}`);

+const storeFile = async (
+  dir: string,
+  path: string,
+  item: string | Uint8Array,
+) => {
+  await fs.mkdir(`${fs.DocumentDirectoryPath}/${dir}`);
+  await fs.writeFile(
+    `${fs.DocumentDirectoryPath}/${path}`,
+    item as string,
+  );
+};

+const fileExists = async (path: string): Promise<boolean> =>
+  await fs.exists(`${fs.DocumentDirectoryPath}/${path}`);

+const artifactStore = new ArtifactStore(getFile, storeFile, fileExists);

 startRailgunEngine(
   'RNRailgunExample',
   memdown(),
   shouldDebug,
   artifactStore,
   useNativeArtifacts,
   skipMerkletreeScans,
 );
```


## Caveats

There are a lot of computational (cryptographic) and disk I/O workloads in the Wallet internals, and React Native is not well suited for that.

**Scanning balances is extremely slow.** It may take up to 15 minutes to cryptographically process all the transactions in a wallet, and all of this is running on the JS UI thread, so it will block your UI.  An improvement is to use [react-native-threads](https://github.com/joltup/react-native-threads) to offload these tasks and allow the UI to remain responsive.  Even better is to use [nodejs-mobile-react-native](https://github.com/nodejs-mobile/nodejs-mobile-react-native), speeding up balance scans by 10x or more.  The Wallet SDK already supports nodejs-mobile-react-native, but the setup is more sophisticated.

**The data is not persistent.** We are using `memdown` as a levelDB alternative, which means there is no persistence.  There may be a way to replace that with [react-native-leveldb](https://github.com/greentriangle/react-native-leveldb).

**Creating proofs (when shielding or transfering) is not yet supported.**  On the web, there is the [snarkjs](https://github.com/iden3/snarkjs) library to use as the Groth16 prover, but it uses WASM which is not supported in React Native.  For React Native, we need to setup support for the [native-prover](https://github.com/Railgun-Community/native-prover), and this is not yet done.
