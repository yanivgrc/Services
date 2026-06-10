/* GRC·LABS — cyber screensaver
   After 9s of no interaction, a full-screen overlay fades in and cycles two
   modes: matrix rain (which periodically coalesces into the GRC·LABS wordmark
   and other real lines), and a raw full-screen "secure shell" console that runs
   a winget-style install for a GET <service> command and then streams the full
   service response. Any interaction dismisses it instantly and resets the timer.

   The console is stylized showcase content — a "// demo", not a real installer.
   Pure canvas/JS, green-on-night-blue.

   Toggle: set CONFIG.enabled = false (or remove the <script> tag) to disable.
   Test helpers (query string): ?saver=now (trigger at once), ?saver=fast
   (2.5s idle), ?saver=off (disable), ?mode=0|1 (start on a given mode). */
(function () {
  'use strict';

  var CONFIG = {
    enabled: true,    // master feature flag
    idleMs: 9000      // idle time before the screensaver appears
  };

  var params = new URLSearchParams(location.search);
  if (params.get('saver') === 'off') CONFIG.enabled = false;
  if (params.get('saver') === 'fast') CONFIG.idleMs = 2500;
  var FORCE_NOW = params.get('saver') === 'now';
  var START_MODE = Math.max(0, parseInt(params.get('mode'), 10) || 0);
  if (!CONFIG.enabled) return;

  // ── palette (always green-on-dark, regardless of site theme) ──
  var BG = '#080B14', GREEN = '#63B22E', BRIGHT = '#9BE85B',
      DIM = 'rgba(99,178,46,0.55)', INK = '#C7D0DD';
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

  function rep(ch, n) { var s = ''; for (var i = 0; i < n; i++) s += ch; return s; }

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
        ctx.fillStyle = Math.random() > 0.94 ? BRIGHT : GREENS[(Math.random() * GREENS.length) | 0];
        if (y > 0) ctx.fillText(ch, x, y);
        if (y > H && Math.random() > 0.975) { drops[i] = Math.floor(Math.random() * -8); speeds[i] = 0.4 + Math.random() * 0.55; }
        drops[i] += speeds[i];
      }

      coTimer += dt;
      if (!coActive && coTimer >= CO_PERIOD) { coActive = 1; coTimer = 0; buildMask(nextMsg()); }
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

  // ───────────── MODE 2 — raw console: winget-style install + full response ─────────────
  var terminal = (function () {
    var PROMPT = 'grc-labs:\\> ';
    var BAR_LEN = 26;
    // Full responses are the approved showcase content (screensaver-scripts.md),
    // verbatim. Stylized demo — not a real installer.
    var COMMANDS = [
      { name: 'CISO', module: 'cyber-leadership-module', body: [
        'Loading: Cyber Leadership Module', 'Status: Available', '',
        'To receive CISO service, define business context first.', '',
        'Required input:', '- Organization size', '- Critical systems', '- Regulatory exposure', '- Current security maturity', '- Main risks and known gaps', '',
        'Processing:', '- Map assets, systems, vendors and business processes', '- Identify cyber, operational and compliance risks', '- Build security governance, policies and work plan', '- Prioritize controls by business impact', '- Create management visibility and measurable security roadmap', '',
        'Output:', '- CISO-as-a-Service', '- Risk-based security program', '- Board and management reporting', '- Security policy framework', '- Operational cyber work plan', '',
        'Result:', 'CISO service is ready when the organization wants security leadership, not just technical fixes.'
      ] },
      { name: 'DPO', module: 'privacy-governance-module', body: [
        'Loading: Privacy Governance Module', 'Status: Available', '',
        'To receive DPO service, start with personal data mapping.', '',
        'Required input:', '- Types of personal data collected', '- Systems holding personal information', '- Data sharing with vendors', '- Legal basis for processing', '- Privacy notices and consent flows', '',
        'Processing:', '- Map data flows across the organization', '- Identify privacy risks and regulatory gaps', '- Review retention, access, disclosure and security controls', '- Build privacy procedures and documentation', '- Prepare the organization for audits, incidents and data subject requests', '',
        'Output:', '- Privacy compliance framework', '- Data processing inventory', '- DPIA support where required', '- Vendor privacy review', '- Management guidance on privacy obligations', '',
        'Result:', 'DPO service is ready when privacy must become managed, documented and defensible.'
      ] },
      { name: 'ISO27001', module: 'isms-module', body: [
        'Loading: Information Security Management System', 'Status: Available', '',
        'To receive ISO 27001 readiness, define the scope.', '',
        'Required input:', '- Business units in scope', '- Systems and locations in scope', '- Existing policies and procedures', '- Risk assessment status', '- Certification target or internal compliance target', '',
        'Processing:', '- Define ISMS scope', '- Perform gap analysis against ISO 27001', '- Build risk assessment and treatment plan', '- Create required policies, procedures and evidence', '- Prepare management review, internal audit and certification readiness', '',
        'Output:', '- ISO 27001 gap report', '- Risk register', '- Statement of Applicability', '- Policies and procedures', '- Certification readiness plan', '',
        'Result:', 'ISO 27001 service is ready when security needs to become a managed system, not a collection of documents.'
      ] },
      { name: 'Audit', module: 'audit-engine', body: [
        'Loading: Audit Engine', 'Status: Available', '',
        'To receive audit service, define what needs to be tested.', '',
        'Required input:', '- Audit scope', '- Standard or regulation', '- Systems and departments involved', '- Previous findings', '- Required reporting format', '',
        'Processing:', '- Review documentation and evidence', '- Interview stakeholders', '- Validate controls in practice', '- Identify gaps, risks and exceptions', '- Prioritize findings by severity and business impact', '',
        'Output:', '- Audit report', '- Control maturity assessment', '- Findings and recommendations', '- Corrective action plan', '- Executive summary', '',
        'Result:', 'Audit service is ready when the organization needs a clear, independent view of what works, what fails and what must improve.'
      ] },
      { name: 'R&D', module: 'secure-rnd-module', body: [
        'Loading: Research and Development Security Module', 'Status: Available', '',
        'To receive R&D support, describe the product, architecture and development flow.', '',
        'Required input:', '- Product purpose', '- Technology stack', '- Cloud or on-prem environment', '- Development lifecycle', '- Security and privacy requirements', '',
        'Processing:', '- Review architecture and design assumptions', '- Identify security risks early in the development process', '- Embed privacy and security by design', '- Support secure API, cloud, identity and data architecture', '- Translate business needs into technical implementation tasks', '',
        'Output:', '- Secure architecture guidance', '- Product risk analysis', '- Security requirements for development', '- API and cloud security recommendations', '- Technical roadmap', '',
        'Result:', 'R&D service is ready when innovation needs structure, security and execution discipline.'
      ] },
      { name: 'IR', module: 'incident-response-module', body: [
        'Loading: Incident Response Module', 'Status: Standby', '',
        'To receive IR service, provide incident context immediately.', '',
        'Required input:', '- What happened', '- When it started', '- Affected systems', '- Known indicators', '- Current containment actions', '- Available logs and evidence', '',
        'Processing:', '- Stabilize the situation', '- Preserve evidence', '- Analyze scope and impact', '- Identify attack path and affected assets', '- Guide containment, eradication and recovery', '- Prepare management and regulatory communication where needed', '',
        'Output:', '- Incident triage', '- Containment plan', '- Evidence-based analysis', '- Recovery guidance', '- Post-incident report', '- Lessons learned and control improvements', '',
        'Result:', 'IR service is ready when the organization needs calm, structured and experienced handling under pressure.'
      ] },
      { name: 'IOT', module: 'iot-security-module', body: [
        'Loading: IoT Security and Architecture Module', 'Status: Available', '',
        'To receive IoT support, map the devices and communication paths.', '',
        'Required input:', '- Device types', '- Network segments', '- Protocols in use', '- Cloud connections', '- Authentication model', '- Firmware and update process', '',
        'Processing:', '- Map device behavior and network exposure', '- Separate IoT from critical systems', '- Define firewall, VLAN and access rules', '- Review identity, firmware, logging and update controls', '- Design secure monitoring and operational management', '',
        'Output:', '- IoT network architecture', '- Segmentation plan', '- Device security checklist', '- Firewall rule recommendations', '- Monitoring and hardening guidance', '',
        'Result:', 'IoT service is ready when connected devices must work reliably without becoming an uncontrolled security risk.'
      ] },
      { name: 'Full-Service', module: 'integrated-governance-suite', body: [
        'Loading: Integrated Cyber, Privacy and Technology Governance', 'Status: Ready', '',
        'Combining:', '- CISO', '- DPO', '- ISO27001', '- Audit', '- R&D', '- IR', '- IoT', '',
        'Processing:', '- Connect business needs, technology, risk and regulation into one managed security program.', '',
        'Output:', '- Tailored Information Security', '- Governance that understands technology', '- Technology that respects risk', '- Risk management that supports the business', '',
        'Result:', 'Service package ready.', 'Recommended action:', 'Start with discovery, continue with risk mapping, execute by priority.'
      ] }
    ];

    var order, oi, history, typed, phase, t, blink, preIdx, bodyIdx, barT;

    function shuffle() {
      order = COMMANDS.map(function (_, i) { return i; });
      for (var i = order.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = order[i]; order[i] = order[j]; order[j] = tmp;
      }
    }
    function reset() { shuffle(); oi = 0; history = []; typed = 0; phase = 'cmd'; t = 0; blink = 0; preIdx = 0; bodyIdx = 0; barT = 0; }

    function barStr(p) { var n = Math.round(p * BAR_LEN); return rep('█', n) + rep('░', BAR_LEN - n) + '  ' + Math.round(p * 100) + '%'; }

    function colorFor(line) {
      if (line.indexOf('Successfully installed') === 0) return BRIGHT;
      if (line.indexOf('Status:') === 0) return BRIGHT;
      if (line.indexOf('Loading:') === 0) return DIM;
      if (line.charAt(0) === '█' || line.charAt(0) === '░') return GREEN;
      if (/^[A-Z][A-Za-z &/]+:$/.test(line)) return BRIGHT;   // section headers
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

    // shared layout for both the animated console and the reduced-motion frame
    function geo() {
      var contentW = Math.min(880, W * 0.9);
      var fs = Math.max(14, Math.min(19, Math.round(contentW / 56)));
      return { contentW: contentW, fs: fs, lh: Math.round(fs * 1.5), x0: Math.round((W - contentW) / 2) };
    }

    function renderRow(row, x0, ty, fs, cursorOn) {
      if (row.cmd) {
        ctx.fillStyle = DIM; ctx.fillText(PROMPT, x0, ty);
        var pw = ctx.measureText(PROMPT).width;
        ctx.fillStyle = BRIGHT; ctx.fillText(row.text, x0 + pw, ty);
        if (row.cursor && cursorOn) {
          var cwx = x0 + pw + ctx.measureText(row.text).width;
          ctx.fillStyle = BRIGHT; ctx.fillRect(cwx + 2, ty + 2, fs * 0.5, fs);
        }
      } else {
        ctx.fillStyle = row.color; ctx.fillText(row.text, x0, ty);
      }
    }

    function draw(dt) {
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      var g = geo();
      var topY = Math.round(H * 0.10), maxRows = Math.max(6, Math.floor((H * 0.82) / g.lh));
      ctx.font = g.fs + 'px ' + MONO; ctx.textBaseline = 'top'; ctx.textAlign = 'start';

      blink += dt;
      var cursorOn = (Math.floor(blink / 530) % 2) === 0;
      var c = COMMANDS[order[oi % order.length]];
      var cmdStr = 'get ' + c.name;

      // ── install + stream state machine ──
      if (phase === 'cmd') {
        typed += dt / 40;
        if (typed >= cmdStr.length) { typed = cmdStr.length; history.push({ cmd: true, text: cmdStr }); phase = 'pre'; t = 0; preIdx = 0; }
      } else if (phase === 'pre') {
        t += dt;
        var pre = ['Found ' + c.name + ' [GRC-Labs.' + c.name + ']', 'Downloading ' + c.module + ' ...'];
        if (preIdx < pre.length && t > 240) { history.push({ text: pre[preIdx], color: INK }); preIdx++; t = 0; }
        if (preIdx >= pre.length) { phase = 'bar'; barT = 0; }
      } else if (phase === 'bar') {
        barT += dt;
        if (barT / 850 >= 1) {
          history.push({ text: barStr(1), color: GREEN });
          history.push({ text: 'Successfully installed. Launching ...', color: BRIGHT });
          history.push({ text: '', color: INK });
          phase = 'body'; bodyIdx = 0; t = 0;
        }
      } else if (phase === 'body') {
        t += dt;
        if (bodyIdx < c.body.length && t > 120) { var bl = c.body[bodyIdx]; history.push({ text: bl, color: colorFor(bl) }); bodyIdx++; t = 0; }
        if (bodyIdx >= c.body.length) { phase = 'hold'; t = 0; }
      } else if (phase === 'hold') {
        t += dt;
        if (t > 1900) { oi++; if (oi % order.length === 0) shuffle(); typed = 0; phase = 'cmd'; history.push({ text: '', color: INK }); }
      }

      // active (transient) row
      var active = null;
      if (phase === 'cmd') active = { cmd: true, text: cmdStr.slice(0, Math.floor(typed)), cursor: true };
      else if (phase === 'bar') active = { text: barStr(Math.min(barT / 850, 1)), color: GREEN };
      else if (phase === 'hold') active = { cmd: true, text: '', cursor: true };

      // build wrapped rows (history + active), auto-scroll to last maxRows
      var rows = [];
      function pushOut(text, color) {
        var wl = wrap(text, g.contentW);
        if (!wl.length) { rows.push({ text: '', color: color }); return; }
        for (var k = 0; k < wl.length; k++) rows.push({ text: (k === 0 ? wl[k] : '  ' + wl[k]), color: color });
      }
      for (var h = 0; h < history.length; h++) {
        var e = history[h];
        if (e.cmd) rows.push({ cmd: true, text: e.text });
        else pushOut(e.text, e.color);
      }
      if (active) {
        if (active.cmd) rows.push({ cmd: true, text: active.text, cursor: active.cursor });
        else pushOut(active.text, active.color);
      }
      if (rows.length > maxRows) rows = rows.slice(rows.length - maxRows);

      var ty = topY;
      for (var r = 0; r < rows.length; r++) { renderRow(rows[r], g.x0, ty, g.fs, cursorOn); ty += g.lh; }
    }

    // reduced-motion: one full response, static, scaled to fit, no animation
    function staticResponse() {
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      ctx.textBaseline = 'top'; ctx.textAlign = 'start';
      var c = COMMANDS[0];
      var items = [{ cmd: true, text: 'get ' + c.name }];
      items.push({ text: 'Found ' + c.name + ' [GRC-Labs.' + c.name + ']', color: INK });
      items.push({ text: 'Downloading ' + c.module + ' ...', color: INK });
      items.push({ text: barStr(1), color: GREEN });
      items.push({ text: 'Successfully installed. Launching ...', color: BRIGHT });
      items.push({ text: '', color: INK });
      for (var i = 0; i < c.body.length; i++) items.push({ text: c.body[i], color: colorFor(c.body[i]) });

      var contentW = Math.min(880, W * 0.9), x0 = Math.round((W - contentW) / 2);
      var fs, lh, rowCount;
      for (fs = 19; fs >= 9; fs--) {                       // shrink until it fits
        ctx.font = fs + 'px ' + MONO; lh = Math.round(fs * 1.5); rowCount = 0;
        for (var j = 0; j < items.length; j++) {
          if (items[j].cmd) { rowCount++; continue; }
          rowCount += Math.max(1, wrap(items[j].text, contentW).length);
        }
        if (rowCount * lh <= H * 0.86) break;
      }
      ctx.font = fs + 'px ' + MONO; lh = Math.round(fs * 1.5);
      var ty = Math.max(Math.round(H * 0.06), Math.round((H - rowCount * lh) / 2));
      for (var k = 0; k < items.length; k++) {
        var it = items[k];
        if (it.cmd) { renderRow({ cmd: true, text: it.text }, x0, ty, fs, false); ty += lh; continue; }
        var wl = wrap(it.text, contentW);
        if (!wl.length) { ty += lh; continue; }
        for (var w2 = 0; w2 < wl.length; w2++) { ctx.fillStyle = it.color; ctx.fillText(w2 === 0 ? wl[w2] : '  ' + wl[w2], x0, ty); ty += lh; }
      }
    }

    return { reset: reset, draw: draw, staticResponse: staticResponse };
  })();

  // ───────────────────────── mode manager + loop ─────────────────────────
  var MODES = [matrix, terminal];
  var MODE_MS = [13000, 16000];   // terminal needs room to stream a full response
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

  function activate() {
    if (active) return;
    active = true;
    resize();
    root.classList.add('on');
    if (reduceMotion) { terminal.staticResponse(); return; }   // static frame, one full response
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
