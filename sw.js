/* El Shenawy — service worker: تنبيهات + كاش للصور والصفحات (PWA) */
const VER='v29';
const SHELL='es-shell-'+VER, IMG='es-img-'+VER;
const IMG_MAX=120;
const PAGES=['index.html','shop.html','product.html','cart.html','track.html','account.html','wishlist.html','notifications.html','policies.html','size-guide.html','thanks.html'];

self.addEventListener('install',e=>{
  /* بنحمّل الصفحات في الخلفية — لو واحدة فشلت مش بتوقّف التثبيت */
  e.waitUntil(caches.open(SHELL).then(c=>Promise.all(PAGES.map(p=>c.add(p).catch(()=>{})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>e.waitUntil(
  caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('es-')&&k!==SHELL&&k!==IMG).map(k=>caches.delete(k)))).then(()=>self.clients.claim())
));

async function trim(name,max){
  const c=await caches.open(name),ks=await c.keys();
  if(ks.length>max)await Promise.all(ks.slice(0,ks.length-max).map(k=>c.delete(k)));
}
const okRes=r=>r&&(r.ok||r.type==='opaque');

/* صور: كاش أولًا (أسرع حاجة)، ولو مش موجودة تتحمّل وتتخزّن */
async function imgFirst(req){
  const c=await caches.open(IMG),hit=await c.match(req);
  if(hit)return hit;
  try{const r=await fetch(req);if(okRes(r)){c.put(req,r.clone());trim(IMG,IMG_MAX)}return r}
  catch(e){return hit||Response.error()}
}
/* css/js: يعرض اللي في الكاش فورًا ويحدّثه في الخلفية */
async function swr(req){
  const c=await caches.open(SHELL),hit=await c.match(req);
  const net=fetch(req).then(r=>{if(r&&r.ok)c.put(req,r.clone());return r}).catch(()=>hit);
  return hit||net;
}
/* صفحات HTML: الشبكة أولًا (علشان المحتوى يبقى جديد) ولو النت ضعيف/واقع يرجع للكاش */
async function pageNet(req){
  const c=await caches.open(SHELL);
  try{
    const r=await Promise.race([fetch(req),new Promise((_,rej)=>setTimeout(rej,4000))]);
    if(r&&r.ok){c.put(req,r.clone())}
    return r;
  }catch(e){
    return (await c.match(req))||(await c.match(req,{ignoreSearch:true}))||(await c.match('index.html'))||Response.error();
  }
}

self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET'||req.headers.has('range'))return; /* الفيديو والـ POST بره الكاش */
  const u=new URL(req.url);
  if(/firestore|firebaseio|googleapis|identitytoolkit|securetoken|google-analytics|googletagmanager|facebook/.test(u.hostname))return; /* داتا لايف */
  if(u.pathname.endsWith('.mp4'))return;
  if(req.destination==='image'||/\.(png|jpe?g|webp|gif|svg|avif)$/i.test(u.pathname)||u.hostname.endsWith('cloudinary.com')){e.respondWith(imgFirst(req));return}
  if(u.origin!==location.origin)return;
  if(req.mode==='navigate'||req.destination==='document'){e.respondWith(pageNet(req));return}
  if(/\.(css|js)$/.test(u.pathname)){e.respondWith(swr(req));return}
});

self.addEventListener('notificationclick',e=>{
  e.notification.close();
  const u=new URL((e.notification.data&&e.notification.data.url)||'notifications.html',self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{
    for(const c of l){if(c.url.startsWith(self.registration.scope)&&'focus' in c){return c.focus().then(()=>c.navigate?c.navigate(u):null)}}
    return self.clients.openWindow(u);
  }));
});
