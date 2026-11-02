/* صفحة السلة وإتمام الطلب */
let COBUSY=false;
/* تحويل العميل لصفحة الدخول مع الرجوع للسلة بعد الدخول (السلة والبيانات محفوظة في المتصفح) */
function goLogin(mode){LS.set('es_next','cart.html');location.href='account.html?next=cart.html'+(mode=='up'?'&mode=up':'')}
function cartDraw(){
setTitle(L2('السلة','Cart'));
if(REMOTE.state=='ok'){cart=cart.filter(i=>P(i));LS.set('es_cart',cart);updBadges()}
const T=totals(),root=$('#pg-cart'),hh=`<div class="pt"><h1>${t('cart')}</h1></div>`;
if(!T.L.length){root.innerHTML=hh+`<div class="empty"><span class="em">🛒</span><h2>${t('empty')}</h2><p>${L2('ابدأ بإضافة منتجات من المتجر.','Add something from the shop.')}</p><a class="btn dark" href="shop.html">${L2('تسوق الآن','Shop now')}</a></div>`;return}
const items=T.L.map(({i,p},k)=>`<div class="ci"><a href="product.html?id=${p.id}">${ph(p,i.col)}</a><div style="flex:1"><a href="product.html?id=${p.id}"><b>${esc(tr(p.n))}</b></a><br><small>${esc(i.col||'')} / ${esc(i.size||'')}</small><br>${money(price(p)*i.q)}<div class="qb"><button data-cq="${cart.indexOf(i)}|-1" aria-label="-">−</button><span>${i.q}</span><button data-cq="${cart.indexOf(i)}|1" aria-label="+">+</button></div></div><button data-rm="${cart.indexOf(i)}" aria-label="Remove">🗑</button></div>`).join('');
const coBtn=!AUTH.done?`<button class="btn dark red" disabled>...</button>`:!user?`<div class="hint">🔒 ${L2('لازم تسجّل دخول أو تنشئ حساب قبل إتمام الطلب. السلة وبياناتك هتفضل محفوظة.','Please sign in or create an account to place your order. Your cart and details will be kept.')}</div><button class="btn dark red" data-login="in">${L2('تسجيل الدخول لإتمام الطلب','Sign in to checkout')}</button><button class="btn dark out" style="background:none;color:var(--fg);margin-top:8px" data-login="up">${L2('إنشاء حساب جديد','Create an account')}</button>`:`<button class="btn dark red" data-co${COBUSY?' disabled':''}>${t('co')}</button>`;
let h='';
if(S.cfg.b2g1&&T.units%3==2)h+=`<div class="hint">🎁 ${t('hint21')}</div>`;
if(+S.cfg.free>0&&T.after<+S.cfg.free)h+=`<div class="hint">🚚 ${t('hintfree').replace('{x}',money(+S.cfg.free-T.after))}</div>`;
h+=`<div class="sm"><div><span>${t('sub')}</span><span>${money(T.sub)}</span></div>${T.free?`<div class="gr"><span>${t('gift')}</span><span>-${money(T.free)}</span></div>`:''}${T.disc?`<div class="gr"><span>${t('cpnd')} ${esc(T.cpn)}</span><span>-${money(T.disc)}</span></div>`:''}<div><span>${t('ship')}</span><span>${T.ship==null?t('pickgov'):T.ship==0?t('freeship'):money(T.ship)}</span></div><div class="tt"><b>${t('total')}</b><b>${money(T.total)}</b></div></div>`;
const cmsg=T.cerr&&T.cerr.err?`<div class="hint cpe">${t(T.cerr.err).replace('{x}',money(T.cerr.need||0))}</div>`:T.disc?`<div class="hint cpo">✓ ${t('cpnok')}</div>`:'';
if(S.cfg.coupons&&couponList().length)h+=`<div class="cpn"><div class="cpr"><input id="cpi" placeholder="${t('cpn')}" value="${esc(CPN)}" autocapitalize="characters" autocomplete="off" dir="ltr"><button class="btn dark" data-cpa>${t('cpnap')}</button>${CPN?`<button class="btn out" data-cpr aria-label="${t('cpnrm')}">×</button>`:''}</div>${cmsg}</div>`;
h+=`<div class="formg"><input id="cn2" placeholder="${t('nm')}" value="${esc(cust.n)}" autocomplete="name"><input id="cp" type="tel" placeholder="${t('ph')}" value="${esc(cust.p)}" autocomplete="tel"><select id="cg" aria-label="${t('gov')}"><option value="">${t('gov')}</option>${GOV.map((g,k)=>`<option value="${k}"${cust.g==k?' selected':''}>${g[lang=='ar'?0:1]}</option>`).join('')}</select><input id="ca" placeholder="${t('ad')}" value="${esc(cust.a)}" autocomplete="street-address"></div>${coBtn}<p class="hint">💵 ${L2('الدفع عند الاستلام. هيتفتح واتساب برسالة الطلب، ابعتها عشان الطلب يتأكد.','Cash on delivery. WhatsApp opens with your order; send it to confirm.')}</p>`;
root.innerHTML=hh+`<div class="cartpg"><div class="lines">${items}${pairHtml(null,3)}</div><div class="side card">${h}</div></div>`}
boot('cart',cartDraw);

