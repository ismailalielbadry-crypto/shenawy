/* صفحة السلة وإتمام الطلب */
function cartDraw(){
setTitle(L2('السلة','Cart'));
if(REMOTE.state=='ok'){cart=cart.filter(i=>P(i));LS.set('es_cart',cart);updBadges()}
const T=totals(),root=$('#pg-cart'),hh=`<div class="pt"><h1>${t('cart')}</h1></div>`;
if(!T.L.length){root.innerHTML=hh+`<div class="empty"><span class="em">🛒</span><h2>${t('empty')}</h2><p>${L2('ابدأ بإضافة منتجات من المتجر.','Add something from the shop.')}</p><a class="btn dark" href="shop.html">${L2('تسوق الآن','Shop now')}</a></div>`;return}
const items=T.L.map(({i,p},k)=>`<div class="ci"><a href="product.html?id=${p.id}">${ph(p,i.col)}</a><div style="flex:1"><a href="product.html?id=${p.id}"><b>${esc(tr(p.n))}</b></a><br><small>${esc(i.col||'')} / ${esc(i.size||'')}</small><br>${money(price(p)*i.q)}<div class="qb"><button data-cq="${cart.indexOf(i)}|-1" aria-label="-">−</button><span>${i.q}</span><button data-cq="${cart.indexOf(i)}|1" aria-label="+">+</button></div></div><button data-rm="${cart.indexOf(i)}" aria-label="Remove">🗑</button></div>`).join('');
let h='';
if(S.cfg.b2g1&&T.units%3==2)h+=`<div class="hint">🎁 ${t('hint21')}</div>`;
if(+S.cfg.free>0&&T.after<+S.cfg.free)h+=`<div class="hint">🚚 ${t('hintfree').replace('{x}',money(+S.cfg.free-T.after))}</div>`;
h+=`<div class="sm"><div><span>${t('sub')}</span><span>${money(T.sub)}</span></div>${T.free?`<div class="gr"><span>${t('gift')}</span><span>-${money(T.free)}</span></div>`:''}<div><span>${t('ship')}</span><span>${T.ship==null?t('pickgov'):T.ship==0?t('freeship'):money(T.ship)}</span></div><div class="tt"><b>${t('total')}</b><b>${money(T.total)}</b></div></div>`;
h+=`<div class="formg"><input id="cn2" placeholder="${t('nm')}" value="${esc(cust.n)}" autocomplete="name"><input id="cp" type="tel" placeholder="${t('ph')}" value="${esc(cust.p)}" autocomplete="tel"><select id="cg" aria-label="${t('gov')}"><option value="">${t('gov')}</option>${GOV.map((g,k)=>`<option value="${k}"${cust.g==k?' selected':''}>${g[lang=='ar'?0:1]}</option>`).join('')}</select><input id="ca" placeholder="${t('ad')}" value="${esc(cust.a)}" autocomplete="street-address"></div><button class="btn dark red" data-co>${t('co')}</button><p class="hint">💵 ${L2('الدفع عند الاستلام. هيتفتح واتساب برسالة الطلب، ابعتها عشان الطلب يتأكد.','Cash on delivery. WhatsApp opens with your order; send it to confirm.')}</p>`;
root.innerHTML=hh+`<div class="cartpg"><div class="lines">${items}</div><div class="side card">${h}</div></div>`}
boot('cart',cartDraw);

async function checkout(btn){const T=totals();if(!T.L.length)return;
const n=cust.n.trim(),a=cust.a.trim();
if(!n||!cust.p.trim()||!a||cust.g<0)return toast(t('need'));
const ph0=normPhone(cust.p);if(!ph0)return toast(t('badphone'));
const wa=(S.cfg.wa||'').replace(/\D/g,'');if(!wa)return toast(t('nowa'));
const gn=GOV[cust.g][lang=='ar'?0:1],id='ES-'+Array.from(crypto.getRandomValues(new Uint8Array(8)),b=>'ABCDEFGHJKMNPQRSTUVWXYZ23456789'[b%31]).join('');
const lines=T.L.map((x,k)=>`${k+1}) ${tr(x.p.n)}\n    ${t('cl')}: ${x.i.col||'-'} | ${t('sz')}: ${x.i.size||'-'} | x${x.i.q}\n    ${money(price(x.p)*x.i.q)}`).join('\n');
const m=`*${lang=='ar'?'طلب جديد من الموقع':'New order from the website'}* ${id}\nEl Shenawy Mens Wear\n\n${t('nm')}: ${n}\n${t('ph')}: ${ph0}\n${t('gov')}: ${gn}\n${t('ad')}: ${a}\n\n${lines}\n\n${t('sub')}: ${money(T.sub)}\n`+(T.free?`${t('gift')}: -${money(T.free)}\n`:'')+`${t('ship')}: ${T.ship?money(T.ship):t('freeship')}\n*${t('total')}: ${money(T.total)}*\n${lang=='ar'?'الدفع عند الاستلام':'Cash on delivery'}`;
const url='https://wa.me/'+wa+'?text='+encodeURIComponent(m);
btn.disabled=true;
sendHook({id,time:new Date().toISOString(),name:n,phone:ph0,governorate:GOV[cust.g][1],address:a,items:T.L.map(x=>({name:x.p.n.en,color:x.i.col,size:x.i.size,qty:x.i.q,unit:Math.round(price(x.p))})),subtotal:Math.round(T.sub),freeItems:Math.round(T.free),shipping:T.ship,total:Math.round(T.total)});
const saved=saveOrder({id,t:Date.now(),name:n,phone:ph0,gov:GOV[cust.g][1],address:a,items:T.L.map(x=>({name:x.p.n.en,na:x.p.n.ar||'',color:x.i.col||'',size:x.i.size||'',qty:x.i.q,unit:Math.round(price(x.p))})),subtotal:Math.round(T.sub),free:Math.round(T.free),shipping:T.ship||0,total:Math.round(T.total),status:'new'});
track('InitiateCheckout',{value:Math.round(T.total),currency:'EGP'});
window.open(url,'_blank');
/* نسجل الطلب عند العميل علشان الإشعارات والتتبع */
addMine(id,ph0.slice(-4),Date.now());nfAdd({id:'o:'+id+':new',t:Date.now(),kind:'order',oid:id,st:'new',p4:ph0.slice(-4)});const seen=LS.get('es_ost',{})||{};seen[id]='new';LS.set('es_ost',seen);
try{sessionStorage.setItem('es_last',JSON.stringify({id,url,p4:ph0.slice(-4)}))}catch(e){}
await Promise.race([saved,new Promise(r=>setTimeout(r,5000))]);
cart=[];cartSave();location.href='thanks.html?id='+encodeURIComponent(id)}
document.addEventListener('click',e=>{const el=e.target.closest('button');if(!el||!el.closest('#pg-cart'))return;const d=el.dataset;
if(d.cq){const[k,dl]=d.cq.split('|').map(Number),it=cart[k];if(it){it.q+=dl;if(it.q<1)cart.splice(k,1);cartSave();cartDraw()}}
else if(d.rm){cart.splice(+d.rm,1);cartSave();cartDraw()}
else if('co'in d)checkout(el)});
document.addEventListener('input',e=>{const id=e.target.id;if(id=='cn2'||id=='cp'||id=='ca')cust[{cn2:'n',cp:'p',ca:'a'}[id]]=e.target.value,saveCust()});
document.addEventListener('change',e=>{if(e.target.id=='cg'){cust.g=e.target.value===''?-1:+e.target.value;saveCust();cartDraw()}});
window.onProfile=()=>{if($('#cn2'))cartDraw()};
