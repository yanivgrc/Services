/* GRC·LABS mark — the "containment breach": an epoxy tetrahedron with a hollow wax-sphere cavity,
   raymarched in a single fragment shader. Dependency-free WebGL; degrades to a static asset if WebGL is unavailable.
   Motion: the mark floats in space — the same free upward tumble as the screensaver's BREACH scene, with a slow
   roll drift and a gentle bob. A cool-white light burns inside the cavity; a distant green source rims the edges (v1.68).
   © 2026 GRC·LABS — all rights reserved. www.grc-labs.com */
(function () {
  var cvs = document.getElementById('logo');
  if (!cvs) return;
  var gl = cvs.getContext('webgl', { antialias: false, alpha: true }) || cvs.getContext('experimental-webgl');
  if (!gl) { document.documentElement.classList.add('no-logo-gl'); return; } // CSS falls back to the wordmark

  var FRAG =
    '#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\n' +
    'uniform vec2 u_res,u_bob; uniform float u_rin,u_rs,u_round,u_svis,u_scan,u_coreI,u_coreFall,u_rim,u_glint,u_edgePx,u_edgeW,u_shell; uniform vec3 u_tint,u_coreCol,u_greenCol; uniform mat3 u_rot;' +

    'const vec3 EPOXY=vec3(0.050,0.078,0.120);' +
    'const vec3 SPECC=vec3(0.90,0.95,0.85);' +
    'const vec3 GREEN_SCAN=vec3(0.388,0.698,0.176);' +   // #63B22E phosphor — the periodic scan line (u_scan)
    'const vec3 N0=vec3( 0.57735, 0.57735, 0.57735);' +
    'const vec3 N1=vec3( 0.57735,-0.57735,-0.57735);' +
    'const vec3 N2=vec3(-0.57735, 0.57735,-0.57735);' +
    'const vec3 N3=vec3(-0.57735,-0.57735, 0.57735);' +
    'float smax(float a,float b,float k){float h=clamp(0.5+0.5*(a-b)/k,0.0,1.0);return mix(b,a,h)+k*h*(1.0-h);}' +
    'float sdTet(vec3 p,float r,float k){float a=dot(p,N0),b=dot(p,N1),c=dot(p,N2),d=dot(p,N3);return smax(smax(a,b,k),smax(c,d,k),k)-r;}' +
    'float map(vec3 p){float t=sdTet(p,u_rin,u_round);float s=length(p)-u_rs;return max(t,-s);}' +
    // normal epsilon passed in: scales with march distance so PR=2 / mediump doesn't produce noisy normals
    'vec3 calcN(vec3 p,float e){vec2 h=vec2(e,0.0);return normalize(vec3(map(p+h.xyy)-map(p-h.xyy),map(p+h.yxy)-map(p-h.yxy),map(p+h.yyx)-map(p-h.yyx)));}' +
    // edge glow: smoothstep (not step) so the rim does not flicker while the mark rotates
    'float edgeGlow(vec3 p,float w){float a=dot(p,N0),b=dot(p,N1),c=dot(p,N2),d=dot(p,N3);float m=max(max(a,b),max(c,d));float cnt=smoothstep(m-w,m,a)+smoothstep(m-w,m,b)+smoothstep(m-w,m,c)+smoothstep(m-w,m,d);return clamp(cnt-1.0,0.0,2.0);}' +
    'void main(){' +
    'vec3 GREEN=u_tint;' +   // outer mark colour from JS (solid white, held — v1.60); declared in main() for GLSL ES 1.0 safety
    'vec3 CORE=u_coreCol;vec3 GRN=u_greenCol;' + // CORE = cool-white light inside the cavity; GRN = distant green source in space
    'vec3 Lg=normalize(vec3(3.0,-2.5,-4.0));' + // external green light: page-anchored (not body), behind + below-right
    'float aspect=u_res.x/u_res.y;' +
    'vec2 uv=(gl_FragCoord.xy-0.5*u_res)/u_res.y;' +
    'uv-=vec2(u_bob.x*aspect,u_bob.y);' +               // float/bob — the whole mark drifts, done in-shader
    'mat3 R=u_rot;' +                                   // single rotation uniform, built in JS from a quaternion
    'vec3 ro=R*vec3(0.,0.,9.0);' +                      // camera kept as-is (distance 9, focal 1.7)
    'vec3 rd=R*normalize(vec3(uv,-1.7));' +
    // raymarch; track the closest angular approach (min d/tt) for 1px silhouette anti-aliasing
    'float tt=0.0;bool hit=false;float d;float mind=1e9;vec3 pm=ro;' +
    'for(int i=0;i<110;i++){vec3 p=ro+rd*tt;d=map(p);if(tt>0.001){float r=d/tt;if(r<mind){mind=r;pm=p;}}if(d<0.001){hit=true;break;}tt+=d*0.85;if(tt>22.0)break;}' +
    'float pxAng=1.0/(u_res.y*1.7);' +                  // angular size of one pixel
    'float cov=smoothstep(pxAng,0.0,mind);' +           // ~1 on the mark, feathering to 0 across one pixel at the edge
    'vec3 col=vec3(0.0);' +
    'vec3 ps=hit?(ro+rd*tt):pm;' +                      // shade the hit point, or the closest-approach point for near misses
    'float ndeps=clamp(tt*0.0007,0.0009,0.0025);' +     // distance-scaled normal epsilon
    'if(hit||cov>0.001){' +
    'vec3 n=calcN(ps,ndeps);vec3 vd=-rd;' +
    'vec3 lk=normalize(vec3(-4.5,5.5,4.0));vec3 lf=normalize(R*vec3(2.0,-1.5,-3.0)-ps);' +   // page-anchored key light from upper-LEFT (as-is); fill still follows the body
    'float dk=max(dot(n,lk),0.0);float df=max(dot(n,lf),0.0);' +
    'vec3 hh=normalize(lk+vd);float spec=pow(max(dot(n,hh),0.0),46.0);' +
    'float ndv=1.0-max(dot(n,vd),0.0);float fres=ndv*ndv*ndv;float fres5=fres*ndv*ndv;' +   // fres = exp 3 (outer white rim); fres5 = exp 5 (cavity + green rim) for finer lines
    'float dl=length(ps);' +
    'float w=max(0.008,pxAng*tt*u_edgePx);' +   // screen-space edge/rim band — stays ~u_edgePx px wide at any canvas size / PR
    'float innerMix=1.0-smoothstep(0.0,w,abs(dl-u_rs));' +   // narrow (~1px) cavity-rim blend; also masks the green rim off the circles
    'float grim=fres5*max(dot(n,Lg),0.0)*u_rim*(1.0-innerMix);' +   // green rim, clamped off the cavity rim so it does not thicken the circles
    'vec3 hg=normalize(Lg+vd);float glint=pow(max(dot(n,hg),0.0),60.0)*u_glint;' +   // tight green specular that flashes across a face as it turns past the light
    'vec3 outerCol=EPOXY*0.20+GREEN*(0.46+dk*0.94+df*0.30)+SPECC*spec*0.42+GREEN*fres*0.46+GREEN*edgeGlow(ps,w)*u_edgeW+GRN*(grim+glint);' +
    'if(hit){' +
    'float cDiff=max(dot(n,-ps/dl),0.0);' +                     // cavity wall faces the central light
    'vec3 coreLit=CORE*u_coreI*cDiff/(dl*dl);' +                // point light at the origin, inverse-square falloff
    'vec3 innerCol=CORE*0.05+GREEN*(dk*0.45+df*0.18)+GREEN*fres5*0.18+GREEN*0.05+coreLit;' +   // cavity fresnel exp 5 → tighter rim
    'col=mix(outerCol,innerCol,innerMix);' +
    'if(u_scan>=0.0){float scanY=mix(2.4,-2.4,u_scan);float sb=smoothstep(0.18,0.0,abs(ps.y-scanY));col+=GREEN_SCAN*sb*0.85;}' +   // additive phosphor band sweeping down the surface
    '}else{col=outerCol*cov;}' +                        // near-miss rim, faded by coverage → anti-aliased silhouette
    '}' +
    // volumetric core glow: brightest where the ray passes closest to the origin inside the cavity sphere,
    // visible only through the openings and occluded by the solid body (gated on the raymarch hit depth)
    'if(u_coreI>0.0){float bb=dot(ro,rd);float cc=dot(ro,ro)-u_rs*u_rs;float disc2=bb*bb-cc;' +
    'if(disc2>0.0){float sq=sqrt(disc2);float ta=-bb-sq;float tb=-bb+sq;float tc=-bb;float tenter=max(ta,0.0);' +
    'if((!hit||tenter<tt)&&tc>0.0){float tcap=hit?min(tb,tt):tb;float tcl=clamp(tc,tenter,tcap);' +
    'vec3 cp=ro+rd*tcl;float dist=length(cp);col+=CORE*u_coreI*exp(-u_coreFall*dist*dist);}}}' +
    // faint ghost shell at the cavity radius (kept, u_svis)
    'if(u_svis>0.001){float b=dot(ro,rd);float c2=dot(ro,ro)-u_rs*u_rs;float disc=b*b-c2;' +
    'if(disc>0.0){float tn=-b-sqrt(disc);if(tn>0.0&&(!hit||tn<tt)){vec3 sp=ro+rd*tn;vec3 sn=normalize(sp);' +
    'float fr=pow(1.0-max(dot(sn,-rd),0.0),u_shell);float a=clamp(u_svis*(0.12+0.88*fr),0.0,1.0);vec3 shell=GREEN*(0.35+0.75*fr);col=mix(col,shell,a);}}}' +
    'float al=max(max(col.r,col.g),col.b);al=clamp(al*3.0,0.0,1.0);' +    // premultiplied-ish alpha so the dark void (and the glow) reads on the panel
    'gl_FragColor=vec4(col,al);}';

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

  var U = {}; ['u_res', 'u_bob', 'u_rin', 'u_rs', 'u_round', 'u_svis', 'u_scan', 'u_coreI', 'u_coreFall', 'u_rim', 'u_glint', 'u_edgePx', 'u_edgeW', 'u_shell', 'u_tint', 'u_coreCol', 'u_greenCol', 'u_rot'].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });
  var PR = Math.min(window.devicePixelRatio || 1, 2);
  function resize() { var r = cvs.getBoundingClientRect(); var w = Math.max(1, Math.round(r.width * PR)), h = Math.max(1, Math.round(r.height * PR)); if (w !== cvs.width || h !== cvs.height) { cvs.width = w; cvs.height = h; } gl.viewport(0, 0, cvs.width, cvs.height); }
  window.addEventListener('resize', resize); resize();
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

    // the light inside the cavity — neutral cool white, no green
    coreColor: [0.863, 0.902, 0.941],  // cool white #DCE6F0
    coreIntensity: 0.45,        // base brightness of the core light + glow
    coreFalloff: 3.0,           // k in exp(-k·dist²) for the volumetric glow
    breathePeriod: 5.0,         // s — the core breathes 0.85…1.15 of coreIntensity (no flicker)

    // distant green source in space — reflects off the mark as a rim + passing glints, never a fill
    greenColor: [0.388, 0.698, 0.176], // phosphor green #63B22E
    rimIntensity: 0.35,         // fresnel-weighted (exp 5) green rim on silhouette-facing surfaces
    glintIntensity: 0.25,       // tight green specular (exp ~60) that flashes across flat faces as they turn past the light

    // fine outlines — screen-space line widths so edges/rims stay ~1px at any canvas size and PR
    edgePx: 1.2,                // triangle-edge glow band width in pixels (also the cavity-rim blend width)
    edgeWeight: 0.22,           // triangle-edge glow weight (was 0.40)
    shellExp: 6.0,              // ghost-sphere fresnel exponent → a thin halo line (u_svis stays 0.10)

    assembleDur: 1.1            // assemble-on-load duration (s) — kept under 1.2s
  };

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
    gl.uniform1f(U.u_rim, CFG.rimIntensity);
    gl.uniform1f(U.u_glint, CFG.glintIntensity);
    gl.uniform1f(U.u_edgePx, CFG.edgePx);
    gl.uniform1f(U.u_edgeW, CFG.edgeWeight);
    gl.uniform1f(U.u_shell, CFG.shellExp);
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
