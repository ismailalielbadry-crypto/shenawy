/* الصفحة الرئيسية */
boot('home',()=>{
setTitle('');
$('#ht').textContent=tr(S.cfg.ht);$('#hp').textContent=tr(S.cfg.hp);$('#hb').textContent=t('shop');
const hs=$('#hs');hs.textContent=L2('أحدث الأقسام','Browse categories');
const v=vis();
/* الأقسام */
let cs=S.cats.map(c=>({c,n:v.filter(p=>p.c==c.en).length,first:v.find(p=>p.c==c.en)})).filter(x=>x.n>0);
if(!cs.length)cs=S.cats.map(c=>({c,n:0,first:null}));
$('#tiles').innerHTML=cs.map(x=>`<a class="tile" href="shop.html?cat=${encodeURIComponent(x.c.en)}" style="--c:${x.first?cc(list(x.first.cl)[0]||'GREY'):'#222'}">${svg}<b>${esc(tr(x.c))}</b><small>${x.n} ${L2('منتج','items')}</small></a>`).join('');
$('#cat-sec').hidden=!cs.length;
$('#cat-t').textContent=L2('تسوق حسب القسم','Shop by category');
/* وصل حديثًا */
const nw=v.slice(0,8);
$('#new-sec').hidden=!nw.length;$('#new-t').textContent=L2('وصل حديثًا','New arrivals');$('#new-a').textContent=L2('عرض الكل','View all');$('#new-a').href='shop.html';
$('#new-g').innerHTML=nw.map(card).join('');
/* عروض */
const hot=v.filter(p=>p.s>0&&!isOut(p)).slice(0,8);
$('#hot-sec').hidden=!hot.length;$('#hot-t').textContent=t('hot');$('#hot-a').textContent=L2('عرض الكل','View all');$('#hot-a').href='shop.html?cat=HOT';
$('#hot-g').innerHTML=hot.map(card).join('');
/* دعوة للتواصل */
const wa=(S.cfg.wa||'').replace(/\D/g,'');
$('#cta').hidden=!wa;
if(wa)$('#cta').innerHTML=`<div><h2>${L2('محتاج مساعدة في المقاس أو الاختيار؟','Need help with size or style?')}</h2><p>${L2('كلمنا على واتساب ونرد عليك بسرعة.','Message us on WhatsApp.')}</p></div><a class="btn" href="https://wa.me/${wa}" target="_blank" rel="noopener noreferrer">${t('wa2')}</a>`;
});
