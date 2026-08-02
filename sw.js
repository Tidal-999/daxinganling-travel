var CACHE = 'csl-travel-v5';
var FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = e.request.url;
  // 跨域请求（如云端 jsonblob）：一律走网络、绝不缓存，确保拿到的永远是最新共享数据
  if (url.indexOf(self.location.origin) !== 0) {
    e.respondWith(fetch(e.request));
    return;
  }
  // 网页本体与共享数据文件：网络优先，联网时拿最新版；断网时用缓存兜底
  if (e.request.mode === 'navigate' || url.indexOf('data.json') > -1) {
    e.respondWith(fetch(e.request).then(function (res) {
      var cp = res.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, cp); });
      return res;
    }).catch(function () { return caches.match(e.request); }));
    return;
  }
  // 静态资源：缓存优先，加快加载
  e.respondWith(caches.match(e.request).then(function (hit) {
    return hit || fetch(e.request).then(function (res) {
      var cp = res.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, cp); });
      return res;
    });
  }));
});