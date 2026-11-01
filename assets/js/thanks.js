/* صفحة تم تجهيز الطلب */
boot('cart',()=>{
setTitle(L2('تم تجهيز طلبك','Order ready'));
const id=(new URLSearchParams(location.search).get('id')||'').toUpperCase();let last=null;
try{last=JSON.parse(sessionStorage.getItem('es_last')||'null')}catch(e){}
if(!id){$('#pg-th').innerHTML=`<div class="empty"><span class="em">📦</span><h2>${L2('مفيش طلب لعرضه','No order to show')}</h2><a class="btn dark" href="shop.html">${L2('تسوق الآن','Shop now')}</a></div>`;return}
const wa=last&&last.id==id?last.url:'';
$('#pg-th').innerHTML=`<div class="done"><div class="ck">✓</div><h1 style="margin:0 0 6px">${t('thanks')}</h1><p class="mut">${t('ordno')}</p><div class="oid" dir="ltr"><b>${esc(id)}</b></div><p>${t('thanks2')}</p><div class="btns">${wa?`<a class="btn dark" href="${esc(wa)}" target="_blank" rel="noopener noreferrer">${t('reopen')}</a>`:''}<a class="btn dark out" style="background:none;color:var(--fg)" href="track.html?id=${encodeURIComponent(id)}${last&&last.p4?'&p4='+encodeURIComponent(last.p4):''}">${L2('تتبع الطلب','Track order')}</a><a class="btn dark out" style="background:none;color:var(--fg)" href="notifications.html">🔔 ${L2('فعّل إشعارات الطلب','Get order notifications')}</a><a class="btn dark out" style="background:none;color:var(--fg)" href="shop.html">${L2('كمّل تسوق','Continue shopping')}</a></div></div>`});
