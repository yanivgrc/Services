/* GRC·LABS mark — the "containment breach": an epoxy tetrahedron with a hollow wax-sphere cavity,
   raymarched in a single fragment shader. Dependency-free WebGL; degrades to a static asset if WebGL is unavailable.
   Motion: the mark floats in space — the same free upward tumble as the screensaver's BREACH scene, with a slow
   roll drift and a gentle bob. Two bodies in space light it from outside: a cool-white key "sun" aimed from the GRC.LABS
   wordmark's on-screen position, and a weak green "planet-shine" bounce from the opposite side that reveals the shadow
   face. A bright white light inside turns the hollow core into a lit chamber seen through the openings. A distant green
   source rims the edges (v1.71).
   Cavity rim is beveled (smax), analytic-normal shaded, sub-pixel refined, with adaptive supersampling on edge pixels.
   © 2026 GRC·LABS — all rights reserved. www.grc-labs.com */
(function () {
  var cvs = document.getElementById('logo');
  if (!cvs) return;
  var gl = cvs.getContext('webgl', { antialias: false, alpha: true }) || cvs.getContext('experimental-webgl');
  if (!gl) { document.documentElement.classList.add('no-logo-gl'); return; } // CSS falls back to the wordmark

  var FRAG =
    '#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\n' +
    'uniform vec2 u_res,u_bob; uniform float u_rin,u_rs,u_round,u_svis,u_scan,u_coreI,u_coreFall,u_rim,u_glint,u_edgePx,u_edgeW,u_shell,u_ssaa,u_amb,u_key,u_bounce,u_albedo; uniform vec3 u_tint,u_coreCol,u_greenCol,u_keyDir,u_bounceDir; uniform mat3 u_rot;' +

    'const vec3 BODY=vec3(0.847,0.871,0.902);' +   // #D8DEE6 — light neutral grey-white albedo; the external key light does all the face shading
    'const vec3 KEYCOL=vec3(0.933,0.949,0.969);' +   // #EEF2F7 — cool white key ("the sun" = the GRC.LABS wordmark)
    'const vec3 SPECC=vec3(0.90,0.95,0.85);' +
    'const vec3 GREEN_SCAN=vec3(0.388,0.698,0.176);' +   // #63B22E phosphor — the periodic scan line (u_scan)
    'const vec3 N0=vec3( 0.57735, 0.57735, 0.57735);' +
    'const vec3 N1=vec3( 0.57735,-0.57735,-0.57735);' +
    'const vec3 N2=vec3(-0.57735, 0.57735,-0.57735);' +
    'const vec3 N3=vec3(-0.57735,-0.57735, 0.57735);' +
    'float smax(float a,float b,float k){float h=clamp(0.5+0.5*(a-b)/k,0.0,1.0);return mix(b,a,h)+k*h*(1.0-h);}' +
    'float sdTet(vec3 p,float r,float k){float a=dot(p,N0),b=dot(p,N1),c=dot(p,N2),d=dot(p,N3);return smax(smax(a,b,k),smax(c,d,k),k)-r;}' +
    // CSG rim is a SMOOTH max (k = u_round) so the cavity gets the same micro-bevel as the tetra edges — no sharp crease
    'float map(vec3 p){float t=sdTet(p,u_rin,u_round);float s=length(p)-u_rs;return smax(t,-s,u_round);}' +
    // tetrahedral 4-tap gradient (not 6-tap central differences) — used only inside the bevel band; epsilon = pixel footprint
    'vec3 calcN(vec3 p,float e){vec2 k=vec2(1.0,-1.0);return normalize(k.xyy*map(p+k.xyy*e)+k.yyx*map(p+k.yyx*e)+k.yxy*map(p+k.yxy*e)+k.xxx*map(p+k.xxx*e));}' +
    // edge glow: smoothstep (not step) so the rim does not flicker while the mark rotates
    'float edgeGlow(vec3 p,float w){float a=dot(p,N0),b=dot(p,N1),c=dot(p,N2),d=dot(p,N3);float m=max(max(a,b),max(c,d));float cnt=smoothstep(m-w,m,a)+smoothstep(m-w,m,b)+smoothstep(m-w,m,c)+smoothstep(m-w,m,d);return clamp(cnt-1.0,0.0,2.0);}' +

    // one sample of the scene; returns straight colour+alpha and flags whether this is an internal/silhouette edge pixel
    'vec4 sampleScene(vec2 frag,out float edgeFlag){edgeFlag=0.0;' +
    'vec3 GREEN=u_tint;vec3 CORE=u_coreCol;vec3 GRN=u_greenCol;' +   // GREEN = white outer mark; CORE = cool-white cavity light; GRN = distant green source
    'vec3 Lg=normalize(vec3(3.0,-2.5,-4.0));' +                      // external green light: page-anchored, behind + below-right
    'float aspect=u_res.x/u_res.y;' +
    'vec2 uv=(frag-0.5*u_res)/u_res.y;' +
    'uv-=vec2(u_bob.x*aspect,u_bob.y);' +                            // float/bob
    'mat3 R=u_rot;' +
    'vec3 ro=R*vec3(0.,0.,9.0);' +                                   // camera kept as-is (distance 9, focal 1.7)
    'vec3 rd=R*normalize(vec3(uv,-1.7));' +
    'float pxAng=1.0/(u_res.y*1.7);' +                               // angular size of one pixel
    // raymarch; hit threshold relative to pixel size; track closest angular approach (min d/tt) for silhouette AA
    'float tt=0.0;bool hit=false;float d;float mind=1e9;vec3 pm=ro;' +
    'for(int i=0;i<110;i++){vec3 p=ro+rd*tt;d=map(p);if(tt>0.001){float r=d/tt;if(r<mind){mind=r;pm=p;}}if(d<pxAng*tt*0.35){hit=true;break;}tt+=d*0.85;if(tt>22.0)break;}' +
    'if(hit){tt+=map(ro+rd*tt)*0.5;tt+=map(ro+rd*tt)*0.5;tt+=map(ro+rd*tt)*0.5;}' +   // 3 refinement steps → sub-pixel surface position
    'float cov=smoothstep(pxAng,0.0,mind);' +
    'vec3 col=vec3(0.0);' +
    'vec3 ps=hit?(ro+rd*tt):pm;' +
    'float dl=length(ps);' +
    'float w=max(0.008,pxAng*tt*u_edgePx);' +                        // screen-space edge/rim band (approved width)
    // face dots → dominant face normal + largest/second-largest (tetra-edge proximity)
    'float da=dot(ps,N0),db=dot(ps,N1),dc=dot(ps,N2),dd=dot(ps,N3);' +
    'float A=max(da,db),a2=min(da,db),B=max(dc,dd),b2=min(dc,dd);' +
    'float m=max(A,B);float second=max(min(A,B),max(a2,b2));' +
    'vec3 fn=N0;float mm=da;if(db>mm){mm=db;fn=N1;}if(dc>mm){mm=dc;fn=N2;}if(dd>mm){mm=dd;fn=N3;}' +
    // classify the hit by which CSG term wins: face (tet) vs cavity sphere (-s); |diff|<u_round == the bevel band
    'float tetv=sdTet(ps,u_rin,u_round);float negS=u_rs-dl;float diff=tetv-negS;' +
    'vec3 n;if(!hit){n=calcN(ps,pxAng*tt*0.5);}else if(diff>u_round){n=fn;}else if(diff<-u_round){n=-ps/dl;}else{n=calcN(ps,pxAng*tt*0.5);}' +
    'vec3 vd=-rd;' +
    'vec3 lk=u_keyDir;vec3 lb=u_bounceDir;' +   // two external bodies: key = the wordmark "sun" (page-anchored dir); bounce = planet-shine from the opposite side, slightly behind
    'float dk=max(dot(n,lk),0.0);float dbn=max(dot(n,lb),0.0);' +
    'vec3 hh=normalize(lk+vd);float spec=pow(max(dot(n,hh),0.0),46.0);' +
    'float ndv=1.0-max(dot(n,vd),0.0);float fres5=ndv*ndv*ndv*ndv*ndv;' +   // fres5 = exp 5, for the green rim and a faint cavity-wall edge
    'float innerMix=1.0-smoothstep(0.0,w,abs(dl-u_rs));' +           // narrow cavity-rim blend; also masks the green rim off the circles
    'float grim=fres5*max(dot(n,Lg),0.0)*u_rim*(1.0-innerMix);' +
    'vec3 hg=normalize(Lg+vd);float glint=pow(max(dot(n,hg),0.0),60.0)*u_glint;' +
    'float rimPx=abs(dl-u_rs)/(pxAng*tt);' +                         // distance to the exact cavity circle, in pixels
    'float rimLine=1.0-smoothstep(0.0,u_edgePx,rimPx);' +            // analytic rim line — same width/weight as the triangle edges
    'vec3 body=BODY*u_albedo;' +
    'vec3 outerCol=body*(u_amb+KEYCOL*dk*u_key)+body*GRN*dbn*u_bounce+SPECC*spec*0.20+GREEN*edgeGlow(ps,w)*u_edgeW+GRN*(grim+glint);' +   // cool-white key drives the faces (white->very dark as they turn); weak green planet-shine reveals the shadow side without lighting it up; edges define the silhouette; NO core spill
    'if(hit){' +
    'float cDiff=max(dot(n,-ps/dl),0.0);' +
    'vec3 coreLit=CORE*u_coreI*cDiff/(dl*dl);' +   // cavity walls: bright white from the core point light — the brightest surface on screen
    'vec3 innerCol=CORE*0.08+coreLit+GREEN*fres5*0.10;' +   // core-lit interior; the outer key/fill barely reach inside
    'col=mix(outerCol,innerCol,innerMix);' +
    'col+=GREEN*rimLine*u_edgeW;' +                                  // crisp analytic circle drawn on top of the blended body
    'if(u_scan>=0.0){float scanY=mix(2.4,-2.4,u_scan);float sb=smoothstep(0.18,0.0,abs(ps.y-scanY));col+=GREEN_SCAN*sb*0.85;}' +
    '}else{col=outerCol*cov;}' +
    // (volumetric core cloud removed in v1.70 — cavity walls + rim lip carry the interior light; no fog in the middle)
    // faint ghost shell at the cavity radius
    'if(u_svis>0.001){float b=dot(ro,rd);float c2=dot(ro,ro)-u_rs*u_rs;float disc=b*b-c2;' +
    'if(disc>0.0){float tn=-b-sqrt(disc);if(tn>0.0&&(!hit||tn<tt)){vec3 sp=ro+rd*tn;vec3 sn=normalize(sp);' +
    'float fr=pow(1.0-max(dot(sn,-rd),0.0),u_shell);float a=clamp(u_svis*(0.12+0.88*fr),0.0,1.0);vec3 shell=GREEN*(0.35+0.75*fr);col=mix(col,shell,a);}}}' +
    // flag edge pixels for supersampling: cavity rim, tetra edge, bevel band, or silhouette transition
    'if(hit){float ep=(m-second)/(pxAng*tt);if(rimPx<2.0||ep<2.0||abs(diff)<u_round)edgeFlag=1.0;}' +
    'if(cov>0.004&&cov<0.996)edgeFlag=1.0;' +
    'float al=max(max(col.r,col.g),col.b);al=clamp(al*3.0,0.0,1.0);' +
    'return vec4(col,al);}' +

    'void main(){float fl;vec4 c=sampleScene(gl_FragCoord.xy,fl);' +
    'if(u_ssaa>0.5&&fl>0.5){float d0;' +                             // adaptive rotated-grid 4x supersampling, edge pixels only
    'vec4 s1=sampleScene(gl_FragCoord.xy+vec2( 0.125, 0.375),d0);' +
    'vec4 s2=sampleScene(gl_FragCoord.xy+vec2( 0.375,-0.125),d0);' +
    'vec4 s3=sampleScene(gl_FragCoord.xy+vec2(-0.125,-0.375),d0);' +
    'vec4 s4=sampleScene(gl_FragCoord.xy+vec2(-0.375, 0.125),d0);' +
    'vec3 pr=s1.rgb*s1.a+s2.rgb*s2.a+s3.rgb*s3.a+s4.rgb*s4.a;' +     // premultiplied average so mixed-transparency samples blend right
    'float pa=s1.a+s2.a+s3.a+s4.a;' +
    'c=pa>0.0001?vec4(pr/pa,pa*0.25):vec4(0.0);}' +
    'gl_FragColor=c;}';

  var VERT = 'attribute vec2 p; void main(){ gl_Position=vec4(p,0.0,1.0); }';

  function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn('logo shader', gl.getShaderInfoLog(s)); } return s; }
  var prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { document.documentElement.classList.add('no-logo-gl'); return; }
  gl.useProgram(prog);

  var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var ploc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(ploc); gl.vertexAttribPointer(ploc, 2, gl.FLOAT, false, 0, 0);
  gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  var U = {}; ['u_res', 'u_bob', 'u_rin', 'u_rs', 'u_round', 'u_svis', 'u_scan', 'u_coreI', 'u_coreFall', 'u_rim', 'u_glint', 'u_edgePx', 'u_edgeW', 'u_shell', 'u_ssaa', 'u_amb', 'u_key', 'u_bounce', 'u_albedo', 'u_tint', 'u_coreCol', 'u_greenCol', 'u_keyDir', 'u_bounceDir', 'u_rot'].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });
  var PR = Math.min(window.devicePixelRatio || 1, 2);

  // ── exterior lighting: temp tuning params + the wordmark-anchored key direction ──
  var QS = (function () { try { return new URLSearchParams(location.search); } catch (e) { return null; } })();
  function qNum(k) { if (!QS) return null; var v = parseFloat(QS.get(k)); return isFinite(v) ? v : null; }
  var P_key = qNum('key'), P_bounce = qNum('bounce'), P_amb = qNum('amb');
  var forceMobile = !!(QS && QS.get('mobile') === '1');                 // ?mobile=1 forces the mobile lighting on desktop for comparison

  function norm3(x, y, z) { var l = Math.sqrt(x * x + y * y + z * z) || 1; return [x / l, y / l, z / l]; }
  var FALLBACK_DIR = norm3(-4.5, 5.5, 4.0);                             // fallback: the current upper-left direction
  var keyDir = new Float32Array(FALLBACK_DIR);
  var bounceDir = new Float32Array(norm3(4.5, -5.5, -0.3));
  var wordmark = (cvs.closest ? cvs.closest('h1') : cvs.parentNode);

  // key "sun" aims from the wordmark's on-screen box toward the canvas centre; bounce mirrors it, slightly behind (z<0)
  function computeKeyDir() {
    var dir = FALLBACK_DIR;
    var lat = (CFG && CFG.keyLateral) || 1.7;                           // read CFG hoisting-safe (first resize() runs before CFG is assigned)
    var fwd = (CFG && CFG.keyForward) || 0.7;
    try {
      var marks = wordmark ? wordmark.querySelectorAll('[data-decrypt]') : null;
      if (marks && marks.length) {
        var l = Infinity, r = -Infinity, tp = Infinity, b = -Infinity;
        for (var i = 0; i < marks.length; i++) { var q = marks[i].getBoundingClientRect(); l = Math.min(l, q.left); r = Math.max(r, q.right); tp = Math.min(tp, q.top); b = Math.max(b, q.bottom); }
        var cr = cvs.getBoundingClientRect();
        var unit = Math.max(1, cr.height);
        var dx = ((l + r) / 2 - (cr.left + cr.width / 2)) / unit;
        var dy = ((cr.top + cr.height / 2) - (tp + b) / 2) / unit;      // flip Y: screen-down → scene-up
        if (isFinite(dx) && isFinite(dy) && (dx || dy)) dir = norm3(dx * lat, dy * lat, fwd);   // lat>1 biases the sun to one side; fwd lowers the frontal fill
      }
    } catch (e) { dir = FALLBACK_DIR; }
    keyDir = new Float32Array(dir);
    bounceDir = new Float32Array(norm3(-dir[0], -dir[1], -0.3));        // opposite side of the key, slightly from behind
  }

  function resize() { var r = cvs.getBoundingClientRect(); var w = Math.max(1, Math.round(r.width * PR)), h = Math.max(1, Math.round(r.height * PR)); if (w !== cvs.width || h !== cvs.height) { cvs.width = w; cvs.height = h; } gl.viewport(0, 0, cvs.width, cvs.height); computeKeyDir(); }
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', resize);                // recompute the key direction on resize + orientation change only (not per frame)
  resize();
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(resize); } // re-fit once the display font has loaded

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DEG = Math.PI / 180, TAU = Math.PI * 2;

  // ── motion + core-light config — everything tunable lives in one place (v1.68 "floating + lit core") ──
  var CFG = {
    dtMax: 1 / 30,              // clamp a single real-time step to 33ms so a long frame / tab return can't jump the motion

    // free tumble — same rates as the screensaver's makeLogo(), scaled down for the calmer hero
    spin: 0.6,                  // overall tumble multiplier (1.0 == screensaver speed)
    yawRate: 0.36,              // rad/s (× spin) about Y
    pitchRate: 0.60,            // rad/s (× spin) about X — continuous upward tumble, may wrap
    rollAmp: 0.08,              // rad — slow roll drift amplitude about Z
    rollRate: 0.13,             // rad/s inside the roll sine

    // float/bob — the mark drifts in space (fractions of canvas height, applied to uv in-shader)
    bobYAmp: 0.025, bobYPeriod: 7.0,   // vertical bob
    bobXAmp: 0.012, bobXPeriod: 11.0,  // horizontal drift

    // pointer parallax: a small extra tilt that follows the cursor, applied on top (frame-rate-independent easing)
    parallaxMaxDeg: 8,          // tilt ceiling (deg)
    parallaxK: 6.0,             // damping rate (1/s): ease factor = 1 - exp(-k·dt)

    // phosphor scan line
    scanPeriod: 12.0,           // s between scan passes
    scanDuration: 0.9,          // s a single scan takes to cross the mark

    // the light source lives INSIDE the cavity — bright white walls (inverted lighting, v1.70) — APPROVED, keep as-is
    coreColor: [0.949, 0.965, 0.980],  // bright white #F2F6FA
    coreIntensity: 0.9,         // core point-light strength → cavity walls are the brightest surface on screen
    coreFalloff: 6.0,           // k in exp(-k·dist²) — tight, so the volumetric core is a small soft cloud, not fog
    breathePeriod: 5.0,         // s — the core breathes 0.85…1.15 of coreIntensity (no flicker)

    // outer faces — two bodies in space light the mark (v1.71): key "sun" = the wordmark; bounce = green planet-shine
    bodyAmbient: 0.04,          // flat ambient floor on the faces (×2 on mobile ≤768px)
    keyWeight: 1.0,             // strength of the external key light → lit face ≈ white, face turned away ≈ very dark
    keyLateral: 1.7,            // side-bias gain on the wordmark offset — >1 pushes the sun further off to one side (stronger one-sided light, deeper far-side shadow)
    keyForward: 0.7,            // forward (z) component of the key dir — lower = more raking side light, less frontal fill
    bounceWeight: 0.18,         // green planet-shine from the opposite side — reveals the shadow side without lighting it up (×1.4 on mobile ≤768px)
    albedoMult: 0.8,            // scales the grey-white body albedo (#D8DEE6) — slightly darker body

    // distant green source in space — now a rare reflection only (−30% from v1.69)
    greenColor: [0.388, 0.698, 0.176], // phosphor green #63B22E
    rimIntensity: 0.245,        // fresnel-weighted (exp 5) green rim on silhouette-facing surfaces
    glintIntensity: 0.175,      // tight green specular (exp ~60) that flashes across flat faces as they turn past the light

    // fine outlines — screen-space line widths so edges/rims stay ~1px at any canvas size and PR
    edgePx: 1.2,                // triangle-edge glow band width in pixels (also the cavity-rim blend + analytic-circle width)
    edgeWeight: 0.22,           // triangle-edge + cavity-rim glow weight
    shellExp: 6.0,              // ghost-sphere fresnel exponent → a thin halo line (u_svis stays 0.10)

    // adaptive supersampling of edge pixels (cavity rim / tetra edges / silhouette) — auto-off on low-end devices
    ssaa: true,

    assembleDur: 1.1            // assemble-on-load duration (s) — kept under 1.2s
  };

  // supersampling: on by default, off on low-end (≤4 cores or mobile UA), which must already look clean via steps 1–4
  var isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');
  var lowEnd = (navigator.hardwareConcurrency || 8) <= 4 || isMobile;
  var ssaaOn = CFG.ssaa && !lowEnd;

  // ── tiny quaternion helpers (no dependencies). q = [w,x,y,z]; R(a⊗b) = R(a)·R(b) ──
  function qMul(a, b) {
    var aw = a[0], ax = a[1], ay = a[2], az = a[3], bw = b[0], bx = b[1], by = b[2], bz = b[3];
    return [
      aw * bw - ax * bx - ay * by - az * bz,
      aw * bx + ax * bw + ay * bz - az * by,
      aw * by - ax * bz + ay * bw + az * bx,
      aw * bz + ax * by - ay * bx + az * bw
    ];
  }
  function qAxis(ax, ay, az, ang) { var h = ang * 0.5, s = Math.sin(h); return [Math.cos(h), ax * s, ay * s, az * s]; } // axis must be unit
  function qToMat3(q) { // → column-major array for gl.uniformMatrix3fv(..., false, m)
    var w = q[0], x = q[1], y = q[2], z = q[3];
    var xx = x * x, yy = y * y, zz = z * z, xy = x * y, xz = x * z, yz = y * z, wx = w * x, wy = w * y, wz = w * z;
    return [
      1 - 2 * (yy + zz), 2 * (xy + wz), 2 * (xz - wy),   // column 0
      2 * (xy - wz), 1 - 2 * (xx + zz), 2 * (yz + wx),   // column 1
      2 * (xz + wy), 2 * (yz - wx), 1 - 2 * (xx + yy)    // column 2
    ];
  }
  // R = Rz(roll)·Rx(pitch)·Ry(yaw) — the screensaver's Rx(pitch)·Ry(yaw) tumble, plus a slow roll drift
  function tumbleQ(yaw, pitch, roll) { return qMul(qAxis(0, 0, 1, roll), qMul(qAxis(1, 0, 0, pitch), qAxis(0, 1, 0, yaw))); }

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  var vis = true, raf = 0, onScreen = true, tabVisible = !document.hidden;
  var maxRad = CFG.parallaxMaxDeg * DEG;
  var tgtYaw = 0, tgtPitch = 0, curYaw = 0, curPitch = 0;

  // motion state
  var t = 0;                               // real elapsed seconds (clamped dt accumulation)
  var lastTs = -1;
  var yaw = 0, pitch = 0.42;               // pitch seeded like the screensaver so the cavity reads immediately

  // pointer parallax — the tilt follows the cursor, capped at CFG.parallaxMaxDeg (skipped under reduced motion)
  if (!reduce) {
    window.addEventListener('pointermove', function (e) {
      var r = cvs.getBoundingClientRect();
      var nx = (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2);
      var ny = (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2);
      tgtYaw = clamp(nx, -1, 1) * maxRad;
      tgtPitch = clamp(ny, -1, 1) * maxRad;
    }, { passive: true });
  }

  // advance motion by a real-time step dt (seconds) → { R, bobX, bobY, scan, coreI }
  function step(dt) {
    t += dt;
    yaw += CFG.yawRate * CFG.spin * dt;
    pitch += CFG.pitchRate * CFG.spin * dt;
    var roll = Math.sin(t * CFG.rollRate) * CFG.rollAmp;

    // pointer parallax — frame-rate-independent easing, applied on top as a separate small rotation
    var f = 1 - Math.exp(-CFG.parallaxK * dt);
    curYaw += (tgtYaw - curYaw) * f;
    curPitch += (tgtPitch - curPitch) * f;

    var q = qMul(qMul(qAxis(1, 0, 0, curPitch), qAxis(0, 1, 0, curYaw)), tumbleQ(yaw, pitch, roll));

    var ph = t % CFG.scanPeriod;
    return {
      R: qToMat3(q),
      bobX: Math.sin(t * TAU / CFG.bobXPeriod) * CFG.bobXAmp,
      bobY: Math.sin(t * TAU / CFG.bobYPeriod) * CFG.bobYAmp,
      scan: ph < CFG.scanDuration ? ph / CFG.scanDuration : -1.0,
      coreI: CFG.coreIntensity * (0.85 + 0.15 * Math.sin(t * TAU / CFG.breathePeriod))
    };
  }

  function drawScene(s) {
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(U.u_res, cvs.width, cvs.height);
    gl.uniform2f(U.u_bob, s.bobX, s.bobY);
    gl.uniform1f(U.u_rin, 1.94 / 3.0); gl.uniform1f(U.u_rs, 0.95); gl.uniform1f(U.u_round, 0.021); gl.uniform1f(U.u_svis, 0.10); // LOCKED SDF params (circumradius 1.94, cavity 0.95, edge 0.021, ghost 0.10) — do not change
    gl.uniformMatrix3fv(U.u_rot, false, s.R);
    gl.uniform1f(U.u_scan, s.scan);
    gl.uniform1f(U.u_coreI, s.coreI);
    gl.uniform1f(U.u_coreFall, CFG.coreFalloff);
    var mob = forceMobile || window.innerWidth <= 768;                 // mobile ≤768px: lift the body on small, bright screens
    var ambEff = (P_amb != null ? P_amb : CFG.bodyAmbient) * (mob ? 2.0 : 1.0);
    var bounceEff = (P_bounce != null ? P_bounce : CFG.bounceWeight) * (mob ? 1.4 : 1.0);
    gl.uniform1f(U.u_amb, ambEff);
    gl.uniform1f(U.u_key, P_key != null ? P_key : CFG.keyWeight);
    gl.uniform1f(U.u_bounce, bounceEff);
    gl.uniform3fv(U.u_keyDir, keyDir);
    gl.uniform3fv(U.u_bounceDir, bounceDir);
    gl.uniform1f(U.u_albedo, CFG.albedoMult);
    gl.uniform1f(U.u_rim, CFG.rimIntensity);
    gl.uniform1f(U.u_glint, CFG.glintIntensity);
    gl.uniform1f(U.u_edgePx, CFG.edgePx);
    gl.uniform1f(U.u_edgeW, CFG.edgeWeight);
    gl.uniform1f(U.u_shell, CFG.shellExp);
    gl.uniform1f(U.u_ssaa, ssaaOn ? 1.0 : 0.0);
    gl.uniform3f(U.u_coreCol, CFG.coreColor[0], CFG.coreColor[1], CFG.coreColor[2]);
    gl.uniform3f(U.u_greenCol, CFG.greenColor[0], CFG.greenColor[1], CFG.greenColor[2]);
    gl.uniform3f(U.u_tint, 1.0, 1.0, 1.0); // solid white outer mark, held (v1.60)
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function frame(ts) {
    raf = requestAnimationFrame(frame);
    if (lastTs < 0) lastTs = ts;
    var dt = (ts - lastTs) / 1000;
    lastTs = ts;                           // kept fresh even while paused, so resume never jumps
    if (!vis) return;                      // paused: tab hidden or mark off-screen
    dt = clamp(dt, 0, CFG.dtMax);          // real dt, clamped — speed is independent of refresh rate
    drawScene(step(dt));
  }

  // assemble-on-load — scale/fade from the cavity outwards, under 1.2s (compositor-only transform+opacity for 60fps)
  function assemble() {
    if (reduce) { cvs.style.opacity = '1'; return; } // static under reduced motion
    cvs.style.transformOrigin = '50% 50%';
    cvs.style.transform = 'scale(0.72)';
    cvs.style.opacity = '0';
    cvs.style.willChange = 'transform,opacity';
    setTimeout(function () {   // let layout/font settle a beat so the mark doesn't jump as the wordmark reflows
      cvs.style.transition = 'transform ' + CFG.assembleDur + 's cubic-bezier(.16,1,.3,1), opacity ' + (CFG.assembleDur * 0.8) + 's ease-out';
      cvs.style.transform = 'scale(1)';
      cvs.style.opacity = '1';
      setTimeout(function () { cvs.style.willChange = 'auto'; }, CFG.assembleDur * 1000 + 80);
    }, 80);
  }

  if (reduce) {
    // one static, anti-aliased frame: a fixed 3/4 pose, no bob/scan, core lit at its mean intensity
    drawScene({ R: qToMat3(tumbleQ(0.5, 0.42, 0.0)), bobX: 0, bobY: 0, scan: -1.0, coreI: CFG.coreIntensity });
    cvs.style.opacity = '1';
  } else {
    lastTs = -1; raf = requestAnimationFrame(frame); assemble();
  }

  // pause rendering when the tab is hidden OR the mark scrolls off-screen
  function syncVis() { vis = onScreen && tabVisible; }
  document.addEventListener('visibilitychange', function () { tabVisible = !document.hidden; syncVis(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { onScreen = es[0].isIntersecting; syncVis(); }, { threshold: 0.01 }).observe(cvs);
  }
})();
