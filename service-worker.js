const PREFIX="tokyo-autumn-guide-2026-";
const CACHE=PREFIX+"20261024-storybook-v1";
const ASSETS=["./","./index.html","./manifest.webmanifest","./icon-tower-180.png","./icon-tower-192.png","./icon-tower-512.png"];

self.addEventListener("install",event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
 event.waitUntil(
  caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(PREFIX)&&key!==CACHE).map(key=>caches.delete(key))))
   .then(()=>self.clients.claim())
 );
});
self.addEventListener("fetch",event=>{
 const url=new URL(event.request.url);
 if(url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope)||event.request.method!=="GET")return;
 if(event.request.mode==="navigate"){
  event.respondWith(fetch(event.request).then(response=>{
   if(response.ok){
    const copy=response.clone();
    event.waitUntil(caches.open(CACHE)
     .then(cache=>cache.put(new URL("./index.html",self.registration.scope).href,copy))
     .catch(error=>console.error("Travel guide cache refresh failed:",error)));
   }
   return response;
  }).catch(async error=>{
   const cached=await caches.match(new URL("./index.html",self.registration.scope).href);
   if(cached)return cached;
   console.error("Offline travel guide is unavailable:",error);
   return Response.error();
  }));
 }else if(ASSETS.some(asset=>new URL(asset,self.registration.scope).pathname===url.pathname)){
  event.respondWith(caches.match(event.request,{ignoreSearch:true}).then(cached=>cached||fetch(event.request)));
 }
});
