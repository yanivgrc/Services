/* GRC·LABS — cyber screensaver (tmux session)
   After 9s idle: one continuous tmux-style session. A persistent status bar at
   the bottom, content flowing inside the CLI. Windows switch with a matrix-rain
   wipe (fills, then drains down and out as the next window rises up from the
   bottom); the signature
   "brain" window splits into two panes (a focused stream on the left, a lateral
   CLI reasoning log on the right) so the work reads broad and deep at once.
   Windows:
     brain   — `pip install <service>` streams in the focus pane while a CLI
               reasoning log ticks through the service's sub-topics on the right.
     viz     — full-bleed ASCII animation: golden spiral, sine, helix, lissajous,
               a rotating torus, Conway's Life, Sierpiński, the Lorenz attractor,
               a butterfly curve, golden-angle phyllotaxis, base molecules
               (H₂O, CO₂, CH₄, NH₃, NaCl) or the Giza pyramids. Spiral bleeds out.
     msg     — a Hebrew line (slogan / call-to-action) decrypting inside a frame.
     rain    — matrix rain, as a window rather than a wipe.
     subject — occasional ASCII portrait.
   One brain (GET) per few windows, spaced by other topics. Any interaction exits
   instantly. prefers-reduced-motion → one static GET frame. Paused while hidden.
   Test: ?saver=now|fast|off, ?win=brain|viz|msg|rain|subject, ?shape=N, ?face=N */
