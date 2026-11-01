/* El Shenawy — service worker بسيط لعرض تنبيهات المتصفح وفتح الصفحة عند الضغط عليها */
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  const u=new URL((e.notification.data&&e.notification.data.url)||'notifications.html',self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{
    for(const c of l){if(c.url.startsWith(self.registration.scope)&&'focus' in c){return c.focus().then(()=>c.navigate?c.navigate(u):null)}}
    return self.clients.openWindow(u);
  }));
});
