const CACHE_NAME = 'inv-app-v1';
const ASSETS_TO_CACHE = [
  '.',
  '.index.html',
  '.manifest.json',
  'httpscdn.tailwindcss.com',
  'httpscdn.sheetjs.comxlsx-latestpackagedistxlsx.full.min.js',
  'httpscdnjs.cloudflare.comajaxlibsfont-awesome6.4.0cssall.min.css',
  'httpsfonts.googleapis.comcss2family=Cairowght@300;400;600;700;900&display=swap',
  'httpscdn-icons-png.flaticon.com512924924514.png'
];

 تثبيت الـ Service Worker وحفظ الملفات
self.addEventListener('install', (event) = {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) = {
        console.log('Opened cache');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

 تفعيل الـ Service Worker
self.addEventListener('activate', (event) = {
  event.waitUntil(
    caches.keys().then((cacheNames) = {
      return Promise.all(
        cacheNames.map((cacheName) = {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

 استدعاء الملفات (Offline First Strategy)
self.addEventListener('fetch', (event) = {
  event.respondWith(
    caches.match(event.request)
      .then((response) = {
         إذا وجد الملف في الكاش، قم بإرجاعه
        if (response) {
          return response;
        }
         وإلا قم بجلبه من الإنترنت
        return fetch(event.request);
      })
  );
});