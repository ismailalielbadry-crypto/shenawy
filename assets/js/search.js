const SYN=[['hoodie','hoodies','هودي','هوديز','سويت شيرت','sweatshirt','sweatshirts','سويتشيرت'],['pullover','pullovers','بلوفر','بلوفرات','كنزه','كنزة','sweater','knit','كنزات'],['jacket','jackets','جاكيت','جاكيتات','جاكت'],['coat','coats','بالطو','معطف','بالطوه'],['shirt','shirts','overshirt','overshirts','قميص','قمصان'],['tshirt','t-shirt','t-shirts','tee','تيشيرت','تيشرت','تي شيرت'],['polo','polos','بولو'],['jeans','denim','جينز'],['pants','trousers','sweatpants','بنطلون','بنطلونات','سويت بانتس','بنطال'],['cap','caps','hat','كاب','قبعه','طاقيه','كابات'],['black','اسود','أسود'],['white','ابيض','أبيض'],['grey','gray','رمادي','رصاصي'],['navy','كحلي','كحلى'],['burgundy','بوردو','عنابي'],['sugar','سكري','بيج','beige'],['olive','زيتي','زيتوني'],['brown','بني','قهوه','قهوة'],['blue','ازرق','أزرق'],['red','احمر','أحمر'],['green','اخضر','أخضر'],['half','نص','هاف'],['neck','نك','رقبه','ياقه']];
const SALE=['sale','offer','offers','discount','خصم','تخفيض','عروض','عرض','اوفر','أوفر','تصفيه','تصفية'];
function nz(x){return String(x||'').toLowerCase().replace(/[\u064B-\u065F\u0670]/g,'').replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').replace(/ؤ/g,'و').replace(/ئ/g,'ي').replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[^\p{L}\p{N}\s-]/gu,' ').replace(/\s+/g,' ').trim()}
const SYNZ=SYN.map(g=>g.map(nz));
const stem=w=>w.length>3&&w.startsWith('ال')?w.slice(2):w;
function lev(a,b,m){if(Math.abs(a.length-b.length)>m)return m+1;let p=[...Array(b.length+1).keys()];for(let i=1;i<=a.length;i++){const c=[i];let mn=i;for(let j=1;j<=b.length;j++){const v=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]==b[j-1]?0:1));c.push(v);if(v<mn)mn=v}if(mn>m)return m+1;p=c}return p[b.length]}
function sIndex(p){const cat=S.cats.find(c=>c.en==p.c)||{};const name=nz((p.n.en||'')+' '+(p.n.ar||''));const meta=nz((p.c||'')+' '+(cat.ar||'')+' '+String(p.cl||'').replace(/,/g,' '));return {name,nt:name.split(' ').map(stem),meta,mt:meta.split(' ').map(stem)}}
function sTok(w,ix,p){let best=0;const syn=SYNZ.find(g=>g.includes(w));
const chk=(t,base)=>{for(const x of ix.nt){if(x==t)return base+4;if(x.startsWith(t))return base+2;if(t.length>=3&&x.includes(t))return base}return 0};
best=Math.max(best,chk(w,6));
for(const x of ix.mt){if(x==w)best=Math.max(best,5);else if(w.length>=3&&x.startsWith(w))best=Math.max(best,4)}
if(syn)for(const g of syn){if(g==w)continue;best=Math.max(best,chk(g,5)-1);for(const x of ix.mt)if(x==g)best=Math.max(best,4)}
if(!best&&w.length>=4){const m=w.length>=6?2:1;for(const x of ix.nt.concat(ix.mt)){if(x.length>=3&&lev(w,x,m)<=m){best=3;break}}}
if(!best&&SALE.includes(w)&&p.s>0)best=4;
return best}
function smart(list,query){const toks=nz(query).split(' ').map(stem).filter(Boolean);if(!toks.length)return list.map(p=>({p,sc:0}));
const out=[];for(const p of list){const ix=sIndex(p);let tot=0,hit=0;for(const w of toks){const v=sTok(w,ix,p);if(v){tot+=v;hit++}}
if(hit==toks.length)out.push({p,sc:tot+(p.s>0?.5:0)-(p.out?1:0)});else if(hit&&toks.length>1&&hit>=toks.length-1)out.push({p,sc:tot*.4,part:1})}
return out.sort((a,b)=>b.sc-a.sc)}
function hl(text,query){const t=esc(text);const ws=String(query).trim().split(/\s+/).filter(w=>w.length>1).map(w=>esc(w).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));if(!ws.length)return t;try{return t.replace(new RegExp('('+ws.join('|')+')','gi'),'<mark>$1</mark>')}catch(e){return t}}
