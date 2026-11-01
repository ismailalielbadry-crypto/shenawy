/* =====================================================================
   El Shenawy Mens Wear — core.js
   الملف المشترك لكل الصفحات: الحالة، Firebase، الهيدر والفوتر،
   السلة والمفضلة، والإشعارات.
   ===================================================================== */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const svg='<svg viewBox="0 0 100 100" fill="currentColor"><path d="M35 8l-26 14 8 18 10-4v52h46V36l10 4 8-18L65 8c-3 8-9 12-15 12S38 16 35 8z"/></svg>';
const ADMIN_EMAIL='fear6184@gmail.com';

/* ---------- تخزين محلي آمن ---------- */
const LS={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};

/* ---------- الحالة ---------- */
let S=null,lang='ar',cart=[],cust={n:'',p:'',a:'',g:-1},HAS_CACHE=false;
try{lang=localStorage.getItem('lg')||'ar'}catch(e){}
function norm(){delete S.cfg.pw;if(!S.cfg.anns||typeof S.cfg.anns!='object')S.cfg.anns={en:(S.cfg.ann&&S.cfg.ann.en)||'',ar:(S.cfg.ann&&S.cfg.ann.ar)||''};for(const k in DEF)if(S.cfg[k]===undefined)S.cfg[k]=DEF[k];S.cats=S.cats||[];S.prods=S.prods||[];S.prods.forEach(p=>{if(!p.imgs)p.imgs=p.img?[p.img]:[];delete p.img;p.os=p.os||'';p.oc=p.oc||''})}
(function(){const c=LS.get('es_store',null);HAS_CACHE=!!(c&&c.cfg&&c.cats&&c.prods);S=JSON.parse(JSON.stringify(HAS_CACHE?c:window.SEED));norm()})();
const L2=(a,e)=>lang=='ar'?a:e;
const t=k=>I[lang][k]??I.en[k]??'',tr=o=>o?(o[lang]||o.en||''):'',money=n=>(lang=='ar'?'ج.م ':'EGP ')+Math.round(n).toLocaleString('en-US');
const price=p=>p.p*(1-(+p.s||0)/100),esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const cc=c=>COL[c.toUpperCase()]||(c[0]=='#'?esc(c):'#888'),list=s=>(s||'').split(',').map(x=>x.trim()).filter(Boolean);
const cname=c=>c=='All'?t('all'):c=='HOT'?t('hot'):tr(S.cats.find(x=>x.en==c))||c;
const vis=()=>S.prods.filter(p=>!p.hide);
const P=i=>S.prods.find(p=>p.id==i.id);
const outS=(p,s)=>list(p.os).includes(s),outC=(p,c)=>list(p.oc).includes(c);
const isOut=p=>p.out||(list(p.sz).length>0&&list(p.sz).every(s=>outS(p,s)))||(list(p.cl).length>0&&list(p.cl).every(c=>outC(p,c)));
function ph(p,c,x,k){const im=(p.imgs||[])[k||0];return `<div class="ph" style="--c:${cc(c||list(p.cl)[0]||'GREY')}">${im?`<img src="${esc(im)}" alt="" style="width:100%;height:100%;object-fit:cover;display:block">`:svg}${x||''}</div>`}
function tags(p){return isOut(p)?`<span class="tag o">${t('so')}</span>`:p.s?`<span class="tag">-${p.s}%</span>`:''}
function pr(p){return p.s?`<b>${money(price(p))}</b><s>${money(p.p)}</s>`:`<b>${money(p.p)}</b>`}
const IC={ig:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',fb:'<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M14 8V6.5c0-.7.3-1 1-1h2V2h-3c-3 0-4.5 1.8-4.5 4.4V8H7v3.5h2.5V22H14V11.5h2.7L17 8z"/></svg>',wa:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21l1.6-4.8A8.5 8.5 0 1 1 8 19.5z"/></svg>'};
const safe=u=>/^https?:\/\//i.test(u||'')?esc(u):'';
/* ---------- سلة وبيانات العميل ---------- */
(function(){const c=LS.get('es_cart',[]);if(Array.isArray(c))cart=c.filter(i=>i&&i.q>0);const cu=LS.get('es_cust',null);if(cu&&typeof cu=='object')cust={n:cu.n||'',p:cu.p||'',a:cu.a||'',g:Number.isInteger(cu.g)&&GOV[cu.g]?cu.g:-1}})();
const saveCust=()=>LS.set('es_cust',cust);
const cartCount=()=>cart.reduce((a,i)=>a+(+i.q||0),0);
function cartSave(){LS.set('es_cart',cart);updBadges()}
function totals(){const L=cart.map(i=>({i,p:P(i)})).filter(x=>x.p),u=[];
L.forEach(x=>{for(let k=0;k<x.i.q;k++)u.push(price(x.p))});
const sub=L.reduce((a,x)=>a+price(x.p)*x.i.q,0);let free=0;
if(S.cfg.b2g1){u.sort((a,b)=>b-a);for(let k=2;k<u.length;k+=3)free+=u[k]}
const after=sub-free;let ship=null;
if(cust.g>=0&&GOV[cust.g]){const z=S.cfg.zones[GOV[cust.g][2]];ship=(+S.cfg.free>0&&after>=+S.cfg.free)?0:(+(z&&z.p)||0)}
return{L,sub,free,units:u.length,after,ship,total:after+(ship||0)}}
function addToCart(p,col,size,q){const k=cart.find(i=>i.id==p.id&&i.col==col&&i.size==size);k?k.q+=q:cart.push({id:p.id,col,size,q});cartSave();track('AddToCart',{value:Math.round(price(p)*q),currency:'EGP'})}

/* ---------- أدوات عامة ---------- */
function toast(m){const e=$('#toast');e.textContent=m;e.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('on'),2200)}
function normPhone(v){let d=String(v).replace(/\D/g,'');if(d.startsWith('0020'))d=d.slice(4);else if(d.startsWith('20')&&d.length==12)d=d.slice(2);if(d.length==10&&d[0]=='1')d='0'+d;return /^01[0125]\d{8}$/.test(d)?d:null}
const track=(ev,o)=>{try{window.fbq&&fbq('track',ev,o||{});window.gtag&&gtag('event',ev.toLowerCase(),o||{})}catch(e){}};
function loadPixel(id){if(window.fbq)return;const n=window.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!window._fbq)window._fbq=n;n.push=n;n.loaded=true;n.version='2.0';n.queue=[];const s=document.createElement('script');s.async=true;s.src='https://connect.facebook.net/en_US/fbevents.js';s.dataset.trk=1;document.head.appendChild(s);fbq('init',id);fbq('track','PageView')}
function loadGA(id){if(window.gtag)return;window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};const s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(id);s.dataset.trk=1;document.head.appendChild(s);gtag('js',new Date());gtag('config',id)}
function sendHook(o){const u=S.cfg.hook;if(!/^https?:\/\//i.test(u||''))return;try{fetch(u,{method:'POST',mode:'no-cors',keepalive:true,headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(o)}).catch(()=>{})}catch(e){}}
const fmtD=t=>{try{return new Date(t).toLocaleDateString(lang=='ar'?'ar-EG':'en-GB',{day:'numeric',month:'short',year:'numeric'})}catch(e){return''}};
const iname=i=>lang=='ar'?(i.na||i.name):i.name;
const CST={new:['تم استلام الطلب','Order received'],confirmed:['تم تأكيد الطلب','Confirmed'],shipped:['خرج للشحن','Shipped'],delivered:['تم التسليم','Delivered'],cancelled:['تم الإلغاء','Cancelled']};
const cst=s=>(CST[s]||CST.new)[lang=='ar'?0:1];
const isAdm=u=>!!u&&u.email==ADMIN_EMAIL;
const safeLink=u=>/^(https?:\/\/|[\w./-]+\.html)/i.test(u||'')?esc(u):'';
const baseUrl=()=>location.origin+location.pathname.replace(/[^/]*$/,'');
function openPanel(id){const o=$('#ov'),e=$(id);if(o)o.classList.add('on');if(e)e.classList.add('on');document.documentElement.classList.add('lk')}
function closeAll(){document.querySelectorAll('.ov.on,.dr.on,.mod.on').forEach(e=>e.classList.remove('on'));closePop();document.documentElement.classList.remove('lk')}
function annRender(){const el=$('#ann');const L=String(tr(S.cfg.anns)||'').split('\n').map(x=>x.trim()).filter(Boolean);if(!L.length){el.style.display='none';return}el.style.display='';
const k=L.join('|');if(el.dataset.k==k)return;el.dataset.k=k;const one=L.map(x=>`<span class="it">${esc(x)}</span>`).join('');
let reps=1;const chars=L.join('').length+L.length*6;reps=Math.max(1,Math.ceil(120/chars));const half=one.repeat(reps);
el.innerHTML=`<div class="tk">${half}${half}</div>`;el.style.setProperty('--d',Math.max(14,chars*reps*.28)+'s')}

/* ---------- Firebase ---------- */
const FB={apiKey:"AIzaSyB2sSwhEgai4-VwNYqP8YhNrYok4mBdT3M",authDomain:"el-shenawy-30f82.firebaseapp.com",projectId:"el-shenawy-30f82",storageBucket:"el-shenawy-30f82.firebasestorage.app",messagingSenderId:"1028508751663",appId:"1:1028508751663:web:16b8f154e4fb9d816b73da"};
let db=null,auth=null,user=null;
const AUTH={done:false},_ul=[];
const onUser=f=>{_ul.push(f);if(AUTH.done)try{f(user)}catch(e){}};
try{firebase.initializeApp(FB);db=firebase.firestore();auth=firebase.auth();auth.onAuthStateChanged(u=>{user=u;AUTH.done=true;_ul.forEach(f=>{try{f(u)}catch(e){}})})}catch(e){AUTH.done=true}
function saveOrder(o){if(!db)return Promise.resolve();try{const od=Object.assign({},o);if(user){od.uid=user.uid;od.email=user.email||''}const tk={id:o.id,t:o.t,status:'new',gov:o.gov,total:o.total,p4:String(o.phone).slice(-4),items:o.items.map(i=>({name:i.name,na:i.na||'',qty:i.qty}))};const b=db.batch();b.set(db.collection('orders').doc(o.id),od);b.set(db.collection('track').doc(o.id),tk);return b.commit().catch(()=>{})}catch(e){return Promise.resolve()}}
function initTrk(){try{if(S.cfg.pixel)loadPixel(String(S.cfg.pixel).replace(/[^\w-]/g,''));if(S.cfg.ga)loadGA(String(S.cfg.ga).replace(/[^\w-]/g,''))}catch(e){}}

/* متجر Firestore: نعرض الكاش فورًا ونحدّث بعدها */
const REMOTE={state:'idle'},_sl=[];
const onStore=f=>_sl.push(f);
const storeReady=(async()=>{const before=JSON.stringify(S);
if(!db){REMOTE.state='fail';return}
try{const d=await db.collection('store').doc('main').get();
if(d.exists){const r=d.data();if(r.cfg)S.cfg=r.cfg;if(r.cats)S.cats=r.cats;if(r.prods)S.prods=r.prods;norm();LS.set('es_store',{cfg:S.cfg,cats:S.cats,prods:S.prods})}
REMOTE.state='ok'}catch(e){REMOTE.state='fail'}
initTrk();
if(JSON.stringify(S)!==before)_sl.forEach(f=>{try{f()}catch(e){}})})();

/* ---------- المفضلة ---------- */
const HEART='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21l-1.4-1.3C5.4 15 2 12 2 8.5 2 5.4 4.4 3 7.5 3c1.7 0 3.4.8 4.5 2.1C13.1 3.8 14.8 3 16.5 3 19.6 3 22 5.4 22 8.5c0 3.5-3.4 6.5-8.6 11.2L12 21z"/></svg>';
const SHARE='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 10.5l6.8-4M8.6 13.5l6.8 4"/></svg>';
let FAV=(LS.get('es_fav',[])||[]).map(Number).filter(Number.isFinite);
const isFav=id=>FAV.includes(+id);
const heart=id=>`<button class="hrt${isFav(id)?' on':''}" data-fv="${id}" aria-label="${L2('أضف للمفضلة','Wishlist')}" aria-pressed="${isFav(id)}">${HEART}</button>`;
function saveFav(){LS.set('es_fav',FAV);updBadges();if(user&&db)db.collection('users').doc(user.uid).set({fav:FAV},{merge:true}).catch(()=>{})}
function toggleFav(id){id=+id;const on=!isFav(id);FAV=on?[...FAV,id]:FAV.filter(x=>x!=id);saveFav();
document.querySelectorAll('[data-fv="'+id+'"]').forEach(b=>{b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)});
toast(on?L2('اتضاف للمفضلة','Added to wishlist'):L2('اتشال من المفضلة','Removed'));window.onFavChange&&onFavChange()}
function card(p){return `<div class="p">${heart(p.id)}<a class="pl" href="product.html?id=${p.id}">${ph(p,0,tags(p))}<h3>${esc(tr(p.n))}</h3>${pr(p)}<div class="dots">${list(p.cl).map(c=>`<i style="--c:${cc(c)}"></i>`).join('')}</div></a></div>`}

/* ---------- مشاركة ---------- */
function shareP(id){const p=S.prods.find(x=>x.id==id);if(!p)return;const url=baseUrl()+'product.html?id='+id,title=tr(p.n),text=title+' - '+money(price(p))+' | El Shenawy Mens Wear';
if(navigator.share){navigator.share({title,text,url}).catch(()=>{});return}
const e=encodeURIComponent,links=[['WhatsApp','https://wa.me/?text='+e(text+'\n'+url)],['Facebook','https://www.facebook.com/sharer/sharer.php?u='+e(url)],['Telegram','https://t.me/share/url?url='+e(url)+'&text='+e(text)]];
$('#sheet').innerHTML=`<button class="x" data-close style="float:inline-end" aria-label="Close">×</button><h2>${L2('مشاركة المنتج','Share')}</h2><div class="shl">${links.map(l=>`<a class="btn dark" href="${esc(l[1])}" target="_blank" rel="noopener noreferrer">${l[0]}</a>`).join('')}<button class="btn out" data-cp="${esc(url)}" style="border:1px solid var(--line)">${L2('نسخ الرابط','Copy link')}</button></div><small class="mut">${L2('لإنستجرام: انسخ الرابط والصقه في الرسائل أو الستوري.','For Instagram: copy the link and paste it in a message or story.')}</small>`;openPanel('#sheet')}

/* =====================================================================
   الإشعارات
   - إعلانات من المتجر (Firestore: store/notifs) يكتبها الأدمن
   - تحديثات حالة طلبات العميل (من track/{id})
   - تنبيهات المتصفح اختيارية
   ===================================================================== */
const NF_MSG={new:['استلمنا طلبك وهنتواصل معاك للتأكيد','We received your order'],confirmed:['تم تأكيد طلبك','Your order is confirmed'],shipped:['طلبك خرج للشحن وهيوصلك قريب','Your order has been shipped'],delivered:['تم تسليم طلبك. شكرًا لثقتك','Your order was delivered. Thank you!'],cancelled:['تم إلغاء طلبك','Your order was cancelled']};
if(!LS.get('es_nfirst',0))LS.set('es_nfirst',Date.now());
const nfLocal=()=>LS.get('es_notifs',[])||[];
const nfAnn=()=>(LS.get('es_ann',[])||[]).map(x=>Object.assign({},x,{kind:'ann'}));
const nfDel=()=>new Set(LS.get('es_ndel',[])||[]);
const nfAll=()=>{const d=nfDel();return [...nfLocal(),...nfAnn()].filter(n=>!d.has(n.id)).sort((a,b)=>b.t-a.t)};
function nfClear(){const d=nfDel();nfAll().forEach(n=>d.add(n.id));LS.set('es_ndel',[...d].slice(-300));updBadges()}
const nfReadSet=()=>new Set(LS.get('es_nread',[])||[]);
function nfUnread(){const r=nfReadSet(),f=LS.get('es_nfirst',0);return nfAll().filter(n=>!r.has(n.id)&&(n.kind!='ann'||n.t>=f)).length}
function nfMarkAll(){const r=nfReadSet();nfAll().forEach(n=>r.add(n.id));LS.set('es_nread',[...r].slice(-300));updBadges()}
function nfAdd(n){const l=nfLocal();if(l.some(x=>x.id==n.id))return false;l.unshift(n);LS.set('es_notifs',l.slice(0,60));updBadges();return true}
function nfText(n){if(n.kind=='order')return{title:L2('طلب','Order')+' '+n.oid,body:(NF_MSG[n.st]||NF_MSG.new)[lang=='ar'?0:1],url:'track.html?id='+encodeURIComponent(n.oid)+(n.p4?'&p4='+encodeURIComponent(n.p4):'')};
return{title:tr(n.title)||'El Shenawy',body:tr(n.body),url:n.url||''}}
const nfMine=()=>(LS.get('es_myorders',[])||[]).sort((a,b)=>b.t-a.t);
function addMine(id,p4,t){const l=nfMine().filter(x=>x.id!=id);l.unshift({id,p4:p4||'',t:t||Date.now()});LS.set('es_myorders',l.slice(0,20))}
const nfSupported=()=>'Notification' in window;
const nfPerm=()=>nfSupported()?Notification.permission:'unsupported';
function regSW(){try{if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{})}catch(e){}}
async function nfEnable(){if(!nfSupported())return'unsupported';let p=Notification.permission;if(p=='default'){try{p=await Notification.requestPermission()}catch(e){}}if(p=='granted')regSW();return p}
async function sysNotify(x,tag){if(nfPerm()!='granted')return;
const o={body:x.body||'',tag:tag||undefined,data:{url:x.url||'notifications.html'},dir:lang=='ar'?'rtl':'ltr',lang};
try{const r=await navigator.serviceWorker.getRegistration();if(r){await r.showNotification(x.title,o);return}}catch(e){}
try{new Notification(x.title,o)}catch(e){}}
let _wo=0;
async function watchOrders(force){if(!db)return;const now=Date.now();if(!force&&now-_wo<30000)return;_wo=now;
try{if(user){try{const q=await db.collection('orders').where('uid','==',user.uid).get();q.docs.forEach(d=>{const o=d.data();if(o.id)addMine(o.id,String(o.phone||'').slice(-4),o.t)})}catch(e){}}
const mine=nfMine().slice(0,10),seen=LS.get('es_ost',{})||{};
await Promise.all(mine.map(async m=>{try{const d=await db.collection('track').doc(m.id).get();if(!d.exists)return;const st=d.data().status||'new';
if(seen[m.id]===undefined){seen[m.id]=st;if(st!='new')nfAdd({id:'o:'+m.id+':'+st,t:Date.now(),kind:'order',oid:m.id,st,p4:m.p4});return}
if(seen[m.id]!==st){seen[m.id]=st;const n={id:'o:'+m.id+':'+st,t:Date.now(),kind:'order',oid:m.id,st,p4:m.p4};if(nfAdd(n))sysNotify(nfText(n),n.id)}}catch(e){}}));
LS.set('es_ost',seen)}catch(e){}
updBadges();window.onNotifs&&onNotifs()}
async function fetchAnn(){if(!db)return;try{const d=await db.collection('store').doc('notifs').get();const items=(d.exists&&Array.isArray(d.data().items)?d.data().items:[]).filter(x=>x&&x.id&&x.t);
const prev=new Set((LS.get('es_ann',[])||[]).map(x=>x.id)),f=LS.get('es_nfirst',0);LS.set('es_ann',items.slice(0,30));
items.filter(x=>!prev.has(x.id)&&x.t>=f).forEach(x=>sysNotify(nfText(Object.assign({kind:'ann'},x)),x.id))}catch(e){}
updBadges();window.onNotifs&&onNotifs()}

