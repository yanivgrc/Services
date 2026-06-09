/* GRC·LABS — decrypt scramble
   Signature "decrypt" animation on [data-decrypt] headings. Hero headings run on
   load; the rest scramble once when scrolled into view. Respects reduced-motion.
   Loads after i18n.js so [data-i18n] elements already carry their data-final text.
   Also holds the console easter egg for the cipher in The Challenge. */
(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&/<>*+";

  function scramble(el){
    var target = el.getAttribute('data-final') || el.textContent;
    el.setAttribute('data-final', target);
    if(reduce){ el.textContent = target; return; }
    var frame = 0;
    var iv = setInterval(function(){
      var out = "";
      for(var i=0;i<target.length;i++){
        if(target[i] === " "){ out += " "; continue; }
        out += (i < frame/3) ? target[i] : chars[Math.floor(Math.random()*chars.length)];
      }
      el.textContent = out; frame++;
      if(frame/3 > target.length){ clearInterval(iv); el.textContent = target; }
    }, 28);
  }

  var heroEls = document.querySelectorAll('.hero [data-decrypt]');
  heroEls.forEach(function(el,i){ setTimeout(function(){ scramble(el); }, 180*i + 120); });
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if(e.isIntersecting){ scramble(e.target); io.unobserve(e.target); } });
    }, {threshold:0.6});
    document.querySelectorAll('section:not(.hero) [data-decrypt]').forEach(function(el){ io.observe(el); });
  } else { document.querySelectorAll('[data-decrypt]').forEach(scramble); }

  try{
    var c = document.getElementById('cipher');
    if(c && window.atob){
      console.log('%cGRC·LABS','color:#F0B429;font-family:monospace;font-size:16px;font-weight:bold');
      console.log('%c// you found the console. good instinct.','color:#4A7BA6;font-family:monospace');
      console.log('%c// decoded: '+ atob(c.textContent.trim()),'color:#C7D0DD;font-family:monospace');
      console.log('%c// more to come. keep looking.','color:#6B7689;font-family:monospace');
    }
  }catch(err){}
})();
