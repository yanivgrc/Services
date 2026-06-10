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
    // The rain coalesces primarily into the GRC·LABS wordmark, alternating with
    // other real lines (capability + credential names) for variety.
    var PRIMARY = ['GRC·LABS'];
    var OTHERS = [
      ['SECURITY', 'LEADERSHIP'],
      ['INCIDENT', 'RESPONSE'],
      ['SECURE', 'ARCHITECTURE'],
      ['PRIVACY', '& DPO'],
      ['GRC &', 'COMPLIANCE'],
      ['CISSP'], ['CISM'], ['ISO 27001'], ['CISO'], ['DPO']
    ];
    var fontSize = 16, cols = 0, rows = 0, drops = [], speeds = [], maskCells = [];
    var coTimer = 0, coActive = 0, coCount = 0, otherIdx = 0, CO_PERIOD = 4500, CO_DUR = 2600;

    function nextMsg() {
      var m = (coCount % 2 === 0) ? PRIMARY : OTHERS[otherIdx++ % OTHERS.length];
      coCount++;
      return m;
    }

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
        buildMask(nextMsg());
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
    // Each script: a command + a short, varied sequence of output lines. GET <X>
    // scripts are real capability/credential flexes; the rest are stylized
    // DEMO-ONLY steps (never a claim of real execution — see the "// demo" label).
    // Line prefix drives colour: "✓" = success, ">" = challenge hint, else a step.
    var SCRIPTS = [
      { cmd: 'GET CISO', out: ['→ loading security program ... OK', '→ policies + annual plan ... ready', '✓ CISO-as-a-Service — senior ownership'] },
      { cmd: 'GET GRC', out: ['→ building risk register ... OK', '→ ISO 27001 / 27035 / 22301 ... aligned', '✓ governance, risk & compliance'] },
      { cmd: 'GET DPO', out: ['→ data-protection controls ... OK', '→ Israeli privacy law + GDPR ... aligned', '✓ DPO services'] },
      { cmd: 'GET IR', out: ['→ triage ... OK', '→ forensics + containment ... done', '→ remediation ... complete', '✓ incident response'] },
      { cmd: 'GET ISO 27001', out: ['→ mapping Annex A controls ... 93/93', '→ evidence review ... passed', '✓ lead auditor · ISO/IEC 27001:2022'] },
      { cmd: 'GET ARCH', out: ['→ threat model ... built', '→ security-by-design review ... passed', '✓ secure architecture'] },
      { cmd: 'GET CISSP', out: ['→ verifying credential ... OK', '✓ (ISC)² CISSP'] },
      { cmd: 'GET CISM', out: ['→ verifying credential ... OK', '✓ ISACA CISM'] },
      { cmd: 'python harden.py', out: ['→ applying baseline ... OK', '→ 0 critical findings', 'done'] },
      { cmd: 'pytest -q', out: ['..........', '12 passed in 0.42s'] },
      { cmd: './run_checks.sh', out: ['→ config ... OK', '→ secrets scan ... clean', 'all checks passed'] },
      { cmd: 'python audit_demo.py --dry-run', out: ['→ dry-run ... OK · 0 findings'] },
      { cmd: 'GET CHALLENGE', out: ['> a door is hidden in plain sight ...', '> rotates every 90 days — or when someone cracks it'] }
    ];
    var PROMPT = 'grc-labs:~$ ';
    var HINT = '#79B0D6';
    var order, oi, history, typed, phase, wait, blink, outShown, outTimer;

    function shuffle() {
      order = SCRIPTS.map(function (_, i) { return i; });
      for (var i = order.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = order[i]; order[i] = order[j]; order[j] = tmp;
      }
    }
    function reset() { shuffle(); oi = 0; history = []; typed = 0; phase = 'cmd'; wait = 0; blink = 0; outShown = 0; outTimer = 0; }

    function colorFor(line) {
      var c = line.charAt(0);
      if (c === '✓') return BRIGHT;
      if (c === '>') return HINT;
      return INK;
    }
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
      var lh = Math.round(fs * 1.5), pad = Math.round(fs * 1.4), titleH = Math.round(fs * 2.5);
      var winX = Math.round((W - winW) / 2);
      var winH = Math.min(Math.round(H * 0.74), titleH + pad + lh * 15);
      var winY = Math.round((H - winH) / 2);
      var textX = winX + pad, textW = winW - pad * 2, indent = Math.round(fs * 1.1);
      var maxRows = Math.max(4, Math.floor((winH - titleH - pad) / lh));

      ctx.textBaseline = 'top'; ctx.textAlign = 'start';
      ctx.font = fs + 'px ' + MONO;

      // ── window chrome ──
      ctx.fillStyle = 'rgba(10,14,24,0.78)'; ctx.strokeStyle = LINE; ctx.lineWidth = 1;
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

      // ── typing / execution state machine ──
      blink += dt;
      var cur = (Math.floor(blink / 530) % 2) === 0;
      var script = SCRIPTS[order[oi % order.length]];
      if (phase === 'cmd') {
        typed += dt / 42;
        if (typed >= script.cmd.length) { typed = script.cmd.length; phase = 'pause'; wait = 0; }
      } else if (phase === 'pause') {
        wait += dt; if (wait > 280) { phase = 'out'; history.push({ type: 'cmd', cmd: script.cmd }); outShown = 0; outTimer = 0; }
      } else if (phase === 'out') {
        outTimer += dt;
        if (outShown < script.out.length && outTimer > 250) {
          var ln = script.out[outShown];
          history.push({ type: 'out', text: ln, color: colorFor(ln) });
          outShown++; outTimer = 0;
        }
        if (outShown >= script.out.length) { phase = 'hold'; wait = 0; }
      } else if (phase === 'hold') {
        wait += dt; if (wait > 1400) { oi++; if (oi % order.length === 0) shuffle(); typed = 0; phase = 'cmd'; }
      }

      // ── build display rows (wrapped output), then the active typing line ──
      var rows = [];
      for (var h = 0; h < history.length; h++) {
        var e = history[h];
        if (e.type === 'cmd') { rows.push({ type: 'cmd', cmd: e.cmd }); continue; }
        var wl = wrap(e.text, textW - indent);
        for (var g = 0; g < wl.length; g++) rows.push({ type: 'out', text: (g === 0 ? wl[g] : '  ' + wl[g]), color: e.color });
      }
      var activeCmd = (phase === 'cmd' || phase === 'pause') ? script.cmd.slice(0, Math.floor(typed)) : '';
      rows.push({ type: 'cmd', cmd: activeCmd, active: true });
      if (rows.length > maxRows) rows = rows.slice(rows.length - maxRows);

      // ── render, clipped to the window body ──
      ctx.save();
      ctx.beginPath(); ctx.rect(winX, winY + titleH, winW, winH - titleH); ctx.clip();
      var ty = winY + titleH + Math.round(pad * 0.5);
      for (var r = 0; r < rows.length; r++) {
        var row = rows[r];
        if (row.type === 'cmd') {
          ctx.fillStyle = DIM; ctx.fillText(PROMPT, textX, ty);
          var pw = ctx.measureText(PROMPT).width;
          ctx.fillStyle = BRIGHT; ctx.fillText(row.cmd, textX + pw, ty);
          if (row.active && cur) {
            var cwx = textX + pw + ctx.measureText(row.cmd).width;
            ctx.fillStyle = BRIGHT; ctx.fillRect(cwx + 2, ty + 2, fs * 0.5, fs);
          }
        } else {
          ctx.fillStyle = row.color; ctx.fillText(row.text, textX + indent, ty);
        }
        ty += lh;
      }
      // subtle CRT scanlines over the body — keeps it feeling alive
      ctx.fillStyle = 'rgba(0,0,0,0.10)';
      for (var sy = winY + titleH + 1; sy < winY + winH; sy += 4) ctx.fillRect(winX, sy, winW, 1);
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
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    var fs = Math.min(W / 7, H / 5);
    ctx.font = '700 ' + fs + 'px ' + MONO;
    ctx.fillStyle = GREEN;
    ctx.fillText('GRC·LABS', W / 2, H / 2 - fs * 0.18);
    ctx.font = Math.round(fs * 0.17) + 'px ' + MONO;
    ctx.fillStyle = DIM;
    ctx.fillText('TAILORED INFORMATION SECURITY', W / 2, H / 2 + fs * 0.5);
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
