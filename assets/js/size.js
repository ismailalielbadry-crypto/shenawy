/* صفحة جدول المقاسات */
boot('size',()=>{
setTitle(t('sg'));
const rows=(S.cfg.sg||'').split('\n').map(r=>r.split(',').map(x=>x.trim())).filter(r=>r[0]);
$('#pg-sz').innerHTML=`<div class="narrow tpad"><div class="pt" style="padding-inline:0"><h1>${t('sg')}</h1><p>${t('sgn')}</p></div>
<table class="tbl"><tr><th>${t('sgs')}</th><th>${t('chest')}</th><th>${t('len')}</th></tr>${rows.map(r=>`<tr><td>${esc(r[0])}</td><td>${esc(r[1]||'')}</td><td>${esc(r[2]||'')}</td></tr>`).join('')}</table>
<div class="tips"><div><b>${L2('إزاي تقيس؟','How to measure')}</b>${L2('قِس عرض الصدر من تحت الإبط للإبط، والطول من أعلى الكتف لآخر القطعة. قارن بقطعة جاهزة عندك بتناسبك.','Measure chest width from armpit to armpit, and length from the top of the shoulder to the hem. Compare with a piece that fits you well.')}</div></div>
<p style="margin-top:20px"><a class="btn dark" href="shop.html">${L2('تسوق الآن','Shop now')}</a></p></div>`});
