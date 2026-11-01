/* صفحة تتبع الطلب */
function timeline(s){if(s=='cancelled')return `<div class="hint" style="color:#b3282d">${cst(s)}</div>`;const st=['new','confirmed','shipped','delivered'],ix=Math.max(0,st.indexOf(s));
return `<div class="tl">${st.map((x,i)=>`<div class="${i<=ix?'on':''}"><i>${i<ix?'✓':i+1}</i><span>${cst(x)}</span></div>`).join('')}</div>`}
async function trackGo(){const id=($('#tid').value||'').trim().toUpperCase(),p4=($('#tp4').value||'').replace(/\D/g,'');const out=$('#tr');
if(!id)return toast(L2('اكتب رقم الطلب','Enter order number'));if(!db)return toast('...');out.innerHTML='<p class="mut">...</p>';
try{const d=await db.collection('track').doc(id).get();if(!d.exists||(d.data().p4&&p4!=d.data().p4)){out.innerHTML=`<p class="hint">${L2('مالقيناش طلب بالبيانات دي. اتأكد من الرقم وآخر 4 أرقام من الموبايل.','No order found. Check the number and last 4 digits.')}</p>`;return}
const o=d.data();out.innerHTML=`<p style="margin:14px 0 4px"><b>${esc(o.id)}</b> <small class="mut">${fmtD(o.t)}</small></p>${timeline(o.status)}<div class="mut" style="font-size:14px">${(o.items||[]).map(i=>`${esc(iname(i))} ×${esc(i.qty)}`).join('<br>')}</div><p><b>${L2('الإجمالي','Total')}: ${money(o.total||0)}</b> · ${esc(o.gov||'')}</p>`}
catch(e){out.innerHTML=`<p class="hint">${L2('تعذر التتبع الآن، جرّب بعد شوية.','Could not look up now.')}</p>`}}
function trkDraw(){
setTitle(L2('تتبع طلبك','Track your order'));
const u=new URLSearchParams(location.search),cur_id=($('#tid')&&$('#tid').value)||u.get('id')||'',cur_p4=($('#tp4')&&$('#tp4').value)||u.get('p4')||'',keep=$('#tr')?$('#tr').innerHTML:'';
const mine=nfMine().slice(0,6);
$('#pg-trk').innerHTML=`<div class="narrow tpad"><div class="pt" style="padding-inline:0"><h1>${L2('تتبع طلبك','Track your order')}</h1><p>${L2('اكتب رقم الطلب وآخر 4 أرقام من موبايلك.','Enter your order number and the last 4 digits of your phone.')}</p></div>
<div style="display:grid;gap:8px;margin-top:14px"><input id="tid" placeholder="${L2('رقم الطلب (مثال: ES-ABCD1234)','Order number (e.g. ES-ABCD1234)')}" value="${esc(cur_id)}" autocapitalize="characters" dir="ltr" style="text-align:start"><input id="tp4" inputmode="numeric" maxlength="4" value="${esc(cur_p4)}" placeholder="${L2('آخر 4 أرقام من رقم موبايلك','Last 4 digits of your phone')}" dir="ltr" style="text-align:start"><button class="btn dark" data-trk>${L2('تتبع','Track')}</button></div>
${mine.length?`<p class="mut" style="margin:18px 0 0;font-size:13px">${L2('طلباتك الأخيرة على الجهاز ده','Recent orders on this device')}</p><div class="myo">${mine.map(m=>`<button data-pick="${esc(m.id)}|${esc(m.p4||'')}" dir="ltr">${esc(m.id)}</button>`).join('')}</div>`:''}
<div id="tr">${keep}</div></div>`}
boot('track',trkDraw);
document.addEventListener('click',e=>{if(e.target.closest('[data-trk]')){trackGo();return}
const pk=e.target.closest('[data-pick]');if(pk){const[i,p]=pk.dataset.pick.split('|');$('#tid').value=i;$('#tp4').value=p;trackGo()}});
document.addEventListener('keydown',e=>{if(e.key=='Enter'&&(e.target.id=='tid'||e.target.id=='tp4'))trackGo()});
(function(){const u=new URLSearchParams(location.search);if(u.get('id')&&u.get('p4'))setTimeout(()=>{if($('#tid'))trackGo()},300)})();
