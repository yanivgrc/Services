/* GRC·LABS mark — the "containment breach": an epoxy tetrahedron with a hollow wax-sphere cavity,
   raymarched in a single fragment shader. Dependency-free WebGL; degrades to a static asset if WebGL is unavailable.
   © 2026 GRC·LABS — all rights reserved. www.grc-labs.com */
(function () {
  var cvs = document.getElementById('logo');
  if (!cvs) return;
  var gl = cvs.getContext('webgl', { antialias: false, alpha: true }) || cvs.getContext('experimental-webgl');
  if (!gl) { document.documentElement.classList.add('no-logo-gl'); return; } // CSS falls back to the wordmark

  var FRAG =
    '#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\n' +
    'uniform vec2 u_res; uniform float u_rin,u_rs,u_round,u_svis,u_yaw,u_pitch;' +
    'const vec3 GREEN=vec3(0.388,0.698,0.176);' +
    'const vec3 EPOXY=vec3(0.050,0.078,0.120);' +
    'const vec3 CAVITY=vec3(0.085,0.125,0.060);' +
    'const vec3 SPECC=vec3(0.74,0.92,0.60);' +
    'const vec3 N0=vec3( 0.57735, 0.57735, 0.57735);' +
    'const vec3 N1=vec3( 0.57735,-0.57735,-0.57735);' +
    'const vec3 N2=vec3(-0.57735, 0.57735,-0.57735);' +
    'const vec3 N3=vec3(-0.57735,-0.57735, 0.57735);' +
    'mat3 rotY(float a){float c=cos(a),s=sin(a);return mat3(c,0.,-s, 0.,1.,0., s,0.,c);}' +
    'mat3 rotX(float a){float c=cos(a),s=sin(a);return mat3(1.,0.,0., 0.,c,-s, 0.,s,c);}' +
    'float smax(float a,float b,float k){float h=clamp(0.5+0.5*(a-b)/k,0.0,1.0);return mix(b,a,h)+k*h*(1.0-h);}' +
    'float sdTet(vec3 p,float r,float k){float a=dot(p,N0),b=dot(p,N1),c=dot(p,N2),d=dot(p,N3);return smax(smax(a,b,k),smax(c,d,k),k)-r;}' +
    'float map(vec3 p){float t=sdTet(p,u_rin,u_round);float s=length(p)-u_rs;return max(t,-s);}' +
    'vec3 calcN(vec3 p){vec2 e=vec2(0.0009,0.0);return normalize(vec3(map(p+e.xyy)-map(p-e.xyy),map(p+e.yxy)-map(p-e.yxy),map(p+e.yyx)-map(p-e.yyx)));}' +
    'float edgeGlow(vec3 p){float a=dot(p,N0),b=dot(p,N1),c=dot(p,N2),d=dot(p,N3);float m=max(max(a,b),max(c,d));float w=0.05+u_round*0.6;float cnt=step(m-w,a)+step(m-w,b)+step(m-w,c)+step(m-w,d);return clamp(cnt-1.0,0.0,2.0);}' +
    'void main(){' +
    'vec2 uv=(gl_FragCoord.xy-0.5*u_res)/u_res.y;' +
    'mat3 R=rotX(u_pitch)*rotY(u_yaw);' +
    'vec3 ro=R*vec3(0.,0.,9.0);' +
    'vec3 rd=R*normalize(vec3(uv,-1.7));' +
    'float tt=0.0;bool hit=false;float d;' +
    'for(int i=0;i<110;i++){vec3 p=ro+rd*tt;d=map(p);if(d<0.001){hit=true;break;}tt+=d*0.85;if(tt>22.0)break;}' +
    'vec3 col=vec3(0.0);' +
    'if(hit){vec3 p=ro+rd*tt;vec3 n=calcN(p);vec3 vd=-rd;' +
    'vec3 lk=normalize(R*vec3(3.5,5.0,6.0)-p);vec3 lf=normalize(R*vec3(-4.0,-1.5,-3.0)-p);' +
    'float dk=max(dot(n,lk),0.0);float df=max(dot(n,lf),0.0);' +
    'vec3 hh=normalize(lk+vd);float spec=pow(max(dot(n,hh),0.0),46.0);float fres=pow(1.0-max(dot(n,vd),0.0),3.0);' +
    'bool inner=abs(length(p)-u_rs)<0.02;' +
    'if(inner){col=CAVITY*0.5+GREEN*(dk*0.45+df*0.18)+GREEN*fres*0.18+GREEN*0.05;}' +
    'else{col=EPOXY*0.55+GREEN*(dk*0.70+df*0.22)+SPECC*spec*0.55+GREEN*fres*0.38+GREEN*edgeGlow(p)*0.30;}}' +
    'if(u_svis>0.001){float b=dot(ro,rd);float c2=dot(ro,ro)-u_rs*u_rs;float disc=b*b-c2;' +
    'if(disc>0.0){float tn=-b-sqrt(disc);if(tn>0.0&&(!hit||tn<tt)){vec3 sp=ro+rd*tn;vec3 sn=normalize(sp);' +
    'float fr=pow(1.0-max(dot(sn,-rd),0.0),3.0);float a=clamp(u_svis*(0.12+0.88*fr),0.0,1.0);vec3 shell=GREEN*(0.35+0.75*fr);col=mix(col,shell,a);}}}' +
    'float al=max(max(col.r,col.g),col.b);al=clamp(al*3.0,0.0,1.0);' +    // premultiplied-ish alpha so the dark void reads as transparent on the panel
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

  var U = {}; ['u_res', 'u_rin', 'u_rs', 'u_round', 'u_svis', 'u_yaw', 'u_pitch'].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });
  var PR = Math.min(window.devicePixelRatio || 1, 2);
  function resize() { var r = cvs.getBoundingClientRect(); var w = Math.max(1, Math.round(r.width * PR)), h = Math.max(1, Math.round(r.height * PR)); if (w !== cvs.width || h !== cvs.height) { cvs.width = w; cvs.height = h; } gl.viewport(0, 0, cvs.width, cvs.height); }
  window.addEventListener('resize', resize); resize();

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var t = 0, vis = true, raf = 0;
  function render() {
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(U.u_res, cvs.width, cvs.height);
    gl.uniform1f(U.u_rin, 1.7 / 3.0); gl.uniform1f(U.u_rs, 0.95); gl.uniform1f(U.u_round, 0.06); gl.uniform1f(U.u_svis, 0.18);
    gl.uniform1f(U.u_yaw, t * 0.30); gl.uniform1f(U.u_pitch, Math.sin(t * 0.18) * 0.32);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function loop() { raf = requestAnimationFrame(loop); if (!vis) return; t += 0.016; render(); }
  if (reduce) { render(); }                       // a single still frame, honour reduced motion
  else { loop(); }
  // pause the loop when the logo scrolls out of view
  if ('IntersectionObserver' in window) { new IntersectionObserver(function (es) { vis = es[0].isIntersecting; }, { threshold: 0.01 }).observe(cvs); }
})();
