/* صفحة المنتج */
const PID=+new URLSearchParams(location.search).get('id');
let cur=null,sel=null,added=false;
function initSel(){const cs=list(cur.cl),ss=list(cur.sz),ac=cs.filter(c=>!outC(cur,c)),as=ss.filter(s=>!outS(cur,s));
sel={c:ac[0]||cs[0],s:(ss[1]&&!outS(cur,ss[1]))?ss[1]:(as[0]||ss[0]),q:1,i:0}}
function pdDraw(){
cur=S.prods.find(p=>p.id==PID&&!p.hide);
const root=$('#pd');
if(!cur){setTitle(L2('منتج غير موجود','Product not found'));root.innerHTML=`<div class="empty"><span class="em">🧥</span><h2>${L2('المنتج ده مش متاح','This product is not available')}</h2><p>${L2('ممكن يكون اتشال أو الرابط غلط.','It may have been removed, or the link is wrong.')}</p><a class="btn dark" href="shop.html">${L2('تصفح المتجر','Browse the shop')}</a></div>`;return}
if(!sel||sel.pid!==cur.id){initSel();sel.pid=cur.id;added=false}
const p=cur,im=p.imgs||[],out=isOut(p);
setTitle(tr(p.n));
const rel=vis().filter(x=>x.id!=p.id&&x.c==p.c).slice(0,4);
const more=rel.length?rel:vis().filter(x=>x.id!=p.id).slice(0,4);
root.innerHTML=`<nav class="crumbs" aria-label="breadcrumb"><a href="index.html">${L2('الرئيسية','Home')}</a><span>/</span><a href="shop.html">${L2('المتجر','Shop')}</a><span>/</span><a href="shop.html?cat=${encodeURIComponent(p.c)}">${esc(cname(p.c))}</a></nav>
<div class="pdp"><div class="gal">${ph(p,sel.c,tags(p),sel.i)}${im.length>1?`<div class="th">${im.map((m,k)=>`<button data-i="${k}" class="${k==sel.i?'on':''}" aria-label="Photo ${k+1}">${ph(p,sel.c,'',k)}</button>`).join('')}</div>`:''}</div>
<div class="md"><div class="ta">${heart(p.id)}<button class="shr" data-sh="${p.id}" aria-label="${L2('مشاركة','Share')}">${SHARE}<span>${L2('مشاركة','Share')}</span></button></div>
<h1>${esc(tr(p.n))}</h1><div class="pri">${pr(p)}</div>
<p><small>${t('cl')}: ${esc(sel.c||'')}</small></p><div class="opt">${list(p.cl).map(c=>`<button class="${c==sel.c?'on':''}" data-c="${esc(c)}"${outC(p,c)?' disabled':''}>${esc(c)}</button>`).join('')}</div>
<small>${t('sz')}</small><div class="opt">${list(p.sz).map(s=>`<button class="${s==sel.s?'on':''}" data-s="${esc(s)}"${outS(p,s)?' disabled':''}>${esc(s)}</button>`).join('')}</div>
<a class="lnk" href="size-guide.html">${t('sg')}</a>
<div class="qrow"><small>${L2('الكمية','Quantity')}</small><div class="opt"><button data-q="-1" aria-label="-">−</button><span>${sel.q}</span><button data-q="1" aria-label="+">+</button></div></div>
${out?`<button class="btn dark" disabled style="opacity:.4">${t('so')}</button>`:`<div class="acts"><button class="btn dark" data-add>${t('add')}</button><button class="btn dark ghost" data-buy>${L2('اشتري الآن','Buy now')}</button></div>`}
<div class="addok${added?' on':''}" role="status"><span>✓ ${t('added')}</span><a href="cart.html">${L2('عرض السلة','View cart')} ←</a></div>
<div class="tb"><div><b>💵 ${L2('الدفع عند الاستلام','Cash on delivery')}</b><small>${L2('افحص الطلب قبل ما تدفع','Inspect before you pay')}</small></div><div><b>🚚 ${L2('شحن لكل مصر','Shipping across Egypt')}</b><small>${L2('لكل المحافظات','All governorates')}</small></div><div><b>🔁 ${L2('استبدال واسترجاع','Exchange & returns')}</b><small>${L2('حسب السياسة','See policy')}</small></div></div>
<a class="lnk" href="policies.html#ret">${L2('تفاصيل الاستبدال والشحن','Exchange & shipping details')}</a></div></div>
${more.length?`<section class="sect"><div class="sh2"><h2>${rel.length?L2('منتجات مشابهة','You may also like'):L2('اكتشف المزيد','Discover more')}</h2><a href="shop.html">${L2('عرض الكل','View all')}</a></div><div class="grid in">${more.map(card).join('')}</div></section>`:''}`}
boot('shop',pdDraw);
window.onFavChange=()=>{};
document.addEventListener('click',e=>{const el=e.target.closest('button');if(!el||!cur||!el.closest('#pd'))return;const d=el.dataset;
if(d.i!==undefined){sel.i=+d.i;pdDraw()}
else if(d.c){sel.c=d.c;pdDraw()}else if(d.s){sel.s=d.s;pdDraw()}
else if(d.q){sel.q=Math.max(1,sel.q+ +d.q);pdDraw()}
else if('add'in d||'buy'in d){if(isOut(cur)||outC(cur,sel.c)||outS(cur,sel.s))return;addToCart(cur,sel.c,sel.s,sel.q);
 if('buy'in d){location.href='cart.html';return}
 added=true;pdDraw();openCartDr()}});