/* ---------- الشارات ---------- */
function updBadges(){const set=(id,n)=>{const e=$(id);if(e){e.textContent=n>99?'99+':n;e.hidden=!n}};
set('#cn',cartCount());set('#fcn',FAV.length);const u=nfUnread();set('#nbn',u);const nb=$('#nb');if(nb)nb.classList.toggle('ring',u>0);drRefresh()}

/* ---------- الهيدر والفوتر والقائمة ---------- */
const ICN={
bell:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/></svg>',
user:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.5 4.2-6 8-6s7 1.5 8 6"/></svg>',
heart:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 21l-1.4-1.3C5.4 15 2 12 2 8.5 2 5.4 4.4 3 7.5 3c1.7 0 3.4.8 4.5 2.1C13.1 3.8 14.8 3 16.5 3 19.6 3 22 5.4 22 8.5c0 3.5-3.4 6.5-8.6 11.2L12 21z"/></svg>',
cart:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h2.2l2.1 10.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L20.5 8H6"/><circle cx="9.5" cy="19.5" r="1.4"/><circle cx="17" cy="19.5" r="1.4"/></svg>'};
let ACTIVE='',PAGE=null,taps=0,tt;
function mountChrome(){const R=document.documentElement;R.lang=lang;R.dir=lang=='ar'?'rtl':'ltr';
const hd=$('#hd');
if(hd)hd.innerHTML=`<div class="hl"><button class="ib" id="mb" aria-label="${L2('القائمة','Menu')}">☰</button><button class="ib l hide-s" id="lb">${lang=='ar'?'EN':'عربي'}</button></div><a class="logo" href="index.html" id="lg" aria-label="El Shenawy Mens Wear"><b>EL SHENAWY</b><small>MENS WEAR</small></a><div class="hr"><a class="ib" id="nb" href="notifications.html" aria-haspopup="true" aria-expanded="false" aria-label="${L2('الإشعارات','Notifications')}">${ICN.bell}<span class="badge" id="nbn" hidden>0</span></a><a class="ib" id="ab" href="account.html" aria-label="${L2('حسابي','Account')}">${ICN.user}</a><a class="ib" id="fb2" href="wishlist.html" aria-label="${L2('المفضلة','Wishlist')}">${ICN.heart}<span class="badge" id="fcn" hidden>0</span></a><a class="ib" id="cb" href="cart.html" aria-label="${L2('السلة','Cart')}">${ICN.cart}<span class="badge" id="cn" hidden>0</span></a></div>`;
if($('#ann'))annRender();
backBar();
const ft=$('#ft');if(ft)ft.innerHTML=footerHtml();
if($('#hd')&&!$('#cartdr'))document.body.insertAdjacentHTML('beforeend','<aside class="dr sdr" id="cartdr" role="dialog" aria-modal="true"></aside><aside class="dr sdr" id="favdr" role="dialog" aria-modal="true"></aside><div class="pop" id="nfpop" role="dialog"></div>');
if(!$('#ov'))document.body.insertAdjacentHTML('beforeend','<div class="ov" id="ov"></div><aside class="dr" id="menu" role="dialog" aria-modal="true"></aside><div class="mod" id="sheet" role="dialog" aria-modal="true"></div><div class="toast" id="toast" role="status"></div>');
if($('#hd')){$('#menu').innerHTML=menuHtml();
 if(!$('#wab')){document.body.insertAdjacentHTML('beforeend','<a class="wab" id="wab" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" hidden><svg viewBox="0 0 24 24" width="28" height="28" fill="#fff"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.700 6.700 0 0 1-3.300-2.900c-.2-.4.2-.4.7-1.300.1-.2 0-.3 0-.5l-.8-1.800c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.200s1 2.600 1.100 2.800c.1.2 1.900 2.900 4.600 4 1.700.7 2.400.8 3.200.6.5-.1 1.500-.6 1.700-1.200.2-.6.2-1.100.2-1.200-.1-.1-.2-.2-.4-.3z"/></svg></a>')}
 const wa=(S.cfg.wa||'').replace(/\D/g,''),w=$('#wab');w.hidden=!wa;w.href='https://wa.me/'+wa+'?text='+encodeURIComponent(L2('أهلاً، عندي استفسار','Hi, I have a question'))}
updBadges()}
function menuHtml(){const a=(h,k,txt)=>`<a class="row${ACTIVE==k?' cur':''}" href="${h}">${txt}</a>`;
return `<button class="x" data-close aria-label="Close">×</button>`+a('index.html','home',L2('الرئيسية','Home'))+a('shop.html','shop',L2('المتجر','Shop'))
+`<a class="row sub" href="shop.html?cat=HOT">${esc(cname('HOT'))}</a>`+S.cats.map(c=>`<a class="row sub" href="shop.html?cat=${encodeURIComponent(c.en)}">${esc(tr(c))}</a>`).join('')
+a('wishlist.html','wishlist',L2('المفضلة','Wishlist'))+a('cart.html','cart',L2('السلة','Cart'))+a('account.html','account',L2('حسابي','My account'))
+a('notifications.html','notifications',L2('الإشعارات','Notifications'))+a('track.html','track',L2('تتبع طلبك','Track order'))
+a('policies.html','policies',L2('السياسات','Policies'))+a('size-guide.html','size',L2('جدول المقاسات','Size guide'))
+`<button class="row" data-lang>${lang=='ar'?'English':'العربية'}</button>`}
const IC_FOOT=IC;
function footerHtml(){const c=S.cfg,ig=safe(c.ig),fb=safe(c.fb),wa=(c.wa||'').replace(/\D/g,'');
const so=(h,k,l)=>h?`<a href="${h}" target="_blank" rel="noopener noreferrer" aria-label="${l}">${IC_FOOT[k]}</a>`:'';
return `<div class="fi"><div class="fc"><b class="fl">EL SHENAWY</b><small>MENS WEAR</small><p>${t('ftag')}</p></div><div class="fc"><h4>${t('shopf')}</h4>${S.cats.slice(0,5).map(x=>`<a href="shop.html?cat=${encodeURIComponent(x.en)}">${esc(tr(x))}</a>`).join('')}</div><div class="fc"><h4>${t('care')}</h4><p>${L2('الدفع عند الاستلام','Cash on delivery')}</p><p>${L2('شحن لكل مصر','Shipping across Egypt')}</p><a href="policies.html">${t('policy')}</a><a href="size-guide.html">${t('sg')}</a><a href="track.html">${L2('تتبع طلبك','Track order')}</a><a href="account.html">${L2('حسابي','My account')}</a>${wa?`<a href="https://wa.me/${wa}" target="_blank" rel="noopener noreferrer">${t('wa2')}</a>`:''}</div><div class="fc"><h4>${t('follow')}</h4><div class="so">${so(ig,'ig','Instagram')}${so(fb,'fb','Facebook')}${so(wa&&'https://wa.me/'+wa,'wa','WhatsApp')}</div></div></div><div class="fb">${t('rights')}</div>`}

/* ---------- تشغيل الصفحة ---------- */
function setLang(l){lang=l;try{localStorage.setItem('lg',lang)}catch(e){}closeAll();mountChrome();PAGE&&PAGE()}
function boot(page,fn){ACTIVE=page;PAGE=()=>{try{fn()}catch(e){console.error(e)}};mountChrome();
const go=()=>PAGE();
if(HAS_CACHE||REMOTE.state!='idle')go();else Promise.race([storeReady,new Promise(r=>setTimeout(r,2500))]).then(go);
onStore(()=>{mountChrome();go()})}
const setTitle=s=>{document.title=(s?s+' | ':'')+'El Shenawy Mens Wear'};

/* ---------- مستمعات عامة ---------- */
document.addEventListener('click',e=>{const T=e.target;let el;
if(!T.closest('#nfpop')&&!T.closest('#nb'))closePop();
const plain=!(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button);
if(plain){
 if(T.closest('#cb')&&ACTIVE!='cart'){e.preventDefault();openCartDr();return}
 if(T.closest('#fb2')&&ACTIVE!='wishlist'){e.preventDefault();openFavDr();return}
 if(T.closest('#nb')&&ACTIVE!='notifications'){e.preventDefault();togglePop();return}
 if(el=T.closest('#menu a.row')){const h=el.getAttribute('href');if(h=='cart.html'&&ACTIVE!='cart'){e.preventDefault();openCartDr();return}if(h=='wishlist.html'&&ACTIVE!='wishlist'){e.preventDefault();openFavDr();return}}}
if(el=T.closest('[data-dq]')){const[k,d]=el.dataset.dq.split('|').map(Number),it=cart[k];if(it){it.q+=d;if(it.q<1)cart.splice(k,1);cartSave()}return}
if(el=T.closest('[data-drm]')){cart.splice(+el.dataset.drm,1);cartSave();return}
if(T.closest('[data-pnen]')){nfEnable().then(popDraw);return}
if(T.closest('[data-pclr]')){nfClear();popDraw();return}
if(T.closest('#lg')){e.preventDefault();clearTimeout(tt);taps++;
 if(taps>=10){taps=0;location.href='admin.html';return}
 tt=setTimeout(()=>{const home=/(^|\/)(index\.html)?$/.test(location.pathname);const n=taps;taps=0;if(n<10&&!home)location.href='index.html'},650);return}
if(el=T.closest('[data-back]')){goBack();return}
if(T.closest('#mb')){openPanel('#menu');return}
if(T.closest('#lb')||T.closest('[data-lang]')){setLang(lang=='ar'?'en':'ar');return}
if(T.closest('.ov')||T.closest('[data-close]')){closeAll();return}
if(el=T.closest('[data-fv]')){e.preventDefault();e.stopPropagation();toggleFav(el.dataset.fv);return}
if(el=T.closest('[data-sh]')){shareP(el.dataset.sh);return}
if(el=T.closest('[data-cp]')){navigator.clipboard&&navigator.clipboard.writeText(el.dataset.cp).then(()=>toast(L2('تم نسخ الرابط','Link copied')),()=>{});return}});
document.addEventListener('keydown',e=>{if(e.key=='Escape')closeAll()});

/* ---------- مزامنة المستخدم (مفضلة + بيانات التوصيل + طلبات) ---------- */
onUser(async u=>{if(u){try{const d=await db.collection('users').doc(u.uid).get();const r=d.exists?d.data():{};
const remote=(r.fav||[]).map(Number).filter(Number.isFinite),merged=[...new Set([...FAV,...remote])];
if(merged.length!=remote.length||merged.length!=FAV.length){FAV=merged;saveFav()}else FAV=merged;
if(!cust.n&&(r.name||u.displayName))cust.n=r.name||u.displayName;if(!cust.p&&r.phone)cust.p=r.phone;if(!cust.a&&r.address)cust.a=r.address;if(cust.g<0&&Number.isInteger(r.g))cust.g=r.g;saveCust();
window.onFavChange&&onFavChange();window.onProfile&&onProfile(r)}catch(e){}}
const ab=$('#ab');if(ab)ab.classList.toggle('in',!!u);updBadges();watchOrders(true)});
if(nfPerm()=='granted')regSW();
fetchAnn();
document.addEventListener('visibilitychange',()=>{if(!document.hidden){watchOrders();fetchAnn()}});
setInterval(()=>{if(!document.hidden){watchOrders();fetchAnn()}},90000);

/* =====================================================================
   لوحات جانبية (السلة + المفضلة) وصندوق الإشعارات الصغير
   ===================================================================== */
function drHead(title,sub){return `<div class="dh"><div><h2>${title}</h2>${sub?`<small>${sub}</small>`:''}</div><button class="x" data-close aria-label="${L2('إغلاق','Close')}">×</button></div>`}
function setDr(el,h){const b=el.querySelector('.db'),y=b?b.scrollTop:0;el.innerHTML=h;const n=el.querySelector('.db');if(n)n.scrollTop=y}

function cartDrHtml(){const T=totals();
if(!T.L.length)return drHead(t('cart'))+`<div class="db"><div class="dempty"><h3>${t('empty')}</h3><p>${L2('ضيف حاجة من المتجر وابدأ طلبك.','Add something from the shop to get started.')}</p><a class="btn dark" href="shop.html">${L2('تسوق الآن','Shop now')}</a></div></div>`;
const items=T.L.map(({i,p})=>{const k=cart.indexOf(i);return `<div class="ci"><a href="product.html?id=${p.id}">${ph(p,i.col)}</a><div class="cib"><a href="product.html?id=${p.id}"><b>${esc(tr(p.n))}</b></a><small>${esc(i.col||'')}${i.col&&i.size?' / ':''}${esc(i.size||'')}</small><div class="cir"><div class="qb"><button data-dq="${k}|-1" aria-label="-">−</button><span>${i.q}</span><button data-dq="${k}|1" aria-label="+">+</button></div><span class="cip">${money(price(p)*i.q)}</span></div></div><button class="rmx" data-drm="${k}" aria-label="${L2('حذف','Remove')}">×</button></div>`}).join('');
let h='';
if(S.cfg.b2g1&&T.units%3==2)h+=`<div class="hint">${t('hint21')}</div>`;
if(+S.cfg.free>0&&T.after<+S.cfg.free)h+=`<div class="hint">${t('hintfree').replace('{x}',money(+S.cfg.free-T.after))}</div>`;
return drHead(t('cart'),cartCount()+' '+L2('قطعة','items'))+`<div class="db">${items}</div><div class="df">${h}<div class="row2"><span>${t('sub')}</span><span>${money(T.sub)}</span></div>${T.free?`<div class="row2 gr"><span>${t('gift')}</span><span>-${money(T.free)}</span></div>`:''}<div class="row2 tt"><b>${t('total')}</b><b>${money(T.after)}</b></div><small>${L2('الشحن بيتحسب في الخطوة الجاية حسب المحافظة.','Shipping is calculated at checkout.')}</small><a class="btn dark red" href="cart.html">${L2('إتمام الطلب','Checkout')}</a></div>`}

function favDrHtml(){const ps=FAV.map(i=>S.prods.find(p=>p.id==i)).filter(p=>p&&!p.hide);
if(!ps.length)return drHead(L2('المفضلة','Wishlist'))+`<div class="db"><div class="dempty"><h3>${L2('لسه ما حفظتش حاجة','Nothing saved yet')}</h3><p>${L2('اضغط على القلب في أي منتج وهيتحفظ هنا.','Tap the heart on any product to save it here.')}</p><a class="btn dark" href="shop.html">${L2('تصفح المتجر','Browse the shop')}</a></div></div>`;
const items=ps.map(p=>`<div class="ci"><a href="product.html?id=${p.id}">${ph(p)}</a><div class="cib"><a href="product.html?id=${p.id}"><b>${esc(tr(p.n))}</b></a>${isOut(p)?`<small>${t('so')}</small>`:''}<div class="cir"><span class="cip">${pr(p)}</span></div></div><button class="rmx" data-fv="${p.id}" aria-label="${L2('إزالة من المفضلة','Remove')}">×</button></div>`).join('');
return drHead(L2('المفضلة','Wishlist'),ps.length+' '+L2('منتج','items'))+`<div class="db">${items}</div><div class="df"><a class="btn dark" href="wishlist.html">${L2('عرض كل المفضلة','View all')}</a></div>`}

function drRefresh(){const c=$('#cartdr'),f=$('#favdr');
if(c&&c.classList.contains('on'))setDr(c,cartDrHtml());
if(f&&f.classList.contains('on'))setDr(f,favDrHtml())}
function openCartDr(){closeAll();const e=$('#cartdr');if(!e)return;setDr(e,cartDrHtml());openPanel('#cartdr')}
function openFavDr(){closeAll();const e=$('#favdr');if(!e)return;setDr(e,favDrHtml());openPanel('#favdr')}

/* ---------- صندوق الإشعارات ---------- */
const NF_IC={new:'🧾',confirmed:'✅',shipped:'🚚',delivered:'📦',cancelled:'✖️'};
let POPSNAP=null;
const nfWhenS=t=>{try{return new Date(t).toLocaleString(lang=='ar'?'ar-EG':'en-GB',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'})}catch(e){return''}};
function popHtml(){const all=nfAll(),f=LS.get('es_nfirst',0),r=POPSNAP||nfReadSet(),perm=nfPerm();
const un=n=>!r.has(n.id)&&(n.kind!='ann'||n.t>=f);
const rows=all.slice(0,6).map(n=>{const x=nfText(n),u=un(n),href=n.kind=='order'?x.url:safeLink(x.url);
const inner=`<span class="pic" aria-hidden="true">${n.kind=='order'?(NF_IC[n.st]||'🔔'):'📢'}</span><span class="ptx"><b>${esc(x.title)}</b>${x.body?`<span>${esc(x.body)}</span>`:''}<time>${esc(nfWhenS(n.t))}</time></span>${u?'<i class="dot"></i>':''}`;
return href?`<a class="pni${u?' un':''}" href="${href}">${inner}</a>`:`<div class="pni${u?' un':''}">${inner}</div>`}).join('');
const en=perm=='default'?`<div class="pen"><span>${L2('فعّل تنبيهات المتصفح لتحديثات طلبك','Turn on browser alerts for order updates')}</span><button data-pnen>${L2('تفعيل','Enable')}</button></div>`:'';
return `<div class="ph2"><b>${L2('الإشعارات','Notifications')}</b>${all.length?`<button data-pclr>${L2('مسح الكل','Clear all')}</button>`:''}</div>${en}<div class="pl">${rows||`<div class="pempty">${L2('مفيش إشعارات لسه','No notifications yet')}</div>`}</div><div class="pfoot"><a href="notifications.html">${L2('عرض كل الإشعارات','View all notifications')}</a></div>`}
function placePop(){const p=$('#nfpop'),b=$('#nb');if(!p||!b)return;const r=b.getBoundingClientRect(),vw=document.documentElement.clientWidth,w=Math.min(360,vw-24);
p.style.width=w+'px';let left=r.left+r.width/2-w/2;left=Math.max(12,Math.min(left,vw-w-12));
p.style.left=left+'px';p.style.top=(r.bottom+8)+'px';p.style.setProperty('--ax',(r.left+r.width/2-left)+'px')}
function popDraw(){const p=$('#nfpop');if(p&&p.classList.contains('on')){p.innerHTML=popHtml();placePop()}}
function openPop(){closeAll();const p=$('#nfpop');if(!p)return;POPSNAP=nfReadSet();p.innerHTML=popHtml();placePop();p.classList.add('on');const b=$('#nb');b&&b.setAttribute('aria-expanded','true');nfMarkAll()}
function closePop(){const p=$('#nfpop');if(p&&p.classList.contains('on')){p.classList.remove('on');const b=$('#nb');b&&b.setAttribute('aria-expanded','false');POPSNAP=null}}
function togglePop(){const p=$('#nfpop');p&&p.classList.contains('on')?closePop():openPop()}
addEventListener('resize',popDraw);addEventListener('scroll',()=>{const p=$('#nfpop');if(p&&p.classList.contains('on'))placePop()},{passive:true});

/* ---------- زرار الرجوع (كل الصفحات الداخلية) ---------- */
const BK_SVG='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';
function backBar(){const hd=$('#hd');if(!hd||ACTIVE=='home')return;let b=$('#bk');
if(!b){hd.insertAdjacentHTML('afterend','<div class="bk" id="bk"><button class="bkb" data-back></button></div>');b=$('#bk')}
b.firstChild.innerHTML=BK_SVG+'<span>'+L2('رجوع','Back')+'</span>';b.firstChild.setAttribute('aria-label',L2('رجوع للصفحة السابقة','Go back'))}
function goBack(){const thanks=!!$('#pg-th');let same=false;try{same=!!document.referrer&&new URL(document.referrer).origin==location.origin}catch(e){}
if(!thanks&&same&&history.length>1)history.back();else location.href=thanks?'shop.html':(ACTIVE=='shop'&&!/[?&]id=/.test(location.search)?'index.html':'shop.html')}
