/* صفحة السياسات: الاستبدال / الشحن / الدفع */
function shipHtml(){const c=S.cfg,Z=c.zones||[];return `<table class="tbl"><tr><th>${L2('المنطقة','Zone')}</th><th>${L2('سعر الشحن','Price')}</th></tr>${Z.map(z=>`<tr><td>${esc(tr(z))}</td><td>${money(+z.p||0)}</td></tr>`).join('')}</table>`+(+c.free>0?`<p>🚚 ${L2('شحن مجاني للطلبات فوق','Free shipping on orders above')} <b>${money(+c.free)}</b></p>`:'')+`<p class="mut">${L2('الشحن لكل محافظات مصر، والتوصيل عادةً خلال 2 إلى 5 أيام عمل بحسب المحافظة.','We ship to all governorates. Delivery usually takes 2-5 business days.')}</p>`}
let polTab='ret';
function polDraw(){
const h=(location.hash||'').slice(1);if(['ret','ship','pay'].includes(h))polTab=h;
setTitle(L2('السياسات','Policies'));
const T=[['ret',L2('الاستبدال والاسترجاع','Returns')],['ship',L2('الشحن','Shipping')],['pay',L2('الدفع','Payment')]],k=polTab;
const body=k=='ret'?`<p>${esc(tr(S.cfg.policy)).replace(/\n/g,'<br>')}</p>`:k=='ship'?shipHtml():`<p>💵 <b>${L2('الدفع عند الاستلام','Cash on delivery')}</b></p><p>${L2('بتدفع للمندوب لما الطلب يوصلك، وتقدر تفحص الطلب قبل الدفع. مفيش أي دفع مقدم.','You pay the courier when the order arrives and can inspect it first. No advance payment.')}</p>`;
$('#pg-pol').innerHTML=`<div class="narrow tpad"><div class="pt" style="padding-inline:0"><h1>${L2('السياسات','Policies')}</h1></div><div class="tg">${T.map(x=>`<button class="${x[0]==k?'on':''}" data-pol="${x[0]}">${x[1]}</button>`).join('')}</div>${body}<p style="margin-top:20px"><a class="lnk" href="size-guide.html">${t('sg')}</a></p></div>`}
boot('policies',polDraw);
document.addEventListener('click',e=>{const b=e.target.closest('[data-pol]');if(b){polTab=b.dataset.pol;history.replaceState(null,'','#'+polTab);polDraw()}});
window.addEventListener('hashchange',polDraw);
