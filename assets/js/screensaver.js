/* GRC·LABS — cyber screensaver (tmux session)
   © 2026 GRC·LABS / Yaniv Dadon — all rights reserved. www.grc-labs.com
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
     brand   — GRC·LABS rendered as live ASCII art (decrypt reveal).
     subject — ASCII portrait that coalesces out of the matrix and dissolves back.
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
  var QAMUL = parseFloat(params.get('qa')); if (isNaN(QAMUL) || QAMUL < 1) QAMUL = 1; // dev/QA only — fast-forward animation time
  if (!CONFIG.enabled) return;

  var BG = '#080B14', GREEN = '#63B22E', BRIGHT = '#9BE85B', AMBER = '#F0B429',
      DIM = 'rgba(99,178,46,0.55)', FAINT = 'rgba(99,178,46,0.22)', INK = '#C7D0DD', MIDG = '#4FA028';
  var GREENS = ['#4FA028', '#63B22E', '#6FC036', '#5AA82A', '#3C7E20'];
  var MONO = '"IBM Plex Mono", ui-monospace, monospace';
  var HEBF = '"IBM Plex Sans Hebrew", "IBM Plex Sans", sans-serif';
  var STAMF = '"Frank Ruhl Libre", "IBM Plex Sans Hebrew", serif';      // a traditional, scriptural Hebrew face (closest web font to Torah-scroll ktav)
  var MONO_RAIN = '"IBM Plex Mono", "Frank Ruhl Libre", monospace';     // Latin/kana stay monospace; Hebrew falls through to the scriptural face
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
  // the rain charset — katakana (the "looks like Chinese" glyphs), a few kanji, Greek and symbols (Hebrew added below)
  var KANA = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンﾊﾋﾌﾍﾎ';
  var KANJI = '日月火水木金土山川田力心目耳口手中大小上下天空雨風';
  var GLY_GREEK = 'πΣΔΛΦΩΘΞΨμβαλσ';
  var GLY_SYM = '#%&<>*+=/¥§∞';
  var HEB_RAIN = 'אבגדהוזחטיכךלמםנןסעפףצץקרשת';                              // Hebrew letters stream in the rain too
  var RAMP_CH = '.,-~:;=!*#$@';                                              // the same ASCII the 3D/shape scenes shade with — shared so the matrix and the shapes read as one alphabet
  var RAIN_BASE = KANA + KANJI + HEB_RAIN + '0123456789' + GLY_GREEK.replace('π', '') + GLY_SYM + RAMP_CH; // no π anywhere in the rain
  function streamCh(i, row) { var h = ((i * 374761393) ^ (row * 668265263)) >>> 0; return RAIN_BASE.charAt(h % RAIN_BASE.length); }
  // a dense, full matrix — every column is a falling stream with a bright head and a fading trail; never thinned to a few drops
  function drawMatrix(R, rfs, rcols, rdrops, rspd, intensity) {
    clipRect(R);
    ctx.font = rfs + 'px ' + MONO_RAIN; ctx.textAlign = 'start'; ctx.textBaseline = 'top'; ctx.direction = 'ltr';
    var rows = Math.ceil(R.h / rfs), TRAIL = Math.max(12, Math.round(rows * 0.55));
    for (var i = 0; i < rcols; i++) {
      var headI = Math.floor(rdrops[i]), x = R.x + i * rfs;
      for (var tr = 0; tr < TRAIL; tr++) {
        var row = headI - tr, yy = R.y + row * rfs;
        if (yy <= R.y - rfs || yy >= R.y + R.h) continue;
        if (tr === 0) { ctx.fillStyle = 'rgba(155,232,91,' + intensity.toFixed(3) + ')'; ctx.fillText(RAIN_BASE.charAt((Math.random() * RAIN_BASE.length) | 0), x, yy); }
        else { var ch = streamCh(i, row), a = intensity * ((1 - tr / TRAIL) * 0.82 + 0.10); ctx.fillStyle = 'rgba(99,178,46,' + a.toFixed(3) + ')'; ctx.fillText(ch, x, yy); }
      }
      rdrops[i] += rspd[i];
      if ((Math.floor(rdrops[i]) - TRAIL) * rfs > R.h) { rdrops[i] = -(Math.random() * 6); rspd[i] = 0.55 + Math.random() * 0.8; }
    }
    ctx.restore();
  }
  // eased crossfade for things that coalesce out of the matrix and dissolve back — smooth in and out
  function coalesceMix(t, FILL, CO, HOLD, DIS) {
    if (t < FILL) return { a: 0, rainI: 1 };
    if (t < FILL + CO) { var p = ease((t - FILL) / CO); return { a: p, rainI: 1 - 0.82 * p }; }
    if (t < FILL + CO + HOLD) return { a: 1, rainI: 0.13 };
    var q = ease(clamp((t - FILL - CO - HOLD) / DIS, 0, 1)); return { a: 1 - q, rainI: 0.18 + 0.82 * q };
  }
  // short Hebrew lines planted, sparsely, inside the ASCII — found, not shown
  var GHOSTS = ['דברו איתנו', 'מצאת אותי', 'מי קורא?', 'עדיין כאן'];

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
  // a live SSH connection into the workspace — not just a key, an actual session
  function buildSsh(name, ln) {
    var s = [];
    s.push("The authenticity of host 'vault.grc-labs.io (10.0.2.4)' can't be established.");
    s.push('ED25519 key fingerprint is SHA256:' + fakeHash(name) + '.');
    s.push('Are you sure you want to continue connecting (yes/no/[fingerprint])? yes');
    s.push("Warning: Permanently added 'vault.grc-labs.io' to the list of known hosts.");
    s.push('Enter passphrase for key: ********');
    s.push('');
    s.push('  Welcome to GRC·LABS secure shell — ' + name + ' workspace');
    s.push('  Last login: from 10.0.0.7 over wireguard');
    s.push('');
    s.push('$ grc session open --scope ' + ln);
    s.push('[ok] policy bundle verified · signature valid');
    s.push('[ok] controls synced · evidence mounted at /vault/' + ln);
    s.push('$ logout');
    s.push('Connection to vault.grc-labs.io closed.');
    s.push('');
    return s;
  }
  // a reachability check to the outside world
  function buildPing(name) {
    var s = [], times = ['12.4', '11.8', '12.1', '11.9'];
    s.push('PING google.com (142.250.74.78): 56 data bytes');
    for (var i = 0; i < 4; i++) s.push('64 bytes from 142.250.74.78: icmp_seq=' + i + ' ttl=118 time=' + times[i] + ' ms');
    s.push('');
    s.push('--- google.com ping statistics ---');
    s.push('4 packets transmitted, 4 received, 0.0% packet loss');
    s.push('round-trip min/avg/max/stddev = 11.8/12.0/12.4/0.2 ms');
    s.push('[ok] egress reachable · ' + name + ' uplink healthy');
    s.push('');
    return s;
  }
  // an interactive Python session running the risk model
  function buildPython(name, ln) {
    var s = [];
    s.push('Python 3.12.2 (grc-labs build) on linux');
    s.push('Type "help", "copyright", "credits" or "license" for more information.');
    s.push('>>> from grc import risk, controls');
    s.push('>>> r = risk.assess("' + ln + '")');
    s.push('>>> r.score');
    s.push(((hashOf(name) % 35) + 58) + '.0   # residual risk, 0=clean');
    s.push('>>> controls.gaps(r)');
    s.push("['access-review', 'logging', 'mfa-coverage']");
    s.push('>>> r.prioritize()[:2]');
    s.push("[('mfa-coverage', 'high'), ('logging', 'med')]");
    s.push('>>> exit()');
    s.push('');
    return s;
  }
  function buildNetstat(name) {
    return ['Active Internet connections (w/o servers)',
      'Proto Recv-Q Send-Q Local Address       Foreign Address      State',
      'tcp        0      0 10.0.2.4:22         10.0.0.7:51544       ESTABLISHED',
      'tcp        0      0 10.0.2.4:443        142.250.74.78:443    ESTABLISHED',
      'tcp        0      0 10.0.2.4:8443       10.0.0.31:60122      TIME_WAIT',
      'udp        0      0 10.0.2.4:51820      0.0.0.0:*            wireguard',
      '[ok] ' + name + ' attack surface — 0 unexpected listeners', ''];
  }
  function buildNslookup(name) {
    return ['Server:    10.0.0.1', 'Address:   10.0.0.1#53', '',
      'Non-authoritative answer:', 'Name:    vault.grc-labs.io', 'Address: 10.0.2.4',
      'vault.grc-labs.io   mail exchanger = 10 mx.grc-labs.io.',
      '[ok] DNS resolves · DNSSEC validated', ''];
  }
  function buildMpremote(name) {
    return ['Connected to MicroPython on /dev/ttyACM0', '>>> import machine, network',
      '>>> machine.unique_id().hex()', "'a4cf12ff09b1'",
      '>>> network.WLAN(network.STA_IF).isconnected()', 'True',
      '>>> import secure_boot; secure_boot.verify()',
      '[ok] firmware signature valid · ' + name + ' device trusted', ''];
  }
  function buildSmtp(name) {
    return ['Trying 10.0.3.9...', '220 mx.grc-labs.io ESMTP ready',
      'EHLO grc-labs.io', '250-mx.grc-labs.io', '250-STARTTLS', '250 AUTH LOGIN PLAIN',
      'STARTTLS', '220 2.0.0 Ready to start TLS',
      '[ok] TLS1.3 · ' + name + ' mail path encrypted', 'QUIT', '221 2.0.0 Bye', ''];
  }
  // real SOC operations — SIEM detection, alert triage, threat hunting
  function buildSiem(name) {
    return ['[soc] connected to SIEM · grc-labs prod cluster',
      'query: index=auth action=failure | stats count by src_ip | where count > 20',
      '', 'src_ip             count   geo         verdict',
      '185.220.101.44      312    RU/anon      brute-force',
      '45.137.21.9          88    NL/vpn       credential-stuffing',
      '10.0.0.31            24    internal     service-acct (benign)',
      '', '[soc] 2 hostile sources auto-blocked at the edge',
      '[ok] ' + name + ' detections tuned · 0 false positives', ''];
  }
  function buildTriage(name) {
    return ['[soc] triage alert A-' + (2200 + (hashOf(name) % 800)),
      'rule: EDR/credential-access · MITRE T1003.001 (LSASS dump)',
      'host: WIN-FIN-07   user: svc_backup   severity: HIGH',
      'enriching IOCs ...',
      '  sha256 9f2ac1..e1  →  VirusTotal 58/72 malicious',
      '  c2 193.42.7.91     →  ThreatFox: Cobalt Strike',
      '[action] isolate host · revoke sessions · open IR-' + (40 + (hashOf(name) % 50)),
      '[ok] contained in 3m12s · ' + name + ' playbook executed', ''];
  }
  function buildHunt(name) {
    return ['[soc] threat hunt · hypothesis: lateral movement via WMI',
      'osquery> SELECT name,path FROM processes WHERE name LIKE "%wmiprvse%";',
      '  wmiprvse.exe   C:\\Windows\\System32\\wbem\\',
      'edr> timeline host=WIN-DC-01 --pivot parent',
      '  powershell -enc <b64 blob>   flagged',
      '  net use \\\\10.0.5.4\\C$        flagged',
      '[soc] 2 suspect chains escalated to tier-2',
      '[ok] ' + name + ' detection coverage validated', ''];
  }
  function pickTrack(cmd, pkg) {
    var ln = cmd.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    var tracks = [
      function () { return { cmd: 'grc-siem search --last 24h', lines: buildSiem(cmd.name) }; },
      function () { return { cmd: 'grc-soc triage --next', lines: buildTriage(cmd.name) }; },
      function () { return { cmd: 'grc-hunt run --playbook lateral', lines: buildHunt(cmd.name) }; },
      function () { return { cmd: 'ssh ' + ln + '@vault.grc-labs.io', lines: buildSsh(cmd.name, ln) }; },
      function () { return { cmd: 'pip install ' + pkg, lines: buildSetup(cmd.name, pkg) }; },
      function () { return { cmd: 'python3', lines: buildPython(cmd.name, ln) }; }
    ];
    return tracks[(Math.random() * tracks.length) | 0]();
  }
  function setupRow(line) {
    var c0 = line.charAt(0), col;
    if (line.indexOf('Successfully installed') === 0 || c0 === '$' || line.indexOf('>>>') === 0) col = BRIGHT;
    else if (line.indexOf('[action]') >= 0 || line.indexOf('flagged') >= 0 || line.indexOf('malicious') >= 0 || line.indexOf('brute-force') >= 0) col = AMBER;
    else if (c0 === '+' || c0 === '|') col = MIDG;
    else if (line.indexOf('SHA256:') === 0 || line.indexOf('[ok]') >= 0) col = GREEN;
    else if (line.indexOf('[soc]') >= 0 || line.indexOf('osquery>') >= 0 || line.indexOf('edr>') >= 0 || line.indexOf('query:') === 0) col = DIM;
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
      else if (row.cta) { ctx.save(); ctx.font = '700 ' + fs + 'px ' + HEBF; ctx.direction = 'rtl'; ctx.textAlign = 'left'; ctx.fillStyle = GREEN; ctx.fillText(row.text, x0, ty); ctx.restore(); }
      else { ctx.font = fs + 'px ' + MONO; ctx.textAlign = 'start'; ctx.direction = 'ltr'; ctx.fillStyle = row.color; ctx.fillText(row.text, x0, ty); }
      ty += lh;
    }
  }

  // ───────────────────────── focus pane: pip install stream ─────────────────────────
  function makeGet(cmd) {
    var pkg = 'grc-labs-' + cmd.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    var rows = [], phase = 'cmd', typed = 0, t = 0, setupIdx = 0, bodyIdx = 0, holdT = 0, blink = 0, elapsed = 0, thinkT = 0, thought = false, gapT = 0;
    var track = pickTrack(cmd, pkg), cmdStr = track.cmd, setup = track.lines;
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
      else if (phase === 'resultHold') { t += dt; if (t > 1600) phase = 'done'; }
      if (elapsed > 60000) phase = 'done';
      var activeCmd = (phase === 'cmd') ? cmdStr.slice(0, Math.floor(typed)) : (phase === 'resultHold' ? '' : null);
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
  // the reasoning pane keeps working — an endless analysis log that streams phases,
  // ticks each off with "done · OK", then starts another pass. It never just stops.
  // brain pane 2 — a live stream of varied network commands and their output (never idle)
  function makeNetPane() {
    var SPIN = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'], t = 0, emitT = 0, lines = [], queue = [];
    var CMDS = [
      { c: 'ss -tnp', o: ['ESTAB 0 0 10.0.2.4:22  10.0.0.7:51544  (("sshd"))', 'ESTAB 0 0 10.0.2.4:443 142.250.74.78:443'] },
      { c: 'dig +short vault.grc-labs.io', o: ['10.0.2.4', ';; SERVER: 10.0.0.1#53 · DNSSEC ok'] },
      { c: 'ping -c2 10.0.0.1', o: ['64 bytes from 10.0.0.1: time=0.4 ms', '64 bytes from 10.0.0.1: time=0.5 ms', '2 received · 0% loss'] },
      { c: 'traceroute grc-labs.io', o: ['1  10.0.0.1     0.4ms', '2  100.64.0.1   3.1ms', '3  grc-labs.io  12.4ms'] },
      { c: 'arp -a', o: ['gateway (10.0.0.1) at 00:1a:2b:3c:4d:5e', '? (10.0.0.31) at a4:cf:12:ff:09:b1'] },
      { c: 'ip route', o: ['default via 10.0.0.1 dev wg0', '10.0.0.0/16 dev eth0 proto kernel'] },
      { c: 'nmap -sn 10.0.5.0/24', o: ['10.0.5.1  up', '10.0.5.4  up', '2 hosts up · 0 unexpected'] },
      { c: 'curl -sI https://grc-labs.io', o: ['HTTP/2 200', 'strict-transport-security: max-age=63072000'] },
      { c: 'whois 185.220.101.44', o: ['netname: TOR-EXIT', 'country: RU · abuse flagged'] }
    ];
    function enqueue() { var k = CMDS[(Math.random() * CMDS.length) | 0]; queue.push({ k: 'cmd', text: k.c }); for (var i = 0; i < k.o.length; i++) queue.push({ k: 'out', text: k.o[i] }); queue.push({ k: 'ok' }); queue.push({ k: 'gap' }); }
    function delayOf(it) { return it.k === 'cmd' ? 620 : it.k === 'out' ? 300 : it.k === 'ok' ? 520 : 360; }
    function emit(it) {
      if (it.k === 'cmd') lines.push({ pre: PROMPT, text: it.text, pcol: DIM, col: BRIGHT });
      else if (it.k === 'out') lines.push({ text: '  ' + it.text, col: it.text.indexOf('flag') >= 0 || it.text.indexOf('TOR') >= 0 ? AMBER : INK });
      else if (it.k === 'ok') lines.push({ text: '[ok] ' + SPIN[0] + ' link healthy', col: GREEN });
      else lines.push({ text: '', col: INK });
      if (lines.length > 120) lines.splice(0, lines.length - 120);
    }
    enqueue();
    function frame(dt, R) {
      t += dt; emitT += dt; ctx.fillStyle = BG; ctx.fillRect(R.x, R.y, R.w, R.h);
      while (queue.length && emitT >= delayOf(queue[0])) { emitT -= delayOf(queue[0]); emit(queue.shift()); if (queue.length < 3) enqueue(); }
      var pad = Math.round(Math.min(R.w, R.h) * 0.05) + 8, x0 = R.x + pad, y0 = R.y + pad, w = R.w - pad * 2;
      var fs = clamp(Math.round(w / 30), 11, 16), lh = Math.round(fs * 1.6), maxRows = Math.max(4, Math.floor((R.h - pad * 2) / lh));
      ctx.font = fs + 'px ' + MONO; ctx.textBaseline = 'top'; ctx.textAlign = 'start'; ctx.direction = 'ltr';
      var vis = lines.length > maxRows ? lines.slice(lines.length - maxRows) : lines, ty = y0, endX = x0;
      for (var d = 0; d < vis.length; d++) { var L = vis[d], pre = L.pre || null; if (pre) { ctx.fillStyle = L.pcol; ctx.fillText(pre, x0, ty); ctx.fillStyle = L.col; ctx.fillText(L.text, x0 + ctx.measureText(pre).width, ty); endX = x0 + ctx.measureText(pre).width + ctx.measureText(L.text).width; } else { ctx.fillStyle = L.col; ctx.fillText(L.text, x0, ty); endX = x0 + ctx.measureText(L.text).width; } ty += lh; }
      if ((Math.floor(t / 520) % 2) === 0) { ctx.fillStyle = BRIGHT; ctx.fillRect(endX + 3, ty - lh + 2, fs * 0.5, fs); }
      return false;
    }
    return { frame: frame };
  }
  function makeThink(cmd) {
    var SPIN = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'], STAT = ['ok', 'pass', 'clear', 'mapped', 'scored', 'signed'], t = 0, emitT = 0, lines = [], queue = [], pass = 0, pending = null;
    var base = thinkData(cmd), name = cmd.name.toLowerCase();
    function enqueue() {
      pass++;
      queue.push({ k: 'cmd', text: 'grc-think --deep ' + name + (pass > 1 ? ' --watch' : '') });
      queue.push({ k: 'note', text: 'attach reasoner · context=' + name });
      var data = shuffle(base.slice());
      for (var i = 0; i < data.length; i++) { queue.push({ k: 'phase', label: data[i].label, sidx: i }); var subs = data[i].subs; for (var s = 0; s < subs.length; s++) queue.push({ k: 'sub', text: subs[s], last: s === subs.length - 1 }); }
      queue.push({ k: 'done' }); queue.push({ k: 'gap' });
    }
    function delayOf(it) { return it.k === 'cmd' ? 520 : it.k === 'note' ? 360 : it.k === 'phase' ? 600 : it.k === 'sub' ? 300 : it.k === 'done' ? 760 : 420; }
    function settle() { if (pending) { pending.done = true; pending = null; } }
    function emit(it) {
      if (it.k === 'cmd') { settle(); lines.push({ pre: PROMPT, text: it.text, pcol: DIM, col: BRIGHT }); }
      else if (it.k === 'note') lines.push({ text: '… ' + it.text, col: DIM });
      else if (it.k === 'phase') { settle(); pending = { phase: true, label: it.label, sidx: it.sidx, done: false }; lines.push(pending); }
      else if (it.k === 'sub') lines.push({ text: '  ' + (it.last ? '└─ ' : '├─ ') + it.text, col: MIDG });
      else if (it.k === 'done') { settle(); lines.push({ text: '✓ ' + name + ' — done · OK', col: BRIGHT }); }
      else lines.push({ text: '', col: INK });
      if (lines.length > 120) lines.splice(0, lines.length - 120);
    }
    enqueue();
    function frame(dt, R) {
      t += dt; emitT += dt; ctx.fillStyle = BG; ctx.fillRect(R.x, R.y, R.w, R.h);
      while (queue.length && emitT >= delayOf(queue[0])) { emitT -= delayOf(queue[0]); emit(queue.shift()); if (queue.length < 3) enqueue(); }
      var pad = Math.round(Math.min(R.w, R.h) * 0.05) + 8, x0 = R.x + pad, y0 = R.y + pad, w = R.w - pad * 2;
      var fs = clamp(Math.round(w / 30), 11, 16), lh = Math.round(fs * 1.6), maxRows = Math.max(4, Math.floor((R.h - pad * 2) / lh));
      ctx.font = fs + 'px ' + MONO; ctx.textBaseline = 'top'; ctx.textAlign = 'start'; ctx.direction = 'ltr';
      var dotW = ctx.measureText('.').width, vis = lines.length > maxRows ? lines.slice(lines.length - maxRows) : lines, ty = y0, endX = x0;
      for (var d = 0; d < vis.length; d++) {
        var L = vis[d], txt, col, pre = L.pre || null;
        if (L.phase) { var mark = L.done ? '✓' : SPIN[Math.floor(t / 90) % SPIN.length], status = L.done ? STAT[L.sidx % STAT.length] : 'analyzing'; var head = mark + ' ' + L.label + ' ', nDots = Math.floor((w - ctx.measureText(head + ' ' + status).width) / dotW); txt = head + rep('.', clamp(nDots, 2, 80)) + ' ' + status; col = L.done ? GREEN : BRIGHT; }
        else { txt = L.text; col = L.col; }
        if (pre) { ctx.fillStyle = L.pcol; ctx.fillText(pre, x0, ty); ctx.fillStyle = col; ctx.fillText(txt, x0 + ctx.measureText(pre).width, ty); endX = x0 + ctx.measureText(pre).width + ctx.measureText(txt).width; }
        else { ctx.fillStyle = col; ctx.fillText(txt, x0, ty); endX = x0 + ctx.measureText(txt).width; }
        ty += lh;
      }
      if ((Math.floor(t / 520) % 2) === 0) { ctx.fillStyle = BRIGHT; ctx.fillRect(endX + 3, ty - lh + 2, fs * 0.5, fs); }
      return false; // keeps working — never stops on its own
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
    var get = makeGet(cmd), think = null, ascii = null, split = 0, SPLIT_MS = 720, splitting = false, narrow = false, t = 0, narrowPhase = 0, narrowT = 0, fade = 0;
    var rr = Math.random(), mode = rr < 0.30 ? 'solo' : (rr < 0.62 ? 'duo' : 'trio'); // sometimes one pane, sometimes two or three
    function frame(dt, R) {
      t += dt; narrow = R.w < 760;
      ctx.fillStyle = BG; ctx.fillRect(R.x, R.y, R.w, R.h);
      if (mode === 'solo') { var sd = get.frame(dt, R); paneChrome(R, '1:focus', true); return sd; }
      if (!narrow) {
        if (!splitting && get.atBody()) { splitting = true; if (!think) think = makeNetPane(); if (mode === 'trio' && !ascii) ascii = [makeDonut, makeSphere, makeKnot, makePyr3D, makeTetraSphere, makeCube][(Math.random() * 6) | 0](); }
        if (splitting && split < 1) split = Math.min(1, split + dt / SPLIT_MS);
        var e = ease(split), gap = split > 0 ? 6 : 0;
        var leftW = R.w * (1 - (mode === 'trio' ? 0.50 : 0.46) * e) - (split > 0 ? gap / 2 : 0);
        var Lr = { x: R.x, y: R.y, w: Math.max(40, leftW), h: R.h };
        clipRect(Lr); var gd = get.frame(dt, inset(Lr, split > 0)); ctx.restore(); paneChrome(Lr, '1:focus', true);
        if (split > 0) {
          var rx = R.x + leftW + gap, rw = R.w - leftW - gap;
          if (mode === 'trio' && ascii) {
            var th = R.h * 0.52 - gap / 2, Tr = { x: rx, y: R.y, w: rw, h: th }, Ar = { x: rx, y: R.y + th + gap, w: rw, h: R.h - th - gap };
            clipRect(Tr); ctx.globalAlpha = e; think.frame(dt, inset(Tr, true)); ctx.globalAlpha = 1; ctx.restore(); paneChrome(Tr, '2:net', false);
            clipRect(Ar); ctx.globalAlpha = e; ascii.frame(dt, inset(Ar, true)); ctx.globalAlpha = 1; ctx.restore(); paneChrome(Ar, '3:render', false);
          } else if (think) {
            var Rr = { x: rx, y: R.y, w: rw, h: R.h }; clipRect(Rr); ctx.globalAlpha = e; think.frame(dt, inset(Rr, true)); ctx.globalAlpha = 1; ctx.restore(); paneChrome(Rr, '2:net', false);
          }
        }
        return gd && (split >= 1); // the focus script drives the close; the side panes keep working until then
      } else {
        // narrow: focus first, then cross-fade to the reasoning log
        if (narrowPhase === 0) {
          var done0 = get.frame(dt, R); paneChrome(R, '1:focus', true);
          if (get.atBody() && !think) think = makeNetPane();
          if (done0) { narrowPhase = 1; fade = 0; }
          return false;
        } else {
          narrowT += dt; fade = Math.min(1, fade + dt / 320);
          think.frame(dt, R); paneChrome(R, '2:net', true);
          if (fade < 1) { ctx.globalAlpha = 1 - fade; ctx.fillStyle = BG; ctx.fillRect(R.x, R.y, R.w, R.h); ctx.globalAlpha = 1; }
          return narrowT > 6500; // the reasoning log loops; cap its airtime on narrow screens
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
    { name: 'butterfly · curve', plot: function (add, prog) { var N = Math.floor(prog * 5200), TT = 24 * Math.PI; for (var i = 0; i < N; i++) { var u = (i / 5200) * TT, e = Math.exp(Math.cos(u)) - 2 * Math.cos(4 * u) - Math.pow(Math.sin(u / 12), 5); add(Math.sin(u) * e / 4.3, Math.cos(u) * e / 4.3); } } },
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
      var rg = t * 0.0004, rgc = Math.cos(rg), rgs = Math.sin(rg); // slow rotation so the shape keeps turning and never feels stuck
      shape.plot(function (nx, ny) { var rx = nx * rgc - ny * rgs, ry = nx * rgs + ny * rgc, c = Math.round(cx + rx * ax * 0.5), r = Math.round(cy - ry * ay * 0.5); if (c >= 0 && c < gw && r >= 0 && r < gh) grid[r * gw + c]++; }, Math.min(t / REVEAL, 1));
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
      var fs = clamp(Math.min(R.w, R.h) / 54, 7, 14), cw = fs * 0.6;
      var cols = Math.max(20, Math.floor(R.w / cw)), rows = Math.max(20, Math.floor(R.h / fs));
      var b = new Array(cols * rows), zb = new Array(cols * rows); for (var z = 0; z < b.length; z++) { b[z] = 0; zb[z] = 0; }
      var A = t * 0.0009, B = t * 0.0006, R1 = 1, R2 = 2, K2 = 5, K1 = Math.min(cols, rows) * K2 * 0.42 / (R1 + R2);
      for (var th = 0; th < 6.28; th += 0.05) { var ct = Math.cos(th), st = Math.sin(th);
        for (var ph = 0; ph < 6.28; ph += 0.015) { var cp = Math.cos(ph), sp = Math.sin(ph), ca = Math.cos(A), sa = Math.sin(A), cb = Math.cos(B), sb = Math.sin(B);
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
  // a generic parametric-surface renderer — same z-buffer + RAMP + lighting as the torus, for any smooth shape
  function makeSurface(name, P, opts) {
    opts = opts || {};
    var t = 0, DUR = opts.dur || 7200, RAMP = '.,-~:;=!*#$@';
    var du = opts.du || 0.06, dv = opts.dv || 0.05, uMax = opts.uMax || 6.283, vMax = opts.vMax || 6.283, LIGHT = [0, 0.6, -0.8];
    function frame(dt, R) {
      t += dt; ctx.fillStyle = BG; ctx.fillRect(R.x, R.y, R.w, R.h);
      var fs = clamp(Math.min(R.w, R.h) / 54, 7, 14), cw = fs * 0.6, cols = Math.max(20, Math.floor(R.w / cw)), rows = Math.max(20, Math.floor(R.h / fs));
      var b = new Array(cols * rows), zb = new Array(cols * rows); for (var z = 0; z < b.length; z++) { b[z] = -1; zb[z] = 0; }
      var A = t * 0.0009, B = t * 0.0011, ca = Math.cos(A), sa = Math.sin(A), cb = Math.cos(B), sb = Math.sin(B), K2 = 5, K1 = Math.min(cols, rows) * (opts.scale || 1.0);
      function rot(p) { var x1 = p[0] * cb + p[2] * sb, z1 = -p[0] * sb + p[2] * cb, y2 = p[1] * ca - z1 * sa, z2 = p[1] * sa + z1 * ca; return [x1, y2, z2]; }
      for (var u = 0; u < uMax; u += du) for (var v = 0; v < vMax; v += dv) {
        var p0 = P(u, v), pu = P(u + du, v), pv = P(u, v + dv);
        var nx = (pu[1] - p0[1]) * (pv[2] - p0[2]) - (pu[2] - p0[2]) * (pv[1] - p0[1]);
        var ny = (pu[2] - p0[2]) * (pv[0] - p0[0]) - (pu[0] - p0[0]) * (pv[2] - p0[2]);
        var nz = (pu[0] - p0[0]) * (pv[1] - p0[1]) - (pu[1] - p0[1]) * (pv[0] - p0[0]);
        var rp = rot(p0), rn = rot([nx, ny, nz]), nl = Math.sqrt(rn[0] * rn[0] + rn[1] * rn[1] + rn[2] * rn[2]) || 1;
        var lum = Math.abs((rn[0] * LIGHT[0] + rn[1] * LIGHT[1] + rn[2] * LIGHT[2]) / nl), ooz = 1 / (K2 + rp[2]);
        var xp = Math.floor(cols / 2 + K1 * ooz * rp[0]), yp = Math.floor(rows / 2 - K1 * ooz * rp[1] * 0.5);
        if (xp >= 0 && xp < cols && yp >= 0 && yp < rows) { var idx = yp * cols + xp; if (ooz > zb[idx]) { zb[idx] = ooz; b[idx] = Math.min(RAMP.length - 1, Math.max(0, Math.floor(lum * (RAMP.length - 1)))); } }
      }
      var x0 = R.x + Math.round((R.w - cols * cw) / 2), y0 = R.y + Math.round((R.h - rows * fs) / 2);
      ctx.font = fs + 'px ' + MONO; ctx.textBaseline = 'top'; ctx.textAlign = 'start'; ctx.direction = 'ltr';
      ctx.fillStyle = FAINT; for (var rd = 0; rd < rows; rd++) for (var cd = 0; cd < cols; cd++) if (b[rd * cols + cd] < 0) ctx.fillText('.', x0 + cd * cw, y0 + rd * fs);
      for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) { var l = b[r * cols + c]; if (l < 0) continue; ctx.fillStyle = l >= 8 ? BRIGHT : (l >= 4 ? GREEN : MIDG); ctx.fillText(RAMP.charAt(l), x0 + c * cw, y0 + r * fs); }
      label(R, name);
      return t >= DUR;
    }
    return { frame: frame, title: 'viz' };
  }
  function makeSphere() { return makeSurface('sphere · rot', function (u, v) { var su = Math.sin(u); return [1.35 * su * Math.cos(v), 1.35 * Math.cos(u), 1.35 * su * Math.sin(v)]; }, { uMax: Math.PI + 0.05, du: 0.05, dv: 0.045, scale: 1.5 }); }
  function makeMobius() { return makeSurface('möbius', function (u, v) { var w = (v - 0.4) * 0.95, h = 1 + w * Math.cos(u / 2); return [1.3 * h * Math.cos(u), 1.3 * w * Math.sin(u / 2), 1.3 * h * Math.sin(u)]; }, { vMax: 0.8, du: 0.04, dv: 0.04, scale: 1.25 }); }
  function makeSpring() { return makeSurface('spring · coil', function (u, v) { var R2 = 1.0, R1 = 0.27, pitch = 0.105; return [(R2 + R1 * Math.cos(v)) * Math.cos(u), u * pitch - 4 * Math.PI * pitch + R1 * Math.sin(v), (R2 + R1 * Math.cos(v)) * Math.sin(u)]; }, { uMax: 8 * Math.PI, du: 0.06, dv: 0.10, scale: 1.25 }); }
  function makeKnot() { return makeSurface('torus · knot', function (u, v) { var k = 2.0, R2 = 1.6, R1 = 0.55, cv = Math.cos(v + k * u); return [(R2 + R1 * cv) * Math.cos(u), R1 * Math.sin(v + k * u), (R2 + R1 * cv) * Math.sin(u)]; }, { du: 0.035, dv: 0.05, scale: 0.85 }); }
  // a cochlea / nautilus shell — a logarithmic spiral tube winding in toward the centre
  function makeCochlea() { return makeSurface('cochlea · 3d', function (u, v) { var s = Math.exp(-0.18 * u), R = 1.7 * s, tube = 0.62 * s; return [(R + tube * Math.cos(v)) * Math.cos(u), tube * Math.sin(v) + 0.07 * u - 0.66, (R + tube * Math.cos(v)) * Math.sin(u)]; }, { uMax: 6 * Math.PI, du: 0.04, dv: 0.12, scale: 1.7 }); }
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
    { name: 'H₂O', atoms: [{ e: 'O', x: 0, y: 0, z: 0 }, { e: 'H', x: -0.82, y: -0.42, z: 0 }, { e: 'H', x: 0.82, y: -0.42, z: 0 }], bonds: [[0, 1, 1], [0, 2, 1]] },
    { name: 'CO₂', atoms: [{ e: 'C', x: 0, y: 0, z: 0 }, { e: 'O', x: -0.95, y: 0, z: 0 }, { e: 'O', x: 0.95, y: 0, z: 0 }], bonds: [[0, 1, 2], [0, 2, 2]] },
    { name: 'CH₄', atoms: [{ e: 'C', x: 0, y: 0, z: 0 }, { e: 'H', x: 0.5, y: 0.5, z: 0.5 }, { e: 'H', x: 0.5, y: -0.5, z: -0.5 }, { e: 'H', x: -0.5, y: 0.5, z: -0.5 }, { e: 'H', x: -0.5, y: -0.5, z: 0.5 }], bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]] },
    { name: 'NH₃', atoms: [{ e: 'N', x: 0, y: 0, z: 0.28 }, { e: 'H', x: 0, y: 0.9, z: -0.2 }, { e: 'H', x: 0.78, y: -0.45, z: -0.2 }, { e: 'H', x: -0.78, y: -0.45, z: -0.2 }], bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1]] },
    { name: 'NaCl', atoms: [{ e: 'Na', x: -0.6, y: 0, z: 0 }, { e: 'Cl', x: 0.6, y: 0, z: 0 }], bonds: [[0, 1, 1]] }
  ];
  function makeMolecule() {
    var t = 0, DUR = 8000, m = MOLS[(Math.random() * MOLS.length) | 0];
    function frame(dt, R) {
      t += dt; ctx.fillStyle = BG; ctx.fillRect(R.x, R.y, R.w, R.h);
      var cx = R.x + R.w / 2, cy = R.y + R.h / 2, sc = Math.min(R.w, R.h) * 0.30;
      var A = t * 0.0005, B = t * 0.0009, ca = Math.cos(A), sa = Math.sin(A), cb = Math.cos(B), sb = Math.sin(B);
      var pts = m.atoms.map(function (a) {
        var az = a.z || 0, x1 = a.x * cb + az * sb, z1 = -a.x * sb + az * cb, y2 = a.y * ca - z1 * sa, z2 = a.y * sa + z1 * ca;
        return { x: cx + x1 * sc, y: cy - y2 * sc, z: z2, depth: clamp((z2 + 1.4) / 2.8, 0, 1), e: a.e };
      });
      var baseR = Math.min(R.w, R.h) * 0.050, fs0 = clamp(Math.round(Math.min(R.w, R.h) / 22), 13, 30);
      for (var i = 0; i < m.bonds.length; i++) {
        var b = m.bonds[i], P = pts[b[0]], Q = pts[b[1]], dx = Q.x - P.x, dy = Q.y - P.y, len = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / len, uy = dy / len, ox = -uy, oy = ux;
        var rA = baseR * (0.7 + 0.5 * P.depth), rB = baseR * (0.7 + 0.5 * Q.depth), ax = P.x + ux * rA, ay = P.y + uy * rA, bx = Q.x - ux * rB, by = Q.y - uy * rB, bd = (P.depth + Q.depth) / 2;
        ctx.strokeStyle = bd > 0.6 ? BRIGHT : (bd > 0.35 ? GREEN : MIDG); ctx.lineWidth = 1 + bd * 2.2;
        var offs = b[2] === 1 ? [0] : (b[2] === 2 ? [-4, 4] : [-5, 0, 5]);
        for (var o = 0; o < offs.length; o++) { ctx.beginPath(); ctx.moveTo(ax + ox * offs[o], ay + oy * offs[o]); ctx.lineTo(bx + ox * offs[o], by + oy * offs[o]); ctx.stroke(); }
      }
      var order = pts.map(function (_, i2) { return i2; }).sort(function (p, q) { return pts[p].z - pts[q].z; });
      for (var k = 0; k < order.length; k++) {
        var p2 = pts[order[k]], el = p2.e, r = baseR * (0.7 + 0.5 * p2.depth), fs = fs0 * (0.72 + 0.45 * p2.depth);
        ctx.fillStyle = BG; ctx.beginPath(); ctx.arc(p2.x, p2.y, r + fs * 0.18, 0, 6.2832); ctx.fill();
        ctx.strokeStyle = p2.depth > 0.55 ? DIM : 'rgba(99,178,46,0.28)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(p2.x, p2.y, r + fs * 0.18, 0, 6.2832); ctx.stroke();
        var base = (el === 'O' || el === 'Cl') ? BRIGHT : (el === 'C' ? GREEN : ((el === 'Na' || el === 'N') ? AMBER : INK));
        ctx.fillStyle = p2.depth > 0.42 ? base : MIDG; ctx.font = '700 ' + Math.round(fs) + 'px ' + MONO; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = 'ltr'; ctx.fillText(el, p2.x, p2.y);
      }
      var cfs = clamp(Math.round(R.w / 30), 14, 26); ctx.font = '700 ' + cfs + 'px ' + STAMF; ctx.direction = 'rtl'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = BRIGHT; ctx.fillText(CTA, cx, R.y + R.h * 0.12);
      ctx.textAlign = 'start'; ctx.textBaseline = 'top'; ctx.direction = 'ltr';
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
      var rs = xs(99); for (var k = 0; k < 44; k++) { var stx = rs() % cols, sty = rs() % Math.max(1, Math.floor(rows * 0.62)); ctx.fillStyle = (rs() % 5 === 0) ? BRIGHT : FAINT; ctx.fillText('.', x0 + stx * cw, y0 + sty * fs); }
      for (var y = 0; y < rows; y++) {
        for (var c = 0; c < cols; c++) {
          var ch = null, col = GREEN;
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
  // a precise square pyramid (Giza height:half-base ≈ 1.27), tilt sweeping from side view to top-down
  function makePyr3D() {
    var V = [[0, 0.54, 0], [-0.85, -0.54, -0.85], [0.85, -0.54, -0.85], [0.85, -0.54, 0.85], [-0.85, -0.54, 0.85]];
    var F = [[0, 1, 2], [0, 2, 3], [0, 3, 4], [0, 4, 1], [1, 2, 3], [1, 3, 4]];
    return makeSolid3D('pyramid · giza', V, F, { scale: 1.3, spin: 0.0008, tiltFn: function (t) { return 0.80 + 0.62 * Math.sin(t * 0.00038); } });
  }
  // a drawn Giza scene, sampled into ASCII like a photo
  function makePyramidPhoto() {
    var t = 0, DUR = 7200, RAMP = " .'^:-=+coaUOXE%#@", grid = null, gw = 0, gh = 0, fs = 0, cw = 0, key = -1, x0 = 0, y0 = 0;
    function build(R) {
      fs = clamp(Math.round(Math.min(R.w, R.h) / 64), 7, 13); cw = fs * 0.6;
      gw = Math.max(40, Math.floor(R.w / cw)); gh = Math.max(28, Math.floor(R.h / fs));
      var off = document.createElement('canvas'); off.width = gw; off.height = gh; var o = off.getContext('2d');
      var sky = o.createLinearGradient(0, 0, 0, gh); sky.addColorStop(0, '#04060a'); sky.addColorStop(1, '#1a1410'); o.fillStyle = sky; o.fillRect(0, 0, gw, gh);
      var ground = gh * 0.74;
      var sand = o.createLinearGradient(0, ground, 0, gh); sand.addColorStop(0, '#3a3026'); sand.addColorStop(1, '#0d0b08'); o.fillStyle = sand; o.fillRect(0, Math.floor(ground), gw, gh);
      var pyr = [{ cx: gw * 0.30, bw: gw * 0.20, h: gh * 0.40 }, { cx: gw * 0.56, bw: gw * 0.28, h: gh * 0.54 }, { cx: gw * 0.80, bw: gw * 0.15, h: gh * 0.30 }];
      for (var p = 0; p < pyr.length; p++) {
        var P = pyr[p], apex = ground - P.h;
        o.fillStyle = '#d8dcc0'; o.beginPath(); o.moveTo(P.cx, apex); o.lineTo(P.cx - P.bw, ground); o.lineTo(P.cx, ground); o.closePath(); o.fill();
        o.fillStyle = '#6b6f5a'; o.beginPath(); o.moveTo(P.cx, apex); o.lineTo(P.cx + P.bw, ground); o.lineTo(P.cx, ground); o.closePath(); o.fill();
      }
      var d = o.getImageData(0, 0, gw, gh).data; grid = new Array(gw * gh);
      for (var i = 0; i < gw * gh; i++) grid[i] = clamp((0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]) / 255, 0, 1);
      x0 = R.x + Math.round((R.w - gw * cw) / 2); y0 = R.y + Math.round((R.h - gh * fs) / 2); key = (R.w << 1) ^ R.h;
    }
    function frame(dt, R) {
      t += dt; ctx.fillStyle = BG; ctx.fillRect(R.x, R.y, R.w, R.h);
      if (!grid || key !== ((R.w << 1) ^ R.h)) build(R);
      ctx.font = fs + 'px ' + MONO; ctx.textBaseline = 'top'; ctx.textAlign = 'start'; ctx.direction = 'ltr';
      for (var r = 0; r < gh; r++) for (var c = 0; c < gw; c++) {
        var v = grid[r * gw + c], idx = Math.min(RAMP.length - 1, Math.floor(v * RAMP.length));
        if (idx <= 0) { ctx.fillStyle = FAINT; ctx.fillText('.', x0 + c * cw, y0 + r * fs); continue; }
        var tw = Math.sin((r * 1.7 + c * 2.3) + t * 0.004) > 0.88;
        ctx.fillStyle = v > 0.62 ? (tw ? '#ffffff' : BRIGHT) : (v > 0.34 ? GREEN : MIDG);
        ctx.fillText(RAMP.charAt(idx), x0 + c * cw, y0 + r * fs);
      }
      label(R, 'giza · ascii');
      return t >= DUR;
    }
    return { frame: frame, title: 'viz' };
  }
  // the seven-branched Temple Menorah — unlit, in gold ASCII, coalescing out of the matrix and back
  function makeMenorah() {
    var t = 0, blk = null, blkW = 0, blkH = 0, key = -1, rain = makeRainLayer();
    var FILL = 800, CO = 1050, HOLD = 1700, DIS = 1250, END = FILL + CO + HOLD + DIS;
    function build(R) {
      var fs = clamp(Math.round(Math.min(R.w, R.h) / 42), 8, 15), cw = fs * 0.6;
      var gw = Math.max(36, Math.floor((R.w * 0.7) / cw)), gh = Math.max(24, Math.floor((R.h * 0.8) / fs));
      var off = document.createElement('canvas'); off.width = gw; off.height = gh; var o = off.getContext('2d');
      o.fillStyle = '#000'; o.fillRect(0, 0, gw, gh);
      o.strokeStyle = '#fff'; o.fillStyle = '#fff'; o.lineCap = 'round'; o.lineJoin = 'round'; o.lineWidth = Math.max(1, Math.min(gw, gh) * 0.020);
      var cx = gw / 2, lampY = gh * 0.27, baseY = gh * 0.74, d = Math.min(gw, gh) * 0.13;
      o.beginPath(); o.moveTo(cx, lampY); o.lineTo(cx, baseY); o.stroke();                                  // central shaft
      var neckY = lampY + d * 0.6;                                                                           // straight angular branches (Knesset style): a diagonal arm then a vertical neck
      for (var i = 1; i <= 3; i++) { var jy = lampY + i * d; o.beginPath(); o.moveTo(cx, jy); o.lineTo(cx + i * d, neckY); o.lineTo(cx + i * d, lampY); o.stroke(); o.beginPath(); o.moveTo(cx, jy); o.lineTo(cx - i * d, neckY); o.lineTo(cx - i * d, lampY); o.stroke(); }
      for (var j = -3; j <= 3; j++) { var lx = cx + j * d; o.beginPath(); o.moveTo(lx - d * 0.30, lampY - d * 0.16); o.lineTo(lx - d * 0.30, lampY); o.lineTo(lx + d * 0.30, lampY); o.lineTo(lx + d * 0.30, lampY - d * 0.16); o.stroke(); } // unlit lamp cups
      o.beginPath(); o.moveTo(cx, baseY); o.lineTo(cx - d * 0.9, gh - 1); o.lineTo(cx + d * 0.9, gh - 1); o.closePath(); o.fill();
      o.fillRect(cx - d * 1.4, gh - Math.max(2, gh * 0.035), d * 2.8, Math.max(2, gh * 0.035));               // stepped foot
      var data = o.getImageData(0, 0, gw, gh).data;
      blkW = gw * cw; blkH = gh * fs;
      blk = document.createElement('canvas'); blk.width = Math.ceil(blkW * dpr); blk.height = Math.ceil(blkH * dpr);
      var cc = blk.getContext('2d'); cc.setTransform(dpr, 0, 0, dpr, 0, 0); cc.font = fs + 'px ' + MONO.replace(/"/g, ''); cc.textBaseline = 'top'; cc.textAlign = 'start';
      for (var r = 0; r < gh; r++) for (var c = 0; c < gw; c++) { if (data[(r * gw + c) * 4] <= 110) continue; cc.fillStyle = (c + r) % 6 === 0 ? BRIGHT : AMBER; cc.fillText('#', c * cw, r * fs); }
      key = (R.w << 1) ^ R.h;
    }
    function frame(dt, R) {
      t += dt; ctx.fillStyle = BG; ctx.fillRect(R.x, R.y, R.w, R.h);
      if (!blk || key !== ((R.w << 1) ^ R.h)) build(R);
      var m = coalesceMix(t, FILL, CO, HOLD, DIS), a = m.a, rainI = m.rainI;
      rain.draw(R, rainI);
      if (a > 0.01) { var dx = R.x + (R.w - blkW) / 2, dy = R.y + (R.h - blkH) / 2; ctx.globalAlpha = a; ctx.drawImage(blk, 0, 0, blk.width, blk.height, dx, dy, blkW, blkH); ctx.globalAlpha = 1; }
      if (a > 0.85) label(R, 'menorah · temple');
      return t >= END;
    }
    return { frame: frame, title: 'viz' };
  }
  // an analog oscilloscope — a live CRT trace sweeping over a graticule
  function makeScope() {
    var t = 0, DUR = 8000;
    function frame(dt, R) {
      t += dt; ctx.fillStyle = BG; ctx.fillRect(R.x, R.y, R.w, R.h);
      var fs = clamp(Math.round(Math.min(R.w, R.h) / 46), 9, 15), cw = fs * 0.6;
      var cols = Math.max(40, Math.floor(R.w / cw)), rows = Math.max(18, Math.floor(R.h / fs));
      var x0 = R.x + Math.round((R.w - cols * cw) / 2), y0 = R.y + Math.round((R.h - rows * fs) / 2);
      ctx.font = fs + 'px ' + MONO; ctx.textBaseline = 'top'; ctx.textAlign = 'start'; ctx.direction = 'ltr';
      function put(c, r, ch, col) { if (c < 0 || c >= cols || r < 0 || r >= rows) return; ctx.fillStyle = col; ctx.fillText(ch, x0 + c * cw, y0 + r * fs); }
      for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) { if (c % 8 === 0 || r % 4 === 0) put(c, r, (c % 8 === 0 && r % 4 === 0) ? '+' : (c % 8 === 0 ? ':' : '·'), FAINT); }
      var midR = rows / 2, head = Math.floor(t * 0.05) % cols;
      for (var c2 = 0; c2 < cols; c2++) {
        var ph = (c2 / cols) * Math.PI * 6 - t * 0.004, amp = 0.55 + 0.35 * Math.sin(t * 0.0011);
        var yv = Math.sin(ph) * amp + 0.18 * Math.sin(ph * 3 + t * 0.002), rr = Math.round(midR - yv * (rows * 0.34));
        var near = ((c2 - head + cols) % cols) < 3;
        put(c2, rr, near ? '#' : 'o', near ? '#ffffff' : GREEN); put(c2, rr + 1, '.', MIDG);
      }
      ctx.fillStyle = AMBER; ctx.fillText('CH1  ' + (20 + Math.round(8 * Math.sin(t * 0.0011))) + 'mV/div  10µs', x0 + 6, y0 + 4);
      ctx.fillStyle = GREEN; ctx.fillText('f ' + (1.20 + 0.30 * Math.sin(t * 0.0011)).toFixed(2) + ' kHz   TRIG o', x0 + 6, y0 + 4 + Math.round(fs * 1.4));
      label(R, 'scope · analog');
      return t >= DUR;
    }
    return { frame: frame, title: 'viz' };
  }
  // an audio waveform on a scope — just the signal, filled from the centre line
  function makeAudioScope() {
    var t = 0, DUR = 8000;
    function frame(dt, R) {
      t += dt; ctx.fillStyle = BG; ctx.fillRect(R.x, R.y, R.w, R.h);
      var fs = clamp(Math.round(Math.min(R.w, R.h) / 52), 8, 14), cw = fs * 0.6;
      var cols = Math.max(50, Math.floor(R.w / cw)), rows = Math.max(20, Math.floor(R.h / fs));
      var x0 = R.x + Math.round((R.w - cols * cw) / 2), y0 = R.y + Math.round((R.h - rows * fs) / 2);
      ctx.font = fs + 'px ' + MONO; ctx.textBaseline = 'top'; ctx.textAlign = 'start'; ctx.direction = 'ltr';
      function put(c, r, ch, col) { if (c < 0 || c >= cols || r < 0 || r >= rows) return; ctx.fillStyle = col; ctx.fillText(ch, x0 + c * cw, y0 + r * fs); }
      var mid = Math.round(rows / 2), half = rows * 0.44;
      for (var cc = 0; cc < cols; cc++) put(cc, mid, '·', FAINT);
      for (var c = 0; c < cols; c++) {
        var u = c / cols;
        var env = 0.40 + 0.45 * Math.abs(Math.sin(u * Math.PI * 2 - t * 0.0009)) * (0.6 + 0.4 * Math.sin(t * 0.0013 + u * 7));
        var sig = Math.sin(u * Math.PI * 38 - t * 0.020) * 0.6 + Math.sin(u * Math.PI * 17 - t * 0.013) * 0.30 + Math.sin(u * Math.PI * 71 - t * 0.030) * 0.18;
        var amp = sig * env, h = Math.round(Math.abs(amp) * half), dir = amp >= 0 ? -1 : 1;
        for (var k = 0; k <= h; k++) { var rr = mid + dir * k, edge = k >= h - 1; put(c, rr, edge ? '#' : '|', edge ? '#ffffff' : (k < h * 0.5 ? GREEN : MIDG)); }
      }
      var afs = clamp(Math.round(R.w / 32), 13, 24); ctx.font = '700 ' + afs + 'px ' + STAMF; ctx.direction = 'rtl'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = BRIGHT; ctx.fillText('צור קשר', R.x + R.w / 2, R.y + R.h * 0.12);
      ctx.textAlign = 'start'; ctx.textBaseline = 'top'; ctx.direction = 'ltr';
      label(R, 'audio · scope');
      return t >= DUR;
    }
    return { frame: frame, title: 'viz' };
  }
  // decryption, illustrated — a big salted cipher block decrypts to reveal one line: the slogan
  function makeCrypto() {
    var t = 0, DUR = 8600, REVEAL = 5600, SLOGAN = 'TAILORED INFORMATION SECURITY';
    var HEX = '0123456789abcdef', key = '', salt = '', cipher = '';
    var kr = xs(hashOf('grc-aes-key')); for (var i = 0; i < 48; i++) key += HEX.charAt(kr() % 16);
    var sr = xs(hashOf('grc-salt')); for (var i2 = 0; i2 < 16; i2++) salt += HEX.charAt(sr() % 16);
    var crp = xs(hashOf('grc-cipher')); for (var j = 0; j < 2400; j++) cipher += HEX.charAt(crp() % 16);
    function frame(dt, R) {
      t += dt; ctx.fillStyle = BG; ctx.fillRect(R.x, R.y, R.w, R.h);
      var fs = clamp(Math.round(Math.min(R.w, R.h) / 28), 12, 22), cw = fs * 0.62;
      var cols = Math.max(30, Math.min(58, Math.floor((R.w * 0.88) / cw))), rows = 13;
      var bx = R.x + Math.round((R.w - cols * cw) / 2), by = R.y + R.h * 0.26;
      ctx.font = fs + 'px ' + MONO; ctx.textBaseline = 'top'; ctx.textAlign = 'start'; ctx.direction = 'ltr';
      var p = clamp(t / REVEAL, 0, 1), sRow = rows >> 1, sCol = Math.max(0, (cols - SLOGAN.length) >> 1), revC = Math.floor(p * SLOGAN.length);
      for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
        var ch, col, si = c - sCol;
        if (r === sRow && si >= 0 && si < SLOGAN.length) {
          if (si < revC) { ch = SLOGAN.charAt(si); col = '#ffffff'; }
          else if (si < revC + 4) { ch = HEX.charAt((Math.random() * 16) | 0); col = BRIGHT; }
          else { ch = cipher.charAt((r * cols + c) % cipher.length); col = GREEN; }
        } else { ch = cipher.charAt((r * cols + c) % cipher.length); col = Math.abs(r - sRow) <= 1 ? GREEN : MIDG; }
        ctx.fillStyle = col; ctx.fillText(ch, bx + c * cw, by + r * fs);
      }
      var hfs = clamp(Math.round(R.w / 42), 12, 18); ctx.font = '700 ' + hfs + 'px ' + MONO; ctx.fillStyle = AMBER; ctx.fillText('AES-256-CBC · decrypting', R.x + 18, R.y + 14);
      ctx.font = (hfs - 3) + 'px ' + MONO; ctx.fillStyle = DIM; ctx.fillText('salt ' + salt, R.x + 18, R.y + 14 + Math.round(hfs * 1.5)); ctx.fillText('key  ' + key.slice(0, 32) + '…', R.x + 18, R.y + 14 + Math.round(hfs * 2.7));
      ctx.fillStyle = BRIGHT; ctx.fillText('plaintext recovered · ' + Math.round(p * 100) + '%', bx, by + rows * fs + Math.round(fs * 0.6));
      label(R, 'cipher · decrypt');
      return t >= DUR;
    }
    return { frame: frame, title: 'viz' };
  }
  // the Knesset Menorah — rendered from supplied ASCII art, coalescing out of the matrix in gold
  var MENORAH_ART = [
    '    ======+   --====+  =======  ===+=++::*+=+===   ======   +====',
    '    -::::--   -:::-=   :-----   :==-=-::.:==-=-.    +=-=     ++++',
    '     ====-    ++===+   -++*==.  :=+==+-.::=+=+=-   =+++=+   -+=+=',
    '     #*+*=     #*#+     +++--.. .=+*++....:%++=     #%+++    ##%*',
    '     ***--.    +=#=     *++:::. .=+*=+.....***+     #+-*+    #**=+',
    '     +*+==    :++==-    #*+--   .:**++.....*=-+    .#+==-    #-+==',
    '    .++==-    :*+++=    ++===-  .+#*+*::..:+===    :=+++=:   *=+++',
    '    :+==--    :***+-    #+*=-   .-=--=.:...#+*+    .***+:    ++==-',
    '    .+**+-    :+==+.    #*=+=   .++=#*.....*-=+:  ..**+=:    +**+=',
    '    :+=++-    :***=-    +====-  .+*+%*....:+=+=+   -*++==    +**==',
    '    .++=+--    ++==-    ***++:*:.+**#*-:.:=#*+==    +**=-    #*+++',
    '    -===+=-    #*==-     +=---*##*---+=--+*+*==     ##+==  ..=====',
    '     -+=*=     *+==+=     -==***##*++#=---=++       +=+-=   .+***+',
    '     -+=+=     #=+=+-    ...   ..#**-*=-:---::     +*+=+=  ..+#*#+-',
    '    :+*+++      ++=--- *+=-:-  ..++++**=-:::-=+*  #**++-.. ..=++-=-',
    '                 ---:=  ##******+*======:-=+*#*   *==-:.....:*+=+*+',
    '         =-:    ...        +***+##*+--++::-=      ..:::::--+##*+==',
    '       :---=    --..           +##++==+=---:    ..::::-++*###+++=',
    '      ..-==+    **++*          ..#*+**++:...::-+--++*#####*+++*',
    '     -::::-=+    *++**##*####-:.-++=====:.:-+*++####**# +==+:###',
    '     .....:-==     :-=+++++*****=*=+*+++----=+++++++        ##%#',
    '      .....:::-=-             ++*++====+=::-               *##%#',
    '       :.....:--==             ++----+==-:::            =*#####',
    '        ..:..::::--=++++=::-----+----==++::.:::::::-::--=*#**',
    '           ...:::======-.::::::-=---:-===-:::-::::-:..:==+*',
    '                   =-:---===++==+--==----::..::-.:::',
    '                               :=--=-------:-',
    '                              ..--:::::--+*+=',
    '                              --=--------=+#%',
    '                               :-::::::::-',
    '                             ==-=:::::::-= -*',
    '                             +===::::::::-=-==',
    '                               :-::::-:::-++',
    '                              ===:-::-::--*=+',
    '                             ====:-::-::--+==+',
    '                             ====---------===-',
    '                        =====-----=------------=====',
    '                      =+==---------------=------==-===+',
    '                     =======+=============++++++++++++++',
    '                     **********+************************'
  ];
  function makeMenorah() {
    // the menorah is not drawn as an image — it is GROWN out of the rain: each cell scrambles
    // through matrix glyphs, condenses as the forming wave reaches it, then locks into its glyph.
    var t = 0, cells = null, fs = 0, cw = 0, blkW = 0, blkH = 0, key = -1, rain = makeRainLayer();
    var FILL = 700, CO = 1700, HOLD = 2200, DIS = 1700, END = FILL + CO + HOLD + DIS;
    var SCR = KANA + KANJI + '0123456789';
    function build(R) {
      var nrows = MENORAH_ART.length, ncols = 0, i; for (i = 0; i < nrows; i++) ncols = Math.max(ncols, MENORAH_ART[i].length);
      fs = Math.max(5, Math.min((R.w * 0.88) / (ncols * 0.6), (R.h * 0.82) / nrows)); cw = fs * 0.6;
      blkW = ncols * cw; blkH = nrows * fs;                  // layout depends only on R.w/R.h; ox/oy are recomputed per-frame so transition offsets don't get cached
      cells = [];
      for (var r = 0; r < nrows; r++) { var line = MENORAH_ART[r]; for (var c = 0; c < line.length; c++) { var ch = line.charAt(c); if (ch === ' ') continue;
        var col = (ch === '#' || ch === '%') ? BRIGHT : ((ch === '*' || ch === '+') ? GREEN : MIDG);
        var hsh = hashOf(r + '_' + c);
        var st = clamp((r / nrows) * 0.60 + ((hsh % 1000) / 1000) * 0.40, 0, 0.999); // downward sweep + per-cell jitter
        cells.push({ c: c, r: r, ch: ch, col: col, st: st, seed: hsh });
      } }
      key = (R.w << 1) ^ R.h;
    }
    function scrCh(seed, tick) { return SCR.charAt((seed + tick) % SCR.length); }
    function frame(dt, R) {
      t += dt; ctx.fillStyle = BG; ctx.fillRect(R.x, R.y, R.w, R.h);
      if (!cells || key !== ((R.w << 1) ^ R.h)) build(R);
      var rainI;
      if (t < FILL) rainI = 1;
      else if (t < FILL + CO) rainI = 1 - 0.80 * ((t - FILL) / CO);
      else if (t < FILL + CO + HOLD) rainI = 0.16;
      else rainI = 0.18 + 0.78 * clamp((t - FILL - CO - HOLD) / DIS, 0, 1);
      rain.draw(R, rainI);
      if (t < FILL) return false;
      ctx.save(); clipRect(R); ctx.font = fs + 'px ' + MONO; ctx.textAlign = 'start'; ctx.textBaseline = 'top'; ctx.direction = 'ltr';
      var ox = R.x + (R.w - blkW) / 2, oy = R.y + (R.h - blkH) / 2;  // centred on the live region each frame
      var tick = Math.floor(t / 70);
      var formP = clamp((t - FILL) / CO, 0, 1);
      var disQ = t > FILL + CO + HOLD ? clamp((t - FILL - CO - HOLD) / DIS, 0, 1) : 0;
      for (var k = 0; k < cells.length; k++) {
        var cell = cells[k], x = ox + cell.c * cw, y = oy + cell.r * fs;
        var unlock = disQ - (1 - cell.st);                       // last-formed cells dissolve first
        if (unlock >= 0) { if (Math.random() < 0.65 - 0.5 * unlock) { ctx.fillStyle = GREENS[cell.seed % GREENS.length]; ctx.fillText(scrCh(cell.seed, tick + cell.c), x, y); } continue; }
        var lockOn = formP - cell.st;
        if (lockOn >= 0) {                                       // settled into the menorah glyph
          ctx.fillStyle = lockOn < 0.045 ? BRIGHT : cell.col; ctx.fillText(cell.ch, x, y);
        } else {                                                 // still rain — condenses as the wave nears
          var near = clamp((formP - (cell.st - 0.22)) / 0.22, 0, 1);
          if (Math.random() < 0.30 + 0.62 * near) { ctx.fillStyle = near > 0.5 ? GREEN : MIDG; ctx.fillText(scrCh(cell.seed, tick + cell.r * 3 + cell.c), x, y); }
        }
      }
      ctx.restore();
      if (formP >= 1 && disQ === 0) label(R, 'menorah · temple');
      return t >= END;
    }
    return { frame: frame, title: 'viz' };
  }
  // a tribute to Voyager — the dish, the booms, the golden record, turning in 3D
  function makeVoyager() {
    var t = 0, DUR = 9000, RAMP = '.,-~:;=!*#$@', pts = [];
    function add(x, y, z, l) { pts.push([x, y, z, l]); }
    for (var ring = 0.10; ring <= 1.0; ring += 0.07) { var nseg = Math.max(10, Math.round(ring * 42)); for (var s = 0; s < nseg; s++) { var a = s / nseg * 6.2832; add(ring * Math.cos(a), ring * Math.sin(a), -0.5 * ring * ring, ring > 0.93 ? 11 : 6); } }
    for (var f = 0; f < 16; f++) add(0, 0, -0.5 + f * 0.04, 8);
    for (var b = 0; b < 12; b++) { var ba = b / 12 * 6.2832; add(0.24 * Math.cos(ba), 0.24 * Math.sin(ba), 0.18, 9); }
    for (var mb = 0; mb <= 1; mb += 0.025) add(0.24 + mb * 2.7, 0.0, 0.18, mb > 0.96 ? 11 : 4);
    for (var rbi = 0; rbi <= 1; rbi += 0.045) add(-(0.24 + rbi * 1.15), -0.05, 0.18, 4);
    for (var rg = 0; rg < 12; rg++) add(-1.42, -0.05, 0.18 + (rg - 6) * 0.028, 9);
    for (var sbi = 0; sbi <= 1; sbi += 0.045) add(0.10, -(0.24 + sbi * 1.25), 0.18, 4);
    add(0.10, -1.52, 0.18, 11); add(0.18, -1.52, 0.18, 9);
    for (var gr = 0; gr < 14; gr++) { var gra = gr / 14 * 6.2832; add(0.34 + 0.13 * Math.cos(gra), 0.13 * Math.sin(gra), 0.20, 11); }
    function frame(dt, R) {
      t += dt; ctx.fillStyle = BG; ctx.fillRect(R.x, R.y, R.w, R.h);
      var fs = clamp(Math.min(R.w, R.h) / 58, 7, 13), cw = fs * 0.6, cols = Math.max(20, Math.floor(R.w / cw)), rows = Math.max(20, Math.floor(R.h / fs));
      var bf = new Array(cols * rows), zb = new Array(cols * rows); for (var z = 0; z < bf.length; z++) { bf[z] = -1; zb[z] = 0; }
      var A = 0.42, B = t * 0.0006, ca = Math.cos(A), sa = Math.sin(A), cb = Math.cos(B), sb2 = Math.sin(B), K2 = 5, K1 = Math.min(cols, rows) * 0.92;
      for (var i = 0; i < pts.length; i++) { var p = pts[i], x1 = p[0] * cb + p[2] * sb2, z1 = -p[0] * sb2 + p[2] * cb, y2 = p[1] * ca - z1 * sa, z2 = p[1] * sa + z1 * ca, ooz = 1 / (K2 + z2), xp = Math.floor(cols / 2 + K1 * ooz * x1), yp = Math.floor(rows / 2 - K1 * ooz * y2 * 0.5); if (xp >= 0 && xp < cols && yp >= 0 && yp < rows) { var idx = yp * cols + xp; if (ooz > zb[idx]) { zb[idx] = ooz; bf[idx] = p[3]; } } }
      var x0 = R.x + Math.round((R.w - cols * cw) / 2), y0 = R.y + Math.round((R.h - rows * fs) / 2);
      ctx.font = fs + 'px ' + MONO; ctx.textBaseline = 'top'; ctx.textAlign = 'start'; ctx.direction = 'ltr';
      ctx.fillStyle = FAINT; for (var rd = 0; rd < rows; rd++) for (var cd = 0; cd < cols; cd++) if (bf[rd * cols + cd] < 0) ctx.fillText('.', x0 + cd * cw, y0 + rd * fs);
      for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) { var l = bf[r * cols + c]; if (l < 0) continue; ctx.fillStyle = l >= 10 ? BRIGHT : (l >= 6 ? GREEN : MIDG); ctx.fillText(RAMP.charAt(Math.min(RAMP.length - 1, l)), x0 + c * cw, y0 + r * fs); }
      var dcx = x0 + cols * cw / 2, dcy = y0 + rows * fs * 0.42, maxR = Math.min(R.w, R.h) * 0.46; // light transmission signals from the dish
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (var w = 0; w < 4; w++) { var wp = (t / 2600 + w / 4) % 1, rr = wp * maxR; if (rr < 10) continue; ctx.fillStyle = wp < 0.45 ? GREEN : FAINT; var np = Math.max(14, Math.floor(rr * 0.32)); for (var k = 0; k < np; k++) { var ang = k / np * 6.2832; ctx.fillText('.', dcx + Math.cos(ang) * rr, dcy + Math.sin(ang) * rr * 0.55); } }
      var vfs = clamp(Math.round(R.w / 32), 13, 24); ctx.font = '700 ' + vfs + 'px ' + STAMF; ctx.direction = 'rtl'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = BRIGHT; ctx.fillText('צור קשר', R.x + R.w / 2, R.y + R.h * 0.10);
      ctx.textAlign = 'start'; ctx.textBaseline = 'top'; ctx.direction = 'ltr';
      label(R, 'voyager · 1977');
      return t >= DUR;
    }
    return { frame: frame, title: 'viz' };
  }
  // an orbital astronomy simulation in ASCII
  function makeAstro() {
    var t = 0, DUR = 8000, stars = null, skey = -1;
    var planets = [{ r: 0.16, sp: 0.0016, g: 'o', col: MIDG, ph: 0 }, { r: 0.27, sp: 0.0011, g: 'O', col: GREEN, ph: 1.3 }, { r: 0.40, sp: 0.0008, g: '@', col: BRIGHT, ph: 2.7, moon: 1 }, { r: 0.55, sp: 0.0005, g: 'o', col: GREEN, ph: 4.1 }, { r: 0.70, sp: 0.00032, g: '°', col: MIDG, ph: 5.5 }];
    function frame(dt, R) {
      t += dt; ctx.fillStyle = BG; ctx.fillRect(R.x, R.y, R.w, R.h);
      var fs = clamp(Math.round(Math.min(R.w, R.h) / 44), 9, 16), cx = R.x + R.w / 2, cy = R.y + R.h / 2, rad = Math.min(R.w, R.h) * 0.44, tilt = 0.14 + 0.44 * (0.5 + 0.5 * Math.sin(t * 0.00016)); // the orbital plane tilts over time — a shifting perspective
      ctx.font = fs + 'px ' + MONO; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = 'ltr';
      if (!stars || skey !== ((R.w << 1) ^ R.h)) { stars = []; var rs = xs(hashOf('astro')); for (var s = 0; s < 70; s++) stars.push([R.x + rs() % Math.max(1, Math.floor(R.w)), R.y + rs() % Math.max(1, Math.floor(R.h)), rs() % 6]); skey = (R.w << 1) ^ R.h; }
      for (var i = 0; i < stars.length; i++) { ctx.fillStyle = stars[i][2] === 0 ? GREEN : FAINT; ctx.fillText(stars[i][2] === 0 ? '+' : '.', stars[i][0], stars[i][1]); }
      for (var p = 0; p < planets.length; p++) { var rr = planets[p].r * rad, n = Math.max(24, Math.floor(rr * 0.45)); ctx.fillStyle = FAINT; for (var k = 0; k < n; k++) { var a = (k / n) * 6.2832; ctx.fillText('.', cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * tilt); } }
      ctx.fillStyle = AMBER; ctx.fillText('@', cx, cy); for (var cr = 0; cr < 8; cr++) { var ca = cr / 8 * 6.2832 + t * 0.001; ctx.fillStyle = cr % 2 ? BRIGHT : AMBER; ctx.fillText('*', cx + Math.cos(ca) * fs * 0.95, cy + Math.sin(ca) * fs * 0.55); }
      for (var q = 0; q < planets.length; q++) {
        var P = planets[q], a2 = t * P.sp + P.ph, px = cx + Math.cos(a2) * P.r * rad, py = cy + Math.sin(a2) * P.r * rad * tilt;
        ctx.fillStyle = P.col; ctx.fillText(P.g, px, py);
        if (P.moon) { var ma = t * 0.004, mx = px + Math.cos(ma) * fs * 1.1, my = py + Math.sin(ma) * fs * 0.7; ctx.fillStyle = MIDG; ctx.fillText('.', mx, my); }
      }
      ctx.textAlign = 'start'; ctx.textBaseline = 'top';
      label(R, 'orbits · astro');
      return t >= DUR;
    }
    return { frame: frame, title: 'viz' };
  }
  // a shared 3D solid renderer — same z-buffer, RAMP and lighting as the torus, for every 3D shape
  function makeSolid3D(name, verts, faces, opts) {
    opts = opts || {};
    var t = 0, DUR = 7200, RAMP = '.,-~:;=!*#$@';
    function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
    function nrm(a) { var l = Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
    function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
    var fnorm = faces.map(function (f) { var a = verts[f[0]], n = nrm(cross(sub(verts[f[1]], a), sub(verts[f[2]], a))); var cx = (verts[f[0]][0] + verts[f[1]][0] + verts[f[2]][0]) / 3, cy = (verts[f[0]][1] + verts[f[1]][1] + verts[f[2]][1]) / 3, cz = (verts[f[0]][2] + verts[f[1]][2] + verts[f[2]][2]) / 3; if (n[0] * cx + n[1] * cy + n[2] * cz < 0) n = [-n[0], -n[1], -n[2]]; return n; });
    var LIGHT = nrm([0.3, 0.7, -0.9]), sph = [];
    if (opts.sphere) { var R0 = opts.sphere; for (var u = 0.0001; u < Math.PI; u += 0.12) for (var v = 0; v < 6.283; v += 0.12) sph.push([Math.sin(u) * Math.cos(v) * R0, Math.cos(u) * R0, Math.sin(u) * Math.sin(v) * R0]); }
    function frame(dt, R) {
      t += dt; ctx.fillStyle = BG; ctx.fillRect(R.x, R.y, R.w, R.h);
      var fs = clamp(Math.min(R.w, R.h) / 54, 7, 14), cw = fs * 0.6, cols = Math.max(20, Math.floor(R.w / cw)), rows = Math.max(20, Math.floor(R.h / fs));
      var bf = new Array(cols * rows), zb = new Array(cols * rows); for (var z = 0; z < bf.length; z++) { bf[z] = -1; zb[z] = 0; }
      var A = opts.tiltFn ? opts.tiltFn(t) : (opts.tilt != null ? opts.tilt : t * 0.0009), B = t * (opts.spin || 0.0011), ca = Math.cos(A), sa = Math.sin(A), cb = Math.cos(B), sb = Math.sin(B), K2 = 5, K1 = Math.min(cols, rows) * (opts.scale || 1.0);
      function rot(p) { var x1 = p[0] * cb + p[2] * sb, z1 = -p[0] * sb + p[2] * cb, y2 = p[1] * ca - z1 * sa, z2 = p[1] * sa + z1 * ca; return [x1, y2, z2]; }
      function plot(rp, lvl) { var ooz = 1 / (K2 + rp[2]), xp = Math.floor(cols / 2 + K1 * ooz * rp[0]), yp = Math.floor(rows / 2 - K1 * ooz * rp[1] * 0.5); if (xp >= 0 && xp < cols && yp >= 0 && yp < rows) { var idx = yp * cols + xp; if (ooz > zb[idx]) { zb[idx] = ooz; bf[idx] = lvl; } } }
      var STEP = 34;
      for (var fi = 0; fi < faces.length; fi++) {
        var f = faces[fi], rnv = rot(fnorm[fi]), lum = 0.30 + 0.70 * Math.max(0, rnv[0] * LIGHT[0] + rnv[1] * LIGHT[1] + rnv[2] * LIGHT[2]), v0 = verts[f[0]], e1 = sub(verts[f[1]], v0), e2 = sub(verts[f[2]], v0);
        for (var ii = 0; ii <= STEP; ii++) for (var jj = 0; jj <= STEP - ii; jj++) { var uu = ii / STEP, vv = jj / STEP, rp = rot([v0[0] + e1[0] * uu + e2[0] * vv, v0[1] + e1[1] * uu + e2[1] * vv, v0[2] + e1[2] * uu + e2[2] * vv]), dz = clamp((1.5 - rp[2]) / 3, 0, 1); plot(rp, Math.min(RAMP.length - 1, Math.max(0, Math.round(lum * (RAMP.length - 1) * (0.40 + 0.60 * dz))))); } // ambient + depth gradient across the face → reads 3D, not a flat fill
      }
      for (var si = 0; si < sph.length; si++) { var rp2 = rot(sph[si]), nn = nrm(rp2), lum2 = 0.25 + 0.75 * Math.max(0, nn[0] * LIGHT[0] + nn[1] * LIGHT[1] + nn[2] * LIGHT[2]), dz2 = clamp((1.5 - rp2[2]) / 3, 0, 1); plot(rp2, Math.min(RAMP.length - 1, Math.floor(lum2 * (RAMP.length - 1) * (0.5 + 0.5 * dz2)))); }
      if (opts.edges) for (var ei = 0; ei < opts.edges.length; ei++) { var ea = rot(verts[opts.edges[ei][0]]), eb = rot(verts[opts.edges[ei][1]]), steps = 48; for (var s = 0; s <= steps; s++) plot([ea[0] + (eb[0] - ea[0]) * s / steps, ea[1] + (eb[1] - ea[1]) * s / steps, ea[2] + (eb[2] - ea[2]) * s / steps], RAMP.length - 1); }
      var x0 = R.x + Math.round((R.w - cols * cw) / 2), y0 = R.y + Math.round((R.h - rows * fs) / 2);
      ctx.font = fs + 'px ' + MONO; ctx.textBaseline = 'top'; ctx.textAlign = 'start'; ctx.direction = 'ltr';
      ctx.fillStyle = FAINT; for (var rd = 0; rd < rows; rd++) for (var cd = 0; cd < cols; cd++) if (bf[rd * cols + cd] < 0) ctx.fillText('.', x0 + cd * cw, y0 + rd * fs);
      for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) { var l = bf[r * cols + c]; if (l < 0) continue; ctx.fillStyle = l >= 8 ? BRIGHT : (l >= 4 ? GREEN : MIDG); ctx.fillText(RAMP.charAt(l), x0 + c * cw, y0 + r * fs); }
      label(R, name);
      return t >= DUR;
    }
    return { frame: frame, title: 'viz' };
  }
  function makeCube() {
    var s = 0.78, V = [[-s, -s, -s], [s, -s, -s], [s, s, -s], [-s, s, -s], [-s, -s, s], [s, -s, s], [s, s, s], [-s, s, s]];
    var F = [[0, 1, 2], [0, 2, 3], [5, 4, 7], [5, 7, 6], [4, 0, 3], [4, 3, 7], [1, 5, 6], [1, 6, 2], [4, 5, 1], [4, 1, 0], [3, 2, 6], [3, 6, 7]];
    return makeSolid3D('cube · 3d', V, F, { scale: 1.25 });
  }
  function makeTetraSphere() {
    var s = 0.95, V = [[s, s, s], [s, -s, -s], [-s, s, -s], [-s, -s, s]], E = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]];
    return makeSolid3D('tetra · sphere', V, [], { edges: E, sphere: 0.46, scale: 1.25 });
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
    var t = 0, DUR = 6000, fs = 16, cols = 0, drops = [], spd = [], key = -1;
    function build(R) { fs = clamp(Math.round(R.w / 70), 12, 20); cols = Math.ceil(R.w / fs); drops = []; spd = []; var rows = R.h / fs; for (var i = 0; i < cols; i++) { drops[i] = Math.floor(Math.random() * rows); spd[i] = 0.55 + Math.random() * 0.8; } key = (R.w << 1) ^ R.h; }
    function frame(dt, R) {
      t += dt; if (key !== ((R.w << 1) ^ R.h)) build(R);
      ctx.fillStyle = BG; ctx.fillRect(R.x, R.y, R.w, R.h);
      drawMatrix(R, fs, cols, drops, spd, 1);
      label(R, 'matrix · rain');
      return t >= DUR;
    }
    return { frame: frame, title: 'rain' };
  }

  // a reusable matrix-rain layer — a full curtain things coalesce out of and dissolve back into
  function makeRainLayer() {
    var rfs = 16, rcols = 0, rdrops = [], rspd = [], rkey = -1;
    function ensure(R) { if (rkey === ((R.w << 1) ^ R.h)) return; rfs = clamp(Math.round(R.w / 70), 12, 20); rcols = Math.ceil(R.w / rfs); rdrops = []; rspd = []; var rows = R.h / rfs; for (var i = 0; i < rcols; i++) { rdrops[i] = Math.floor(Math.random() * rows); rspd[i] = 0.55 + Math.random() * 0.8; } rkey = (R.w << 1) ^ R.h; }
    function draw(R, intensity) { ensure(R); drawMatrix(R, rfs, rcols, rdrops, rspd, Math.max(0.20, intensity)); }
    return { draw: draw };
  }

  // ───────────────────────── window: brand — GRC·LABS out of the matrix ─────────────────────────
  function makeBrand() {
    var t = 0, blk = null, blkW = 0, blkH = 0, key = -1, rain = makeRainLayer();
    var FILL = 800, CO = 950, HOLD = 1000, DIS = 1150, END = FILL + CO + HOLD + DIS;
    function build(R) {
      var fs = clamp(Math.round(Math.min(R.w, R.h) / 26), 10, 22), cw = fs * 0.6;
      var gw = Math.max(24, Math.floor((R.w * 0.9) / cw)), gh = Math.max(7, Math.floor((R.h * 0.42) / fs));
      var off = document.createElement('canvas'); off.width = gw; off.height = gh; var o = off.getContext('2d');
      o.fillStyle = '#000'; o.fillRect(0, 0, gw, gh); o.fillStyle = '#fff'; o.textAlign = 'center'; o.textBaseline = 'middle';
      var GF = '"Space Grotesk", "IBM Plex Sans", sans-serif';                  // the site's display font
      var fsize = gh; o.font = '700 ' + fsize + 'px ' + GF;
      while (fsize > 4 && o.measureText('GRC·LABS').width > gw * 0.94) { fsize--; o.font = '700 ' + fsize + 'px ' + GF; }
      o.fillText('GRC·LABS', gw / 2, gh / 2 + 1);
      var d = o.getImageData(0, 0, gw, gh).data;
      blkW = gw * cw; blkH = gh * fs;
      blk = document.createElement('canvas'); blk.width = Math.ceil(blkW * dpr); blk.height = Math.ceil(blkH * dpr);
      var cc = blk.getContext('2d'); cc.setTransform(dpr, 0, 0, dpr, 0, 0); cc.font = fs + 'px ' + MONO.replace(/"/g, ''); cc.textBaseline = 'top'; cc.textAlign = 'start';
      for (var r = 0; r < gh; r++) for (var c = 0; c < gw; c++) { if (d[(r * gw + c) * 4] <= 110) continue; cc.fillStyle = (c + r) % 5 === 0 ? BRIGHT : GREEN; cc.fillText((c + r) % 7 === 0 ? '@' : '#', c * cw, r * fs); }
      key = (R.w << 1) ^ R.h;
    }
    function frame(dt, R) {
      t += dt; ctx.fillStyle = BG; ctx.fillRect(R.x, R.y, R.w, R.h);
      if (!blk || key !== ((R.w << 1) ^ R.h)) build(R);
      var m = coalesceMix(t, FILL, CO, HOLD, DIS), a = m.a, rainI = m.rainI;
      rain.draw(R, rainI);
      if (a > 0.01) { var dx = R.x + (R.w - blkW) / 2, dy = R.y + (R.h - blkH) / 2; ctx.globalAlpha = a; ctx.drawImage(blk, 0, 0, blk.width, blk.height, dx, dy, blkW, blkH); ctx.globalAlpha = 1; }
      if (a > 0.85) label(R, 'grc·labs');
      return t >= END;
    }
    return { frame: frame, title: 'brand' };
  }

  // ───────────────────────── window: subject — ASCII portrait (retired; ?win=subject) ─────────────────────────
  // a few portrait renderings to compare — cycle with ?face=N, or it rotates each appearance
  var FACE_VARIANTS = [
    { id: 'v1·soft', ramp: " .,:;-~=+*coaeUXEZ%#8B@", lo: 0.16, span: 0.74, gamma: 0.70, hi: 0.70, mid: 0.36, blank: 0.12 },
    { id: 'v2·hard', ramp: " .:-=+ox*#%@MW", lo: 0.10, span: 0.82, gamma: 0.85, hi: 0.60, mid: 0.30, blank: 0.10 },
    { id: 'v3·block', ramp: " .:-+*coe%#", lo: 0.13, span: 0.78, gamma: 0.72, hi: 0.64, mid: 0.34, blank: 0.10 }
  ];
  var faceVar = 0;
  var portrait = (function () {
    var img = new Image(), ready = false, failed = false;
    img.onload = function () { ready = true; }; img.onerror = function () { failed = true; }; img.src = 'assets/img/portrait-dark.jpg';
    function scene() {
      var t = 0, blk = null, blkW = 0, blkH = 0, key = -1;
      var V = FACE_VARIANTS[FORCE_FACE >= 0 ? (FORCE_FACE % FACE_VARIANTS.length) : (faceVar++ % FACE_VARIANTS.length)], RAMP = V.ramp;
      // the face shows only for a moment — it coalesces out of the matrix and quickly dissolves back
      var FILL = 700, CO = 850, HOLD = 350, DIS = 1050, END = FILL + CO + HOLD + DIS;
      var rain = makeRainLayer();
      function build(R) {
        var side = Math.min(R.w * 0.80, R.h * 0.84), fs = clamp(side / 58, 7, 13), acw = fs * 0.6;
        var gw = Math.max(40, Math.floor(side / acw)), gh = Math.max(40, Math.floor(side / fs));
        var off = document.createElement('canvas'); off.width = gw; off.height = gh; var o = off.getContext('2d');
        // crop a centred square tight on the head, so the face fills the frame instead of floating small and low
        var iw = img.naturalWidth || img.width || 720, ih = img.naturalHeight || img.height || 720, cs = Math.min(iw, ih) * 0.76, isx = (iw - cs) / 2, isy = clamp(ih * 0.47 - cs / 2, 0, ih - cs);
        o.drawImage(img, isx, isy, cs, cs, 0, 0, gw, gh); var d = o.getImageData(0, 0, gw, gh).data;
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
        if (failed) { ctx.fillStyle = GREEN; ctx.font = '700 ' + Math.round(R.w / 42) + 'px ' + MONO; ctx.textAlign = 'center'; ctx.fillText('// SUBJECT UNAVAILABLE', R.x + R.w / 2, R.y + R.h / 2); ctx.textAlign = 'start'; return t >= END; }
        if (!ready) { ctx.fillStyle = DIM; ctx.font = '700 ' + Math.round(R.w / 42) + 'px ' + MONO; ctx.textAlign = 'center'; ctx.fillText('// DECRYPTING SUBJECT ...', R.x + R.w / 2, R.y + R.h / 2); ctx.textAlign = 'start'; return false; }
        if (!blk || key !== ((R.w << 1) ^ R.h)) build(R);
        var m = coalesceMix(t, FILL, CO, HOLD, DIS), faceA = m.a, rainI = m.rainI;
        rain.draw(R, rainI);
        if (faceA > 0.01) { var dx = R.x + (R.w - blkW) / 2, dy = R.y + (R.h - blkH) / 2; ctx.globalAlpha = faceA; ctx.drawImage(blk, 0, 0, blk.width, blk.height, dx, dy, blkW, blkH); ctx.globalAlpha = 1; }
        if (faceA > 0.85) label(R, 'subject · ' + V.id);
        return t >= END;
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
  var VIZ_BUILDERS = POINT_SHAPES.map(function (sh) { return function () { return makePointGeo(sh); }; }).concat([makeDonut, makeSphere, makeSpring, makeKnot, makeCochlea, makeMolecule, makePyr3D, makeCube, makeTetraSphere, makeAudioScope, makeAstro, makeCrypto, makeVoyager, makeMenorah]);
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
    if (!ilOrder || ilI >= ilOrder.length) { ilOrder = shuffle(['viz', 'viz', 'rain', 'subject']); ilI = 0; } // viz scenes, matrix rain, and the face coalescing from the rain
    return ilOrder[ilI++];
  }
  function buildWindow(type) {
    if (type === 'brain') return makeBrain(nextCmd());
    if (type === 'viz') return nextViz();
    if (type === 'rain') return makeRain();
    if (type === 'brand') return makeBrand();
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
      ctx.font = '700 ' + fs + 'px ' + STAMF; ctx.direction = 'rtl'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
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
    // a dense, full matrix — katakana, kanji, Hebrew, Greek, symbols and the shape ASCII; each column a falling stream with a bright head and a fading trail
    var fs = 16, cols = 0, drops = [], speeds = [], bottomed = [], TRAIL = 16;
    function reset(C, fromTop) { fs = Math.max(12, Math.min(20, Math.round(W / 70))); cols = Math.ceil(C.w / fs); drops = []; speeds = []; bottomed = []; var rows = C.h / fs; TRAIL = Math.max(12, Math.round(rows * 0.55)); for (var i = 0; i < cols; i++) { drops[i] = fromTop ? -Math.random() * 6 : Math.floor(Math.random() * rows); speeds[i] = 0.6 + Math.random() * 0.85; bottomed[i] = false; } }
    function draw(C, respawn) {
      clipRect(C);
      if (respawn) { ctx.fillStyle = 'rgba(8,11,20,0.16)'; ctx.fillRect(C.x, C.y, C.w, C.h); } // fill phase: progressively veil the outgoing window
      ctx.font = fs + 'px ' + MONO_RAIN; ctx.textAlign = 'start'; ctx.textBaseline = 'top'; ctx.direction = 'ltr';
      for (var i = 0; i < cols; i++) {
        var headI = Math.floor(drops[i]), x = C.x + i * fs;
        for (var tr = 0; tr < TRAIL; tr++) {
          var row = headI - tr, yy = C.y + row * fs;
          if (yy <= C.y - fs || yy >= C.y + C.h) continue;
          if (tr === 0) { ctx.fillStyle = 'rgba(155,232,91,1)'; ctx.fillText(RAIN_BASE.charAt((Math.random() * RAIN_BASE.length) | 0), x, yy); }
          else { var ch = streamCh(i, row), a = (1 - tr / TRAIL) * 0.82 + 0.10; ctx.fillStyle = 'rgba(99,178,46,' + a.toFixed(3) + ')'; ctx.fillText(ch, x, yy); }
        }
        drops[i] += speeds[i];
        if (drops[i] * fs > C.h) bottomed[i] = true;                  // this column has swept the full height at least once
        if (respawn && (Math.floor(drops[i]) - TRAIL) * fs > C.h) { drops[i] = -(Math.random() * 6); speeds[i] = 0.6 + Math.random() * 0.85; }
      }
      ctx.restore();
    }
    function reachedBottom() { if (!cols) return false; for (var i = 0; i < cols; i++) if (!bottomed[i]) return false; return true; } // the curtain has covered the whole screen
    function cleared(C) { for (var i = 0; i < cols; i++) if ((Math.floor(drops[i]) - TRAIL) * fs <= C.h) return false; return true; }
    return { reset: reset, draw: draw, reachedBottom: reachedBottom, cleared: cleared };
  })();

  // ─────────────────────────── loop ───────────────────────────
  var FILL_MAX = 1700, DRAIN_MS = 1500, RISE_MS = 900;
  var cur = null, incoming = null, trans = '', transT = 0, raf = 0, last = 0;
  function content() { return { x: 0, y: 0, w: W, h: H - statusH() }; }
  function frame(now) {
    if (!last) last = now; var dt = Math.min(80, now - last) * QAMUL; last = now;
    var C = content();
    if (trans === 'fill') {                       // rain falls from the top until it has covered the whole screen
      mtx.draw(C, true); transT += dt;
      if (mtx.reachedBottom() || transT >= FILL_MAX) { trans = 'drain'; transT = 0; } // no reset — the full curtain carries straight into the drain
    } else if (trans === 'drain') {               // incoming window rises up from the bottom as the full curtain drains out
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
    if (FORCE_NOW) { root.style.transition = 'none'; root.style.opacity = '1'; } // forced test/QA: skip the fade-in
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
