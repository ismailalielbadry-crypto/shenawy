/* صفحة المتجر: بحث ذكي + أقسام + ترتيب */
let cat='All',q='',sdAct=-1,sdRes=[];
(function(){const u=new URLSearchParams(location.search);cat=u.get('cat')||'All';q=(u.get('q')||'').trim().toLowerCase();const e=$('#sq');if(e)e.value=u.get('q')||''})();
const sdEl=$('#sd');
function syncUrl(){const u=new URLSearchParams();if(cat!='All')u.set('cat',cat);history.replaceState(null,'',location.pathname+(u.toString()?'?'+u:''))}
function shopDraw(){
if(cat!='All'&&cat!='HOT'&&!S.cats.some(c=>c.en==cat))cat='All';
$('#sq').placeholder='🔍 '+t('search');
const so=+($('#sort').value||0);$('#sort').innerHTML=t('sort').map((x,i)=>`<option value="${i}"${i==so?' selected':''}>${x}</option>`).join('');
let l=vis().filter(p=>cat=='All'||(cat=='HOT'?p.s>0:p.c==cat));
let rk=null;if(q){const sm=smart(l,q);rk=new Map(sm.map((x,i)=>[x.p.id,i]));l=sm.map(x=>x.p)}
l=[...l].sort((a,b)=>so==1?price(a)-price(b):so==2?price(b)-price(a):so==3?tr(a.n).localeCompare(tr(b.n),lang):rk?rk.get(a.id)-rk.get(b.id):0);
$('#cnt').textContent=l.length+t('n');
$('#h1').textContent=cat=='All'?L2('المتجر','Shop'):cname(cat);
$('#grid').innerHTML=l.length?l.map(card).join(''):`<div class="empty" style="grid-column:1/-1"><span class="em">🔎</span><h2>${t('none')}</h2></div>`;
$('#cats').innerHTML=['All','HOT',...S.cats.map(c=>c.en)].map(c=>`<button class="${c==cat?'on':''}" data-cat="${esc(c)}">${esc(cname(c))}</button>`).join('');
setTitle(cat=='All'?L2('المتجر','Shop'):cname(cat))}
boot('shop',shopDraw);
$('#sort').onchange=shopDraw;
document.addEventListener('click',e=>{const b=e.target.closest('[data-cat]');if(b&&b.closest('#cats')){cat=b.dataset.cat;syncUrl();shopDraw();return}
if(e.target.closest('[data-sall]')){sdEl.classList.remove('on');$('#cats').scrollIntoView({behavior:'smooth'});return}
if(!e.target.closest('.sb'))sdEl.classList.remove('on')},true);

/* قائمة نتائج البحث المنسدلة */
function sdrop(){const qq=($('#sq').value||'').trim();if(!qq){sdEl.classList.remove('on');sdEl.innerHTML='';sdRes=[];return}
const L=lang=='ar',res=smart(vis(),qq);sdRes=res;sdAct=-1;
if(!res.length){sdEl.innerHTML=`<div class="sn">${L?'مفيش نتايج لـ':'No results for'} "${esc(qq)}"<br><small>${L?'جرّب كلمة تانية زي: بلوفر، هودي، اسود':'Try: pullover, hoodie, black'}</small></div>`;sdEl.classList.add('on');return}
const top=res.slice(0,6);
sdEl.innerHTML=(res[0].part?`<div class="sh">${L?'نتايج قريبة':'Similar results'}</div>`:'')+top.map(({p})=>`<a class="sr" href="product.html?id=${p.id}"><div class="st2">${ph(p,0)}</div><div class="si"><b>${hl(tr(p.n),qq)}</b><small>${esc(cname(p.c))}${isOut(p)?' · '+(L?'نفدت الكمية':'Sold out'):''}</small><span>${money(price(p))}</span>${p.s>0?` <small style="display:inline;text-decoration:line-through">${money(p.p)}</small>`:''}</div></a>`).join('')+(res.length>top.length?`<button class="sa" data-sall>${L?'عرض كل النتايج':'Show all results'} (${res.length})</button>`:'');
sdEl.classList.add('on')}
document.addEventListener('input',e=>{if(e.target.id=='sq'){q=e.target.value.trim().toLowerCase();shopDraw();sdrop()}});
document.addEventListener('focusin',e=>{if(e.target.id=='sq')sdrop()});
document.addEventListener('keydown',e=>{if(e.target.id!='sq')return;const rows=[...sdEl.querySelectorAll('.sr')];
if(e.key=='ArrowDown'||e.key=='ArrowUp'){if(!rows.length)return;e.preventDefault();sdAct=(sdAct+(e.key=='ArrowDown'?1:-1)+rows.length)%rows.length;rows.forEach((r,i)=>r.classList.toggle('act',i==sdAct))}
else if(e.key=='Enter'){e.preventDefault();if(sdAct>=0&&rows[sdAct])location.href=rows[sdAct].href;else{sdEl.classList.remove('on');$('#cats').scrollIntoView({behavior:'smooth'})}}
else if(e.key=='Escape')sdEl.classList.remove('on')});
