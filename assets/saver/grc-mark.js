/* GRC·LABS — the tetrahedron mark's shaders, for the screensaver's GRC slide. Copied from yanivgrc/grc-live-v2
   public/earth/moon.js (lines 16–98). The screensaver draws the mark with them; without this file it draws it in ASCII. */
(() => {
  const FRAG = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 u_res,u_bob; uniform float u_rin,u_rs,u_round,u_svis,u_scan,u_coreI,u_coreFall,u_rim,u_glint,u_edgePx,u_edgeW,u_shell,u_ssaa,u_amb,u_key,u_bounce,u_albedo,u_alpha,u_gr,u_behind,u_over; uniform vec2 u_gc; uniform vec3 u_tint,u_coreCol,u_greenCol,u_keyDir,u_bounceDir; uniform mat3 u_rot;
const vec3 BODY=vec3(0.847,0.871,0.902);
const vec3 KEYCOL=vec3(0.933,0.949,0.969);
const vec3 SPECC=vec3(0.90,0.95,0.85);
const vec3 GREEN_SCAN=vec3(0.388,0.698,0.176);
const vec3 N0=vec3( 0.57735, 0.57735, 0.57735);
const vec3 N1=vec3( 0.57735,-0.57735,-0.57735);
const vec3 N2=vec3(-0.57735, 0.57735,-0.57735);
const vec3 N3=vec3(-0.57735,-0.57735, 0.57735);
float smax(float a,float b,float k){float h=clamp(0.5+0.5*(a-b)/k,0.0,1.0);return mix(b,a,h)+k*h*(1.0-h);}
float sdTet(vec3 p,float r,float k){float a=dot(p,N0),b=dot(p,N1),c=dot(p,N2),d=dot(p,N3);return smax(smax(a,b,k),smax(c,d,k),k)-r;}
float map(vec3 p){float t=sdTet(p,u_rin,u_round);float s=length(p)-u_rs;return smax(t,-s,u_round);}
vec3 calcN(vec3 p,float e){vec2 k=vec2(1.0,-1.0);return normalize(k.xyy*map(p+k.xyy*e)+k.yyx*map(p+k.yyx*e)+k.yxy*map(p+k.yxy*e)+k.xxx*map(p+k.xxx*e));}
float edgeGlow(vec3 p,float w){float a=dot(p,N0),b=dot(p,N1),c=dot(p,N2),d=dot(p,N3);float m=max(max(a,b),max(c,d));float cnt=smoothstep(m-w,m,a)+smoothstep(m-w,m,b)+smoothstep(m-w,m,c)+smoothstep(m-w,m,d);return clamp(cnt-1.0,0.0,2.0);}
vec4 sampleScene(vec2 frag,out float edgeFlag){edgeFlag=0.0;
vec3 GREEN=u_tint;vec3 CORE=u_coreCol;vec3 GRN=u_greenCol;
vec3 Lg=normalize(vec3(3.0,-2.5,-4.0));
float aspect=u_res.x/u_res.y;
vec2 uv=(frag-0.5*u_res)/u_res.y;
uv-=vec2(u_bob.x*aspect,u_bob.y);
mat3 R=u_rot;
vec3 ro=R*vec3(0.,0.,9.0);
vec3 rd=R*normalize(vec3(uv,-1.7));
float pxAng=1.0/(u_res.y*1.7);
float tt=0.0;bool hit=false;float d;float mind=1e9;vec3 pm=ro;
for(int i=0;i<110;i++){vec3 p=ro+rd*tt;d=map(p);if(tt>0.001){float r=d/tt;if(r<mind){mind=r;pm=p;}}if(d<pxAng*tt*0.35){hit=true;break;}tt+=d*0.85;if(tt>22.0)break;}
if(hit){tt+=map(ro+rd*tt)*0.5;tt+=map(ro+rd*tt)*0.5;tt+=map(ro+rd*tt)*0.5;}
float cov=smoothstep(pxAng,0.0,mind);
vec3 col=vec3(0.0);
vec3 ps=hit?(ro+rd*tt):pm;
float dl=length(ps);
float w=max(0.008,pxAng*tt*u_edgePx);
float da=dot(ps,N0),db=dot(ps,N1),dc=dot(ps,N2),dd=dot(ps,N3);
float A=max(da,db),a2=min(da,db),B=max(dc,dd),b2=min(dc,dd);
float m=max(A,B);float second=max(min(A,B),max(a2,b2));
vec3 fn=N0;float mm=da;if(db>mm){mm=db;fn=N1;}if(dc>mm){mm=dc;fn=N2;}if(dd>mm){mm=dd;fn=N3;}
float tetv=sdTet(ps,u_rin,u_round);float negS=u_rs-dl;float diff=tetv-negS;
vec3 n;if(!hit){n=calcN(ps,pxAng*tt*0.5);}else if(diff>u_round){n=fn;}else if(diff<-u_round){n=-ps/dl;}else{n=calcN(ps,pxAng*tt*0.5);}
vec3 vd=-rd;
vec3 lk=u_keyDir;vec3 lb=u_bounceDir;
float dk=max(dot(n,lk),0.0);float dbn=max(dot(n,lb),0.0);
vec3 hh=normalize(lk+vd);float spec=pow(max(dot(n,hh),0.0),46.0);
float ndv=1.0-max(dot(n,vd),0.0);float fres5=ndv*ndv*ndv*ndv*ndv;
float innerMix=1.0-smoothstep(0.0,w,abs(dl-u_rs));
float grim=fres5*max(dot(n,Lg),0.0)*u_rim*(1.0-innerMix);
vec3 hg=normalize(Lg+vd);float glint=pow(max(dot(n,hg),0.0),60.0)*u_glint;
float rimPx=abs(dl-u_rs)/(pxAng*tt);
float rimLine=1.0-smoothstep(0.0,u_edgePx,rimPx);
vec3 body=BODY*u_albedo;
vec3 outerCol=body*(u_amb+KEYCOL*dk*u_key)+body*GRN*dbn*u_bounce+SPECC*spec*0.20+GREEN*edgeGlow(ps,w)*u_edgeW+GRN*(grim+glint);
if(hit){
float cDiff=max(dot(n,-ps/dl),0.0);
vec3 coreLit=CORE*u_coreI*cDiff/(dl*dl);
vec3 innerCol=CORE*0.08+coreLit+GREEN*fres5*0.10;
col=mix(outerCol,innerCol,innerMix);
col+=GREEN*rimLine*u_edgeW;
if(u_scan>=0.0){float scanY=mix(2.4,-2.4,u_scan);float sb=smoothstep(0.18,0.0,abs(ps.y-scanY));col+=GREEN_SCAN*sb*0.85;}
}else{col=outerCol*cov;}
if(u_svis>0.001){float b=dot(ro,rd);float c2=dot(ro,ro)-u_rs*u_rs;float disc=b*b-c2;
if(disc>0.0){float tn=-b-sqrt(disc);if(tn>0.0&&(!hit||tn<tt)){vec3 sp=ro+rd*tn;vec3 sn=normalize(sp);
float fr=pow(1.0-max(dot(sn,-rd),0.0),u_shell);float a=clamp(u_svis*(0.12+0.88*fr),0.0,1.0);vec3 shell=GREEN*(0.35+0.75*fr);col=mix(col,shell,a);}}}
if(hit){float ep=(m-second)/(pxAng*tt);if(rimPx<2.0||ep<2.0||abs(diff)<u_round)edgeFlag=1.0;}
if(cov>0.004&&cov<0.996)edgeFlag=1.0;
float al=max(max(col.r,col.g),col.b);al=clamp(al*3.0,0.0,1.0);
return vec4(col,al);}
void main(){float fl;vec4 c=sampleScene(gl_FragCoord.xy,fl);
if(u_ssaa>0.5&&fl>0.5){float d0;
vec4 s1=sampleScene(gl_FragCoord.xy+vec2( 0.125, 0.375),d0);
vec4 s2=sampleScene(gl_FragCoord.xy+vec2( 0.375,-0.125),d0);
vec4 s3=sampleScene(gl_FragCoord.xy+vec2(-0.125,-0.375),d0);
vec4 s4=sampleScene(gl_FragCoord.xy+vec2(-0.375, 0.125),d0);
vec3 pr=s1.rgb*s1.a+s2.rgb*s2.a+s3.rgb*s3.a+s4.rgb*s4.a;
float pa=s1.a+s2.a+s3.a+s4.a;
c=pa>0.0001?vec4(pr/pa,pa*0.25):vec4(0.0);}
float dg=length(gl_FragCoord.xy-u_gc);float inG=1.0-smoothstep(u_gr-1.0,u_gr+1.0,dg);
float k=mix(1.0,u_behind>0.5?0.0:u_over,inG);
gl_FragColor=vec4(c.rgb,c.a*u_alpha*k);}`;
  const VERT = "attribute vec2 p; void main(){ gl_Position=vec4(p,0.0,1.0); }";
  window.__grcMark = { FRAG, VERT };
})();
