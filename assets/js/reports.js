/* =====================================================================
   تقارير المبيعات والطلبات (تبويب "التقارير" في admin.html)
   - فترات: النهاردة / 7 أيام / 30 يوم / الشهر ده / الكل / تاريخ مخصص
   - ملخص + مبيعات حسب اليوم أو الشهر + المنتجات الأكثر مبيعًا + المحافظات
   - تصدير CSV وطباعة / PDF
   ===================================================================== */
const RP={pre:'30',from:'',to:'',basis:'live',data:null,more:0,rmore:0,capped:0};
const RP_LIMIT=5000;
const R2=(a,e)=>lang=='ar'?a:e;

const csvQ=v=>{let s=String(v??'');if(typeof v!='number'&&/^[=+\-@]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"'};
function csvDownload(rows,name){
  const b=new Blob(['\ufeff'+rows.map(r=>r.map(csvQ).join(',')).join('\n')],{type:'text/csv;charset=utf-8'}),u=URL.createObjectURL(b),a=document.createElement('a');
  a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2000)
}

/* ---- حساب حدود الفترة (بتوقيت الجهاز) ---- */
const dStart=d=>{const x=new Date(d);x.setHours(0,0,0,0);return x.getTime()};
const dEnd=d=>{const x=new Date(d);x.setHours(23,59,59,999);return x.getTime()};
function rpRange(){
  const now=new Date(),p=RP.pre;
  if(p=='today')return[dStart(now),dEnd(now)];
  if(p=='7'||p=='30'){const s=new Date(now);s.setDate(s.getDate()-(+p-1));return[dStart(s),dEnd(now)]}
  if(p=='month')return[dStart(new Date(now.getFullYear(),now.getMonth(),1)),dEnd(now)];
  if(p=='custom'){
    const f=RP.from?dStart(RP.from+'T00:00:00'):0,t=RP.to?dEnd(RP.to+'T00:00:00'):0;
    return[f||0,t||0]
  }
  return[0,0]
}
function rpLabel(){
  const[f,t]=rpRange(),fm=x=>new Date(x).toLocaleDateString(lang=='ar'?'ar-EG':'en-GB');
  if(RP.pre=='all')return R2('كل الفترات','All time');
  if(f&&t)return fm(f)+' → '+fm(t);
  if(f)return R2('من ','From ')+fm(f);
  if(t)return R2('حتى ','Until ')+fm(t);
  return R2('كل الفترات','All time')
}

/* ---- تحميل الطلبات من Firestore حسب الفترة ---- */
async function loadReport(){
  RP.data=null;RP.capped=0;RP.more=0;RP.rmore=0;
  if(tab=='r'&&$('#adm').classList.contains('on'))drawAdm();
  if(!db||!user){RP.data=[];drawAdm();return}
  try{
    const[f,t]=rpRange();let q=db.collection('orders');
    if(f)q=q.where('t','>=',f);if(t)q=q.where('t','<=',t);
    const s=await q.orderBy('t','desc').limit(RP_LIMIT).get();
    RP.data=s.docs.map(d=>({_id:d.id,...d.data()}));RP.capped=s.size>=RP_LIMIT?1:0
  }catch(e){RP.data=[];toast(t_fail(e))}
  if(tab=='r'&&$('#adm').classList.contains('on'))drawAdm()
}
const t_fail=e=>(typeof t=='function'?t('fail'):'')+((e&&e.code)||'');

/* ---- الحسابات ---- */
const rpCounted=o=>RP.basis=='deliv'?o.status=='delivered':o.status!='cancelled'&&o.status!='returned';
const dayKey=ms=>{const d=new Date(ms);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
function rpCalc(list){
  const ok=list.filter(rpCounted);
  const rev=ok.reduce((a,o)=>a+(+o.total||0),0),ship=ok.reduce((a,o)=>a+(+o.shipping||0),0);
  const items=ok.reduce((a,o)=>a+(o.items||[]).reduce((x,i)=>x+(+i.qty||0),0),0);
  const canc=list.filter(o=>o.status=='cancelled').length;
  /* المرتجعات: العدد والقيمة والأسباب */
  const rets=list.filter(o=>o.status=='returned').sort((a,b)=>(+b.t||0)-(+a.t||0)),retVal=rets.reduce((a,o)=>a+(+o.total||0),0),rm={};
  rets.forEach(o=>{const k=String(o.rr||'').trim()||'-';const e=rm[k]||(rm[k]={r:k,n:0,val:0});e.n++;e.val+=+o.total||0});
  const reasons=Object.values(rm).sort((a,b)=>b.n-a.n||b.val-a.val);
  const byStatus={};list.forEach(o=>{const k=ST[o.status]?o.status:'new';byStatus[k]=(byStatus[k]||0)+1});
  /* مبيعات حسب اليوم (لو الفترة ≤ 31 يوم) أو حسب الشهر */
  let series=[];
  if(ok.length){
    const ts=ok.map(o=>+o.t||0),span=(Math.max(...ts)-Math.min(...ts))/864e5,byDay=span<=31,m={};
    ok.forEach(o=>{const k=byDay?dayKey(o.t):dayKey(o.t).slice(0,7);const e=m[k]||(m[k]={k,rev:0,n:0});e.rev+=+o.total||0;e.n++});
    series=Object.values(m).sort((a,b)=>a.k<b.k?-1:1);series.byDay=byDay
  }
  /* المنتجات الأكثر مبيعًا */
  const pm={};
  ok.forEach(o=>(o.items||[]).forEach(i=>{const k=String(i.name||'?');const e=pm[k]||(pm[k]={name:k,na:i.na||'',qty:0,rev:0,ord:0});e.qty+=+i.qty||0;e.rev+=(+i.unit||0)*(+i.qty||0);e.ord++;if(i.na)e.na=i.na}));
  const prods=Object.values(pm).sort((a,b)=>b.qty-a.qty||b.rev-a.rev);
  /* المحافظات */
  const gm={};ok.forEach(o=>{const k=o.gov||'-';const e=gm[k]||(gm[k]={gov:k,n:0,rev:0});e.n++;e.rev+=+o.total||0});
  const govs=Object.values(gm).sort((a,b)=>b.rev-a.rev);
  return{ok,rev,ship,items,canc,rets,retVal,reasons,byStatus,series,prods,govs,n:list.length,cn:ok.length,avg:ok.length?rev/ok.length:0}
}
const pName=p=>lang=='ar'&&p.na?p.na:p.name;

/* ---- الواجهة ---- */
function reportHtml(){
  const ar=lang=='ar';
  const pres=[['today',R2('النهاردة','Today')],['7',R2('آخر 7 أيام','Last 7 days')],['30',R2('آخر 30 يوم','Last 30 days')],['month',R2('الشهر ده','This month')],['all',R2('الكل','All')],['custom',R2('تاريخ مخصص','Custom')]];
  let h=`<div id="rptwrap"><div class="ofl">${pres.map(([k,l])=>`<button class="${RP.pre==k?'on':''}" data-rp="${k}">${l}</button>`).join('')}</div>`;
  if(RP.pre=='custom')h+=`<div class="rpd"><label>${R2('من','From')}<input type="date" data-rdate="from" value="${esc(RP.from)}"></label><label>${R2('إلى','To')}<input type="date" data-rdate="to" value="${esc(RP.to)}"></label></div>`;
  h+=`<div class="rpd"><label>${R2('احسب المبيعات من','Count sales from')}<select data-rbasis><option value="live"${RP.basis=='live'?' selected':''}>${R2('كل الطلبات ماعدا الملغي والمرتجع','All orders except cancelled & returned')}</option><option value="deliv"${RP.basis=='deliv'?' selected':''}>${R2('الطلبات المسلّمة فقط','Delivered only')}</option></select></label></div>`;
  if(RP.data===null)return h+`<p class="mut" style="padding:14px">...</p></div>`;
  const c=rpCalc(RP.data);
  h+=`<p class="rph mut">${R2('تقرير المبيعات','Sales report')} · ${esc(rpLabel())} · ${R2('اتطبع في','Printed')} ${esc(new Date().toLocaleString(ar?'ar-EG':'en-GB'))}</p>`;
  if(RP.capped)h+=`<p class="hint" style="margin:0 14px 8px">${R2('الفترة فيها طلبات كتير. التقرير بيعرض آخر '+RP_LIMIT+' طلب بس. قلّل الفترة.','Too many orders. Showing the latest '+RP_LIMIT+' only. Narrow the period.')}</p>`;
  h+=`<div class="ost"><div><b>${c.n}</b><small>${R2('إجمالي الطلبات','Orders')}</small></div><div><b>${money(c.rev)}</b><small>${R2('المبيعات','Revenue')}</small></div><div><b>${money(c.avg)}</b><small>${R2('متوسط الطلب','Avg order')}</small></div><div><b>${c.items}</b><small>${R2('قطع مباعة','Items sold')}</small></div><div><b>${money(c.ship)}</b><small>${R2('الشحن','Shipping')}</small></div><div><b>${c.canc}${c.n?` <small>(${Math.round(c.canc*100/c.n)}%)</small>`:''}</b><small>${R2('ملغي','Cancelled')}</small></div><div><b>${c.rets.length}${c.n?` <small>(${Math.round(c.rets.length*100/c.n)}%)</small>`:''}</b><small>${R2('مرتجع','Returned')}</small></div><div><b>${money(c.retVal)}</b><small>${R2('قيمة المرتجعات','Returned value')}</small></div></div>`;
  h+=`<div class="rpd rps">${Object.keys(ST).map(k=>`<span class="sc ${k}">${stTxt(k)}: ${c.byStatus[k]||0}</span>`).join('')}</div>`;
  /* مبيعات حسب الفترة */
  h+=`<h3 class="rpt">${c.series.byDay===false?R2('المبيعات حسب الشهر','Sales by month'):R2('المبيعات حسب اليوم','Sales by day')}</h3>`;
  if(c.series.length){const mx=Math.max(...c.series.map(x=>x.rev))||1;
    h+=`<div class="rbars">${c.series.map(x=>`<div class="rb"><span dir="ltr">${esc(x.k)}</span><i><u style="width:${Math.max(2,Math.round(x.rev*100/mx))}%"></u></i><b>${money(x.rev)} <small>(${x.n})</small></b></div>`).join('')}</div>`}
  else h+=`<p class="mut" style="padding:0 14px">${R2('مفيش مبيعات في الفترة دي','No sales in this period')}</p>`;
  /* الأكثر مبيعًا */
  h+=`<h3 class="rpt">${R2('المنتجات الأكثر مبيعًا','Best sellers')}</h3>`;
  if(c.prods.length){const top=RP.more?c.prods:c.prods.slice(0,10),mx=c.prods[0].qty||1;
    h+=`<div class="rbars">${top.map((p,i)=>`<div class="rb rbp"><span><em>${i+1}</em> ${esc(pName(p))}</span><i><u style="width:${Math.max(2,Math.round(p.qty*100/mx))}%"></u></i><b>×${p.qty} <small>${money(p.rev)}</small></b></div>`).join('')}</div>`;
    if(c.prods.length>10)h+=`<div style="padding:0 14px"><button class="btn out rpx" data-rmore>${RP.more?R2('عرض أقل','Show less'):R2('عرض الكل ('+c.prods.length+')','Show all ('+c.prods.length+')')}</button></div>`;
    h+=`<p class="hint" style="margin:6px 14px 0;font-size:12px">${R2('إيراد المنتج = السعر × الكمية قبل خصم عروض (اشتري 2 والتالت هدية) والشحن.','Product revenue = unit price × qty, before promo discounts and shipping.')}</p>`}
  else h+=`<p class="mut" style="padding:0 14px">${R2('لا توجد بيانات','No data')}</p>`;
  /* المحافظات */
  if(c.govs.length)h+=`<h3 class="rpt">${R2('المبيعات حسب المحافظة','Sales by governorate')}</h3><div class="rbars">${(()=>{const mx=c.govs[0].rev||1;return c.govs.slice(0,8).map(g=>`<div class="rb"><span>${esc(g.gov)}</span><i><u style="width:${Math.max(2,Math.round(g.rev*100/mx))}%"></u></i><b>${money(g.rev)} <small>(${g.n})</small></b></div>`).join('')})()}</div>`;
  /* المرتجعات */
  h+=`<h3 class="rpt">↩️ ${R2('المرتجعات','Returns')}</h3>`;
  if(c.rets.length){const mx=c.reasons[0].n||1;
    h+=`<p class="hint" style="margin:0 14px 8px;font-size:12px">${R2('أسباب المرتجع','Return reasons')}</p><div class="rbars">${c.reasons.map(x=>`<div class="rb"><span>${esc(x.r=='-'?R2('غير محدد','Not specified'):x.r)}</span><i><u style="width:${Math.max(2,Math.round(x.n*100/mx))}%"></u></i><b>${x.n} <small>${money(x.val)}</small></b></div>`).join('')}</div>`;
    const lst=RP.rmore?c.rets:c.rets.slice(0,10);
    h+=`<div class="rrl">${lst.map(o=>`<div class="rrw"><div class="oh"><span><b>${esc(o.id||o._id)}</b> <small class="mut">${esc(new Date(+o.t||0).toLocaleDateString(ar?'ar-EG':'en-GB'))}</small></span><b>${money(o.total||0)}</b></div><div class="mut" style="font-size:13px">${esc(o.name||'')} · ${esc(o.gov||'')}</div><div class="rrs">${R2('السبب','Reason')}: <b>${esc(o.rr||R2('غير محدد','Not specified'))}</b></div></div>`).join('')}</div>`;
    if(c.rets.length>10)h+=`<div style="padding:0 14px"><button class="btn out rpx" data-rrmore>${RP.rmore?R2('عرض أقل','Show less'):R2('عرض كل المرتجعات ('+c.rets.length+')','Show all returns ('+c.rets.length+')')}</button></div>`}
  else h+=`<p class="mut" style="padding:0 14px">${R2('مفيش مرتجعات في الفترة دي','No returns in this period')}</p>`;
  /* التصدير */
  h+=`<div class="rpe"><button class="btn dark" data-rexp="rep">${R2('تصدير التقرير CSV','Export report CSV')}</button><button class="btn dark" data-rexp="ord">${R2('تصدير الطلبات CSV','Export orders CSV')}</button><button class="btn out" data-rprint style="border:1px solid var(--line)">${R2('طباعة / حفظ PDF','Print / Save PDF')}</button></div></div>`;
  return h
}

/* ---- التصدير ---- */
function rpExport(kind){
  const L=RP.data||[];if(!L.length)return toast(R2('مفيش بيانات للتصدير','Nothing to export'));
  const stamp=new Date().toISOString().slice(0,10);
  if(kind=='ord'){return exportCsv(L,'orders-'+RP.pre+'-'+stamp+'.csv')}
  const c=rpCalc(L),ar=lang=='ar',rows=[];
  rows.push([R2('تقرير المبيعات','Sales report'),rpLabel()]);
  rows.push([R2('أساس الحساب','Basis'),RP.basis=='deliv'?R2('المسلّمة فقط','Delivered only'):R2('كل الطلبات ماعدا الملغي والمرتجع','All except cancelled & returned')]);
  rows.push([]);rows.push([R2('الملخص','Summary')]);
  rows.push([R2('إجمالي الطلبات','Orders'),c.n]);rows.push([R2('الطلبات المحسوبة','Counted orders'),c.cn]);
  rows.push([R2('المبيعات','Revenue'),Math.round(c.rev)]);rows.push([R2('متوسط الطلب','Avg order'),Math.round(c.avg)]);
  rows.push([R2('القطع المباعة','Items sold'),c.items]);rows.push([R2('الشحن','Shipping'),Math.round(c.ship)]);rows.push([R2('الملغي','Cancelled'),c.canc]);rows.push([R2('المرتجع','Returned'),c.rets.length]);rows.push([R2('قيمة المرتجعات','Returned value'),Math.round(c.retVal)]);rows.push([R2('نسبة المرتجع %','Return rate %'),c.n?Math.round(c.rets.length*1000/c.n)/10:0]);
  Object.keys(ST).forEach(k=>rows.push([stTxt(k),c.byStatus[k]||0]));
  rows.push([]);rows.push([c.series.byDay===false?R2('حسب الشهر','By month'):R2('حسب اليوم','By day'),R2('عدد الطلبات','Orders'),R2('المبيعات','Revenue')]);
  c.series.forEach(x=>rows.push([x.k,x.n,Math.round(x.rev)]));
  rows.push([]);rows.push([R2('المنتج','Product'),R2('الكمية','Qty'),R2('الإيراد','Revenue'),R2('عدد الطلبات','Orders')]);
  c.prods.forEach(p=>rows.push([pName(p),p.qty,Math.round(p.rev),p.ord]));
  rows.push([]);rows.push([R2('المحافظة','Governorate'),R2('عدد الطلبات','Orders'),R2('المبيعات','Revenue')]);
  c.govs.forEach(g=>rows.push([g.gov,g.n,Math.round(g.rev)]));
  if(c.rets.length){
    rows.push([]);rows.push([R2('سبب المرتجع','Return reason'),R2('عدد الطلبات','Orders'),R2('القيمة','Value')]);
    c.reasons.forEach(x=>rows.push([x.r=='-'?R2('غير محدد','Not specified'):x.r,x.n,Math.round(x.val)]));
    rows.push([]);rows.push([R2('رقم الطلب','Order'),R2('التاريخ','Date'),R2('العميل','Customer'),R2('المحافظة','Governorate'),R2('الإجمالي','Total'),R2('سبب المرتجع','Return reason')]);
    c.rets.forEach(o=>rows.push([o.id||o._id,new Date(+o.t||0).toISOString().slice(0,10),o.name||'',o.gov||'',Math.round(+o.total||0),o.rr||'']))}
  csvDownload(rows,'sales-report-'+RP.pre+'-'+stamp+'.csv')
}

/* ---- أحداث التقارير ---- */
document.addEventListener('click',e=>{
  const el=e.target.closest('button');if(!el)return;const d=el.dataset;
  if(d.tab=='r'){if(RP.data===null||!RP._t||Date.now()-RP._t>30000){RP._t=Date.now();loadReport()}return}
  if(tab!='r')return;
  if(d.rp){RP.pre=d.rp;if(d.rp=='custom'){RP.data=RP.data||[];drawAdm();return}RP._t=Date.now();loadReport()}
  else if('rmore'in d){RP.more=RP.more?0:1;drawAdm()}
  else if('rrmore'in d){RP.rmore=RP.rmore?0:1;drawAdm()}
  else if(d.rexp)rpExport(d.rexp)
  else if('rprint'in d){document.body.classList.add('prt-rep');const done=()=>{document.body.classList.remove('prt-rep');window.removeEventListener('afterprint',done)};window.addEventListener('afterprint',done);setTimeout(()=>{window.print();setTimeout(done,1500)},50)}
});
document.addEventListener('change',e=>{
  const x=e.target;if(tab!='r'||!x.dataset)return;
  if(x.dataset.rdate){RP[x.dataset.rdate]=x.value;if(RP.from&&RP.to&&RP.from>RP.to){const a=RP.from;RP.from=RP.to;RP.to=a}RP._t=Date.now();loadReport()}
  else if('rbasis'in x.dataset){RP.basis=x.value;drawAdm()}
});
