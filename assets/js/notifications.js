/* صفحة الإشعارات */
const SEEN0=nfReadSet();           /* اللي كان مقروء قبل فتح الصفحة، علشان نبرز الجديد */
const NF_FIRST=LS.get('es_nfirst',0);
const nfIcon=n=>n.kind=='order'?({new:'🧾',confirmed:'✅',shipped:'🚚',delivered:'📦',cancelled:'✖️'}[n.st]||'🔔'):'📣';
const nfWhen=t=>{try{return new Date(t).toLocaleString(lang=='ar'?'ar-EG':'en-GB',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'})}catch(e){return''}};
function nfDraw(){
setTitle(L2('الإشعارات','Notifications'));
const perm=nfPerm();let sw;
if(perm=='unsupported')sw=`<b>${L2('تنبيهات المتصفح','Browser alerts')}</b><small>${L2('المتصفح ده مش بيدعم التنبيهات. هتلاقي كل جديد هنا.','This browser does not support alerts. You will still see everything here.')}</small>`;
else if(perm=='granted')sw=`<div><b>🔔 ${L2('تنبيهات المتصفح مفعّلة','Browser alerts are on')} <span class="ok">✓</span></b><small>${L2('هننبهك بتحديثات طلباتك والعروض الجديدة لما تفتح الموقع.','We will alert you about order updates and new offers when you open the site.')}</small></div><button class="btn dark out" style="background:none;color:var(--fg)" data-ntest>${L2('جرّب إشعار','Send a test')}</button>`;
else if(perm=='denied')sw=`<div><b>${L2('التنبيهات متوقفة من المتصفح','Alerts are blocked')}</b><small>${L2('فعّلها من إعدادات الموقع في المتصفح، وبعدها حدّث الصفحة. لسه هتشوف كل الإشعارات هنا.','Allow notifications in your browser site settings, then reload. You still see everything here.')}</small></div>`;
else sw=`<div><b>🔔 ${L2('فعّل تنبيهات المتصفح','Turn on browser alerts')}</b><small>${L2('عشان يوصلك إشعار لما حالة طلبك تتغير أو ينزل عرض جديد.','Get notified when your order status changes or a new offer drops.')}</small></div><button class="btn dark" data-nen>${L2('تفعيل','Enable')}</button>`;
const all=nfAll();
const un=n=>!SEEN0.has(n.id)&&(n.kind!='ann'||n.t>=NF_FIRST);
const items=all.map(n=>{const x=nfText(n),u=un(n),href=n.kind=='order'?x.url:safeLink(x.url),inner=`<span class="ic" aria-hidden="true">${nfIcon(n)}</span><span class="tx"><b>${esc(x.title)}</b>${x.body?`<p>${esc(x.body)}</p>`:''}<time>${esc(nfWhen(n.t))}</time></span>${u?'<i class="dot" aria-label="new"></i>':''}`;
return href?`<a class="ni${u?' un':''}" href="${href}">${inner}</a>`:`<div class="ni${u?' un':''}">${inner}</div>`}).join('');
$('#nf').innerHTML=`<div class="nwrap"><div class="pt" style="padding-inline:0"><h1>🔔 ${L2('الإشعارات','Notifications')}</h1><p>${L2('تحديثات طلباتك وعروض المتجر في مكان واحد.','Your order updates and store offers in one place.')}</p></div>
<div class="nsw">${sw}</div>
${all.length?`<div class="nbar"><span>${all.length} ${L2('إشعار','notifications')}</span><button data-nclear>${L2('مسح الكل','Clear all')}</button></div><div class="nl">${items}</div>`
:`<div class="empty"><span class="em">🔔</span><h2>${L2('مفيش إشعارات لسه','No notifications yet')}</h2><p>${L2('لما حالة طلبك تتغير أو ننزل عرض جديد هتلاقيه هنا.','Order updates and new offers will show up here.')}</p><a class="btn dark" href="shop.html">${L2('تسوق الآن','Shop now')}</a></div>`}</div>`;
nfMarkAll()}
boot('notifications',nfDraw);
window.onNotifs=nfDraw;
document.addEventListener('click',async e=>{
if(e.target.closest('[data-nen]')){const p=await nfEnable();if(p=='granted')toast(L2('تم تفعيل التنبيهات','Alerts enabled'));else if(p=='denied')toast(L2('اتمنعت من المتصفح','Blocked by the browser'));nfDraw()}
else if(e.target.closest('[data-ntest]')){sysNotify({title:'El Shenawy Mens Wear',body:L2('التنبيهات شغالة ✓','Alerts are working ✓'),url:'notifications.html'},'test')}
else if(e.target.closest('[data-nclear]')){nfClear();nfDraw()}});
