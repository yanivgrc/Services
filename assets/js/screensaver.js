/* GRC·LABS — cyber screensaver
   After 30s of no interaction, a full-screen overlay fades in and cycles two
   modes: matrix rain (which periodically coalesces into real lines — the slogan,
   capability and credential names) and a wide, centered "secure shell" terminal
   that types GET <credential> lines mixed with stylized, demo-only test commands.
   Any interaction dismisses it instantly and resets the idle timer.

   The terminal is atmosphere only — a clearly-labelled "// demo" sandbox, not a
   claim of real actions. Pure canvas/JS, green-on-night-blue.

   Toggle: set CONFIG.enabled = false (or remove the <script> tag) to disable.
   Test helpers (query string): ?saver=now (trigger at once), ?saver=fast
   (2.5s idle), ?saver=off (disable), ?mode=0|1 (start on a given mode). */
(function () {
  'use strict';

  var CONFIG = {
    enabled: true,     // master feature flag
    idleMs: 30000      // idle time before the screensaver appears
  };

  var params = new URLSearchParams(location.search);
  if (params.get('saver') === 'off') CONFIG.enabled = false;
  if (params.get('saver') === 'fast') CONFIG.idleMs = 2500;
  var FORCE_NOW = params.get('saver') === 'now';
  var START_MODE = Math.max(0, parseInt(params.get('mode'), 10) || 0);
  if (!CONFIG.enabled) return;

  // ── palette (always green-on-dark, regardless of site theme) ──
  var BG = '#080B14', GREEN = '#63B22E', BRIGHT = '#9BE85B',
      DIM = 'rgba(99,178,46,0.55)', INK = '#C7D0DD', LINE = 'rgba(122,140,170,0.20)';
  var GREENS = ['#4FA028', '#63B22E', '#6FC036', '#5AA82A'];
  var MONO = '"IBM Plex Mono", ui-monospace, monospace';
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
  }

  // ───────────────────────── MODE 1 — matrix rain ─────────────────────────
  var matrix = (function () {
    var GLYPHS = 'アイウエオカキクケコサシスセソタチツテトﾊﾋﾌﾍﾎ0123456789#%&<>*+=/'.split('');
    // real lines that the rain coalesces into — slogan, capabilities, credentials
    var MSGS = [
      ['TAILORED', 'INFORMATION', 'SECURITY'],
      ['SECURITY', 'LEADERSHIP'],
      ['INCIDENT', 'RESPONSE'],
      ['SECURE', 'ARCHITECTURE'],
      ['PRIVACY', '& DPO'],
      ['GRC &', 'COMPLIANCE'],
      ['CISSP'], ['CISM'], ['ISO 27001'], ['CISO']
    ];
    var fontSize = 16, cols = 0, rows = 0, drops = [], speeds = [], maskCells = [];
    var coTimer = 0, coActive = 0, coIndex = 0, CO_PERIOD = 4500, CO_DUR = 2600;

    function layout() {
      fontSize = Math.max(12, Math.min(20, Math.round(W / 70)));
      cols = Math.ceil(W / fontSize);
      rows = Math.ceil(H / fontSize);
      drops = []; speeds = [];
      for (var i = 0; i < cols; i++) {
        drops[i] = Math.floor(Math.random() * -rows);
        speeds[i] = 0.4 + Math.random() * 0.55;   // per-column fall speed (variety)
      }
      coActive = 0; coTimer = 0;
    }

    // Render a message to an offscreen buffer; remember which grid cells are lit,
    // so the rain can assemble into the words during the coalesce phase.
    function buildMask(lines) {
      maskCells = [];
      var off = document.createElement('canvas');
      off.width = W; off.height = H;
      var o = off.getContext('2d');
      var longest = lines.reduce(function (a, b) { return b.length > a.length ? b : a; }, '');
      var fs = Math.max(20, Math.min(W * 0.8 / (longest.length * 0.62), H * 0.6 / (lines.length * 1.2)));
      o.fillStyle = '#fff';
      o.font = '700 ' + fs + 'px ' + MONO.replace(/"/g, '');
      o.textAlign = 'center'; o.textBaseline = 'middle';
      var lh = fs * 1.16, y0 = H / 2 - (lines.length - 1) * lh / 2;
      for (var w = 0; w < lines.length; w++) o.fillText(lines[w], W / 2, y0 + w * lh);
      var data = o.getImageData(0, 0, W, H).data;
      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          var px = (c * fontSize + fontSize / 2) | 0, py = (r * fontSize + fontSize / 2) | 0;
          if (px < W && py < H && data[(py * W + px) * 4 + 3] > 128)
            maskCells.push({ x: c * fontSize, y: r * fontSize });
        }
      }
    }

    function reset() { coTimer = 0; coActive = 0; ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H); }

    function draw(dt) {
      ctx.fillStyle = 'rgba(8,11,20,0.09)';   // trailing fade
      ctx.fillRect(0, 0, W, H);
      ctx.font = fontSize + 'px ' + MONO;
      ctx.textAlign = 'start'; ctx.textBaseline = 'top';
      for (var i = 0; i < cols; i++) {
        var ch = GLYPHS[(Math.random() * GLYPHS.length) | 0];
        var x = i * fontSize, y = drops[i] * fontSize;
        // bright head + occasional sparkle, otherwise a varied green for depth
        ctx.fillStyle = Math.random() > 0.94 ? BRIGHT : GREENS[(Math.random() * GREENS.length) | 0];
        if (y > 0) ctx.fillText(ch, x, y);
        if (y > H && Math.random() > 0.975) { drops[i] = Math.floor(Math.random() * -8); speeds[i] = 0.4 + Math.random() * 0.55; }
        drops[i] += speeds[i];
      }

      // coalesce: periodically light a real message's cells, then dissolve
      coTimer += dt;
      if (!coActive && coTimer >= CO_PERIOD) {
        coActive = 1; coTimer = 0;
        buildMask(MSGS[coIndex]); coIndex = (coIndex + 1) % MSGS.length;
      }
      if (coActive) {
        var t = Math.min(coTimer / CO_DUR, 1);
        var inten = Math.sin(t * Math.PI);   // 0→1→0
        ctx.font = '700 ' + fontSize + 'px ' + MONO;
        for (var m = 0; m < maskCells.length; m++) {
          if (Math.random() > 0.5 + inten * 0.5) continue;
          ctx.fillStyle = inten > 0.4 ? BRIGHT : GREEN;
          ctx.globalAlpha = 0.6 + inten * 0.4;
          ctx.fillText(GLYPHS[(Math.random() * GLYPHS.length) | 0], maskCells[m].x, maskCells[m].y);
        }
        ctx.globalAlpha = 1;
        if (coTimer >= CO_DUR) { coActive = 0; coTimer = 0; }
      }
    }
    return { layout: layout, reset: reset, draw: draw };
  })();

  // ─────────────────────── MODE 2 — secure-shell terminal ───────────────────────
  var terminal = (function () {
    // GET <credential> lines (real) mixed with stylized demo-only test commands.
    var SHELL = [
      { k: 'get', cmd: 'GET CISO', resp: 'security leadership, as a service — senior ownership, not a checklist' },
      { k: 'sh',  cmd: 'python harden.py', resp: 'OK' },
      { k: 'get', cmd: 'GET GRC', resp: 'governance, risk & compliance — measured to your real risk' },
      { k: 'sh',  cmd: 'pytest -q', resp: '12 passed in 0.42s' },
      { k: 'get', cmd: 'GET DPO', resp: 'privacy & data protection — Israeli law and the GDPR' },
      { k: 'sh',  cmd: './run_checks.sh', resp: 'all checks passed' },
      { k: 'get', cmd: 'GET IR', resp: 'incident response — investigation, forensics, remediation' },
      { k: 'sh',  cmd: 'python selftest.py', resp: 'OK' },
      { k: 'get', cmd: 'GET ISO 27001', resp: 'lead auditor — an ISMS taken all the way to certification' },
      { k: 'sh',  cmd: 'python audit_demo.py --dry-run', resp: 'OK · 0 findings' },
      { k: 'get', cmd: 'GET CISSP', resp: '(ISC)² — certified information systems security professional' },
      { k: 'get', cmd: 'GET CISM', resp: 'ISACA — certified information security manager' }
    ];
    var PROMPT = 'grc-labs:~$ ';
    var history, idx, typed, phase, wait, blink;

    function reset() { history = []; idx = 0; typed = 0; phase = 'cmd'; wait = 0; blink = 0; }

    function wrap(text, maxW) {
      var words = text.split(' '), lines = [], cur = '';
      for (var i = 0; i < words.length; i++) {
        var test = cur ? cur + ' ' + words[i] : words[i];
        if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = words[i]; }
        else cur = test;
      }
      if (cur) lines.push(cur);
      return lines;
    }

    function draw(dt) {
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      // ── window geometry (centered both ways, wide, responsive, not full-bleed) ──
      var winW = Math.min(940, W * 0.86);
      var fs = Math.max(13, Math.min(21, Math.round(winW / 46)));
      var lh = Math.round(fs * 1.55), pad = Math.round(fs * 1.4), titleH = Math.round(fs * 2.5);
      var winX = Math.round((W - winW) / 2);
      var maxRows = 14;
      var winH = Math.min(Math.round(H * 0.7), titleH + pad + lh * (maxRows + 1));
      var winY = Math.round((H - winH) / 2);
      var textX = winX + pad, textW = winW - pad * 2;
      maxRows = Math.max(4, Math.floor((winH - titleH - pad) / lh));

      ctx.textBaseline = 'top'; ctx.textAlign = 'start';
      ctx.font = fs + 'px ' + MONO;

      // ── window chrome ──
      ctx.fillStyle = 'rgba(10,14,24,0.74)'; ctx.strokeStyle = LINE; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(winX, winY, winW, winH, 10); ctx.fill(); ctx.stroke();
      ctx.save(); ctx.beginPath(); ctx.roundRect(winX, winY, winW, titleH, 10); ctx.clip();
      ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.fillRect(winX, winY, winW, titleH); ctx.restore();
      ctx.strokeStyle = LINE; ctx.beginPath(); ctx.moveTo(winX, winY + titleH); ctx.lineTo(winX + winW, winY + titleH); ctx.stroke();
      var dotY = winY + titleH / 2, dx = winX + pad;
      var dots = ['#C8503A', '#F0B429', '#63B22E'];
      ctx.globalAlpha = 0.8;
      for (var k = 0; k < 3; k++) { ctx.fillStyle = dots[k]; ctx.beginPath(); ctx.arc(dx + k * 16, dotY, 4, 0, 7); ctx.fill(); }
      ctx.globalAlpha = 1;
      ctx.fillStyle = DIM; ctx.font = Math.round(fs * 0.82) + 'px ' + MONO;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('secure shell // demo', winX + winW / 2, dotY + 1);
      ctx.textAlign = 'start'; ctx.textBaseline = 'top'; ctx.font = fs + 'px ' + MONO;

      // ── typing state machine ──
      blink += dt;
      var cur = (Math.floor(blink / 530) % 2) === 0;
      var entry = SHELL[idx % SHELL.length];
      if (phase === 'cmd') {
        typed += dt / 42;
        if (typed >= entry.cmd.length) { typed = entry.cmd.length; phase = 'pause'; wait = 0; }
      } else if (phase === 'pause') {
        wait += dt; if (wait > 320) phase = 'resp';
      } else if (phase === 'resp') {
        history.push(entry); phase = 'hold'; wait = 0;
      } else if (phase === 'hold') {
        wait += dt; if (wait > 1500) { idx++; typed = 0; phase = 'cmd'; }
      }

      // ── build rows (command + wrapped output), then the active line ──
      var out = [];
      for (var h = 0; h < history.length; h++) {
        var e = history[h];
        out.push({ type: 'cmd', cmd: e.cmd });
        if (e.k === 'get') {
          var gl = wrap(e.resp, textW - ctx.measureText('  → ').width);
          for (var g = 0; g < gl.length; g++) out.push({ type: 'out', text: (g === 0 ? '  → ' : '    ') + gl[g], color: INK });
        } else {
          out.push({ type: 'out', text: '  ' + e.resp, color: BRIGHT });
        }
      }
      var activeCmd = (phase === 'cmd' || phase === 'pause') ? entry.cmd.slice(0, Math.floor(typed)) : '';
      out.push({ type: 'cmd', cmd: activeCmd, active: true });
      if (out.length > maxRows) out = out.slice(out.length - maxRows);

      // ── render, clipped to the window body ──
      ctx.save();
      ctx.beginPath(); ctx.rect(winX, winY + titleH, winW, winH - titleH); ctx.clip();
      var ty = winY + titleH + Math.round(pad * 0.5);
      for (var r = 0; r < out.length; r++) {
        var row = out[r];
        if (row.type === 'cmd') {
          ctx.fillStyle = DIM; ctx.fillText(PROMPT, textX, ty);
          var pw = ctx.measureText(PROMPT).width;
          ctx.fillStyle = BRIGHT; ctx.fillText(row.cmd, textX + pw, ty);
          if (row.active && cur) {
            var cwx = textX + pw + ctx.measureText(row.cmd).width;
            ctx.fillStyle = BRIGHT; ctx.fillRect(cwx + 2, ty + 2, fs * 0.5, fs);
          }
        } else {
          ctx.fillStyle = row.color; ctx.fillText(row.text, textX, ty);
        }
        ty += lh;
      }
      ctx.restore();
    }
    return { reset: reset, draw: draw };
  })();

  // ───────────────────────── mode manager + loop ─────────────────────────
  var MODES = [matrix, terminal];
  var MODE_MS = [14000, 11000];   // matrix gets more time (two coalesce messages per visit)
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
    if (transElapsed < 0 && modeAge >= MODE_MS[modeIndex]) { transElapsed = 0; transSwitched = false; }
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

  setInterval(function () {
    if (active || document.hidden) return;
    if (performance.now() - lastActivity >= CONFIG.idleMs) activate();
  }, 1000);

  ['mousemove', 'mousedown', 'wheel', 'keydown', 'touchstart', 'scroll'].forEach(function (ev) {
    window.addEventListener(ev, onActivity, { passive: true });
  });

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
