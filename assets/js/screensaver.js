/* GRC·LABS — cyber screensaver (scene console)
   After 9s idle: a one-time matrix-rain entrance dissolves into a single green
   console. Scenes then play inside it, separated by a brief matrix-wipe clear:
     A) GET <service> — winget-style install, the response typed at a readable
        pace, a "processing" download beat before the output (which opens with an
        SSH-randomart signature), then the Hebrew CTA inline in the terminal.
     B) ASCII geometry — a shape from nature/math, drawn large, gently alive.
     C) ASCII portrait — occasional; the face in green, gently breathing.
   Fluid, few effects. Any interaction exits instantly. prefers-reduced-motion →
   one static GET frame. Paused while the tab is hidden.
   Test: ?saver=now / ?saver=fast / ?saver=off, ?scene=get|geo|portrait, ?shape=N */
(function () {
  'use strict';

  var CONFIG = { enabled: true, idleMs: 9000 };
  var params = new URLSearchParams(location.search);
  if (params.get('saver') === 'off') CONFIG.enabled = false;
  if (params.get('saver') === 'fast') CONFIG.idleMs = 2500;
  var FORCE_NOW = params.get('saver') === 'now';
  var FORCE_SCENE = params.get('scene');
  var FORCE_SHAPE = parseInt(params.get('shape'), 10); if (isNaN(FORCE_SHAPE)) FORCE_SHAPE = -1;
  if (!CONFIG.enabled) return;

  var BG = '#080B14', GREEN = '#63B22E', BRIGHT = '#9BE85B', AMBER = '#F0B429',
      DIM = 'rgba(99,178,46,0.55)', INK = '#C7D0DD', MIDG = '#4FA028';
  var GREENS = ['#4FA028', '#63B22E', '#6FC036', '#5AA82A', '#3C7E20'];
  var MONO = '"IBM Plex Mono", ui-monospace, monospace';
  var HEBF = '"IBM Plex Sans Hebrew", "IBM Plex Sans", sans-serif';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var CTA = 'ספר לנו על האתגרים שלך — צור קשר';
  var PROMPT = 'grc-labs:\\> ';
  var BAR_LEN = 26;

  var style = document.createElement('style');
  style.textContent =
    '#grc-saver{position:fixed;inset:0;z-index:9999;background:' + BG + ';opacity:0;transition:opacity .6s ease;pointer-events:none}' +
    '#grc-saver.on{opacity:1;pointer-events:auto;cursor:none}' +
    '#grc-saver canvas{display:block;width:100%;height:100%}' +
    '#grc-saver .gs-tag{position:fixed;top:16px;left:20px;font:11px/1 ' + MONO + ';letter-spacing:.22em;color:' + DIM + ';text-transform:uppercase}' +
    '#grc-saver .gs-hint{position:fixed;bottom:16px;right:20px;font:11px/1 ' + MONO + ';letter-spacing:.16em;color:' + DIM + '}';
  document.head.appendChild(style);
  var root = document.createElement('div'); root.id = 'grc-saver'; root.setAttribute('aria-hidden', 'true');
  var canvas = document.createElement('canvas');
  var tag = document.createElement('div'); tag.className = 'gs-tag'; tag.textContent = 'GRC·LABS // STANDBY';
  var hint = document.createElement('div'); hint.className = 'gs-hint'; hint.textContent = '// move to dismiss';
  root.appendChild(canvas); root.appendChild(tag); root.appendChild(hint);

  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, dpr = 1;
  function resize() { dpr = Math.min(window.devicePixelRatio || 1, 2); W = window.innerWidth; H = window.innerHeight; canvas.width = Math.floor(W * dpr); canvas.height = Math.floor(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  function rep(ch, n) { var s = ''; for (var i = 0; i < n; i++) s += ch; return s; }
  function barStr(p) { var n = Math.round(p * BAR_LEN); return rep('█', n) + rep('░', BAR_LEN - n) + '  ' + Math.round(p * 100) + '%'; }
  function thinkStr(ms) { var sp = ['/', '-', '\\', '|'][Math.floor(ms / 110) % 4], p = Math.min(ms / 1800, 1), L = 18, f = Math.round(p * L); return sp + '  processing  [' + rep('▓', f) + rep('░', L - f) + ']  ' + Math.round(p * 100) + '%'; }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  // SSH-style randomart (drunken-bishop), seeded by the service name
  function randomart(name) {
    var GW = 17, GH = 9, fld = new Array(GW * GH); for (var z = 0; z < fld.length; z++) fld[z] = 0;
    var x = GW >> 1, y = GH >> 1, seed = 2166136261;
    for (var i = 0; i < name.length; i++) { seed ^= name.charCodeAt(i); seed = (seed * 16777619) >>> 0; }
    function rnd() { seed = (seed * 1103515245 + 12345) >>> 0; return seed; }
    for (var s = 0; s < 112; s++) { var b = rnd(); x = Math.max(0, Math.min(GW - 1, x + ((b & 1) ? 1 : -1))); y = Math.max(0, Math.min(GH - 1, y + ((b & 2) ? 1 : -1))); fld[y * GW + x]++; }
    var ch = ' .o+=*BOX@%&#/^', lines = [];
    function frame(label) { var s = '[' + label + ']', dash = GW - s.length, l = Math.max(0, dash >> 1), r = Math.max(0, dash - l); return '+' + rep('-', l) + s + rep('-', r) + '+'; }
    lines.push(frame(' SIGNATURE '));
    for (var r2 = 0; r2 < GH; r2++) { var row = '|'; for (var c = 0; c < GW; c++) row += ch.charAt(Math.min(ch.length - 1, fld[r2 * GW + c])); lines.push(row + '|'); }
    lines.push(frame('GRC-Labs'));
    return lines;
  }

  // ──────────────────────────── GET content ────────────────────────────
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

  // ──────────────────────── console helpers ────────────────────────
  function consoleGeo() {
    var contentW = Math.min(900, W * 0.9), fs = Math.max(15, Math.min(20, Math.round(contentW / 50)));
    return { contentW: contentW, fs: fs, lh: Math.round(fs * 1.5), x0: Math.round((W - contentW) / 2), topY: Math.round(H * 0.10), maxRows: Math.max(6, Math.floor((H * 0.82) / Math.round(fs * 1.5))) };
  }
  function wrap(text, maxW) { var words = text.split(' '), lines = [], cur = ''; for (var i = 0; i < words.length; i++) { var test = cur ? cur + ' ' + words[i] : words[i]; if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = words[i]; } else cur = test; } if (cur) lines.push(cur); return lines; }
  function colorFor(line) {
    if (line.indexOf('Successfully installed') === 0) return BRIGHT;
    if (line.indexOf('Status:') === 0) return BRIGHT;
    if (line.indexOf('Loading:') === 0) return DIM;
    var c0 = line.charAt(0);
    if (c0 === '█' || c0 === '░') return GREEN;
    if (c0 === '+' || c0 === '|') return MIDG;            // signature box
    if (/^[A-Z][A-Za-z &/]+:$/.test(line)) return BRIGHT;
    return INK;
  }
  function isHeader(line) { return /^[A-Z][A-Za-z &/]+:$/.test(line); }

  function drawConsole(rows, activeCmd, activeBar, cursorOn, thinkLine) {
    ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
    var g = consoleGeo();
    ctx.font = g.fs + 'px ' + MONO; ctx.textBaseline = 'top'; ctx.textAlign = 'start';
    var disp = [];
    function pushOut(text, color) { var wl = wrap(text, g.contentW); if (!wl.length) { disp.push({ text: '', color: color }); return; } for (var k = 0; k < wl.length; k++) disp.push({ text: (k === 0 ? wl[k] : '  ' + wl[k]), color: color }); }
    for (var i = 0; i < rows.length; i++) { var r = rows[i]; if (r.cmd) disp.push({ cmd: true, text: r.text }); else if (r.cta) disp.push({ cta: true, text: r.text }); else pushOut(r.text, r.color); }
    if (thinkLine != null) disp.push({ text: thinkLine, color: GREEN });
    if (activeCmd != null) disp.push({ cmd: true, text: activeCmd, cursor: true });
    if (activeBar != null) disp.push({ text: activeBar, color: GREEN });
    if (disp.length > g.maxRows) disp = disp.slice(disp.length - g.maxRows);
    var ty = g.topY;
    for (var d = 0; d < disp.length; d++) {
      var row = disp[d];
      if (row.cmd) {
        ctx.font = g.fs + 'px ' + MONO; ctx.textAlign = 'start'; ctx.direction = 'ltr';
        ctx.fillStyle = DIM; ctx.fillText(PROMPT, g.x0, ty);
        var pw = ctx.measureText(PROMPT).width;
        ctx.fillStyle = BRIGHT; ctx.fillText(row.text, g.x0 + pw, ty);
        if (row.cursor && cursorOn) { var cwx = g.x0 + pw + ctx.measureText(row.text).width; ctx.fillStyle = BRIGHT; ctx.fillRect(cwx + 2, ty + 2, g.fs * 0.5, g.fs); }
      } else if (row.cta) {
        ctx.save(); ctx.font = g.fs + 'px ' + HEBF; ctx.direction = 'rtl'; ctx.textAlign = 'left'; ctx.fillStyle = AMBER;
        ctx.fillText(row.text, g.x0, ty); ctx.restore();
      } else {
        ctx.font = g.fs + 'px ' + MONO; ctx.textAlign = 'start'; ctx.direction = 'ltr';
        ctx.fillStyle = row.color; ctx.fillText(row.text, g.x0, ty);
      }
      ty += g.lh;
    }
  }

  // ─────────────────────────── SCENE: GET ───────────────────────────
  function getScene(cmd) {
    var rows = [], phase = 'cmd', typed = 0, t = 0, barT = 0, preIdx = 0, bodyIdx = 0, holdT = 0, blink = 0, elapsed = 0, thinkT = 0, thought = false;
    var cmdStr = 'get ' + cmd.name;
    var pre = ['Found ' + cmd.name + ' [GRC-Labs.' + cmd.name + ']', 'Downloading ' + cmd.module + ' ...'];
    var body = cmd.body.slice(), oi = body.indexOf('Output:');
    if (oi >= 0) { var art = randomart(cmd.name); art.push(''); body = body.slice(0, oi + 1).concat(art, body.slice(oi + 1)); }
    function frame(dt) {
      elapsed += dt; blink += dt;
      if (phase === 'cmd') { typed += dt / 55; if (typed >= cmdStr.length) { typed = cmdStr.length; rows.push({ cmd: true, text: cmdStr }); phase = 'pre'; t = 0; } }
      else if (phase === 'pre') { t += dt; if (preIdx < pre.length && t > 360) { rows.push({ text: pre[preIdx], color: INK }); preIdx++; t = 0; } if (preIdx >= pre.length) { phase = 'bar'; barT = 0; } }
      else if (phase === 'bar') { barT += dt; if (barT / 1300 >= 1) { rows.push({ text: barStr(1), color: GREEN }); rows.push({ text: 'Successfully installed. Launching ...', color: BRIGHT }); rows.push({ text: '', color: INK }); phase = 'body'; bodyIdx = 0; t = 0; } }
      else if (phase === 'body') {
        if (!thought && body[bodyIdx] === 'Output:') { phase = 'think'; thinkT = 0; thought = true; }   // download/think beat
        else { t += dt; var nl = body[bodyIdx]; var c0 = nl ? nl.charAt(0) : ''; var need = (nl !== undefined && isHeader(nl)) ? 520 : ((c0 === '+' || c0 === '|') ? 60 : 290); if (bodyIdx < body.length && t > need) { rows.push({ text: nl, color: colorFor(nl) }); bodyIdx++; t = 0; } if (bodyIdx >= body.length) { phase = 'resultHold'; t = 0; } }
      }
      else if (phase === 'think') { thinkT += dt; if (thinkT > 1800) { phase = 'body'; t = 0; } }
      else if (phase === 'resultHold') { t += dt; if (t > 800) { rows.push({ text: '', color: INK }); rows.push({ cta: true, text: CTA }); phase = 'cta'; holdT = 0; } }
      else if (phase === 'cta') { holdT += dt; if (holdT > 700) phase = 'done'; }
      if (elapsed > 40000) phase = 'done';
      var activeCmd = (phase === 'cmd') ? cmdStr.slice(0, Math.floor(typed)) : ((phase === 'resultHold' || phase === 'cta') ? '' : null);
      drawConsole(rows, activeCmd, (phase === 'bar') ? barStr(Math.min(barT / 1300, 1)) : null, (Math.floor(blink / 530) % 2) === 0, (phase === 'think') ? thinkStr(thinkT) : null);
      return phase === 'done';
    }
    return { frame: frame };
  }

  // ─────────────────────── SCENE: ASCII geometry (large) ───────────────────────
  function plot(ch, x, y, color) { if (x < -20 || x > W + 20 || y < -20 || y > H + 20) return; ctx.fillStyle = color; ctx.fillText(ch, x, y); }
  var SHAPES = [
    { name: 'golden spiral · φ', fn: function (p) {
      var cx = W / 2, cy = H / 2, b = 0.1759, a = Math.min(W, H) * 0.46 / Math.exp(b * 6.4 * Math.PI), N = 620, n = Math.floor(p * N);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (var s = 0; s < n; s++) { var th = (s / N) * 6.4 * Math.PI, r = a * Math.exp(b * th); plot('·', cx + r * Math.cos(th), cy + r * Math.sin(th), s > n - 22 ? BRIGHT : GREENS[(s * 5) % GREENS.length]); }
    } },
    { name: 'phyllotaxis · sunflower', fn: function (p) {
      var N = 760, cx = W / 2, cy = H / 2, c = Math.min(W, H) * 0.48 / Math.sqrt(N), gold = Math.PI * (3 - Math.sqrt(5)), n = Math.floor(p * N);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (var i = 0; i < n; i++) { var ang = i * gold, r = c * Math.sqrt(i); plot(i % 9 === 0 ? '✦' : '*', cx + r * Math.cos(ang), cy + r * Math.sin(ang), i > n - 30 ? BRIGHT : GREENS[i % GREENS.length]); }
    } },
    { name: 'harmonic waves · sin', fn: function (p) {
      var midY = H / 2, A = Math.min(H * 0.34, 280), k = (2 * Math.PI) / Math.min(W * 0.42, 520), xe = p * W, step = Math.max(6, W / 230);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (var x = 0; x < xe; x += step) { plot('·', x, midY + A * Math.sin(x * k), GREEN); plot('·', x, midY + A * 0.6 * Math.sin(x * k * 2 + 1), '#4FA028'); plot('·', x, midY + A * 0.32 * Math.sin(x * k * 3 + 2), '#3C7E20'); }
    } },
    { name: 'fractal tree', fn: function (p) {
      var rd = p * 11, fs = Math.max(8, Math.min(13, Math.min(W, H) / 64));
      ctx.font = fs + 'px ' + MONO; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      (function branch(x, y, len, ang, depth) {
        if (depth > rd || len < 5) return;
        var x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len, d = Math.hypot(x2 - x, y2 - y), steps = Math.max(1, Math.floor(d / (fs * 0.55))), col = depth > 7 ? BRIGHT : (depth > 4 ? GREEN : '#3C7E20');
        for (var i = 0; i <= steps; i++) plot(depth > 7 ? '*' : '·', x + (x2 - x) * i / steps, y + (y2 - y) * i / steps, col);
        branch(x2, y2, len * 0.75, ang - 0.42, depth + 1); branch(x2, y2, len * 0.75, ang + 0.42, depth + 1);
      })(W / 2, H * 0.93, Math.min(W, H) * 0.2, -Math.PI / 2, 0);
    } },
    { name: 'double helix · DNA', fn: function (p) {
      var cx = W / 2, A = Math.min(W * 0.16, 150), top = H * 0.1, bot = H * 0.9, k = 0.024, step = Math.max(7, H / 95), ye = top + p * (bot - top), idx = 0;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (var y = top; y < ye; y += step) { var x1 = cx + A * Math.sin(y * k), x2 = cx + A * Math.sin(y * k + Math.PI); if (idx % 4 === 0) for (var s = 1; s < 6; s++) plot('-', x1 + (x2 - x1) * s / 6, y, '#2E6B1A'); plot('o', x1, y, GREEN); plot('o', x2, y, '#4FA028'); idx++; }
    } }
  ];
  function geoScene(shape) {
    var t = 0, REVEAL = 3400, DUR = 5400;
    return { frame: function (dt) {
      t += dt; ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      var fs = Math.max(9, Math.min(15, Math.min(W, H) / 60)); ctx.font = fs + 'px ' + MONO;
      var pulse = 1 + 0.012 * Math.sin(t * 0.0035);   // gentle life — never frozen
      ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(pulse, pulse); ctx.translate(-W / 2, -H / 2);
      shape.fn(Math.min(t / REVEAL, 1)); ctx.restore();
      ctx.fillStyle = DIM; ctx.font = '600 ' + Math.max(11, Math.round(W / 95)) + 'px ' + MONO; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(shape.name, W / 2, H * 0.96); ctx.textAlign = 'start'; ctx.textBaseline = 'top';
      return t >= DUR;
    } };
  }

  // ─────────────────────── SCENE: ASCII portrait ───────────────────────
  var portrait = (function () {
    var RAMP = " .,:;-~=+*coaeUXEZ%#8B@", FLICK = '01<>[]{}/|=+*#%&XAHKMWZ'.split('');
    var img = new Image(), ready = false, failed = false, grid = null, gw = 0, gh = 0, fs = 0, sized = -1, cache = null, ax0 = 0, ay0 = 0, acw = 0, ablockH = 0, cy = 0;
    img.onload = function () { ready = true; grid = null; }; img.onerror = function () { failed = true; };
    img.src = 'assets/img/portrait-dark.jpg';
    function key() { return W * 100000 + H; }
    function build() {
      var side = Math.min(W * 0.86, H * 0.7); fs = Math.max(7, Math.min(13, side / 54)); acw = fs * 0.6;
      gw = Math.max(44, Math.floor(side / acw)); gh = Math.max(44, Math.floor(side / fs));
      var off = document.createElement('canvas'); off.width = gw; off.height = gh; var o = off.getContext('2d'); o.drawImage(img, 0, 0, gw, gh); var d = o.getImageData(0, 0, gw, gh).data; grid = [];
      for (var r = 0; r < gh; r++) { var row = []; for (var c = 0; c < gw; c++) { var i = (r * gw + c) * 4, lum = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255, v = (lum - 0.16) / 0.74; v = Math.max(0, Math.min(1, v)); v = Math.pow(v, 0.7); var ch, col; if (v < 0.12) { ch = ' '; col = null; } else { ch = RAMP.charAt(Math.min(RAMP.length - 1, Math.floor(v * RAMP.length))); col = v > 0.7 ? BRIGHT : (v > 0.36 ? GREEN : '#3C7E20'); } row.push({ ch: ch, col: col, settle: 280 + Math.random() * 600 + (r / gh) * 620 }); } grid.push(row); }
      ablockH = gh * fs; ax0 = Math.round((W - gw * acw) / 2); ay0 = Math.round((H - ablockH) / 2) - fs; cy = ay0 + ablockH / 2;
      cache = document.createElement('canvas'); cache.width = W; cache.height = H; var cc = cache.getContext('2d'); cc.font = fs + 'px ' + MONO.replace(/"/g, ''); cc.textBaseline = 'top'; cc.textAlign = 'start';
      for (var rr = 0; rr < gh; rr++) for (var cx2 = 0; cx2 < gw; cx2++) { var cl = grid[rr][cx2]; if (cl.col === null) continue; cc.fillStyle = cl.col; cc.fillText(cl.ch, ax0 + cx2 * acw, ay0 + rr * fs); }
      cc.fillStyle = DIM; cc.font = '700 ' + Math.max(11, Math.round(fs)) + 'px ' + MONO.replace(/"/g, ''); cc.textAlign = 'center'; cc.fillText('SUBJECT // Y.DADON — CISO', W / 2, ay0 + ablockH + fs * 0.8);
      sized = key();
    }
    function scene() {
      var ageMs = 0, DUR = 7000;
      return { frame: function (dt) {
        ageMs += dt; ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H); ctx.textAlign = 'start'; ctx.textBaseline = 'top';
        if (failed) { ctx.fillStyle = GREEN; ctx.font = '700 ' + Math.round(W / 42) + 'px ' + MONO; ctx.textAlign = 'center'; ctx.fillText('// SUBJECT UNAVAILABLE', W / 2, H / 2); ctx.textAlign = 'start'; return ageMs >= DUR; }
        if (!ready) { ctx.fillStyle = DIM; ctx.font = '700 ' + Math.round(W / 42) + 'px ' + MONO; ctx.textAlign = 'center'; ctx.fillText('// DECRYPTING SUBJECT ...', W / 2, H / 2); ctx.textAlign = 'start'; return false; }
        if (!grid || sized !== key()) build();
        if (ageMs < 1500) {
          ctx.font = fs + 'px ' + MONO;
          for (var r = 0; r < gh; r++) { var row = grid[r], yy = ay0 + r * fs; for (var c = 0; c < gw; c++) { var cell = row[c]; if (cell.col === null) continue; if (ageMs >= cell.settle) { ctx.fillStyle = cell.col; ctx.fillText(cell.ch, ax0 + c * acw, yy); } else if (Math.random() < 0.45) { ctx.fillStyle = DIM; ctx.fillText(FLICK[(Math.random() * FLICK.length) | 0], ax0 + c * acw, yy); } } }
        } else { var s = 1 + 0.016 * Math.sin((ageMs - 1500) * 0.0023); ctx.save(); ctx.translate(W / 2, cy); ctx.scale(s, s); ctx.translate(-W / 2, -cy); ctx.drawImage(cache, 0, 0); ctx.restore(); }
        return ageMs >= DUR;
      } };
    }
    return { scene: scene };
  })();

  // ─────────────────────── matrix (entrance + wipe between scenes) ───────────────────────
  var matrix = (function () {
    var GLYPHS = 'アイウエオカキクケコサシスセソタチツテトﾊﾋﾌﾍﾎ0123456789#%&<>*+=/'.split('');
    var fs = 16, cols = 0, rows = 0, drops = [], speeds = [];
    function reset() { fs = Math.max(12, Math.min(20, Math.round(W / 70))); cols = Math.ceil(W / fs); rows = Math.ceil(H / fs); drops = []; speeds = []; for (var i = 0; i < cols; i++) { drops[i] = Math.floor(Math.random() * -rows); speeds[i] = 0.5 + Math.random() * 0.7; } }
    function draw(dt) {
      ctx.fillStyle = 'rgba(8,11,20,0.12)'; ctx.fillRect(0, 0, W, H); ctx.font = fs + 'px ' + MONO; ctx.textAlign = 'start'; ctx.textBaseline = 'top'; ctx.direction = 'ltr';
      for (var i = 0; i < cols; i++) { var ch = GLYPHS[(Math.random() * GLYPHS.length) | 0], y = drops[i] * fs; ctx.fillStyle = Math.random() > 0.94 ? BRIGHT : GREENS[(Math.random() * GREENS.length) | 0]; if (y > 0) ctx.fillText(ch, i * fs, y); if (y > H && Math.random() > 0.975) { drops[i] = Math.floor(Math.random() * -8); speeds[i] = 0.5 + Math.random() * 0.7; } drops[i] += speeds[i]; }
    }
    return { reset: reset, draw: draw };
  })();

  // ─────────────────────── reduced-motion static frame ───────────────────────
  function staticFrame() {
    ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H); ctx.textBaseline = 'top'; ctx.textAlign = 'start';
    var c = COMMANDS[0], items = [{ cmd: true, text: 'get ' + c.name }, { text: 'Found ' + c.name + ' [GRC-Labs.' + c.name + ']', color: INK }, { text: 'Downloading ' + c.module + ' ...', color: INK }, { text: barStr(1), color: GREEN }, { text: 'Successfully installed. Launching ...', color: BRIGHT }, { text: '', color: INK }];
    var body = c.body.slice(), oi = body.indexOf('Output:'); if (oi >= 0) { var art = randomart(c.name); art.push(''); body = body.slice(0, oi + 1).concat(art, body.slice(oi + 1)); }
    for (var i = 0; i < body.length; i++) items.push({ text: body[i], color: colorFor(body[i]) });
    items.push({ text: '', color: INK }); items.push({ cta: true, text: CTA });
    var contentW = Math.min(900, W * 0.9), x0 = Math.round((W - contentW) / 2), fs, lh, rc;
    for (fs = 19; fs >= 8; fs--) { ctx.font = fs + 'px ' + MONO; lh = Math.round(fs * 1.5); rc = 0; for (var j = 0; j < items.length; j++) { if (items[j].cmd || items[j].cta) { rc++; continue; } rc += Math.max(1, wrap(items[j].text, contentW).length); } if (rc * lh <= H * 0.9) break; }
    ctx.font = fs + 'px ' + MONO; lh = Math.round(fs * 1.5); var ty = Math.max(Math.round(H * 0.05), Math.round((H - rc * lh) / 2));
    for (var k = 0; k < items.length; k++) { var it = items[k];
      if (it.cmd) { ctx.font = fs + 'px ' + MONO; ctx.textAlign = 'start'; ctx.direction = 'ltr'; ctx.fillStyle = DIM; ctx.fillText(PROMPT, x0, ty); ctx.fillStyle = BRIGHT; ctx.fillText(it.text, x0 + ctx.measureText(PROMPT).width, ty); ty += lh; continue; }
      if (it.cta) { ctx.save(); ctx.font = fs + 'px ' + HEBF; ctx.direction = 'rtl'; ctx.textAlign = 'left'; ctx.fillStyle = AMBER; ctx.fillText(it.text, x0, ty); ctx.restore(); ty += lh; continue; }
      var wl = wrap(it.text, contentW); if (!wl.length) { ty += lh; continue; } for (var w = 0; w < wl.length; w++) { ctx.font = fs + 'px ' + MONO; ctx.textAlign = 'start'; ctx.direction = 'ltr'; ctx.fillStyle = it.color; ctx.fillText(w === 0 ? wl[w] : '  ' + wl[w], x0, ty); ty += lh; } }
  }

  // ─────────────────────────── scheduler + loop ───────────────────────────
  var cmdOrder, cmdI = 0, shapeOrder, shapeI = 0, sceneNum = 0;
  function nextCmd() { if (!cmdOrder || cmdI >= cmdOrder.length) { cmdOrder = shuffle(COMMANDS.map(function (_, i) { return i; })); cmdI = 0; } return COMMANDS[cmdOrder[cmdI++]]; }
  function nextShape() { if (FORCE_SHAPE >= 0 && FORCE_SHAPE < SHAPES.length) return SHAPES[FORCE_SHAPE]; if (!shapeOrder || shapeI >= shapeOrder.length) { shapeOrder = shuffle(SHAPES.map(function (_, i) { return i; })); shapeI = 0; } return SHAPES[shapeOrder[shapeI++]]; }
  function scheduleType() { if (FORCE_SCENE) return FORCE_SCENE; sceneNum++; if (sceneNum % 7 === 0) return 'portrait'; return (sceneNum % 2 === 1) ? 'get' : 'geo'; }
  function nextScene() { var ty = scheduleType(); if (ty === 'geo') return geoScene(nextShape()); if (ty === 'portrait') return portrait.scene(); return getScene(nextCmd()); }

  var ENTRANCE_MS = 3500, DISSOLVE_MS = 800, WIPE_MS = 750;
  var sphase = 'entrance', pt = 0, scene = null, raf = 0, last = 0;
  function frame(now) {
    if (!last) last = now; var dt = Math.min(80, now - last); last = now;
    if (sphase === 'entrance') {
      matrix.draw(dt); pt += dt;
      if (pt >= ENTRANCE_MS) { var a = Math.min((pt - ENTRANCE_MS) / DISSOLVE_MS, 1); ctx.globalAlpha = a; ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; if (pt >= ENTRANCE_MS + DISSOLVE_MS) { scene = nextScene(); sphase = 'scene'; } }
    } else if (sphase === 'scene') {
      if (scene.frame(dt)) { sphase = 'wipe'; pt = 0; matrix.reset(); }
    } else if (sphase === 'wipe') {
      matrix.draw(dt); pt += dt;
      if (pt > WIPE_MS * 0.5) { var a2 = Math.min((pt - WIPE_MS * 0.5) / (WIPE_MS * 0.5), 1); ctx.globalAlpha = a2; ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
      if (pt >= WIPE_MS) { scene = nextScene(); sphase = 'scene'; }
    }
    raf = requestAnimationFrame(frame);
  }

  // ─────────────────────────── activation / idle ───────────────────────────
  var active = false, lastActivity = performance.now();
  function activate() {
    if (active) return; active = true; resize(); root.classList.add('on');
    if (reduceMotion) { staticFrame(); return; }
    sceneNum = 0; cmdOrder = null; shapeOrder = null; last = 0;
    if (FORCE_SCENE) { scene = nextScene(); sphase = 'scene'; } else { sphase = 'entrance'; pt = 0; matrix.reset(); ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H); }
    raf = requestAnimationFrame(frame);
  }
  function deactivate() { if (!active) return; active = false; root.classList.remove('on'); if (raf) cancelAnimationFrame(raf), raf = 0; lastActivity = performance.now(); }
  function onActivity() { lastActivity = performance.now(); if (active) deactivate(); }
  setInterval(function () { if (active || document.hidden) return; if (performance.now() - lastActivity >= CONFIG.idleMs) activate(); }, 1000);
  ['mousemove', 'mousedown', 'wheel', 'keydown', 'touchstart', 'scroll'].forEach(function (ev) { window.addEventListener(ev, onActivity, { passive: true }); });
  document.addEventListener('visibilitychange', function () { if (!active || reduceMotion) return; if (document.hidden) { if (raf) cancelAnimationFrame(raf), raf = 0; } else { last = 0; raf = requestAnimationFrame(frame); } });
  window.addEventListener('resize', function () { if (active) resize(); });
  document.addEventListener('DOMContentLoaded', function () { document.body.appendChild(root); });
  if (document.readyState !== 'loading') document.body.appendChild(root);
  if (FORCE_NOW) setTimeout(activate, 400);
})();
