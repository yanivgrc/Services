/* GRC·LABS — cyber screensaver
   After 30s of no interaction, a full-screen overlay fades in and cycles three
   modes: matrix rain that coalesces into the slogan, a green ASCII portrait, and
   typed "GET <credential>" terminal lines. Any interaction dismisses it instantly
   and resets the idle timer. Pure canvas/JS, theme-green on night-blue.

   Toggle: set CONFIG.enabled = false (or remove the <script> tag) to disable.
   Test helpers (query string): ?saver=now (trigger at once), ?saver=fast
   (2.5s idle), ?saver=off (disable). */
(function () {
  'use strict';

  var CONFIG = {
    enabled: true,     // master feature flag
    idleMs: 30000,     // idle time before the screensaver appears
    modeMs: 11000      // time spent in each mode before transitioning
  };

  var params = new URLSearchParams(location.search);
  if (params.get('saver') === 'off') CONFIG.enabled = false;
  if (params.get('saver') === 'fast') CONFIG.idleMs = 2500;
  var FORCE_NOW = params.get('saver') === 'now';
  var START_MODE = Math.max(0, parseInt(params.get('mode'), 10) || 0);
  if (!CONFIG.enabled) return;

  // ── palette (the screensaver is always green-on-dark, regardless of site theme) ──
  var BG = '#080B14', GREEN = '#63B22E', BRIGHT = '#9BE85B',
      DIM = 'rgba(99,178,46,0.55)', INK = '#C7D0DD';
  var MONO = '"IBM Plex Mono", ui-monospace, monospace';
  var SLOGAN = 'TAILORED INFORMATION SECURITY';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── overlay DOM + styles ──
  var style = document.createElement('style');
  style.textContent =
    '#grc-saver{position:fixed;inset:0;z-index:9999;background:' + BG + ';opacity:0;' +
    'transition:opacity .6s ease;pointer-events:none}' +
    '#grc-saver.on{opacity:1;pointer-events:auto;cursor:none}' +
    '#grc-saver canvas{display:block;width:100%;height:100%}' +
    '#grc-saver .gs-tag{position:fixed;top:16px;left:20px;font:11px/1 ' + MONO + ';' +
    'letter-spacing:.22em;color:' + DIM + ';text-transform:uppercase}' +
    '#grc-saver .gs-hint{position:fixed;bottom:16px;right:20px;font:11px/1 ' + MONO + ';' +
    'letter-spacing:.16em;color:' + DIM + '}';
  document.head.appendChild(style);

  var root = document.createElement('div');
  root.id = 'grc-saver';
  root.setAttribute('aria-hidden', 'true');
  var canvas = document.createElement('canvas');
  var tag = document.createElement('div');
  tag.className = 'gs-tag';
  tag.textContent = 'GRC·LABS // STANDBY';
  var hint = document.createElement('div');
  hint.className = 'gs-hint';
  hint.textContent = '// move to dismiss';
  root.appendChild(canvas);
  root.appendChild(tag);
  root.appendChild(hint);

  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    matrix.layout();
    ascii.invalidate();
  }

  // ───────────────────────── MODE 1 — matrix rain ─────────────────────────
  var matrix = (function () {
    var GLYPHS = 'アイウエオカキクケコサシスセソタチツテトﾊﾋﾌﾍﾎ0123456789#%&<>*+=/'.split('');
    var fontSize = 16, cols = 0, rows = 0, drops = [], maskCells = [];
    var coTimer = 0, coActive = 0, CO_PERIOD = 7000, CO_DUR = 3400;

    function layout() {
      fontSize = Math.max(12, Math.min(20, Math.round(W / 70)));
      cols = Math.ceil(W / fontSize);
      rows = Math.ceil(H / fontSize);
      drops = [];
      for (var i = 0; i < cols; i++) drops[i] = Math.floor(Math.random() * -rows);
      buildMask();
    }

    // Render the slogan to an offscreen buffer; remember which grid cells are "lit"
    // so the rain can assemble into the words during the coalesce phase.
    function buildMask() {
      maskCells = [];
      var off = document.createElement('canvas');
      off.width = W; off.height = H;
      var o = off.getContext('2d');
      var fs = Math.min(W / 11, H / 6);
      o.fillStyle = '#fff';
      o.font = '700 ' + fs + 'px ' + MONO.replace(/"/g, '');
      o.textAlign = 'center'; o.textBaseline = 'middle';
      var words = ['TAILORED', 'INFORMATION', 'SECURITY'];
      var lh = fs * 1.12, y0 = H / 2 - lh;
      for (var w = 0; w < words.length; w++) o.fillText(words[w], W / 2, y0 + w * lh);
      var data = o.getImageData(0, 0, W, H).data;
      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          var px = Math.floor(c * fontSize + fontSize / 2);
          var py = Math.floor(r * fontSize + fontSize / 2);
          if (px < W && py < H && data[(py * W + px) * 4 + 3] > 128)
            maskCells.push({ x: c * fontSize, y: r * fontSize });
        }
      }
    }

    function reset() { coTimer = 0; coActive = 0; ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H); }

    function draw(dt) {
      // trailing fade
      ctx.fillStyle = 'rgba(8,11,20,0.10)';
      ctx.fillRect(0, 0, W, H);
      ctx.font = fontSize + 'px ' + MONO;
      ctx.textAlign = 'start'; ctx.textBaseline = 'top';
      for (var i = 0; i < cols; i++) {
        var ch = GLYPHS[(Math.random() * GLYPHS.length) | 0];
        var x = i * fontSize, y = drops[i] * fontSize;
        ctx.fillStyle = Math.random() > 0.975 ? BRIGHT : GREEN;
        if (y > 0) ctx.fillText(ch, x, y);
        if (y > H && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 0.6;
      }

      // coalesce: periodically light the slogan cells brighter, then dissolve
      coTimer += dt;
      if (!coActive && coTimer >= CO_PERIOD) { coActive = 1; coTimer = 0; }
      if (coActive) {
        var t = Math.min(coTimer / CO_DUR, 1);
        var inten = Math.sin(t * Math.PI); // 0→1→0
        ctx.font = '700 ' + fontSize + 'px ' + MONO;
        for (var m = 0; m < maskCells.length; m++) {
          if (Math.random() > 0.5 + inten * 0.45) continue;
          ctx.fillStyle = inten > 0.6 ? BRIGHT : GREEN;
          ctx.globalAlpha = 0.5 + inten * 0.5;
          ctx.fillText(GLYPHS[(Math.random() * GLYPHS.length) | 0], maskCells[m].x, maskCells[m].y);
        }
        ctx.globalAlpha = 1;
        if (coTimer >= CO_DUR) { coActive = 0; coTimer = 0; }
      }
    }
    return { layout: layout, reset: reset, draw: draw };
  })();

  // ─────────────────────── MODE 2 — ASCII portrait ───────────────────────
  var ascii = (function () {
    var RAMP = ' .:-=+*#%@';
    var COLS = 70, ROWS = 40;
    var img = new Image(), ready = false, failed = false;
    var grid = null, dirty = true, reveal = 0;
    img.onload = function () { ready = true; dirty = true; };
    img.onerror = function () { failed = true; };
    img.src = 'assets/img/portrait-dark.jpg';

    function invalidate() { dirty = true; }

    function sample() {
      var off = document.createElement('canvas');
      off.width = COLS; off.height = ROWS;
      var o = off.getContext('2d');
      o.drawImage(img, 0, 0, COLS, ROWS);
      var d = o.getImageData(0, 0, COLS, ROWS).data;
      grid = [];
      for (var r = 0; r < ROWS; r++) {
        var line = '';
        for (var c = 0; c < COLS; c++) {
          var i = (r * COLS + c) * 4;
          var lum = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255;
          line += RAMP[Math.min(RAMP.length - 1, Math.floor(lum * RAMP.length))];
        }
        grid.push(line);
      }
      dirty = false;
    }

    function reset() { reveal = 0; }

    function draw(dt) {
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      if (failed) { centerText('// PORTRAIT UNAVAILABLE', GREEN); return; }
      if (!ready) { centerText('// LOADING SUBJECT …', DIM); return; }
      if (dirty) sample();
      var fs = Math.min((W * 0.9) / (COLS * 0.6), (H * 0.82) / ROWS);
      var cw = fs * 0.6, blockW = COLS * cw, blockH = ROWS * fs;
      var x0 = (W - blockW) / 2, y0 = (H - blockH) / 2;
      ctx.font = fs + 'px ' + MONO;
      ctx.textAlign = 'start'; ctx.textBaseline = 'top';
      ctx.fillStyle = GREEN;
      reveal += dt / 40; // rows revealed per frame-ish
      var shown = Math.min(ROWS, Math.floor(reveal));
      for (var r = 0; r < shown; r++) ctx.fillText(grid[r], x0, y0 + r * fs);
      // caption
      ctx.font = '700 ' + Math.max(12, fs) + 'px ' + MONO;
      ctx.fillStyle = DIM; ctx.textAlign = 'center';
      ctx.fillText('SUBJECT // Y.DADON — CISO', W / 2, y0 + blockH + fs);
      ctx.textAlign = 'start';
    }
    return { invalidate: invalidate, reset: reset, draw: draw };
  })();

  // ─────────────────────── MODE 3 — GET terminal ───────────────────────
  var terminal = (function () {
    var SHELL = [
      ['GET CISO', 'security leadership, as a service — senior ownership, not a checklist'],
      ['GET GRC', 'governance, risk & compliance — measured to your real risk'],
      ['GET DPO', 'privacy & data protection — Israeli law and the GDPR'],
      ['GET IR', 'incident response — investigation, forensics, remediation'],
      ['GET ISO 27001', 'lead auditor — an ISMS taken all the way to certification'],
      ['GET CISSP', '(ISC)² — certified information systems security professional'],
      ['GET CISM', 'ISACA — certified information security manager']
    ];
    var PROMPT = 'grc-labs:~$ ';
    var lines, idx, typed, phase, wait, blink;

    function reset() {
      lines = []; idx = 0; typed = 0; phase = 'cmd'; wait = 0; blink = 0;
    }

    function draw(dt) {
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      var fs = Math.max(14, Math.min(22, Math.round(W / 54)));
      var lh = fs * 1.5, x = Math.max(24, W * 0.12), y = Math.max(60, H * 0.16);
      ctx.font = fs + 'px ' + MONO; ctx.textBaseline = 'top'; ctx.textAlign = 'start';

      blink += dt;
      var cur = (Math.floor(blink / 530) % 2) === 0;
      var entry = SHELL[idx % SHELL.length];

      // advance the typewriter
      if (phase === 'cmd') {
        typed += dt / 45;
        if (typed >= entry[0].length) { typed = entry[0].length; phase = 'pause'; wait = 0; }
      } else if (phase === 'pause') {
        wait += dt; if (wait > 360) { phase = 'resp'; }
      } else if (phase === 'resp') {
        phase = 'hold'; wait = 0;
        lines.push([PROMPT + entry[0], '  → ' + entry[1]]);
        if (lines.length > Math.floor((H * 0.6) / lh)) lines.shift();
      } else if (phase === 'hold') {
        wait += dt; if (wait > 1500) { idx++; typed = 0; phase = 'cmd'; }
      }

      // history
      var ly = y;
      for (var i = 0; i < lines.length; i++) {
        ctx.fillStyle = GREEN; ctx.fillText(lines[i][0], x, ly);
        ctx.fillStyle = INK; ctx.fillText(lines[i][1], x, ly + lh * 0.5);
        ly += lh * 1.25;
      }
      // active line being typed
      ctx.fillStyle = DIM; ctx.fillText(PROMPT, x, ly);
      var pw = ctx.measureText(PROMPT).width;
      ctx.fillStyle = BRIGHT;
      var shownCmd = entry[0].slice(0, Math.floor(typed));
      ctx.fillText(shownCmd, x + pw, ly);
      if (cur) {
        var cwx = x + pw + ctx.measureText(shownCmd).width;
        ctx.fillStyle = BRIGHT; ctx.fillRect(cwx + 2, ly + 2, fs * 0.55, fs);
      }
    }
    return { reset: reset, draw: draw };
  })();

  // ── shared helper ──
  function centerText(text, color) {
    var fs = Math.max(14, Math.min(24, Math.round(W / 40)));
    ctx.font = '700 ' + fs + 'px ' + MONO;
    ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, W / 2, H / 2);
    ctx.textAlign = 'start';
  }

  // ───────────────────────── mode manager + loop ─────────────────────────
  var MODES = [matrix, ascii, terminal];
  var modeIndex = 0, modeAge = 0, raf = 0, last = 0;
  var TRANS = 600, transElapsed = -1, transSwitched = false;

  function initMode(i) {
    modeIndex = i; modeAge = 0;
    if (MODES[i].reset) MODES[i].reset();
  }

  function frame(now) {
    if (!last) last = now;
    var dt = Math.min(80, now - last); last = now;
    MODES[modeIndex].draw(dt);

    modeAge += dt;
    if (transElapsed < 0 && modeAge >= CONFIG.modeMs) { transElapsed = 0; transSwitched = false; }
    if (transElapsed >= 0) {
      transElapsed += dt;
      var half = TRANS / 2;
      var a = transElapsed < half ? transElapsed / half : 1 - (transElapsed - half) / half;
      if (transElapsed >= half && !transSwitched) {
        initMode((modeIndex + 1) % MODES.length); transSwitched = true;
      }
      ctx.globalAlpha = Math.max(0, Math.min(1, a));
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
      if (transElapsed >= TRANS) transElapsed = -1;
    }
    raf = requestAnimationFrame(frame);
  }

  // ───────────────────────── activation / idle ─────────────────────────
  var active = false, lastActivity = performance.now();

  function staticFrame() {
    ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
    var fs = Math.min(W / 13, H / 7);
    ctx.font = '700 ' + fs + 'px ' + MONO;
    ctx.fillStyle = GREEN; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('TAILORED', W / 2, H / 2 - fs * 1.1);
    ctx.fillText('INFORMATION', W / 2, H / 2);
    ctx.fillText('SECURITY', W / 2, H / 2 + fs * 1.1);
    ctx.textAlign = 'start';
  }

  function activate() {
    if (active) return;
    active = true;
    resize();
    root.classList.add('on');
    if (reduceMotion) { staticFrame(); return; }   // no animation when reduced-motion
    matrix.reset();
    initMode(START_MODE % MODES.length);
    last = 0; transElapsed = -1;
    raf = requestAnimationFrame(frame);
  }

  function deactivate() {
    if (!active) return;
    active = false;
    root.classList.remove('on');
    if (raf) cancelAnimationFrame(raf), raf = 0;
    lastActivity = performance.now();
  }

  function onActivity() {
    lastActivity = performance.now();
    if (active) deactivate();
  }

  // tick: trigger after idleMs of no activity (skip while tab hidden)
  setInterval(function () {
    if (active || document.hidden) return;
    if (performance.now() - lastActivity >= CONFIG.idleMs) activate();
  }, 1000);

  ['mousemove', 'mousedown', 'wheel', 'keydown', 'touchstart', 'scroll'].forEach(function (ev) {
    window.addEventListener(ev, onActivity, { passive: true });
  });

  // pause animation when the tab is hidden; resume on return
  document.addEventListener('visibilitychange', function () {
    if (!active || reduceMotion) return;
    if (document.hidden) { if (raf) cancelAnimationFrame(raf), raf = 0; }
    else { last = 0; raf = requestAnimationFrame(frame); }
  });

  window.addEventListener('resize', function () { if (active) resize(); });

  document.addEventListener('DOMContentLoaded', function () { document.body.appendChild(root); });
  if (document.readyState !== 'loading') document.body.appendChild(root);

  if (FORCE_NOW) setTimeout(activate, 400);
})();