(function () {
  'use strict';

  var CONFIG = { enabled: true, idleMs: 9000 };
  var params = new URLSearchParams(location.search);
  if (params.get('saver') === 'off') CONFIG.enabled = false;
  if (params.get('saver') === 'fast') CONFIG.idleMs = 2500;
  var FORCE_NOW = params.get('saver') === 'now';
  var FORCE_WIN = params.get('win');
  var FORCE_SHAPE = parseInt(params.get('shape'), 10); if (isNaN(FORCE_SHAPE)) FORCE_SHAPE = -1;
  var FORCE_FACE = parseInt(params.get('face'), 10); if (isNaN(FORCE_FACE)) FORCE_FACE = -1;
  if (!CONFIG.enabled) return;

  var BG = '#080B14', GREEN = '#63B22E', BRIGHT = '#9BE85B', AMBER = '#F0B429',
      DIM = 'rgba(99,178,46,0.55)', FAINT = 'rgba(99,178,46,0.22)', INK = '#C7D0DD', MIDG = '#4FA028';
  var GREENS = ['#4FA028', '#63B22E', '#6FC036', '#5AA82A', '#3C7E20'];
  var MONO = '"IBM Plex Mono", ui-monospace, monospace';
  var HEBF = '"IBM Plex Sans Hebrew", "IBM Plex Sans", sans-serif';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var CTA = 'ספר לנו על האתגרים שלך — צור קשר';
  var PROMPT = 'grc-labs:~$ ';
  var BAR_LEN = 26;
  var MSGS = [
    { he: 'GRC·LABS', en: '' },
    { he: 'צרו קשר', en: 'ESTABLISH CONTACT' },
    { he: 'דברו איתנו', en: "LET'S TALK" },
    { he: 'ספרו לנו איזה אתגר תרצו לפתור', en: 'NAME YOUR CHALLENGE' }
  ];
  // digit pools — the "charset" is the decimals of π / e, not random noise
  var PI_D = '31415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679';
  var E_D = '27182818284590452353602874713526624977572470936999595749669676277240766303535475945713821785251664274';
  function constPick() { return Math.random() < 0.5 ? { d: PI_D, s: 'π' } : { d: E_D, s: 'e' }; }
  // short Hebrew lines planted, sparsely, inside the ASCII — found, not shown
  var GHOSTS = ['צור קשר', 'דברו איתנו', 'מצאת אותי', 'מי קורא?', 'עדיין כאן'];

  var style = document.createElement('style');
  style.textContent =
    '#grc-saver{position:fixed;inset:0;z-index:9999;background:' + BG + ';opacity:0;transition:opacity .6s ease;pointer-events:none}' +
    '#grc-saver.on{opacity:1;pointer-events:auto;cursor:none}' +
    '#grc-saver canvas{display:block;width:100%;height:100%}' +
    '#grc-saver .gs-hint{position:fixed;bottom:8px;right:20px;font:11px/1 ' + MONO + ';letter-spacing:.16em;color:' + DIM + ';z-index:2}';
  document.head.appendChild(style);
  var root = document.createElement('div'); root.id = 'grc-saver'; root.setAttribute('aria-hidden', 'true');
  var canvas = document.createElement('canvas');
  var hint = document.createElement('div'); hint.className = 'gs-hint'; hint.textContent = '// move to dismiss';
  root.appendChild(canvas); root.appendChild(hint);

  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, dpr = 1;
  function resize() { dpr = Math.min(window.devicePixelRatio || 1, 2); W = window.innerWidth; H = window.innerHeight; canvas.width = Math.floor(W * dpr); canvas.height = Math.floor(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  function rep(ch, n) { var s = ''; for (var i = 0; i < n; i++) s += ch; return s; }
  function barStr(p) { var n = Math.round(p * BAR_LEN); return rep('█', n) + rep('░', BAR_LEN - n) + '  ' + Math.round(p * 100) + '%'; }
  function thinkStr(ms) { var sp = ['/', '-', '\\', '|'][Math.floor(ms / 110) % 4], p = Math.min(ms / 1800, 1), L = 16, f = Math.round(p * L); return sp + '  processing  [' + rep('▓', f) + rep('░', L - f) + ']  ' + Math.round(p * 100) + '%'; }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function hashOf(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 16777619) >>> 0; } return h; }
  function xs(seed) { var s = (seed >>> 0) || 1; return function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s; }; }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function ease(p) { return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

  function fakeHash(name) { var r = xs(hashOf('k' + name)), cs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/', out = ''; for (var i = 0; i < 43; i++) out += cs.charAt(r() % cs.length); return out; }
  function randomart(name) {
    var GW = 17, GH = 9, fld = new Array(GW * GH); for (var z = 0; z < fld.length; z++) fld[z] = 0;
    var x = GW >> 1, y = GH >> 1, sx = x, sy = y, rnd = xs(hashOf(name));
    for (var s = 0; s < 380; s++) { var b = rnd(); x = clamp(x + ((b & 1) ? 1 : -1), 0, GW - 1); y = clamp(y + ((b & 2) ? 1 : -1), 0, GH - 1); fld[y * GW + x]++; }
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

  // ──────────────────────────── service content ────────────────────────────
  var COMMANDS = [
    { name: 'CISO', body: ['Loading: Cyber Leadership Module', 'Status: Available', '', 'To receive CISO service, define business context first.', '', 'Required input:', '- Organization size', '- Critical systems', '- Regulatory exposure', '- Current security maturity', '- Main risks and known gaps', '', 'Processing:', '- Map assets, systems, vendors and business processes', '- Identify cyber, operational and compliance risks', '- Build security governance, policies and work plan', '- Prioritize controls by business impact', '- Create management visibility and a measurable roadmap', '', 'Output:', '- CISO-as-a-Service', '- Risk-based security program', '- Board and management reporting', '- Security policy framework', '- Operational cyber work plan', '', 'Result:', 'CISO service is ready when the organization wants security leadership, not just technical fixes.'] },
    { name: 'DPO', body: ['Loading: Privacy Governance Module', 'Status: Available', '', 'To receive DPO service, start with personal data mapping.', '', 'Required input:', '- Types of personal data collected', '- Systems holding personal information', '- Data sharing with vendors', '- Legal basis for processing', '- Privacy notices and consent flows', '', 'Processing:', '- Map data flows across the organization', '- Identify privacy risks and regulatory gaps', '- Review retention, access, disclosure and security', '- Build privacy procedures and documentation', '- Prepare for audits, incidents and subject requests', '', 'Output:', '- Privacy compliance framework', '- Data processing inventory', '- DPIA support where required', '- Vendor privacy review', '- Management guidance on privacy obligations', '', 'Result:', 'DPO service is ready when privacy must become managed, documented and defensible.'] },
    { name: 'ISO27001', body: ['Loading: Information Security Management System', 'Status: Available', '', 'To receive ISO 27001 readiness, define the scope.', '', 'Required input:', '- Business units in scope', '- Systems and locations in scope', '- Existing policies and procedures', '- Risk assessment status', '- Certification or internal compliance target', '', 'Processing:', '- Define the ISMS scope', '- Run a gap analysis against ISO 27001', '- Build risk assessment and treatment plan', '- Create policies, procedures and evidence', '- Prepare review, internal audit and certification', '', 'Output:', '- ISO 27001 gap report', '- Risk register', '- Statement of Applicability', '- Policies and procedures', '- Certification readiness plan', '', 'Result:', 'ISO 27001 service is ready when security must become a managed system, not a pile of documents.'] },
    { name: 'Audit', body: ['Loading: Audit Engine', 'Status: Available', '', 'To receive audit service, define what needs testing.', '', 'Required input:', '- Audit scope', '- Standard or regulation', '- Systems and departments involved', '- Previous findings', '- Required reporting format', '', 'Processing:', '- Review documentation and evidence', '- Interview stakeholders', '- Validate controls in practice', '- Identify gaps, risks and exceptions', '- Prioritize findings by severity and impact', '', 'Output:', '- Audit report', '- Control maturity assessment', '- Findings and recommendations', '- Corrective action plan', '- Executive summary', '', 'Result:', 'Audit service is ready when the organization needs a clear, independent view of what works and what must improve.'] },
    { name: 'R&D', body: ['Loading: Research and Development Security Module', 'Status: Available', '', 'To receive R&D support, describe the product and flow.', '', 'Required input:', '- Product purpose', '- Technology stack', '- Cloud or on-prem environment', '- Development lifecycle', '- Security and privacy requirements', '', 'Processing:', '- Review architecture and design assumptions', '- Identify security risks early in development', '- Embed privacy and security by design', '- Support API, cloud, identity and data security', '- Translate business needs into technical tasks', '', 'Output:', '- Secure architecture guidance', '- Product risk analysis', '- Security requirements for development', '- API and cloud security recommendations', '- Technical roadmap', '', 'Result:', 'R&D service is ready when innovation needs structure, security and execution discipline.'] },
    { name: 'IR', body: ['Loading: Incident Response Module', 'Status: Standby', '', 'To receive IR service, provide incident context now.', '', 'Required input:', '- What happened', '- When it started', '- Affected systems', '- Known indicators', '- Current containment actions', '- Available logs and evidence', '', 'Processing:', '- Stabilize the situation', '- Preserve evidence', '- Analyze scope and impact', '- Identify attack path and affected assets', '- Guide containment, eradication and recovery', '', 'Output:', '- Incident triage', '- Containment plan', '- Evidence-based analysis', '- Recovery guidance', '- Post-incident report', '', 'Result:', 'IR service is ready when the organization needs calm, structured handling under pressure.'] },
    { name: 'IOT', body: ['Loading: IoT Security and Architecture Module', 'Status: Available', '', 'To receive IoT support, map devices and paths.', '', 'Required input:', '- Device types', '- Network segments', '- Protocols in use', '- Cloud connections', '- Authentication model', '- Firmware and update process', '', 'Processing:', '- Map device behavior and network exposure', '- Separate IoT from critical systems', '- Define firewall, VLAN and access rules', '- Review identity, firmware, logging and updates', '- Design secure monitoring and management', '', 'Output:', '- IoT network architecture', '- Segmentation plan', '- Device security checklist', '- Firewall rule recommendations', '- Monitoring and hardening guidance', '', 'Result:', 'IoT service is ready when connected devices must work reliably without becoming an uncontrolled risk.'] },
    { name: 'Full-Service', body: ['Loading: Integrated Cyber, Privacy and Technology Governance', 'Status: Ready', '', 'Combining:', '- CISO', '- DPO', '- ISO27001', '- Audit', '- R&D', '- IR', '- IoT', '', 'Processing:', '- Connect business, technology, risk and regulation', '- Align governance with how the technology works', '- Translate risk into a prioritized program', '- Keep management visibility end to end', '', 'Output:', '- Tailored Information Security', '- Governance that understands technology', '- Technology that respects risk', '- Risk management that supports the business', '', 'Result:', 'Service package ready. Start with discovery, continue with risk mapping, execute by priority.'] }
  ];

  // ──────────────────────── text + console helpers ────────────────────────
  function wrap(text, maxW) { var words = text.split(' '), lines = [], cur = ''; for (var i = 0; i < words.length; i++) { var test = cur ? cur + ' ' + words[i] : words[i]; if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = words[i]; } else cur = test; } if (cur) lines.push(cur); return lines; }
  function colorFor(line) { if (line.indexOf('Status:') === 0) return BRIGHT; if (line.indexOf('Loading:') === 0) return DIM; if (/^[A-Z][A-Za-z &/]+:$/.test(line)) return BRIGHT; return INK; }
  function isHeader(line) { return /^[A-Z][A-Za-z &/]+:$/.test(line); }

  function drawConsole(rows, R, activeCmd, cursorOn, thinkLine) {
    var pad = Math.round(Math.min(R.w, R.h) * 0.04) + 6;
    var contentW = R.w - pad * 2, fs = clamp(Math.round(contentW / 46), 12, 19), lh = Math.round(fs * 1.5);
    var x0 = R.x + pad, topY = R.y + pad, maxRows = Math.max(4, Math.floor((R.h - pad * 2) / lh));
    ctx.font = fs + 'px ' + MONO; ctx.textBaseline = 'top'; ctx.textAlign = 'start';
    var disp = [];
    function pushOut(text, color) { var wl = wrap(text, contentW); if (!wl.length) { disp.push({ text: '', color: color }); return; } for (var k = 0; k < wl.length; k++) disp.push({ text: (k === 0 ? wl[k] : '  ' + wl[k]), color: color }); }
    for (var i = 0; i < rows.length; i++) { var r = rows[i]; if (r.cmd) disp.push({ cmd: true, text: r.text }); else if (r.cta) disp.push({ cta: true, text: r.text }); else pushOut(r.text, r.color); }
    if (thinkLine != null) disp.push({ text: thinkLine, color: GREEN });
    if (activeCmd != null) disp.push({ cmd: true, text: activeCmd, cursor: true });
    if (disp.length > maxRows) disp = disp.slice(disp.length - maxRows);
    var ty = topY;
    for (var d = 0; d < disp.length; d++) {
      var row = disp[d];
      if (row.cmd) { ctx.font = fs + 'px ' + MONO; ctx.textAlign = 'start'; ctx.direction = 'ltr'; ctx.fillStyle = DIM; ctx.fillText(PROMPT, x0, ty); var pw = ctx.measureText(PROMPT).width; ctx.fillStyle = BRIGHT; ctx.fillText(row.text, x0 + pw, ty); if (row.cursor && cursorOn) { var cwx = x0 + pw + ctx.measureText(row.text).width; ctx.fillStyle = BRIGHT; ctx.fillRect(cwx + 2, ty + 2, fs * 0.5, fs); } }
      else if (row.cta) { ctx.save(); ctx.font = fs + 'px ' + HEBF; ctx.direction = 'rtl'; ctx.textAlign = 'right'; ctx.fillStyle = AMBER; ctx.fillText(row.text, x0 + contentW, ty); ctx.restore(); }
      else { ctx.font = fs + 'px ' + MONO; ctx.textAlign = 'start'; ctx.direction = 'ltr'; ctx.fillStyle = row.color; ctx.fillText(row.text, x0, ty); }
      ty += lh;
    }
  }

  // ───────────────────────── focus pane: pip install stream ─────────────────────────
  function makeGet(cmd) {
    var pkg = 'grc-labs-' + cmd.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    var rows = [], phase = 'cmd', typed = 0, t = 0, setupIdx = 0, bodyIdx = 0, holdT = 0, blink = 0, elapsed = 0, thinkT = 0, thought = false, gapT = 0;
    var cmdStr = 'pip install ' + pkg, setup = buildSetup(cmd.name, pkg);
    function frame(dt, R) {
      elapsed += dt; blink += dt;
      if (phase === 'cmd') { typed += dt / 56; if (typed >= cmdStr.length) { typed = cmdStr.length; rows.push({ cmd: true, text: cmdStr }); phase = 'setup'; t = 0; } }
      else if (phase === 'setup') { t += dt; var sl = setup[setupIdx], c0 = sl ? sl.charAt(0) : ''; var need = (c0 === '$') ? 480 : ((c0 === '+' || c0 === '|') ? 55 : (sl === '' ? 360 : 150)); if (setupIdx < setup.length && t > need) { rows.push(setupRow(sl)); setupIdx++; t = 0; } if (setupIdx >= setup.length) { phase = 'gap'; gapT = 0; rows.push({ text: '', color: INK }); } }
      else if (phase === 'gap') { gapT += dt; if (gapT > 440) { phase = 'body'; bodyIdx = 0; t = 0; } }
      else if (phase === 'body') {
        if (!thought && cmd.body[bodyIdx] === 'Output:') { phase = 'think'; thinkT = 0; thought = true; }
        else { t += dt; var nl = cmd.body[bodyIdx]; var need2 = (nl !== undefined && isHeader(nl)) ? 540 : 300; if (bodyIdx < cmd.body.length && t > need2) { rows.push({ text: nl, color: colorFor(nl) }); bodyIdx++; t = 0; } if (bodyIdx >= cmd.body.length) { phase = 'resultHold'; t = 0; } }
      }
      else if (phase === 'think') { thinkT += dt; if (thinkT > 1700) { phase = 'body'; t = 0; } }
      else if (phase === 'resultHold') { t += dt; if (t > 900) { rows.push({ text: '', color: INK }); rows.push({ cta: true, text: CTA }); phase = 'cta'; holdT = 0; } }
      else if (phase === 'cta') { holdT += dt; if (holdT > 1100) phase = 'done'; }
      if (elapsed > 60000) phase = 'done';
      var activeCmd = (phase === 'cmd') ? cmdStr.slice(0, Math.floor(typed)) : ((phase === 'resultHold' || phase === 'cta') ? '' : null);
      drawConsole(rows, R, activeCmd, (Math.floor(blink / 560) % 2) === 0, (phase === 'think') ? thinkStr(thinkT) : null);
      return phase === 'done';
    }
    return { frame: frame, atBody: function () { return phase === 'body' || phase === 'think' || phase === 'resultHold' || phase === 'cta' || phase === 'done'; } };
  }

  // ───────────────────── lateral pane: thought tree (the brain at work) ─────────────────────
  function thinkData(cmd) {
    var b = cmd.body, phases = [], inProc = false;
    for (var i = 0; i < b.length; i++) {
      var l = b[i];
      if (l === 'Processing:') { inProc = true; continue; }
      if (inProc) { if (l === '') break; if (l.charAt(0) === '-') { var txt = l.replace(/^-\s*/, '').replace(/\band\b/g, ','); var parts = txt.split(',').map(function (s) { return s.trim(); }).filter(Boolean); var head = parts.shift() || ''; phases.push({ label: cap(head), subs: parts.slice(0, 3) }); } }
    }
    return phases.slice(0, 5);
  }
  function makeThink(cmd) {
    var data = thinkData(cmd), SPIN = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'], STAT = ['ok', 'pass', 'clear', 'mapped', 'scored'], t = 0;
    // a streaming CLI log: prompt → reasoner attaches → each phase ticks off with a tree of sub-checks
    var script = [{ kind: 'cmd', text: 'grc-think --deep ' + cmd.name.toLowerCase(), at: 0 }, { kind: 'note', text: 'attach reasoner · context=' + cmd.name.toLowerCase(), at: 320 }], at = 520, pAts = [];
    for (var i = 0; i < data.length; i++) {
      pAts.push(at); script.push({ kind: 'phase', label: data[i].label, sidx: i, at: at }); at += 640;
      var subs = data[i].subs;
      for (var s = 0; s < subs.length; s++) { script.push({ kind: 'sub', text: subs[s], last: s === subs.length - 1, at: at }); at += 300; }
    }
    var finalAt = at + 240, END = finalAt + 1400;
    script.push({ kind: 'final', at: finalAt });
    function frame(dt, R) {
      t += dt; ctx.fillStyle = BG; ctx.fillRect(R.x, R.y, R.w, R.h);
      var pad = Math.round(Math.min(R.w, R.h) * 0.05) + 8, x0 = R.x + pad, y0 = R.y + pad, w = R.w - pad * 2;
      var fs = clamp(Math.round(w / 30), 11, 16), lh = Math.round(fs * 1.6), maxRows = Math.max(4, Math.floor((R.h - pad * 2) / lh));
      ctx.font = fs + 'px ' + MONO; ctx.textBaseline = 'top'; ctx.textAlign = 'start'; ctx.direction = 'ltr';
      var dotW = ctx.measureText('.').width, lines = [], pi = -1;
      for (var k = 0; k < script.length; k++) {
        var e = script[k]; if (t < e.at) break;
        if (e.kind === 'cmd') lines.push({ pre: PROMPT, text: e.text, pcol: DIM, col: BRIGHT });
        else if (e.kind === 'note') lines.push({ text: '… ' + e.text, col: DIM });
        else if (e.kind === 'phase') {
          pi++; var done = t >= (pAts[pi + 1] != null ? pAts[pi + 1] : finalAt);
          var mark = done ? '✓' : SPIN[Math.floor(t / 90) % SPIN.length], status = done ? STAT[e.sidx % STAT.length] : 'analyzing';
          var head = mark + ' ' + e.label + ' ', nDots = Math.floor((w - ctx.measureText(head + ' ' + status).width) / dotW);
          lines.push({ text: head + rep('.', clamp(nDots, 2, 80)) + ' ' + status, col: done ? GREEN : BRIGHT });
        }
        else if (e.kind === 'sub') lines.push({ text: '  ' + (e.last ? '└─ ' : '├─ ') + e.text, col: MIDG });
        else { lines.push({ text: '', col: INK }); lines.push({ text: '✓ reasoning complete · ' + data.length + ' vectors', col: BRIGHT }); }
      }
      if (lines.length > maxRows) lines = lines.slice(lines.length - maxRows);
      var ty = y0;
      for (var d = 0; d < lines.length; d++) { var L = lines[d]; if (L.pre) { ctx.fillStyle = L.pcol; ctx.fillText(L.pre, x0, ty); ctx.fillStyle = L.col; ctx.fillText(L.text, x0 + ctx.measureText(L.pre).width, ty); } else { ctx.fillStyle = L.col; ctx.fillText(L.text, x0, ty); } ty += lh; }
      if (t < END && lines.length) { var ln = lines[lines.length - 1], lw = (ln.pre ? ctx.measureText(ln.pre).width : 0) + ctx.measureText(ln.text).width; if ((Math.floor(t / 520) % 2) === 0) { ctx.fillStyle = BRIGHT; ctx.fillRect(x0 + lw + 3, ty - lh + 2, fs * 0.5, fs); } }
      return t >= END;
    }
    return { frame: frame };
  }

  // ───────────────────────── window: brain (focus + lateral) ─────────────────────────
  function paneChrome(R, title, activeOn) {
    ctx.save(); ctx.strokeStyle = activeOn ? GREEN : 'rgba(99,178,46,0.28)'; ctx.lineWidth = 1;
    ctx.strokeRect(Math.round(R.x) + 0.5, Math.round(R.y) + 0.5, Math.round(R.w) - 1, Math.round(R.h) - 1);
    var ts = clamp(Math.round(R.h * 0.03), 10, 13); ctx.font = '600 ' + ts + 'px ' + MONO; ctx.textBaseline = 'top'; ctx.direction = 'ltr'; ctx.textAlign = 'start';
    var label = ' ' + title + ' ', lw = ctx.measureText(label).width;
    ctx.fillStyle = BG; ctx.fillRect(R.x + 12, R.y, lw, ts + 3);
    ctx.fillStyle = activeOn ? BRIGHT : DIM; ctx.fillText(label, R.x + 12, R.y + 1); ctx.restore();
  }
  function clipRect(R) { ctx.save(); ctx.beginPath(); ctx.rect(R.x, R.y, R.w, R.h); ctx.clip(); }

  // The brain window varies so it never reads the same twice: sometimes a single
  // focus pane, sometimes a focus + reasoning log, sometimes a three-pane split
  // where the lateral side itself splits into a reasoning log and a live 3D render.
  function makeBrain(cmd) {
    var get = makeGet(cmd), think = null, ascii = null, split = 0, SPLIT_MS = 720, splitting = false, narrow = false, t = 0, narrowPhase = 0, fade = 0;
    var mode = 'trio'; // TMUX always splits to three: focus + reasoning log + a live 3D render
    function frame(dt, R) {
      t += dt; narrow = R.w < 760;
      ctx.fillStyle = BG; ctx.fillRect(R.x, R.y, R.w, R.h);
      if (mode === 'solo') { var sd = get.frame(dt, R); paneChrome(R, '1:focus', true); return sd; }
      if (!narrow) {
        if (!splitting && get.atBody()) { splitting = true; if (!think) think = makeThink(cmd); if (mode === 'trio' && !ascii) ascii = (Math.random() < 0.5 ? makeDonut : makePyr3D)(); }
        if (splitting && split < 1) split = Math.min(1, split + dt / SPLIT_MS);
        var e = ease(split), gap = split > 0 ? 6 : 0;
        var leftW = R.w * (1 - (mode === 'trio' ? 0.50 : 0.46) * e) - (split > 0 ? gap / 2 : 0);
        var Lr = { x: R.x, y: R.y, w: Math.max(40, leftW), h: R.h };
        clipRect(Lr); var gd = get.frame(dt, inset(Lr, split > 0)); ctx.restore(); paneChrome(Lr, '1:focus', true);
        var rd = true;
        if (split > 0) {
          var rx = R.x + leftW + gap, rw = R.w - leftW - gap;
          if (mode === 'trio' && ascii) {
            var th = R.h * 0.52 - gap / 2, Tr = { x: rx, y: R.y, w: rw, h: th }, Ar = { x: rx, y: R.y + th + gap, w: rw, h: R.h - th - gap };
            clipRect(Tr); ctx.globalAlpha = e; rd = think.frame(dt, inset(Tr, true)); ctx.globalAlpha = 1; ctx.restore(); paneChrome(Tr, '2:reason', false);
            clipRect(Ar); ctx.globalAlpha = e; ascii.frame(dt, inset(Ar, true)); ctx.globalAlpha = 1; ctx.restore(); paneChrome(Ar, '3:render', false);
          } else if (think) {
            var Rr = { x: rx, y: R.y, w: rw, h: R.h }; clipRect(Rr); ctx.globalAlpha = e; rd = think.frame(dt, inset(Rr, true)); ctx.globalAlpha = 1; ctx.restore(); paneChrome(Rr, '2:lateral', false);
          }
        }
        return gd && (split >= 1) && rd;
      } else {
        // narrow: focus first, then cross-fade to the reasoning log
        if (narrowPhase === 0) {
          var done0 = get.frame(dt, R); paneChrome(R, '1:focus', true);
          if (get.atBody() && !think) think = makeThink(cmd);
          if (done0) { narrowPhase = 1; fade = 0; }
          return false;
        } else {
          fade = Math.min(1, fade + dt / 320);
          var dt2 = think.frame(dt, R); paneChrome(R, '2:lateral', true);
          if (fade < 1) { ctx.globalAlpha = 1 - fade; ctx.fillStyle = BG; ctx.fillRect(R.x, R.y, R.w, R.h); ctx.globalAlpha = 1; }
          return dt2;
        }
      }
    }
    function inset(R, on) { return on ? { x: R.x + 4, y: R.y + 16, w: R.w - 8, h: R.h - 22 } : R; }
    return { frame: frame, title: 'brain' };
  }

  // ───────────────────────── window: viz — ASCII animations ─────────────────────────
  var POINT_SHAPES = [
    { name: 'golden spiral · φ', plot: function (add, prog) { var N = 1100, n = Math.floor(prog * N), b = 0.196, maxTh = 6.2 * Math.PI, mr = Math.exp(b * maxTh); for (var s = 0; s < n; s++) { var th = (s / N) * maxTh, r = Math.exp(b * th) / mr; add(r * Math.cos(th), r * Math.sin(th)); } } },
    { name: 'harmonic waves · sin', plot: function (add, prog) { var N = Math.floor(prog * 520); for (var i = 0; i < N; i++) { var nx = -1.04 + (i / 520) * 2.08; add(nx, 0.84 * Math.sin(nx * Math.PI * 2.6)); add(nx, 0.5 * Math.sin(nx * Math.PI * 5.2 + 1)); add(nx, 0.27 * Math.sin(nx * Math.PI * 7.8 + 2)); } } },
    { name: 'double helix · DNA', plot: function (add, prog) { var N = Math.floor(prog * 520); for (var i = 0; i < N; i++) { var ny = -1.04 + (i / 520) * 2.08, x1 = 0.74 * Math.sin(ny * Math.PI * 2.4), x2 = 0.74 * Math.sin(ny * Math.PI * 2.4 + Math.PI); add(x1, ny); add(x2, ny); if (i % 11 === 0) for (var k = 1; k < 6; k++) add(x1 + (x2 - x1) * k / 6, ny); } } },
    { name: 'lissajous · 5:4', plot: function (add, prog) { var N = Math.floor(prog * 1400), d = Math.PI / 4; for (var i = 0; i < N; i++) { var u = (i / 1400) * Math.PI * 2; add(0.98 * Math.sin(5 * u + d), 0.98 * Math.sin(4 * u)); } } },
    { name: 'sierpiński · chaos game', plot: function (add, prog) { var V = [[0, 0.96], [-0.92, -0.86], [0.92, -0.86]], N = Math.floor(prog * 5200), r = xs(1337), x = 0, y = 0; for (var i = 0; i < N; i++) { var v = V[r() % 3]; x = (x + v[0]) / 2; y = (y + v[1]) / 2; if (i > 10) add(x, y); } } },
    { name: 'lorenz · chaos', plot: function (add, prog) { var N = Math.floor(prog * 3200), x = 0.1, y = 0, z = 0, h = 0.009; for (var i = 0; i < N; i++) { var dx = 10 * (y - x), dy = x * (28 - z) - y, dz = x * y - (8 / 3) * z; x += dx * h; y += dy * h; z += dz * h; if (i > 50) add(x / 26, (z - 25) / 28); } } },
    { name: 'butterfly · curve', plot: function (add, prog) { var N = Math.floor(prog * 2600), TT = 24 * Math.PI; for (var i = 0; i < N; i++) { var u = (i / 2600) * TT, e = Math.exp(Math.cos(u)) - 2 * Math.cos(4 * u) - Math.pow(Math.sin(u / 12), 5); add(Math.sin(u) * e / 4.3, Math.cos(u) * e / 4.3); } } },
    { name: 'phyllotaxis · φ', plot: function (add, prog) { var N = Math.floor(prog * 1500), ga = Math.PI * (3 - Math.sqrt(5)); for (var i = 0; i < N; i++) { var rr = Math.sqrt(i / 1500), a = i * ga; add(rr * Math.cos(a), rr * Math.sin(a)); } } }
  ];
  function makePointGeo(shape) {
    var t = 0, REVEAL = 3600, DUR = 6400, RAMP = ' .:-=+*#%@';
    function frame(dt, R) {
      t += dt; ctx.fillStyle = BG; ctx.fillRect(R.x, R.y, R.w, R.h);
      var side = Math.max(R.w, R.h) * 0.62, fs = clamp(side / 46, 9, 16), cw = fs * 0.6;
      var gw = Math.max(8, Math.floor(R.w / cw)), gh = Math.max(8, Math.floor(R.h / fs));
      var grid = new Array(gw * gh); for (var z = 0; z < grid.length; z++) grid[z] = 0;
      var cx = (gw - 1) / 2, cy = (gh - 1) / 2, ax = side / cw, ay = side / fs;
      shape.plot(function (nx, ny) { var c = Math.round(cx + nx * ax * 0.5), r = Math.round(cy - ny * ay * 0.5); if (c >= 0 && c < gw && r >= 0 && r < gh) grid[r * gw + c]++; }, Math.min(t / REVEAL, 1));
      var x0 = R.x + Math.round((R.w - gw * cw) / 2), y0 = R.y + Math.round((R.h - gh * fs) / 2);
      ctx.font = fs + 'px ' + MONO; ctx.textBaseline = 'top'; ctx.textAlign = 'start'; ctx.direction = 'ltr';
      ctx.fillStyle = FAINT; for (var rd = 0; rd < gh; rd++) for (var cd = 0; cd < gw; cd++) if (!grid[rd * gw + cd]) ctx.fillText('.', x0 + cd * cw, y0 + rd * fs); // empty cells get a faint dot — gives the field form
      for (var r2 = 0; r2 < gh; r2++) for (var c2 = 0; c2 < gw; c2++) { var v = grid[r2 * gw + c2]; if (!v) continue; var pc = v >= 4 ? BRIGHT : (v >= 2 ? GREEN : MIDG); if (Math.sin((r2 * 3.3 + c2 * 1.7) + t * 0.006) > 0.82) pc = BRIGHT; ctx.fillStyle = pc; ctx.fillText(RAMP.charAt(Math.min(RAMP.length - 1, v)), x0 + c2 * cw, y0 + r2 * fs); } // lit cells twinkle so the shape never freezes after reveal
      label(R, shape.name);
      return t >= DUR;
    }
    return { frame: frame, title: 'viz' };
  }
  function makeDonut() {
    var t = 0, DUR = 7200, RAMP = '.,-~:;=!*#$@';
    function frame(dt, R) {
      t += dt; ctx.fillStyle = BG; ctx.fillRect(R.x, R.y, R.w, R.h);
      var fs = clamp(Math.min(R.w, R.h) / 44, 9, 16), cw = fs * 0.6;
      var cols = Math.max(20, Math.floor(R.w / cw)), rows = Math.max(20, Math.floor(R.h / fs));
      var b = new Array(cols * rows), zb = new Array(cols * rows); for (var z = 0; z < b.length; z++) { b[z] = 0; zb[z] = 0; }
      var A = t * 0.0009, B = t * 0.0006, R1 = 1, R2 = 2, K2 = 5, K1 = Math.min(cols, rows) * K2 * 0.42 / (R1 + R2);
      for (var th = 0; th < 6.28; th += 0.07) { var ct = Math.cos(th), st = Math.sin(th);
        for (var ph = 0; ph < 6.28; ph += 0.02) { var cp = Math.cos(ph), sp = Math.sin(ph), ca = Math.cos(A), sa = Math.sin(A), cb = Math.cos(B), sb = Math.sin(B);
          var circ = R2 + R1 * ct, x = circ * (cb * cp + sa * sb * sp) - R1 * st * ca * sb;
          var y = circ * (sb * cp - sa * cb * sp) + R1 * st * ca * cb, z2 = K2 + ca * circ * sp + R1 * st * sa, ooz = 1 / z2;
          var xp = Math.floor(cols / 2 + K1 * ooz * x), yp = Math.floor(rows / 2 - K1 * ooz * y * 0.5);
          var lum = cp * ct * sb - ca * ct * sp - sa * st + cb * (ca * st - ct * sa * sp);
          if (yp >= 0 && yp < rows && xp >= 0 && xp < cols) { var idx = yp * cols + xp; if (ooz > zb[idx]) { zb[idx] = ooz; b[idx] = Math.max(0, Math.floor(lum * 8)); } }
        } }
      var x0 = R.x + Math.round((R.w - cols * cw) / 2), y0 = R.y + Math.round((R.h - rows * fs) / 2);
      ctx.font = fs + 'px ' + MONO; ctx.textBaseline = 'top'; ctx.textAlign = 'start'; ctx.direction = 'ltr';
      ctx.fillStyle = FAINT; for (var rd = 0; rd < rows; rd++) for (var cd = 0; cd < cols; cd++) if (!b[rd * cols + cd]) ctx.fillText('.', x0 + cd * cw, y0 + rd * fs); // empty cells get a faint dot — gives the field form
      for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) { var l = b[r * cols + c]; if (!l) continue; ctx.fillStyle = l >= 7 ? BRIGHT : (l >= 4 ? GREEN : MIDG); ctx.fillText(RAMP.charAt(Math.min(RAMP.length - 1, l)), x0 + c * cw, y0 + r * fs); }
      label(R, 'torus · rot');
      return t >= DUR;
    }
    return { frame: frame, title: 'viz' };
  }
  function makeLife() {
    var t = 0, DUR = 8000, acc = 0, STEP = 130, grid = null, cols = 0, rows = 0, age = null, key = -1;
    function build(R) { var fs = clamp(Math.min(R.w, R.h) / 60, 8, 13), cw = fs * 0.62; cols = Math.max(24, Math.floor(R.w / cw)); rows = Math.max(20, Math.floor(R.h / fs)); grid = new Array(cols * rows); age = new Array(cols * rows); for (var i = 0; i < grid.length; i++) { grid[i] = Math.random() < 0.30 ? 1 : 0; age[i] = 0; } key = (R.w << 1) ^ R.h; build.fs = fs; build.cw = cw; }
    function step() { var ng = new Array(cols * rows); for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) { var n = 0; for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) { if (!dx && !dy) continue; var nx = (x + dx + cols) % cols, ny = (y + dy + rows) % rows; n += grid[ny * cols + nx]; } var i = y * cols + x, alive = grid[i]; ng[i] = (alive && (n === 2 || n === 3)) || (!alive && n === 3) ? 1 : 0; age[i] = ng[i] ? (alive ? Math.min(age[i] + 1, 99) : 1) : 0; } grid = ng; }
    function frame(dt, R) {
      t += dt; acc += dt; ctx.fillStyle = BG; ctx.fillRect(R.x, R.y, R.w, R.h);
      if (!grid || key !== ((R.w << 1) ^ R.h)) build(R);
      while (acc >= STEP) { step(); acc -= STEP; }
      var fs = build.fs, cw = build.cw, x0 = R.x + Math.round((R.w - cols * cw) / 2), y0 = R.y + Math.round((R.h - rows * fs) / 2);
      ctx.font = fs + 'px ' + MONO; ctx.textBaseline = 'top'; ctx.textAlign = 'start'; ctx.direction = 'ltr';
      for (var y2 = 0; y2 < rows; y2++) for (var x2 = 0; x2 < cols; x2++) { var i = y2 * cols + x2; if (!grid[i]) continue; var a = age[i]; ctx.fillStyle = a <= 1 ? BRIGHT : (a < 6 ? GREEN : MIDG); ctx.fillText(a <= 1 ? '#' : (a < 6 ? '*' : '·'), x0 + x2 * cw, y0 + y2 * fs); }
      label(R, "conway's life");
      return t >= DUR;
    }
    return { frame: frame, title: 'viz' };
  }
  var MOLS = [
    { name: 'H₂O', atoms: [{ e: 'O', x: 0, y: 0 }, { e: 'H', x: -0.82, y: -0.42 }, { e: 'H', x: 0.82, y: -0.42 }], bonds: [[0, 1, 1], [0, 2, 1]] }, // H-O-H ≈ 126°
    { name: 'CO₂', atoms: [{ e: 'C', x: 0, y: 0 }, { e: 'O', x: -0.86, y: 0 }, { e: 'O', x: 0.86, y: 0 }], bonds: [[0, 1, 2], [0, 2, 2]] },
    { name: 'CH₄', atoms: [{ e: 'C', x: 0, y: 0 }, { e: 'H', x: 0, y: 0.82 }, { e: 'H', x: 0.78, y: -0.32 }, { e: 'H', x: -0.78, y: -0.32 }, { e: 'H', x: 0, y: -0.86 }], bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]] },
    { name: 'NH₃', atoms: [{ e: 'N', x: 0, y: 0.12 }, { e: 'H', x: 0, y: -0.74 }, { e: 'H', x: 0.74, y: 0.5 }, { e: 'H', x: -0.74, y: 0.5 }], bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1]] },
    { name: 'NaCl', atoms: [{ e: 'Na', x: -0.52, y: 0 }, { e: 'Cl', x: 0.56, y: 0 }], bonds: [[0, 1, 1]] }
  ];
  function makeMolecule() {
    var t = 0, DUR = 7000, m = MOLS[(Math.random() * MOLS.length) | 0];
    function frame(dt, R) {
      t += dt; ctx.fillStyle = BG; ctx.fillRect(R.x, R.y, R.w, R.h);
      var cx = R.x + R.w / 2, cy = R.y + R.h / 2, sc = Math.min(R.w, R.h) * 0.27, ang = t * 0.00042, ca = Math.cos(ang), sa = Math.sin(ang);
      var pts = m.atoms.map(function (a) { return { x: cx + (a.x * ca - a.y * sa) * sc, y: cy + (a.x * sa + a.y * ca) * sc }; });
      var ar = Math.min(R.w, R.h) * 0.052;
      ctx.lineWidth = 1.5; ctx.strokeStyle = GREEN;
      for (var i = 0; i < m.bonds.length; i++) { var b = m.bonds[i], A = pts[b[0]], B = pts[b[1]], dx = B.x - A.x, dy = B.y - A.y, len = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / len, uy = dy / len, ox = -uy, oy = ux; var ax = A.x + ux * ar, ay = A.y + uy * ar, bx = B.x - ux * ar, by = B.y - uy * ar; var offs = b[2] === 1 ? [0] : (b[2] === 2 ? [-3, 3] : [-4, 0, 4]); for (var o = 0; o < offs.length; o++) { ctx.beginPath(); ctx.moveTo(ax + ox * offs[o], ay + oy * offs[o]); ctx.lineTo(bx + ox * offs[o], by + oy * offs[o]); ctx.stroke(); } }
      var fs = clamp(Math.round(Math.min(R.w, R.h) / 22), 13, 28); ctx.font = '700 ' + fs + 'px ' + MONO; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = 'ltr';
      for (var a2 = 0; a2 < m.atoms.length; a2++) { var p = pts[a2], el = m.atoms[a2].e; ctx.fillStyle = BG; ctx.beginPath(); ctx.arc(p.x, p.y, ar + fs * 0.16, 0, 6.2832); ctx.fill(); ctx.strokeStyle = DIM; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(p.x, p.y, ar + fs * 0.16, 0, 6.2832); ctx.stroke(); ctx.fillStyle = (el === 'O' || el === 'Cl') ? BRIGHT : (el === 'C' ? GREEN : ((el === 'Na' || el === 'N') ? AMBER : INK)); ctx.fillText(el, p.x, p.y); }
      ctx.textAlign = 'start'; ctx.textBaseline = 'top';
      label(R, 'molecule · ' + m.name);
      return t >= DUR;
    }
    return { frame: frame, title: 'viz' };
  }
  function makePyramids() {
    var t = 0, DUR = 7200;
    function frame(dt, R) {
      t += dt; ctx.fillStyle = BG; ctx.fillRect(R.x, R.y, R.w, R.h);
      var fs = clamp(Math.round(Math.min(R.w, R.h) / 46), 9, 15), cw = fs * 0.6;
      var cols = Math.max(40, Math.floor(R.w / cw)), rows = Math.max(26, Math.floor(R.h / fs));
      var x0 = R.x + Math.round((R.w - cols * cw) / 2), y0 = R.y + Math.round((R.h - rows * fs) / 2);
      ctx.font = fs + 'px ' + MONO; ctx.textAlign = 'start'; ctx.textBaseline = 'top'; ctx.direction = 'ltr';
      var ground = Math.floor(rows * 0.80);
      var pyr = [{ cx: cols * 0.30, bh: cols * 0.15, h: Math.floor(rows * 0.40) }, { cx: cols * 0.58, bh: cols * 0.22, h: Math.floor(rows * 0.56) }, { cx: cols * 0.80, bh: cols * 0.12, h: Math.floor(rows * 0.30) }];
      var sx = cols * 0.74, sy = rows * 0.20, sr = Math.max(3, cols * 0.05);
      var rs = xs(99); for (var k = 0; k < 44; k++) { var stx = rs() % cols, sty = rs() % Math.max(1, Math.floor(rows * 0.62)); ctx.fillStyle = (rs() % 5 === 0) ? BRIGHT : FAINT; ctx.fillText('.', x0 + stx * cw, y0 + sty * fs); }
      for (var y = 0; y < rows; y++) {
        for (var c = 0; c < cols; c++) {
          var ch = null, col = GREEN;
          var ddx = (c - sx) * 0.55, ddy = (y - sy), dist = Math.sqrt(ddx * ddx + ddy * ddy);
          if (dist < sr) { ch = dist < sr * 0.5 ? '@' : '*'; col = dist < sr * 0.5 ? BRIGHT : AMBER; }
          if (y === ground) { ch = '_'; col = DIM; }
          else if (y > ground) {
            var off = y - ground;
            for (var si = 0; si < pyr.length && off <= 3; si++) { var Ps = pyr[si]; if (c >= Ps.cx - Ps.bh - off * 0.9 && c <= Ps.cx - off * 0.5) { ch = '░'; col = FAINT; } } // shadows cast down-left from the sun
            if (!ch && ((c + y) % 9) === 0) { ch = '·'; col = FAINT; }
          }
          for (var pi = 0; pi < pyr.length; pi++) {
            var P = pyr[pi], apex = ground - P.h;
            if (y > apex && y <= ground) {
              var frac = (y - apex) / Math.max(1, P.h), hw = P.bh * frac, d = c - P.cx, ad = Math.abs(d), edge = hw - ad;
              if (ad <= hw) {
                if (edge < 1) { ch = d < 0 ? '/' : '\\'; col = BRIGHT; }                                            // silhouette outline
                else if (ad < 0.85) { ch = '│'; col = BRIGHT; }                                                     // near front edge — the 3D ridge
                else if (d > 0) { var lp = Math.sin(c * 0.2 - t * 0.0028 + pi) * 0.5 + 0.5; ch = lp > 0.58 ? '▓' : '▒'; col = lp > 0.58 ? BRIGHT : GREEN; }   // sunlit right face — slow light sweep
                else { var lp2 = Math.sin(c * 0.2 - t * 0.0028 + pi) * 0.5 + 0.5; ch = lp2 > 0.55 ? '▒' : '░'; col = lp2 > 0.55 ? MIDG : DIM; }              // shadowed left face — slow light sweep
              }
            }
          }
          if (ch) { ctx.fillStyle = col; ctx.fillText(ch, x0 + c * cw, y0 + y * fs); }
        }
      }
      label(R, 'giza · pyramids');
      return t >= DUR;
    }
    return { frame: frame, title: 'viz' };
  }
  // a real 3D square pyramid — z-buffered, flat-shaded faces, spinning like the torus
  function makePyr3D() {
    var t = 0, DUR = 7200, RAMP = '.,-~:;=!*#$@';
    var AP = [0, 1.0, 0], BV = [[-0.9, -0.6, -0.9], [0.9, -0.6, -0.9], [0.9, -0.6, 0.9], [-0.9, -0.6, 0.9]];
    var faces = [[AP, BV[0], BV[1]], [AP, BV[1], BV[2]], [AP, BV[2], BV[3]], [AP, BV[3], BV[0]], [BV[0], BV[2], BV[3]], [BV[0], BV[1], BV[2]]];
    function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
    function nrm(a) { var l = Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
    var fn = faces.map(function (f) {
      var e1 = sub(f[1], f[0]), e2 = sub(f[2], f[0]);
      var n = nrm([e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]]);
      var cx = (f[0][0] + f[1][0] + f[2][0]) / 3, cy = (f[0][1] + f[1][1] + f[2][1]) / 3, cz = (f[0][2] + f[1][2] + f[2][2]) / 3;
      if (n[0] * cx + n[1] * cy + n[2] * cz < 0) n = [-n[0], -n[1], -n[2]];
      return n;
    });
    var LIGHT = nrm([0.3, 0.7, -0.9]);
    function frame(dt, R) {
      t += dt; ctx.fillStyle = BG; ctx.fillRect(R.x, R.y, R.w, R.h);
      var fs = clamp(Math.min(R.w, R.h) / 44, 9, 16), cw = fs * 0.6;
      var cols = Math.max(20, Math.floor(R.w / cw)), rows = Math.max(20, Math.floor(R.h / fs));
      var bf = new Array(cols * rows), zb = new Array(cols * rows); for (var z = 0; z < bf.length; z++) { bf[z] = -1; zb[z] = 0; }
      var A = t * 0.0011, B = t * 0.0008, ca = Math.cos(A), sa = Math.sin(A), cb = Math.cos(B), sb = Math.sin(B);
      var K2 = 5, K1 = Math.min(cols, rows) * 1.15;
      function rot(p) { var x1 = p[0] * cb + p[2] * sb, z1 = -p[0] * sb + p[2] * cb; var y2 = p[1] * ca - z1 * sa, z2 = p[1] * sa + z1 * ca; return [x1, y2, z2]; }
      var STEP = 22;
      for (var fi = 0; fi < faces.length; fi++) {
        var f = faces[fi], rnv = rot(fn[fi]), lum = Math.max(0.06, rnv[0] * LIGHT[0] + rnv[1] * LIGHT[1] + rnv[2] * LIGHT[2]);
        var e1 = sub(f[1], f[0]), e2 = sub(f[2], f[0]), lvl = Math.min(RAMP.length - 1, Math.floor(lum * (RAMP.length - 1)));
        for (var ii = 0; ii <= STEP; ii++) for (var jj = 0; jj <= STEP - ii; jj++) {
          var u = ii / STEP, vv = jj / STEP;
          var rp = rot([f[0][0] + e1[0] * u + e2[0] * vv, f[0][1] + e1[1] * u + e2[1] * vv, f[0][2] + e1[2] * u + e2[2] * vv]);
          var ooz = 1 / (K2 + rp[2]);
          var xp = Math.floor(cols / 2 + K1 * ooz * rp[0]), yp = Math.floor(rows / 2 - K1 * ooz * rp[1] * 0.5);
          if (xp >= 0 && xp < cols && yp >= 0 && yp < rows) { var idx = yp * cols + xp; if (ooz > zb[idx]) { zb[idx] = ooz; bf[idx] = lvl; } }
        }
      }
      var x0 = R.x + Math.round((R.w - cols * cw) / 2), y0 = R.y + Math.round((R.h - rows * fs) / 2);
      ctx.font = fs + 'px ' + MONO; ctx.textBaseline = 'top'; ctx.textAlign = 'start'; ctx.direction = 'ltr';
      ctx.fillStyle = FAINT; for (var rd = 0; rd < rows; rd++) for (var cd = 0; cd < cols; cd++) if (bf[rd * cols + cd] < 0) ctx.fillText('.', x0 + cd * cw, y0 + rd * fs);
      for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) { var l = bf[r * cols + c]; if (l < 0) continue; ctx.fillStyle = l >= 8 ? BRIGHT : (l >= 4 ? GREEN : MIDG); ctx.fillText(RAMP.charAt(l), x0 + c * cw, y0 + r * fs); }
      label(R, 'pyramid · 3d');
      return t >= DUR;
    }
    return { frame: frame, title: 'viz' };
  }
  function label(R, name) { ctx.fillStyle = DIM; ctx.font = '600 ' + clamp(Math.round(R.w / 95), 11, 15) + 'px ' + MONO; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = 'ltr'; ctx.fillText('// ' + name, R.x + R.w / 2, R.y + R.h - 26); ctx.textAlign = 'start'; ctx.textBaseline = 'top'; }

  // ───────────────────────── window: msg — Hebrew line in a frame ─────────────────────────
  function makeMsg(msg) {
    var t = 0, DUR = 6000, cp = constPick(), GL = ('אבגדהוזחטיכלמנסעפצקרשת' + cp.d.slice(0, 44) + '#%*+=/<>').split('');
    function frame(dt, R) {
      t += dt; ctx.fillStyle = BG; ctx.fillRect(R.x, R.y, R.w, R.h);
      var cx = R.x + R.w / 2, cy = R.y + R.h / 2;
      var bw = Math.min(R.w * 0.74, 760), bh = Math.min(R.h * 0.42, 260), bx = cx - bw / 2, by = cy - bh / 2;
      // frame draws itself
      var fp = clamp(t / 900, 0, 1); ctx.strokeStyle = GREEN; ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(bx, by); ctx.lineTo(bx + bw * fp, by);
      ctx.moveTo(bx + bw, by); ctx.lineTo(bx + bw, by + bh * fp);
      ctx.moveTo(bx + bw, by + bh); ctx.lineTo(bx + bw - bw * fp, by + bh);
      ctx.moveTo(bx, by + bh); ctx.lineTo(bx, by + bh - bh * fp); ctx.stroke();
      // corner ticks
      if (fp >= 1) { ctx.fillStyle = BRIGHT; var ct = 7; [[bx, by], [bx + bw, by], [bx, by + bh], [bx + bw, by + bh]].forEach(function (p) { ctx.fillRect(p[0] - ct / 2, p[1] - 1, ct, 2); ctx.fillRect(p[0] - 1, p[1] - ct / 2, 2, ct); }); }
      // eyebrow
      var efs = clamp(Math.round(bw / 34), 11, 15); ctx.font = '600 ' + efs + 'px ' + MONO; ctx.fillStyle = DIM; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.direction = 'ltr';
      if (t > 700) ctx.fillText('// GRC·LABS', cx, by + efs + 12);
      // hebrew line: scramble then settle
      var hfs = clamp(Math.round(bw / (msg.he.length > 12 ? 16 : 9)), 22, 64);
      ctx.font = '700 ' + hfs + 'px ' + HEBF; ctx.direction = 'rtl'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      var rev = clamp((t - 1000) / 1200, 0, 1), keep = Math.floor(rev * msg.he.length), out = '';
      for (var i = 0; i < msg.he.length; i++) { var chc = msg.he.charAt(i); out += (chc === ' ' || i < keep) ? chc : GL[(Math.random() * GL.length) | 0]; }
      ctx.fillStyle = rev >= 1 ? BRIGHT : GREEN; ctx.fillText(out, cx, cy - hfs * 0.1);
      // english subline
      if (t > 2400) { var sfs = clamp(Math.round(bw / 30), 11, 16); ctx.font = sfs + 'px ' + MONO; ctx.fillStyle = AMBER; ctx.direction = 'ltr'; ctx.textBaseline = 'middle'; ctx.fillText(msg.en, cx, cy + hfs * 0.75); }
      ctx.textAlign = 'start'; ctx.textBaseline = 'top';
      return t >= DUR;
    }
    return { frame: frame, title: 'msg' };
  }

  // ───────────────────────── window: rain — matrix as content ─────────────────────────
  function makeRain() {
    var t = 0, DUR = 6000, KANA = 'アイウエオカキクケコサシスセソタチツテトﾊﾋﾌﾍﾎ'.split(''), SYM = '#%&<>*+=/'.split(''), cp = constPick(), DIG = cp.d, fs = 16, cols = 0, drops = [], spd = [], cptr = [], key = -1;
    function build(R) { fs = clamp(Math.round(R.w / 70), 12, 20); cols = Math.ceil(R.w / fs); drops = []; spd = []; cptr = []; for (var i = 0; i < cols; i++) { drops[i] = Math.floor(Math.random() * -(R.h / fs)); spd[i] = 0.55 + Math.random() * 0.8; cptr[i] = (Math.random() * DIG.length) | 0; } key = (R.w << 1) ^ R.h; }
    function frame(dt, R) {
      t += dt; if (key !== ((R.w << 1) ^ R.h)) build(R);
      ctx.save(); clipRect(R); ctx.fillStyle = 'rgba(8,11,20,0.14)'; ctx.fillRect(R.x, R.y, R.w, R.h);
      ctx.font = fs + 'px ' + MONO; ctx.textAlign = 'start'; ctx.textBaseline = 'top'; ctx.direction = 'ltr';
      for (var i = 0; i < cols; i++) { var roll = Math.random(), ch = roll < 0.80 ? DIG.charAt(cptr[i]++ % DIG.length) : (roll < 0.93 ? KANA[(Math.random() * KANA.length) | 0] : SYM[(Math.random() * SYM.length) | 0]), yy = R.y + drops[i] * fs; ctx.fillStyle = Math.random() > 0.94 ? BRIGHT : GREENS[(Math.random() * GREENS.length) | 0]; if (yy > R.y) ctx.fillText(ch, R.x + i * fs, yy); if (yy > R.y + R.h && Math.random() > 0.975) { drops[i] = Math.floor(Math.random() * -8); spd[i] = 0.55 + Math.random() * 0.8; } else drops[i] += spd[i]; }
      ctx.restore(); ctx.restore();
      label(R, 'rain · ' + cp.s);
      return t >= DUR;
    }
    return { frame: frame, title: 'rain' };
  }

  // ───────────────────────── window: subject — ASCII portrait ─────────────────────────
  // a few portrait renderings to compare — cycle with ?face=N, or it rotates each appearance
  var FACE_VARIANTS = [
    { id: 'v1·soft', ramp: " .,:;-~=+*coaeUXEZ%#8B@", lo: 0.16, span: 0.74, gamma: 0.70, hi: 0.70, mid: 0.36, blank: 0.12 },
    { id: 'v2·hard', ramp: " .:-=+ox*#%@MW", lo: 0.10, span: 0.82, gamma: 0.85, hi: 0.60, mid: 0.30, blank: 0.10 },
    { id: 'v3·block', ramp: " .·:-+*coe%#", lo: 0.13, span: 0.78, gamma: 0.72, hi: 0.64, mid: 0.34, blank: 0.10 }
  ];
  var faceVar = 0;
  var portrait = (function () {
    var img = new Image(), ready = false, failed = false;
    img.onload = function () { ready = true; }; img.onerror = function () { failed = true; }; img.src = 'assets/img/portrait-dark.jpg';
    function scene() {
      var t = 0, DUR = 7000, blk = null, blkW = 0, blkH = 0, key = -1;
      var V = FACE_VARIANTS[FORCE_FACE >= 0 ? (FORCE_FACE % FACE_VARIANTS.length) : (faceVar++ % FACE_VARIANTS.length)], RAMP = V.ramp;
      function build(R) {
        var side = Math.min(R.w * 0.74, R.h * 0.80), fs = clamp(side / 56, 7, 13), acw = fs * 0.6;
        var gw = Math.max(40, Math.floor(side / acw)), gh = Math.max(40, Math.floor(side / fs));
        var off = document.createElement('canvas'); off.width = gw; off.height = gh; var o = off.getContext('2d'); o.drawImage(img, 0, 0, gw, gh); var d = o.getImageData(0, 0, gw, gh).data;
        var bh = gh * fs; blkW = gw * acw; blkH = bh + Math.round(fs * 2.2);
        blk = document.createElement('canvas'); blk.width = Math.ceil(blkW * dpr); blk.height = Math.ceil(blkH * dpr);
        var cc = blk.getContext('2d'); cc.setTransform(dpr, 0, 0, dpr, 0, 0); cc.font = fs + 'px ' + MONO.replace(/"/g, ''); cc.textBaseline = 'top'; cc.textAlign = 'start';
        for (var r = 0; r < gh; r++) for (var c = 0; c < gw; c++) {
          var i = (r * gw + c) * 4, lum = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255, v = clamp(Math.pow(clamp((lum - V.lo) / V.span, 0, 1), V.gamma), 0, 1);
          if (v < V.blank) continue;
          cc.fillStyle = v > V.hi ? BRIGHT : (v > V.mid ? GREEN : MIDG); cc.fillText(RAMP.charAt(Math.min(RAMP.length - 1, Math.floor(v * RAMP.length))), c * acw, r * fs);
        }
        cc.fillStyle = DIM; cc.font = '700 ' + Math.max(11, Math.round(fs)) + 'px ' + MONO.replace(/"/g, ''); cc.textAlign = 'center'; cc.fillText('SUBJECT // Y.DADON — CEO', blkW / 2, bh + fs * 0.5);
        key = (R.w << 1) ^ R.h;
      }
      function frame(dt, R) {
        t += dt; ctx.fillStyle = BG; ctx.fillRect(R.x, R.y, R.w, R.h); ctx.textAlign = 'start'; ctx.textBaseline = 'top'; ctx.direction = 'ltr';
        if (failed) { ctx.fillStyle = GREEN; ctx.font = '700 ' + Math.round(R.w / 42) + 'px ' + MONO; ctx.textAlign = 'center'; ctx.fillText('// SUBJECT UNAVAILABLE', R.x + R.w / 2, R.y + R.h / 2); ctx.textAlign = 'start'; return t >= DUR; }
        if (!ready) { ctx.fillStyle = DIM; ctx.font = '700 ' + Math.round(R.w / 42) + 'px ' + MONO; ctx.textAlign = 'center'; ctx.fillText('// DECRYPTING SUBJECT ...', R.x + R.w / 2, R.y + R.h / 2); ctx.textAlign = 'start'; return false; }
        if (!blk || key !== ((R.w << 1) ^ R.h)) build(R);
        var dx = R.x + (R.w - blkW) / 2, dy = R.y + (R.h - blkH) / 2;
        ctx.drawImage(blk, 0, 0, blk.width, blk.height, dx, dy, blkW, blkH);
        label(R, 'subject · ' + V.id);
        return t >= DUR;
      }
      return { frame: frame, title: 'subject' };
    }
    return { scene: scene };
  })();

  // ─────────────────────────── reduced-motion static frame ───────────────────────────
  function staticFrame() {
    ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
    var R = { x: 0, y: 0, w: W, h: H };
    drawConsole([{ cmd: true, text: 'pip install grc-labs-ciso' }, { text: 'Successfully installed risk-engine-2.3 policy-kit-1.6 grc-labs-ciso-1.0', color: BRIGHT }, { text: '', color: INK }].concat(COMMANDS[0].body.map(function (l) { return { text: l, color: colorFor(l) }; })).concat([{ text: '', color: INK }, { cta: true, text: CTA }]), R, null, false, null);
  }

  // ─────────────────────────── status bar (persistent) ───────────────────────────
  function chFs() { return clamp(Math.round(Math.min(W, H) / 66), 11, 15); }
  function statusH() { return Math.round(chFs() * 1.8); }
  function timeStr() { var d = new Date(), h = d.getHours(), m = d.getMinutes(); return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m; }
  var windowsLog = [];
  // the session is always working — a live spinner + rotating Hebrew status word, never idle
  var STAT_HE = ['בטיפול', 'בבדיקה', 'התנעה', 'ניתוח', 'מיפוי', 'אימות', 'ניטור'];
  var STAT_SPN = '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏';
  function drawStatus(nowMs) {
    var sh = statusH(), y = H - sh, fs = Math.round(sh * 0.44), pad = Math.round(sh * 0.5);
    ctx.fillStyle = '#0B0F18'; ctx.fillRect(0, y, W, sh); ctx.fillStyle = 'rgba(99,178,46,0.25)'; ctx.fillRect(0, y, W, 1);
    ctx.textBaseline = 'middle'; ctx.direction = 'ltr'; ctx.textAlign = 'left';
    ctx.font = '700 ' + fs + 'px ' + MONO; var sess = '[grc-labs]', sw = ctx.measureText(sess).width + pad * 1.4;
    ctx.fillStyle = GREEN; ctx.fillRect(0, y, sw, sh); ctx.fillStyle = BG; ctx.fillText(sess, pad * 0.7, y + sh / 2);
    var x = sw + pad;
    ctx.font = fs + 'px ' + MONO; ctx.fillStyle = BRIGHT; var spin = STAT_SPN.charAt(Math.floor(nowMs / 90) % STAT_SPN.length); ctx.fillText(spin, x, y + sh / 2); x += ctx.measureText(spin).width + Math.round(pad * 0.5);
    ctx.font = '600 ' + fs + 'px ' + HEBF; ctx.fillStyle = AMBER; var word = STAT_HE[Math.floor(nowMs / 2200) % STAT_HE.length]; ctx.fillText(word, x, y + sh / 2); x += ctx.measureText(word).width + pad;
    ctx.font = fs + 'px ' + MONO;
    var show = windowsLog.slice(-4);
    for (var i = 0; i < show.length; i++) { var wd = show[i], lab = wd.idx + ':' + wd.name + (wd.active ? '*' : ' '); ctx.fillStyle = wd.active ? BRIGHT : DIM; ctx.fillText(lab, x, y + sh / 2); x += ctx.measureText(lab).width + pad; }
    var right = 'y.dadon@grc-labs   ' + timeStr(); ctx.textAlign = 'right'; ctx.fillStyle = DIM; ctx.fillText(right, W - pad, y + sh / 2);
    ctx.textAlign = 'start'; ctx.textBaseline = 'top'; ctx.direction = 'ltr';
  }

  // ─────────────────────────── scheduler ───────────────────────────
  var cmdOrder, cmdI = 0, shapeOrder, shapeI = 0, winN = 0, winIdx = 0;
  function nextCmd() { if (!cmdOrder || cmdI >= cmdOrder.length) { cmdOrder = shuffle(COMMANDS.map(function (_, i) { return i; })); cmdI = 0; } return COMMANDS[cmdOrder[cmdI++]]; }
  var VIZ_BUILDERS = POINT_SHAPES.map(function (sh) { return function () { return makePointGeo(sh); }; }).concat([makeDonut, makeLife, makeMolecule, makePyramids, makePyr3D]);
  function nextViz() {
    if (FORCE_SHAPE >= 0) return VIZ_BUILDERS[FORCE_SHAPE % VIZ_BUILDERS.length]();
    if (!shapeOrder || shapeI >= shapeOrder.length) { shapeOrder = shuffle(VIZ_BUILDERS.map(function (_, i) { return i; })); shapeI = 0; }
    return VIZ_BUILDERS[shapeOrder[shapeI++]]();
  }
  var msgOrder, msgI = 0, ilOrder, ilI = 0;
  function nextMsg() { if (!msgOrder || msgI >= msgOrder.length) { msgOrder = shuffle(MSGS.map(function (_, i) { return i; })); msgI = 0; } return makeMsg(MSGS[msgOrder[msgI++]]); }
  function pickType() {
    if (FORCE_WIN) return FORCE_WIN;
    var n = winN++;
    if (n % 3 === 0) return 'brain';
    if (!ilOrder || ilI >= ilOrder.length) { ilOrder = shuffle(['viz', 'viz', 'msg', 'rain', 'subject']); ilI = 0; }
    return ilOrder[ilI++];
  }
  function buildWindow(type) {
    if (type === 'brain') return makeBrain(nextCmd());
    if (type === 'viz') return nextViz();
    if (type === 'msg') return nextMsg();
    if (type === 'rain') return makeRain();
    if (type === 'subject') return portrait.scene();
    return nextViz();
  }
  function nextWindow() {
    var type = pickType(), view = buildWindow(type);
    winIdx++;
    windowsLog.forEach(function (w) { w.active = false; });
    windowsLog.push({ idx: winIdx, name: view.title || type, active: true });
    if (windowsLog.length > 6) windowsLog.shift();
    return view;
  }

  // ─────────── planted Hebrew — sparse, roaming, found not shown ───────────
  var ghost = (function () {
    var active = false, msg = '', gx = 0, gy = 0, t = 0, LIFE = 2600, cooldown = 9000, dig = PI_D;
    function spawn(C) { msg = GHOSTS[(Math.random() * GHOSTS.length) | 0]; dig = constPick().d; gx = C.x + C.w * (0.2 + Math.random() * 0.6); gy = C.y + C.h * (0.22 + Math.random() * 0.56); t = 0; active = true; }
    function update(dt, C, title) {
      if (title !== 'rain' && title !== 'viz') { active = false; return; }
      if (!active) { cooldown -= dt; if (cooldown <= 0) { if (Math.random() < 0.6) spawn(C); cooldown = 16000 + Math.random() * 12000; } return; }
      t += dt;
      var fs = clamp(Math.round(C.w / 38), 18, 34);
      var appear = clamp(t / 340, 0, 1), rev = clamp((t - 340) / 720, 0, 1), fade = t > LIFE - 600 ? clamp((LIFE - t) / 600, 0, 1) : 1;
      var keep = Math.floor(rev * msg.length), out = '';
      for (var i = 0; i < msg.length; i++) { var c = msg.charAt(i); out += (c === ' ' || i < keep) ? c : dig.charAt((Math.random() * dig.length) | 0); }
      ctx.save(); ctx.globalAlpha = Math.min(appear, fade);
      ctx.font = '700 ' + fs + 'px ' + HEBF; ctx.direction = 'rtl'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.shadowColor = GREEN; ctx.shadowBlur = 14; ctx.fillStyle = rev >= 1 ? BRIGHT : GREEN; ctx.fillText(out, gx, gy); ctx.shadowBlur = 0;
      if (rev >= 1 && (Math.floor(t / 420) % 2 === 0)) { var w = ctx.measureText(out).width; ctx.fillStyle = BRIGHT; ctx.fillRect(gx - w / 2 - fs * 0.6, gy - fs * 0.45, fs * 0.5, fs * 0.9); }
      ctx.restore(); ctx.direction = 'ltr'; ctx.textAlign = 'start'; ctx.textBaseline = 'top';
      if (t >= LIFE) { active = false; cooldown = 16000 + Math.random() * 12000; }
    }
    return { update: update, reset: function () { active = false; cooldown = 9000; } };
  })();

  // ─────────── matrix wipe — the transition between windows ───────────
  // Falls to fill, then drains down and out the bottom, revealing the next window.
  var mtx = (function () {
    // the rain honours π — each column streams the digits of π, with the π glyph itself surfacing in amber
    var KANA = 'アイウエオカキクケコサシスセソタチツテト'.split('');
    var fs = 16, cols = 0, drops = [], speeds = [], cptr = [];
    function reset(C, fromTop) { fs = Math.max(12, Math.min(20, Math.round(W / 70))); cols = Math.ceil(C.w / fs); drops = []; speeds = []; cptr = []; for (var i = 0; i < cols; i++) { drops[i] = fromTop ? -Math.random() * 6 : Math.floor(Math.random() * -(C.h / fs)); speeds[i] = 0.6 + Math.random() * 0.85; cptr[i] = (Math.random() * PI_D.length) | 0; } }
    function draw(C, respawn) {
      ctx.save(); clipRect(C); ctx.fillStyle = 'rgba(8,11,20,0.12)'; ctx.fillRect(C.x, C.y, C.w, C.h);
      ctx.font = fs + 'px ' + MONO; ctx.textAlign = 'start'; ctx.textBaseline = 'top'; ctx.direction = 'ltr';
      for (var i = 0; i < cols; i++) {
        var roll = Math.random(), ch, isPi = false;
        if (roll < 0.78) ch = PI_D.charAt(cptr[i]++ % PI_D.length);     // the value of π, streaming
        else if (roll < 0.90) { ch = 'π'; isPi = true; }                // the π glyph itself
        else ch = KANA[(Math.random() * KANA.length) | 0];
        var yy = C.y + drops[i] * fs;
        ctx.fillStyle = isPi ? AMBER : (Math.random() > 0.94 ? BRIGHT : GREENS[(Math.random() * GREENS.length) | 0]);
        if (yy > C.y - fs && yy < C.y + C.h + fs) ctx.fillText(ch, C.x + i * fs, yy);
        if (respawn && yy > C.y + C.h && Math.random() > 0.975) { drops[i] = Math.floor(Math.random() * -8); speeds[i] = 0.6 + Math.random() * 0.85; } else drops[i] += speeds[i];
      }
      ctx.restore(); ctx.restore();
    }
    function cleared(C) { for (var i = 0; i < cols; i++) if (drops[i] * fs <= C.h + fs) return false; return true; }
    return { reset: reset, draw: draw, cleared: cleared };
  })();

  // ─────────────────────────── loop ───────────────────────────
  var FILL_MS = 1050, DRAIN_MS = 1900, RISE_MS = 850;
  var cur = null, incoming = null, trans = '', transT = 0, raf = 0, last = 0;
  function content() { return { x: 0, y: 0, w: W, h: H - statusH() }; }
  function frame(now) {
    if (!last) last = now; var dt = Math.min(80, now - last); last = now;
    var C = content();
    if (trans === 'fill') {                       // rain accumulates over the frozen outgoing window
      mtx.draw(C, true); transT += dt;
      if (transT >= FILL_MS) { trans = 'drain'; transT = 0; mtx.reset(C, true); }
    } else if (trans === 'drain') {               // incoming window rises up from the bottom as the rain drains out
      ctx.fillStyle = BG; ctx.fillRect(C.x, C.y, C.w, C.h);
      var rise = (1 - ease(clamp(transT / RISE_MS, 0, 1))) * C.h * 0.5;
      clipRect(C); (incoming || cur).frame(dt, { x: C.x, y: C.y + rise, w: C.w, h: C.h }); ctx.restore();
      mtx.draw(C, false); transT += dt;
      if (mtx.cleared(C) || transT >= DRAIN_MS) { if (incoming) { cur = incoming; incoming = null; } trans = ''; }
    } else {
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      var done = cur.frame(dt, C);
      ghost.update(dt, C, cur.title);
      if (done) { incoming = nextWindow(); trans = 'fill'; transT = 0; mtx.reset(C, true); }
    }
    drawStatus(now);
    raf = requestAnimationFrame(frame);
  }

  // ─────────────────────────── activation / idle ───────────────────────────
  var active = false, lastActivity = performance.now();
  function activate() {
    if (active) return; active = true; resize(); root.classList.add('on');
    if (reduceMotion) { staticFrame(); return; }
    last = 0; winN = 0; winIdx = 0; windowsLog = []; cmdOrder = null; shapeOrder = null; msgOrder = null; ilOrder = null;
    ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
    cur = null; incoming = nextWindow(); trans = 'fill'; transT = 0; mtx.reset(content(), true); ghost.reset();
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
