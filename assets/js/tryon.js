/* القياس الافتراضي (Virtual Try-On) عبر Anywear من Decart
   بيتحمّل في صفحة المنتج بس. لو عايز تغيّر الدومين: window.TRYON_DOMAIN='yourstore.com' قبل السكربت ده.
   لو عايز تقفل الميزة: window.TRYON_OFF=true */
(function(){
  try{
    if(window.TRYON_OFF||window.__anywear)return;
    var host=window.TRYON_DOMAIN||location.hostname;
    /* مش بنحمّله على localhost أو ملفات محلية */
    if(!host||host==='localhost'||/^\d+\.\d+\.\d+\.\d+$/.test(host)||location.protocol==='file:')return;
    window.__anywear=1;
    var s=document.createElement('script');
    s.src='https://anywear.decart.ai/widget/latest/anywear.js?domain='+encodeURIComponent(host.replace(/^www\./,''));
    s.async=true;
    document.body.appendChild(s);
  }catch(e){}
})();
