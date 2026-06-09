/* GRC·LABS — theme toggle
   Black-hat / white-hat switch. Dark = black hat (filled), light = white hat
   (outline) — a nod to attacker vs. defender. Self-contained. */
(function(){
  var root = document.documentElement;
  var themebtn = document.getElementById('themebtn');
  var themelabel = document.getElementById('themelabel');
  var themeicon = document.getElementById('themeicon');
  var theme = 'dark';

  var BLACKHAT = '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path fill="currentColor" d="M8 4c-.5 2.2-1 4.5-1.2 6.6C4 11.2 2 12.3 2 13.6 2 15.5 6.5 17 12 17s10-1.5 10-3.4c0-1.3-2-2.4-4.8-3C17 8.5 16.5 6.2 16 4c-.3-1.3-1.9-1.6-3.9-1.6S8.3 2.7 8 4z"/><path fill="currentColor" d="M2 13.8c0 1.9 4.5 3.4 10 3.4s10-1.5 10-3.4v1.8c0 1.9-4.5 3.4-10 3.4S2 17.5 2 15.6z"/></svg>';
  var WHITEHAT = '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" d="M8 4c-.5 2.2-1 4.5-1.2 6.6C4 11.2 2 12.3 2 13.6 2 15.5 6.5 17 12 17s10-1.5 10-3.4c0-1.3-2-2.4-4.8-3C17 8.5 16.5 6.2 16 4c-.3-1.3-1.9-1.6-3.9-1.6S8.3 2.7 8 4z"/></svg>';

  function applyTheme(t){
    theme = t; root.setAttribute('data-theme', t);
    themelabel.textContent = t === 'dark' ? 'GO WHITE' : 'GO BLACK';
    themeicon.innerHTML = t === 'dark' ? WHITEHAT : BLACKHAT;
    themebtn.setAttribute('aria-pressed', t === 'light' ? 'true' : 'false');
    themebtn.setAttribute('title', t === 'dark' ? 'Go white-hat (light)' : 'Go black-hat (dark)');
    themebtn.setAttribute('aria-label', t === 'dark' ? 'Switch to light (white-hat) theme' : 'Switch to dark (black-hat) theme');
  }

  applyTheme('dark');
  themebtn.addEventListener('click', function(){ applyTheme(theme === 'dark' ? 'light' : 'dark'); });
})();
