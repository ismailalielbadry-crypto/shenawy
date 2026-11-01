/* صفحة المفضلة */
function wlDraw(){
setTitle(L2('المفضلة','Wishlist'));
$('#wl-h').textContent=L2('المفضلة','Wishlist');
const ps=FAV.map(i=>S.prods.find(p=>p.id==i)).filter(p=>p&&!p.hide);
$('#wl-n').textContent=ps.length?ps.length+t('n'):'';
$('#wl').innerHTML=ps.length?`<div class="grid in">${ps.map(card).join('')}</div>`:`<div class="empty"><span class="em">♡</span><h2>${L2('لسه ما ضفتش حاجة','Nothing saved yet')}</h2><p>${L2('دوس على القلب اللي على أي منتج عشان تحفظه هنا.','Tap the heart on any product to save it here.')}</p><a class="btn dark" href="shop.html">${L2('تصفح المتجر','Browse the shop')}</a></div>`}
boot('wishlist',wlDraw);
window.onFavChange=()=>{wlDraw()};
