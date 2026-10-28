/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-afac4cd2'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "1872c500de691dce40960bb85481de07"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "16968e49c8a6d47bc4c0aa0399ef512a"
  }, {
    "url": "pwa-512x512.png",
    "revision": "127392c881ed9064aeb21b43931990c3"
  }, {
    "url": "pwa-192x192.png",
    "revision": "9d59da33ca652dd38e1839320a1cc3eb"
  }, {
    "url": "index.html",
    "revision": "0760bed83d97a62b96a45ab3e73ee2a6"
  }, {
    "url": "icon.svg",
    "revision": "c405a8dffaa73373802c558a70cf9f0f"
  }, {
    "url": "favicon.ico",
    "revision": "a6c7ebc9e2defb0a3a91a13b72fde46e"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "0f47e94b32c594352274a44ab64f8b7a"
  }, {
    "url": "assets/index-DqOqQuBl.js",
    "revision": null
  }, {
    "url": "assets/index-CkHDj6dw.css",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "0f47e94b32c594352274a44ab64f8b7a"
  }, {
    "url": "favicon.ico",
    "revision": "a6c7ebc9e2defb0a3a91a13b72fde46e"
  }, {
    "url": "icon.svg",
    "revision": "c405a8dffaa73373802c558a70cf9f0f"
  }, {
    "url": "pwa-192x192.png",
    "revision": "9d59da33ca652dd38e1839320a1cc3eb"
  }, {
    "url": "pwa-512x512.png",
    "revision": "127392c881ed9064aeb21b43931990c3"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "16968e49c8a6d47bc4c0aa0399ef512a"
  }, {
    "url": "manifest.webmanifest",
    "revision": "5d0fb4c2319577f74faedce360946811"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/fonts\.gstatic\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "gstatic-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');

}));