async function checkout(btn){
if(COBUSY)return;
/* إجبار تسجيل الدخول قبل الطلب */
if(!AUTH.done)return;
if(!user)return goLogin('in');
const T=totals();if(!T.L.length)return;
const n=cust.n.trim(),a=cust.a.trim();
if(!n||!cust.p.trim()||!a||cust.g<0)return toast(t('need'));
const ph0=normPhone(cust.p);if(!ph0)return toast(t('badphone'));
const wa=(S.cfg.wa||'').replace(/\D/g,'');if(!wa)return toast(t('nowa'));
COBUSY=true;if(btn)btn.disabled=true;
try{
const gn=GOV[cust.g][lang=='ar'?0:1];
/* كل الأرقام بتتحسب مرة واحدة من نفس اللقطة، ونفس القيم بتروح للواتساب وقاعدة البيانات */
const sub=Math.round(T.sub),free=Math.round(T.free),disc=Math.round(T.disc),cpn=T.cpn,ship=T.ship||0,total=Math.round(T.total);
/* رقم الطلب ثابت لنفس السلة والبيانات: لو العميل رجع وحاول تاني مش هيتعمل طلب جديد */
const sig=JSON.stringify([user.uid,T.L.map(x=>[x.i.id,x.i.col||'',x.i.size||'',x.i.q]),cust.g,ph0,n,a,total,cpn]);
let rec=LS.get('es_co',null);
if(!rec||rec.sig!=sig||Date.now()-rec.t>30*60*1000)rec={sig,t:Date.now(),id:'ES-'+Array.from(crypto.getRandomValues(new Uint8Array(8)),b=>'ABCDEFGHJKMNPQRSTUVWXYZ23456789'[b%31]).join(''),hook:0};
LS.set('es_co',rec);const id=rec.id;
const lines=T.L.map((x,k)=>`${k+1}) ${tr(x.p.n)}\n    ${t('cl')}: ${x.i.col||'-'} | ${t('sz')}: ${x.i.size||'-'} | x${x.i.q}\n    ${money(price(x.p)*x.i.q)}`).join('\n');
const m=`*${lang=='ar'?'طلب جديد من الموقع':'New order from the website'}* ${id}\nEl Shenawy Mens Wear\n\n${t('nm')}: ${n}\n${t('ph')}: ${ph0}\n${t('gov')}: ${gn}\n${t('ad')}: ${a}\n\n${lines}\n\n${t('sub')}: ${money(sub)}\n`+(free?`${t('gift')}: -${money(free)}\n`:'')+(disc?`${t('cpnd')} ${cpn}: -${money(disc)}\n`:'')+`${t('ship')}: ${ship?money(ship):t('freeship')}\n*${t('total')}: ${money(total)}*\n${lang=='ar'?'الدفع عند الاستلام':'Cash on delivery'}`;
const url='https://wa.me/'+wa+'?text='+encodeURIComponent(m);
const items=T.L.map(x=>({name:x.p.n.en,na:x.p.n.ar||'',color:x.i.col||'',size:x.i.size||'',qty:x.i.q,unit:Math.round(price(x.p))}));
/* الويب هوك بيتبعت مرة واحدة بس لكل رقم طلب */
if(!rec.hook){rec.hook=1;LS.set('es_co',rec);sendHook({id,time:new Date().toISOString(),name:n,phone:ph0,governorate:GOV[cust.g][1],address:a,items:items.map(x=>({name:x.name,color:x.color,size:x.size,qty:x.qty,unit:x.unit})),subtotal:sub,freeItems:free,coupon:cpn,couponDiscount:disc,shipping:ship,total})}
/* تسجيل الطلب: المستند بنفس رقم الطلب، فمستحيل يتكرر (القواعد بتمنع التعديل) */
const saved=saveOrder({id,t:Date.now(),name:n,phone:ph0,gov:GOV[cust.g][1],address:a,items,subtotal:sub,free,coupon:cpn,discount:disc,shipping:ship,total,status:'new'});
track('InitiateCheckout',{value:total,currency:'EGP'});
window.open(url,'_blank');
/* نسجل الطلب عند العميل علشان الإشعارات والتتبع */
addMine(id,ph0.slice(-4),Date.now());nfAdd({id:'o:'+id+':new',t:Date.now(),kind:'order',oid:id,st:'new',p4:ph0.slice(-4)});const seen=LS.get('es_ost',{})||{};seen[id]='new';LS.set('es_ost',seen);
try{sessionStorage.setItem('es_last',JSON.stringify({id,url,p4:ph0.slice(-4)}))}catch(e){}
await Promise.race([saved,new Promise(r=>setTimeout(r,5000))]);
cart=[];cartSave();
location.href='thanks.html?id='+encodeURIComponent(id)
}catch(e){console.error(e);COBUSY=false;if(btn)btn.disabled=false;toast(L2('حصل خطأ، جرّب تاني','Something went wrong, try again'))}}
document.addEventListener('click',e=>{const el=e.target.closest('button');if(!el||!el.closest('#pg-cart'))return;const d=el.dataset;
if(d.cq){const[k,dl]=d.cq.split('|').map(Number),it=cart[k];if(it){it.q+=dl;if(it.q<1)cart.splice(k,1);cartSave();cartDraw()}}
else if(d.rm){cart.splice(+d.rm,1);cartSave();cartDraw()}
else if('co'in d)checkout(el)
else if('cpa'in d){setCoupon($('#cpi').value);cartDraw()}
else if('cpr'in d){setCoupon('');cartDraw()}
else if(d.login)goLogin(d.login)});
document.addEventListener('keydown',e=>{if(e.key=='Enter'&&e.target.id=='cpi'){e.preventDefault();const b=$('[data-cpa]');if(b)b.click()}});
document.addEventListener('input',e=>{const id=e.target.id;if(id=='cn2'||id=='cp'||id=='ca')cust[{cn2:'n',cp:'p',ca:'a'}[id]]=e.target.value,saveCust()});
document.addEventListener('change',e=>{if(e.target.id=='cg'){cust.g=e.target.value===''?-1:+e.target.value;saveCust();cartDraw()}});
window.onProfile=()=>{if($('#cn2'))cartDraw()};
onUser(()=>{const r=$('#pg-cart');if(S&&r&&r.innerHTML&&!COBUSY)cartDraw()});
