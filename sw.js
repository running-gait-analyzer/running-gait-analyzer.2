const CACHE_NAME = "running-gait-v1.0.0";
const APP_FILES = ["./","./index.html","./manifest.json","./icons/icon-192.png","./icons/icon-512.png"];
const CDN_FILES = [
 "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs",
 "https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"
];
self.addEventListener("install", event => {
 event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_FILES)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate", event => {
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch", event => {
 const url = new URL(event.request.url);
 if(event.request.method!=="GET") return;
 if(url.origin===location.origin || url.hostname==="cdn.jsdelivr.net" || url.hostname==="storage.googleapis.com"){
   event.respondWith(caches.match(event.request).then(cached=>cached || fetch(event.request).then(response=>{
     if(response.ok){const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));}
     return response;
   }).catch(()=>caches.match("./index.html"))));
 }
});