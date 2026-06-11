/* GRC·LABS — cyber screensaver (scene console)
   After 9s idle: a matrix entrance fills then drains to the bottom, revealing a
   single bash-style console. Scenes play inside it, separated by a full-screen
   matrix transition that fills the screen, flows all the way down and out, then
   lets the next scene fade up — no mid-animation cut:
     A) GET <service> — `pip install` with dependency resolution, a faked
        `ssh-keygen` (fingerprint + randomart), the response typed at a readable
        pace with a CLI "processing" beat, then the Hebrew CTA inline.
     B) ASCII geometry — square ASCII-art grid of a shape (spiral / sine / helix).
     C) ASCII portrait — occasional; square, static (no breathing zoom).
   One GET per cycle, then two other topics, then the next GET. Fluid, few
   effects. Any interaction exits instantly. prefers-reduced-motion → one static
   GET frame. Paused while the tab is hidden.
   Test: ?saver=now|fast|off, ?scene=get|geo|portrait, ?shape=N */
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
  var PROMPT = 'grc-labs:~$ ';
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
  function hashOf(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 16777619) >>> 0; } return h; }
  function xs(seed) { var s = (seed >>> 0) || 1; return function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s; }; }

  function fakeHash(name) { var r = xs(hashOf('k' + name)), cs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/', out = ''; for (var i = 0; i < 43; i++) out += cs.charAt(r() % cs.length); return out; }

  // dense SSH-style randomart (drunken bishop), seeded by the service name
  function randomart(name) {
    var GW = 17, GH = 9, fld = new Array(GW * GH); for (var z = 0; z < fld.length; z++) fld[z] = 0;
    var x = GW >> 1, y = GH >> 1, sx = x, sy = y, rnd = xs(hashOf(name));
    for (var s = 0; s < 380; s++) { var b = rnd(); x = Math.max(0, Math.min(GW - 1, x + ((b & 1) ? 1 : -1))); y = Math.max(0, Math.min(GH - 1, y + ((b & 2) ? 1 : -1))); fld[y * GW + x]++; }
    var ex = x, ey = y, ch = ' .o+=*BOX@%&#/^', lines = [];
    function fr(label) { var t = '[' + label + ']', d = GW - t.length, l = Math.max(0, d >> 1), r = Math.max(0, d - l); return '+' + rep('-', l) + t + rep('-', r) + '+'; }
    lines.push(fr('ED25519 256'));
    for (var r2 = 0; r2 < GH; r2++) { var row = '|'; for (var c = 0; c < GW; c++) { var ci = c === sx && r2 === sy ? 'S' : (c === ex && r2 === ey ? 'E' : ch.charAt(Math.min(ch.length - 1, fld[r2 * GW + c]))); row += ci; } lines.push(row + '|'); }
    lines.push(fr('SHA256'));
    return lines;
  }

  var DEP_POOL = [
    { n: 'risk-engine', q: '>=2.1', v: '2.3' }, { n: 'policy-kit', q: '>=1.4', v: '1.6' }, { n: 'compliance-core', q: '', v: '0.9' },
    { n: 'iso27001-controls', q: '>=3.0', v: '3.2' }, { n: 'privacy-toolkit', q: '>=1.0', v: '1.1' }, { n: 'audit-tools', q: '>=0.8', v: '0.9' },
    { n: 'crypto-utils', q: '>=4.2', v: '4.5' }, { n: 'threat-model', q: '', v: '2.0' }
  ];
  function depsFor(name) { var r = xs(hashOf('d' + name)), pool = DEP_POOL.slice(), out = []; for (var k = 0; k < 3; k++) out.push(pool.splice(r() % pool.length, 1)[0]); return out; }

  function buildSetup(name, pkg) {
    var ln = name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), deps = depsFor(name), s = [];
    s.push('Collecting ' + pkg);
    s.push('  Downloading ' + pkg.replace(/-/g, '_') + '-1.0-py3-none-any.whl (38 kB)');
    for (var i = 0; i < deps.length; i++) s.push('Collecting ' + deps[i].n + (deps[i].q ? (' ' + deps[i].q) : '') + ' (from ' + pkg + ')');
    s.push('Installing collected packages: ' + deps.map(function (d) { return d.n; }).concat(pkg).join(', '));
    s.push('Successfully installed ' + deps.map(function (d) { return d.n + '-' + d.v; }).concat(pkg + '-1.0').join(' '));
    s.push('');
    s.push('$ ssh-keygen -t ed25519 -C "' + ln + '@grc-labs"');
    s.push('Generating public/private ed25519 key pair.');
    s.push('Your identification has been saved in ~/.ssh/id_' + ln);
    s.push('The key fingerprint is:');
    s.push('SHA256:' + fakeHash(name) + ' ' + ln + '@grc-labs');
    s.push("The key's randomart image is:");
    var art = randomart(name); for (var a = 0; a < art.length; a++) s.push(art[a]);
    s.push('');
    return s;
  }
  function setupRow(line) {
    var c0 = line.charAt(0), col;
    if (line.indexOf('Successfully installed') === 0 || c0 === '$') col = BRIGHT;
    else if (c0 === '+' || c0 === '|') col = MIDG;
    else if (line.indexOf('SHA256:') === 0) col = GREEN;
    else col = INK;
    return { text: line, color: col };
  }

  // ──────────────────────────── GET content ────────────────────────────
  var COMMANDS = [
    { name: 'CISO', body: ['Loading: Cyber Leadership Module', 'Status: Available', '', 'To receive CISO service, define business context first.', '', 'Required input:', '- Organization size', '- Critical systems', '- Regulatory exposure', '- Current security maturity', '- Main risks and known gaps', '', 'Processing:', '- Map assets, systems, vendors and business processes', '- Identify cyber, operational and compliance risks', '- Build security governance, policies and work plan', '- Prioritize controls by business impact', '- Create management visibility and measurable security roadmap', '', 'Output:', '- CISO-as-a-Service', '- Risk-based security program', '- Board and management reporting', '- Security policy framework', '- Operational cyber work plan', '', 'Result:', 'CISO service is ready when the organization wants security leadership, not just technical fixes.'] },
    { name: 'DPO', body: ['Loading: Privacy Governance Module', 'Status: Available', '', 'To receive DPO service, start with personal data mapping.', '', 'Required input:', '- Types of personal data collected', '- Systems holding personal information', '- Data sharing with vendors', '- Legal basis for processing', '- Privacy notices and consent flows', '', 'Processing:', '- Map data flows across the organization', '- Identify privacy risks and regulatory gaps', '- Review retention, access, disclosure and security controls', '- Build privacy procedures and documentation', '- Prepare the organization for audits, incidents and data subject requests', '', 'Output:', '- Privacy compliance framework', '- Data processing inventory', '- DPIA support where required', '- Vendor privacy review', '- Management guidance on privacy obligations', '', 'Result:', 'DPO service is ready when privacy must become managed, documented and defensible.'] },
    { name: 'ISO27001', body: ['Loading: Information Security Management System', 'Status: Available', '', 'To receive ISO 27001 readiness, define the scope.', '', 'Required input:', '- Business units in scope', '- Systems and locations in scope', '- Existing policies and procedures', '- Risk assessment status', '- Certification target or internal compliance target', '', 'Processing:', '- Define ISMS scope', '- Perform gap analysis against ISO 27001', '- Build risk assessment and treatment plan', '- Create required policies, procedures and evidence', '- Prepare management review, internal audit and certification readiness', '', 'Output:', '- ISO 27001 gap report', '- Risk register', '- Statement of Applicability', '- Policies and procedures', '- Certification readiness plan', '', 'Result:', 'ISO 27001 service is ready when security needs to become a managed system, not a collection of documents.'] },
    { name: 'Audit', body: ['Loading: Audit Engine', 'Status: Available', '', 'To receive audit service, define what needs to be tested.', '', 'Required input:', '- Audit scope', '- Standard or regulation', '- Systems and departments involved', '- Previous findings', '- Required reporting format', '', 'Processing:', '- Review documentation and evidence', '- Interview stakeholders', '- Validate controls in practice', '- Identify gaps, risks and exceptions', '- Prioritize findings by severity and business impact', '', 'Output:', '- Audit report', '- Control maturity assessment', '- Findings and recommendations', '- Corrective action plan', '- Executive summary', '', 'Result:', 'Audit service is ready when the organization needs a clear, independent view of what works, what fails and what must improve.'] },
    { name: 'R&D', body: ['Loading: Research and Development Security Module', 'Status: Available', '', 'To receive R&D support, describe the product, architecture and development flow.', '', 'Required input:', '- Product purpose', '- Technology stack', '- Cloud or on-prem environment', '- Development lifecycle', '- Security and privacy requirements', '', 'Processing:', '- Review architecture and design assumptions', '- Identify security risks early in the development process', '- Embed privacy and security by design', '- Support secure API, cloud, identity and data architecture', '- Translate business needs into technical implementation tasks', '', 'Output:', '- Secure architecture guidance', '- Product risk analysis', '- Security requirements for development', '- API and cloud security recommendations', '- Technical roadmap', '', 'Result:', 'R&D service is ready when innovation needs structure, security and execution discipline.'] },
    { name: 'IR', body: ['Loading: Incident Response Module', 'Status: Standby', '', 'To receive IR service, provide incident context immediately.', '', 'Required input:', '- What happened', '- When it started', '- Affected systems', '- Known indicators', '- Current containment actions', '- Available logs and evidence', '', 'Processing:', '- Stabilize the situation', '- Preserve evidence', '- Analyze scope and impact', '- Identify attack path and affected assets', '- Guide containment, eradication and recovery', '- Prepare management and regulatory communication where needed', '', 'Output:', '- Incident triage', '- Containment plan', '- Evidence-based analysis', '- Recovery guidance', '- Post-incident report', '- Lessons learned and control improvements', '', 'Result:', 'IR service is ready when the organization needs calm, structured and experienced handling under pressure.'] },
    { name: 'IOT', body: ['Loading: IoT Security and Architecture Module', 'Status: Available', '', 'To receive IoT support, map the devices and communication paths.', '', 'Required input:', '- Device types', '- Network segments', '- Protocols in use', '- Cloud connections', '- Authentication model', '- Firmware and update process', '', 'Processing:', '- Map device behavior and network exposure', '- Separate IoT from critical systems', '- Define firewall, VLAN and access rules', '- Review identity, firmware, logging and update controls', '- Design secure monitoring and operational management', '', 'Output:', '- IoT network architecture', '- Segmentation plan', '- Device security checklist', '- Firewall rule recommendations', '- Monitoring and hardening guidance', '', 'Result:', 'IoT service is ready when connected devices must work reliably without becoming an uncontrolled security risk.'] },
    { name: 'Full-Service', body: ['Loading: Integrated Cyber, Privacy and Technology Governance', 'Status: Ready', '', 'Combining:', '- CISO', '- DPO', '- ISO27001', '- Audit', '- R&D', '- IR', '- IoT', '', 'Processing:', '- Connect business needs, technology, risk and regulation into one managed security program.', '', 'Output:', '- Tailored Information Security', '- Governance that understands technology', '- Technology that respects risk', '- Risk management that supports the business', '', 'Result:', 'Service package ready.', 'Recommended action:', 'Start with discovery, continue with risk mapping, execute by priority.'] }
  ];

  // ──────────────────────── console helpers ────────────────────────
  function consoleGeo() { var contentW = Math.min(940, W * 0.92), fs = Math.max(15, Math.min(20, Math.round(contentW / 52))); return { contentW: contentW, fs: fs, lh: Math.round(fs * 1.5), x0: Math.round((W - contentW) / 2), topY: Math.round(H * 0.09), maxRows: Math.max(6, Math.floor((H * 0.84) / Math.round(fs * 1.5))) }; }
  function wrap(text, maxW) { var words = text.split(' '), lines = [], cur = ''; for (var i = 0; i < words.length; i++) { var test = cur ? cur + ' ' + words[i] : words[i]; if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = words[i]; } else cur = test; } if (cur) lines.push(cur); return lines; }
  function colorFor(line) { if (line.indexOf('Status:') === 0) return BRIGHT; if (line.indexOf('Loading:') === 0) return DIM; if (/^[A-Z][A-Za-z &/]+:$/.test(line)) return BRIGHT; return INK; }
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
      if (row.cmd) { ctx.font = g.fs + 'px ' + MONO; ctx.textAlign = 'start'; ctx.direction = 'ltr'; ctx.fillStyle = DIM; ctx.fillText(PROMPT, g.x0, ty); var pw = ctx.measureText(PROMPT).width; ctx.fillStyle = BRIGHT; ctx.fillText(row.text, g.x0 + pw, ty); if (row.cursor && cursorOn) { var cwx = g.x0 + pw + ctx.measureText(row.text).width; ctx.fillStyle = BRIGHT; ctx.fillRect(cwx + 2, ty + 2, g.fs * 0.5, g.fs); } }
      else if (row.cta) { ctx.save(); ctx.font = g.fs + 'px ' + HEBF; ctx.direction = 'rtl'; ctx.textAlign = 'left'; ctx.fillStyle = AMBER; ctx.fillText(row.text, g.x0, ty); ctx.restore(); }
      else { ctx.font = g.fs + 'px ' + MONO; ctx.textAlign = 'start'; ctx.direction = 'ltr'; ctx.fillStyle = row.color; ctx.fillText(row.text, g.x0, ty); }
      ty += g.lh;
    }
  }

  // ─────────────────────────── SCENE: GET ───────────────────────────
  function getScene(cmd) {
    var pkg = 'grc-labs-' + cmd.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    var rows = [], phase = 'cmd', typed = 0, t = 0, setupIdx = 0, bodyIdx = 0, holdT = 0, blink = 0, elapsed = 0, thinkT = 0, thought = false, gapT = 0;
    var cmdStr = 'pip install ' + pkg, setup = buildSetup(cmd.name, pkg);
    function frame(dt) {
      elapsed += dt; blink += dt;
      if (phase === 'cmd') { typed += dt / 56; if (typed >= cmdStr.length) { typed = cmdStr.length; rows.push({ cmd: true, text: cmdStr }); phase = 'setup'; t = 0; } }
      else if (phase === 'setup') { t += dt; var sl = setup[setupIdx], c0 = sl ? sl.charAt(0) : ''; var need = (c0 === '$') ? 500 : ((c0 === '+' || c0 === '|') ? 55 : (sl === '' ? 380 : 150)); if (setupIdx < setup.length && t > need) { rows.push(setupRow(sl)); setupIdx++; t = 0; } if (setupIdx >= setup.length) { phase = 'gap'; gapT = 0; rows.push({ text: '', color: INK }); } }
      else if (phase === 'gap') { gapT += dt; if (gapT > 460) { phase = 'body'; bodyIdx = 0; t = 0; } }
      else if (phase === 'body') {
        if (!thought && cmd.body[bodyIdx] === 'Output:') { phase = 'think'; thinkT = 0; thought = true; }
        else { t += dt; var nl = cmd.body[bodyIdx]; var need2 = (nl !== undefined && isHeader(nl)) ? 560 : 300; if (bodyIdx < cmd.body.length && t > need2) { rows.push({ text: nl, color: colorFor(nl) }); bodyIdx++; t = 0; } if (bodyIdx >= cmd.body.length) { phase = 'resultHold'; t = 0; } }
      }
      else if (phase === 'think') { thinkT += dt; if (thinkT > 1700) { phase = 'body'; t = 0; } }
      else if (phase === 'resultHold') { t += dt; if (t > 1000) { rows.push({ text: '', color: INK }); rows.push({ cta: true, text: CTA }); phase = 'cta'; holdT = 0; } }
      else if (phase === 'cta') { holdT += dt; if (holdT > 1100) phase = 'done'; }
      if (elapsed > 46000) phase = 'done';
      var activeCmd = (phase === 'cmd') ? cmdStr.slice(0, Math.floor(typed)) : ((phase === 'resultHold' || phase === 'cta') ? '' : null);
      drawConsole(rows, activeCmd, null, (Math.floor(blink / 560) % 2) === 0, (phase === 'think') ? thinkStr(thinkT) : null);
      return phase === 'done';
    }
    return { frame: frame };
  }

  // ─────────── SCENE: square ASCII-art geometry (spiral / sine / helix) ───────────
  var SHAPES = [
    { name: 'golden spiral · φ', plot: function (add, prog) { var N = 1000, n = Math.floor(prog * N), b = 0.196, maxTh = 6.0 * Math.PI, mr = Math.exp(b * maxTh); for (var s = 0; s < n; s++) { var th = (s / N) * maxTh, r = Math.exp(b * th) / mr * 0.96; add(r * Math.cos(th), r * Math.sin(th)); } } },
    { name: 'harmonic waves · sin', plot: function (add, prog) { var N = Math.floor(prog * 460); for (var i = 0; i < N; i++) { var nx = -0.98 + (i / 460) * 1.96; add(nx, 0.82 * Math.sin(nx * Math.PI * 2.6)); add(nx, 0.5 * Math.sin(nx * Math.PI * 5.2 + 1)); add(nx, 0.27 * Math.sin(nx * Math.PI * 7.8 + 2)); } } },
    { name: 'double helix · DNA', plot: function (add, prog) { var N = Math.floor(prog * 460); for (var i = 0; i < N; i++) { var ny = -0.98 + (i / 460) * 1.96, x1 = 0.72 * Math.sin(ny * Math.PI * 2.4), x2 = 0.72 * Math.sin(ny * Math.PI * 2.4 + Math.PI); add(x1, ny); add(x2, ny); if (i % 11 === 0) for (var k = 1; k < 6; k++) add(x1 + (x2 - x1) * k / 6, ny); } } }
  ];
  function geoScene(shape) {
    var t = 0, REVEAL = 3600, DUR = 6200, gw = 0, gh = 0, fs = 0, x0 = 0, y0 = 0, cw = 0, skey = -1, grid = null, RAMP = ' .:-=+*#%@';
    function dims() { var side = Math.min(W, H) * 0.84; fs = Math.max(9, Math.min(15, side / 46)); cw = fs * 0.6; gw = Math.floor(side / cw); gh = Math.floor(side / fs); x0 = Math.round((W - gw * cw) / 2); y0 = Math.round((H - gh * fs) / 2); grid = new Array(gw * gh); skey = W * 100000 + H; }
    return { frame: function (dt) {
      t += dt; ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      if (skey !== W * 100000 + H) dims();
      for (var z = 0; z < grid.length; z++) grid[z] = 0;
      shape.plot(function (nx, ny) { var c = Math.round((nx + 1) / 2 * (gw - 1)), r = Math.round((1 - (ny + 1) / 2) * (gh - 1)); if (c >= 0 && c < gw && r >= 0 && r < gh) grid[r * gw + c]++; }, Math.min(t / REVEAL, 1));
      ctx.font = fs + 'px ' + MONO; ctx.textBaseline = 'top'; ctx.textAlign = 'start';
      for (var r2 = 0; r2 < gh; r2++) for (var c2 = 0; c2 < gw; c2++) { var v = grid[r2 * gw + c2]; if (!v) continue; ctx.fillStyle = v >= 4 ? BRIGHT : (v >= 2 ? GREEN : '#4FA028'); ctx.fillText(RAMP.charAt(Math.min(RAMP.length - 1, v)), x0 + c2 * cw, y0 + r2 * fs); }
      ctx.fillStyle = DIM; ctx.font = '600 ' + Math.max(11, Math.round(W / 95)) + 'px ' + MONO; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(shape.name, W / 2, H * 0.95); ctx.textAlign = 'start'; ctx.textBaseline = 'top';
      return t >= DUR;
    } };
  }

  // ─────────────────────── SCENE: ASCII portrait (square, breathing) ───────────────────────
  var portrait = (function () {
    var RAMP = " .,:;-~=+*coaeUXEZ%#8B@", FLICK = '01<>[]{}/|=+*#%&XAHKMWZ'.split('');
    var img = new Image(), ready = false, failed = false, grid = null, gw = 0, gh = 0, fs = 0, sized = -1, cache = null, ax0 = 0, ay0 = 0, acw = 0, ablockH = 0, cy = 0;
    img.onload = function () { ready = true; grid = null; }; img.onerror = function () { failed = true; };
    img.src = 'assets/img/portrait-dark.jpg';
    function key() { return W * 100000 + H; }
    function build() {
      var side = Math.min(W * 0.82, H * 0.78); fs = Math.max(7, Math.min(13, side / 56)); acw = fs * 0.6;
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
        if (ageMs < 1500) { ctx.font = fs + 'px ' + MONO; for (var r = 0; r < gh; r++) { var row = grid[r], yy = ay0 + r * fs; for (var c = 0; c < gw; c++) { var cell = row[c]; if (cell.col === null) continue; if (ageMs >= cell.settle) { ctx.fillStyle = cell.col; ctx.fillText(cell.ch, ax0 + c * acw, yy); } else if (Math.random() < 0.45) { ctx.fillStyle = DIM; ctx.fillText(FLICK[(Math.random() * FLICK.length) | 0], ax0 + c * acw, yy); } } } }
        else { ctx.drawImage(cache, 0, 0); }
        return ageMs >= DUR;
      } };
    }
    return { scene: scene };
  })();

  // ─────────────────── matrix (entrance + full-screen wipe between scenes) ───────────────────
  var matrix = (function () {
    var GLYPHS = 'アイウエオカキクケコサシスセソタチツテトﾊﾋﾌﾍﾎ0123456789#%&<>*+=/'.split('');
    var fs = 16, cols = 0, rows = 0, drops = [], speeds = [];
    function reset(fromTop) { fs = Math.max(12, Math.min(20, Math.round(W / 70))); cols = Math.ceil(W / fs); rows = Math.ceil(H / fs); drops = []; speeds = []; for (var i = 0; i < cols; i++) { drops[i] = fromTop ? -Math.random() * 6 : Math.floor(Math.random() * -rows); speeds[i] = 0.55 + Math.random() * 0.8; } }
    function draw(dt, respawn) {
      ctx.fillStyle = 'rgba(8,11,20,0.12)'; ctx.fillRect(0, 0, W, H); ctx.font = fs + 'px ' + MONO; ctx.textAlign = 'start'; ctx.textBaseline = 'top'; ctx.direction = 'ltr';
      for (var i = 0; i < cols; i++) { var ch = GLYPHS[(Math.random() * GLYPHS.length) | 0], y = drops[i] * fs; ctx.fillStyle = Math.random() > 0.94 ? BRIGHT : GREENS[(Math.random() * GREENS.length) | 0]; if (y > 0 && y < H + fs) ctx.fillText(ch, i * fs, y); if (respawn && y > H && Math.random() > 0.975) { drops[i] = Math.floor(Math.random() * -8); speeds[i] = 0.55 + Math.random() * 0.8; } else { drops[i] += speeds[i]; } }
    }
    function cleared() { for (var i = 0; i < cols; i++) if (drops[i] * fs <= H + fs) return false; return true; }
    return { reset: reset, draw: draw, cleared: cleared };
  })();

  // ─────────────────────── reduced-motion static frame ───────────────────────
  function staticFrame() {
    ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H); ctx.textBaseline = 'top'; ctx.textAlign = 'start';
    var c = COMMANDS[0], pkg = 'grc-labs-ciso';
    var items = [{ cmd: true, text: 'pip install ' + pkg }, { text: 'Successfully installed risk-engine-2.3 policy-kit-1.6 compliance-core-0.9 ' + pkg + '-1.0', color: BRIGHT }, { text: '', color: INK }, { text: "The key's randomart image is:", color: INK }];
    var art = randomart(c.name); for (var z = 0; z < art.length; z++) items.push({ text: art[z], color: MIDG });
    items.push({ text: '', color: INK });
    for (var i = 0; i < c.body.length; i++) items.push({ text: c.body[i], color: colorFor(c.body[i]) });
    items.push({ text: '', color: INK }); items.push({ cta: true, text: CTA });
    var contentW = Math.min(940, W * 0.92), x0 = Math.round((W - contentW) / 2), fs, lh, rc;
    for (fs = 18; fs >= 7; fs--) { ctx.font = fs + 'px ' + MONO; lh = Math.round(fs * 1.45); rc = 0; for (var j = 0; j < items.length; j++) { if (items[j].cmd || items[j].cta) { rc++; continue; } rc += Math.max(1, wrap(items[j].text, contentW).length); } if (rc * lh <= H * 0.92) break; }
    ctx.font = fs + 'px ' + MONO; lh = Math.round(fs * 1.45); var ty = Math.max(Math.round(H * 0.04), Math.round((H - rc * lh) / 2));
    for (var k = 0; k < items.length; k++) { var it = items[k];
      if (it.cmd) { ctx.font = fs + 'px ' + MONO; ctx.textAlign = 'start'; ctx.direction = 'ltr'; ctx.fillStyle = DIM; ctx.fillText(PROMPT, x0, ty); ctx.fillStyle = BRIGHT; ctx.fillText(it.text, x0 + ctx.measureText(PROMPT).width, ty); ty += lh; continue; }
      if (it.cta) { ctx.save(); ctx.font = fs + 'px ' + HEBF; ctx.direction = 'rtl'; ctx.textAlign = 'left'; ctx.fillStyle = AMBER; ctx.fillText(it.text, x0, ty); ctx.restore(); ty += lh; continue; }
      var wl = wrap(it.text, contentW); if (!wl.length) { ty += lh; continue; } for (var w = 0; w < wl.length; w++) { ctx.font = fs + 'px ' + MONO; ctx.textAlign = 'start'; ctx.direction = 'ltr'; ctx.fillStyle = it.color; ctx.fillText(w === 0 ? wl[w] : '  ' + wl[w], x0, ty); ty += lh; } }
  }

  // ─────────────────────────── scheduler + loop ───────────────────────────
  var cmdOrder, cmdI = 0, shapeOrder, shapeI = 0, sceneNum = 0;
  function nextCmd() { if (!cmdOrder || cmdI >= cmdOrder.length) { cmdOrder = shuffle(COMMANDS.map(function (_, i) { return i; })); cmdI = 0; } return COMMANDS[cmdOrder[cmdI++]]; }
  function nextShape() { if (FORCE_SHAPE >= 0 && FORCE_SHAPE < SHAPES.length) return SHAPES[FORCE_SHAPE]; if (!shapeOrder || shapeI >= shapeOrder.length) { shapeOrder = shuffle(SHAPES.map(function (_, i) { return i; })); shapeI = 0; } return SHAPES[shapeOrder[shapeI++]]; }
  function scheduleType() { if (FORCE_SCENE) return FORCE_SCENE; var n = sceneNum++; if (n % 3 === 0) return 'get'; if (n % 6 === 5) return 'portrait'; return 'geo'; }
  function nextScene() { var ty = scheduleType(); if (ty === 'geo') return geoScene(nextShape()); if (ty === 'portrait') return portrait.scene(); return getScene(nextCmd()); }

  var ENT_FILL = 2200, ENT_CLEAR = 1600, WIPE_FILL = 1300, WIPE_CLEAR = 1700, FADE_MS = 320, INTRO_MS = 520;
  var sphase = 'entrance', sub = 'fill', pt = 0, fadeT = 0, introT = 0, scene = null, raf = 0, last = 0;
  function startScene() { scene = nextScene(); sphase = 'scene'; introT = 0; }
  function frame(now) {
    if (!last) last = now; var dt = Math.min(80, now - last); last = now;
    if (sphase === 'entrance' || sphase === 'wipe') {
      var FILL = sphase === 'entrance' ? ENT_FILL : WIPE_FILL, CLEAR = sphase === 'entrance' ? ENT_CLEAR : WIPE_CLEAR;
      pt += dt;
      if (sub === 'fill') { matrix.draw(dt, true); if (pt >= FILL) sub = 'clear'; }
      else if (sub === 'clear') { matrix.draw(dt, false); if ((pt - FILL) >= CLEAR || matrix.cleared()) { sub = 'fade'; fadeT = 0; } }
      if (sub === 'fade') { fadeT += dt; var fa = Math.min(fadeT / FADE_MS, 1); ctx.globalAlpha = fa; ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; if (fadeT >= FADE_MS) { startScene(); sub = 'fill'; } }
    } else if (sphase === 'scene') {
      var done = scene.frame(dt);
      if (introT < INTRO_MS) { introT += dt; var ia = 1 - Math.min(introT / INTRO_MS, 1); ctx.globalAlpha = ia; ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
      if (done) { sphase = 'wipe'; sub = 'fill'; pt = 0; matrix.reset(true); }
    }
    raf = requestAnimationFrame(frame);
  }

  // ─────────────────────────── activation / idle ───────────────────────────
  var active = false, lastActivity = performance.now();
  function activate() {
    if (active) return; active = true; resize(); root.classList.add('on');
    if (reduceMotion) { staticFrame(); return; }
    sceneNum = 0; cmdOrder = null; shapeOrder = null; last = 0;
    if (FORCE_SCENE) { startScene(); } else { sphase = 'entrance'; sub = 'fill'; pt = 0; matrix.reset(false); ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H); }
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
