/* GRC·LABS — the screensaver of earth.grc-labs.com, copied unchanged from yanivgrc/grc-live-v2 public/earth/saver.js at live-v1.42.7.
   Do not edit here: change it there, then copy it again (see SCREENSAVER-QA.md). */
// live-v1.23.8 — Earth's screensaver (Yaniv, 20.10 12:33): «not the security topics, the shapes and ideas we have,
// and add others». The shapes of live's idle screen (src/App.jsx, POINT_SHAPES + the torus), ported, in Earth's
// colours, and new ones from the worlds the map is made of. live-v1.23.9 (13:06): more fractals, and the matrix.
// live-v1.23.15 — v2 (Yaniv, 14:10): no captions; every shape coalesces out of the matrix rain and dissolves back
// into it; a much denser character field (a ~70-step ramp on a fine grid, smoothed, so the shapes read with depth);
// «our tetrahedron» — the GRC·LABS mark, ray-marched as ASCII from the same SDF as the logo and the moon; the
// fractal tree removed.
//
// It starts after 45 seconds with no input (live-v1.39.15; was live's 60), never under reduced motion, never while the text
// map is open or the tab is hidden. Any key, pointer, touch or wheel wakes it; the press that wakes it does
// nothing else. The canvas is decoration (aria-hidden).
(() => {
  "use strict";
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  // live-v1.23.24 (Yaniv, 16:50): the matrix flows longer — the shape is a refresh, a moment to make one curious
  // live-v1.23.30 (Yaniv, 17:20: «the shapes complete themselves too fast, and their exit has nothing to do with the
  // matrix»): the shape assembles over ~5 s, and leaves by turning into drops of the same rain
  // live-v1.23.39 (Yaniv, 19:53: «the exit where the whole figure breaks apart downwards really bothers me; the
  // vanishing should be quiet, elegant and mysterious — the reverse of the entry. Give the matrix more time; only now and
  // then a figure comes in and goes out; never a crash or a break»): the rain flows ~20 s between figures, slower; a
  // figure is drawn in and withdrawn by the same algorithm, symmetric, over ~6.5 s each way
  // live-v1.23.43 (Yaniv, 21.10 09:36): the entry and the exit are no longer timers. The same streams of the rain that
  // bring a figure in take it away: a column of the figure is laid down as that column's stream falls through it, and
  // withdrawn — downwards — as the next stream falls through it. So both run at the matrix's own speed, and they end
  // when the streams have passed (IN_MAX / OUT_MAX only guard a column that never comes).
  // live-v1.23.45 (Yaniv, 21.10 11:01: «slow the matrix down, and in general; the shapes should form a little slower —
  // sometimes a shape really gets stuck until the matrix comes back»): the rain at 0.42 (was 0.6); a figure keeps
  // developing until its exit begins — growth over GROW_MS, drawing over DRAW_MS — and leaves soon after it is complete,
  // so no figure stands still waiting; HOLD_MS is now only for the figures that move by themselves (the tetrahedron, the
  // torus, the fractal fields).
  const IDLE_MS = 45000,   // live-v1.39.15 (Yaniv 12.11 12:18): 45 s, was 60 s (live's interval)
        HOLD_MS = 4500, IN_MAX = 20000, OUT_MAX = 20000, GROW_MS = 16000, DRAW_MS = 14000, RAIN_MS = 20000;
  const cv = document.getElementById("saver"); if (!cv) return;
  const NO_WORDS = cv.dataset.words === "off";   // live-v1.42.7: a page that wants the GRC slide without its Hebrew words (grc-labs.com)
  const ctx = cv.getContext("2d");
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const COL = { bg: css("--space") || "#04060b", hi: css("--city") || "#ffcf7a", mid: css("--coast") || "#7fb4c9", lo: "#4f6c8a" };
  // live-v1.23.43 — the rain's green is grc-labs.com's (a soft head, never a glaring one); the figures keep ארצ's gold
  // and blue, and every cell of a figure is born in the rain's green and cools into its own colour
  const RAIN_BG = "#080B14", RG_HEAD = [198, 255, 168], RG_TRAIL = [78, 148, 40];   // live-v1.23.46: the head stands out (the site's was 116,194,66)
  const RG = { head: `rgb(${RG_HEAD})`, trail: `rgb(${RG_TRAIL})` };
  const TAIL = [0.25, 0.5, 0.75].map((k) => `rgb(${RG_HEAD.map((x, i) => Math.round(x + (RG_TRAIL[i] - x) * k))})`);
  const xs = (seed) => { let s = (seed >>> 0) || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s; }; };

  // each plot(add, prog): add(nx, ny) in [-1, 1]; prog 0→1 over the scene. `name` is for the reader of this file
  // only — nothing is drawn from it (v2: no captions).
  const SHAPES = [
    { name: "ספירלת הזהב · φ", plot: (add, prog) => { const N = 1100, n = Math.floor(prog * N), b = 0.196, maxTh = 6.2 * Math.PI, mr = Math.exp(b * maxTh); for (let s = 0; s < n; s++) { const th = (s / N) * maxTh, r = Math.exp(b * th) / mr; add(r * Math.cos(th), r * Math.sin(th)); } } },
    // A sunflower's arms (its 21 and 34 spirals) come from the seeds' positions alone. At ASCII resolution 1500 even
    // seeds read as a flat disc (measured), so: fewer seeds, each one a distinct dot of five points.
    { name: "חמנייה · זווית הזהב", plot: (add, prog) => { const T = 320, N = Math.floor(prog * T), ga = Math.PI * (3 - Math.sqrt(5)), d = 0.011; for (let i = 1; i < N; i++) { const r = 0.98 * Math.sqrt(i / T), th = i * ga, x = r * Math.cos(th), y = r * Math.sin(th); add(x, y); add(x + d, y); add(x - d, y); add(x, y + d); add(x, y - d); } } },
    { name: "התאבכות של שני מקורות", plot: (add, prog) => { const R = 0.2 + prog * 1.2, k = 26; for (let gx = -1; gx <= 1; gx += 0.018) for (let gy = -1; gy <= 1; gy += 0.03) { const d1 = Math.hypot(gx + 0.28, gy), d2 = Math.hypot(gx - 0.28, gy); if (Math.max(d1, d2) > R) continue; const v = Math.cos(k * (d1 - d2)); if (v > 0.86) add(gx, gy); } } },
    { name: "סליל כפול · DNA", plot: (add, prog) => { const N = Math.floor(prog * 520); for (let i = 0; i < N; i++) { const ny = -1.04 + (i / 520) * 2.08, x1 = 0.74 * Math.sin(ny * Math.PI * 2.4), x2 = 0.74 * Math.sin(ny * Math.PI * 2.4 + Math.PI); add(x1, ny); add(x2, ny); if (i % 11 === 0) for (let k = 1; k < 6; k++) add(x1 + (x2 - x1) * k / 6, ny); } } },
    { name: "מסלולי כוכבי הלכת", plot: (add, prog) => { const orbits = [0.16, 0.27, 0.39, 0.53, 0.7, 0.9]; add(0, 0); add(0.01, 0); add(0, 0.01); orbits.forEach((a, j) => { const e = 0.08 + 0.03 * j, b = a * Math.sqrt(1 - e * e), c = a * e, N = Math.floor(prog * (140 + j * 60)); for (let i = 0; i < N; i++) { const u = (i / (140 + j * 60)) * Math.PI * 2; add(a * Math.cos(u) - c, b * Math.sin(u)); } const p = prog * Math.PI * 2 * (1.6 - j * 0.2); for (let q = 0; q < 5; q++) add(a * Math.cos(p) - c + (q % 2) * 0.012, b * Math.sin(p) + (q > 2 ? 0.012 : 0)); }); } },
    { name: "ליסז'ו · 5:4", plot: (add, prog) => { const N = Math.floor(prog * 1400), d = Math.PI / 4; for (let i = 0; i < N; i++) { const u = (i / 1400) * Math.PI * 2; add(0.98 * Math.sin(5 * u + d), 0.98 * Math.sin(4 * u)); } } },
    { name: "שושנה · r = cos(5θ/4)", plot: (add, prog) => { const N = Math.floor(prog * 2600); for (let i = 0; i < N; i++) { const th = (i / 2600) * Math.PI * 8, r = 0.96 * Math.cos(1.25 * th); add(r * Math.cos(th), r * Math.sin(th)); } } },
    { name: "משולש סרפינסקי", plot: (add, prog) => { const V = [[0, 0.96], [-0.92, -0.86], [0.92, -0.86]], N = Math.floor(prog * 5200), r = xs(1337); let x = 0, y = 0; for (let i = 0; i < N; i++) { const v = V[r() % 3]; x = (x + v[0]) / 2; y = (y + v[1]) / 2; if (i > 10) add(x, y); } } },
    // live-v1.23.9 — fractals, the family of the triangle. Measured on screen: the fern at 9000 points
    // merged into one leaf (now 3200), the Pythagoras tree at depth 9 filled its canopy solid (now 6).
    { name: "שרך בארנסלי", still: true, plot: (add, prog) => { const N = Math.floor(prog * 3200), r = xs(7); let x = 0, y = 0; for (let i = 0; i < N; i++) { const q = r() % 100; let nx, ny; if (q < 1) { nx = 0; ny = 0.16 * y; } else if (q < 86) { nx = 0.85 * x + 0.04 * y; ny = -0.04 * x + 0.85 * y + 1.6; } else if (q < 93) { nx = 0.2 * x - 0.26 * y; ny = 0.23 * x + 0.22 * y + 1.6; } else { nx = -0.15 * x + 0.28 * y; ny = 0.26 * x + 0.24 * y + 0.44; } x = nx; y = ny; if (i > 20) add(x / 2.9, y / 5.1 - 0.98); } } },
    { name: "פתית השלג של קוך", plot: (add, prog) => { const depth = Math.min(5, 1 + Math.floor(prog * 5)); let P = [0, 1, 2].map((k) => [0.9 * Math.cos(Math.PI / 2 + k * 2 * Math.PI / 3), 0.9 * Math.sin(Math.PI / 2 + k * 2 * Math.PI / 3)]); P.push(P[0]); for (let d = 0; d < depth; d++) { const Q = []; for (let i = 0; i < P.length - 1; i++) { const [ax, ay] = P[i], [bx, by] = P[i + 1], dx = (bx - ax) / 3, dy = (by - ay) / 3, px = ax + dx, py = ay + dy, qx = ax + 2 * dx, qy = ay + 2 * dy; Q.push([ax, ay], [px, py], [px + dx * 0.5 + dy * 0.866, py + dy * 0.5 - dx * 0.866], [qx, qy]); } Q.push(P[P.length - 1]); P = Q; } for (let i = 0; i < P.length - 1; i++) { const n = Math.max(1, Math.round(Math.hypot(P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1]) * 120)); for (let k = 0; k < n; k++) add(P[i][0] + (P[i + 1][0] - P[i][0]) * k / n, P[i][1] + (P[i + 1][1] - P[i][1]) * k / n); } } },
    { name: "עקומת הדרקון", plot: (add, prog) => { const N = Math.floor(prog * 9000), r = xs(3); let x = 0, y = 0; for (let i = 0; i < N; i++) { if (r() & 1) { const nx = 0.5 * x - 0.5 * y, ny = 0.5 * x + 0.5 * y; x = nx; y = ny; } else { const nx = 1 - 0.5 * x - 0.5 * y, ny = 0.5 * x - 0.5 * y; x = nx; y = ny; } if (i > 20) add((x - 0.42) * 1.3, (y - 0.15) * 1.3); } } },
    { name: "עץ פיתגורס", still: true, plot: (add, prog) => { const depth = 1 + Math.floor(prog * 6); const line = (a, b) => { const n = Math.max(2, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) * 70)); for (let k = 0; k <= n; k++) add(a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n); }; const sq = (p0, p1, d) => { if (d > depth) return; const dx = p1[0] - p0[0], dy = p1[1] - p0[1], p3 = [p0[0] - dy, p0[1] + dx], p2 = [p1[0] - dy, p1[1] + dx]; line(p0, p1); line(p1, p2); line(p2, p3); line(p3, p0); const ap = [p3[0] + 0.5 * dx - 0.5 * dy, p3[1] + 0.5 * dy + 0.5 * dx]; sq(p3, ap, d + 1); sq(ap, p2, d + 1); }; sq([-0.16, -0.98], [0.16, -0.98], 1); } },
    { name: "המושך של לורנץ", plot: (add, prog) => { const N = Math.floor(prog * 3200), h = 0.009; let x = 0.1, y = 0, z = 0; for (let i = 0; i < N; i++) { const dx = 10 * (y - x), dy = x * (28 - z) - y, dz = x * y - (8 / 3) * z; x += dx * h; y += dy * h; z += dz * h; if (i > 50) add(x / 26, (z - 25) / 28); } } },
    // live-v1.23.24 — more shapes (Yaniv 14:10, 16:50). Strange attractors drawn as dense clouds: the ramp's depth
    // shows where the orbit returns most.
    // live-v1.39.1 (Yaniv 11.11 11:00: one chaos scene «slows the whole system») — Clifford and de Jong are gone: each
    // computed 60,000 points on every frame; no other figure passes 9,000 (Rössler, which stays).
    { name: "מושך רסלר", plot: (add, prog) => { const N = Math.floor((0.3 + 0.7 * prog) * 9000), h = 0.025; let x = 1, y = 1, z = 0; for (let i = 0; i < N; i++) { const dx = -y - z, dy = x + 0.2 * y, dz = 0.2 + z * (x - 5.7); x += dx * h; y += dy * h; z += dz * h; if (i > 300) add(x / 12, (y + z * 0.35) / 12.5); } } },
    // 3D figures turned in depth (`t`), not in the plane
    { name: "קשר טורוס 3:7", still: true, plot: (add, prog, t) => { const N = 2600, a = t * 0.00035, ca = Math.cos(a), sa = Math.sin(a), tl = 0.5, ct = Math.cos(tl), st = Math.sin(tl); for (let i = 0; i < N; i++) { const u = i / N * Math.PI * 2, r = 0.62 + 0.3 * Math.cos(7 * u), x = r * Math.cos(3 * u), y = r * Math.sin(3 * u), z = 0.3 * Math.sin(7 * u); const x1 = x * ca + z * sa, z1 = -x * sa + z * ca, y1 = y * ct - z1 * st; add(x1, y1); } } },
    { name: "עקומת הילברט", still: true, plot: (add, prog) => { const ord = Math.min(5, 2 + Math.floor(prog * 4)), n = 1 << ord, pts = []; for (let d = 0; d < n * n; d++) { let x = 0, y = 0, t = d; for (let s2 = 1; s2 < n; s2 *= 2) { const rx = 1 & (t / 2), ry = 1 & (t ^ rx); if (ry === 0) { if (rx === 1) { x = s2 - 1 - x; y = s2 - 1 - y; } const tmp = x; x = y; y = tmp; } x += s2 * rx; y += s2 * ry; t = Math.floor(t / 4); } pts.push([x / (n - 1) * 1.8 - 0.9, y / (n - 1) * 1.8 - 0.9]); } for (let i = 1; i < pts.length; i++) { const [ax, ay] = pts[i - 1], [bx, by] = pts[i]; for (let k = 0; k < 4; k++) add(ax + (bx - ax) * k / 4, ay + (by - ay) * k / 4); } } },
    { name: "פרח החיים", plot: (add, prog) => { const R = 0.3, C = [[0, 0]]; for (let k = 0; k < 6; k++) C.push([R * Math.cos(k * Math.PI / 3), R * Math.sin(k * Math.PI / 3)]); for (let k = 0; k < 6; k++) { C.push([2 * R * Math.cos(k * Math.PI / 3), 2 * R * Math.sin(k * Math.PI / 3)]); C.push([Math.sqrt(3) * R * Math.cos(k * Math.PI / 3 + Math.PI / 6), Math.sqrt(3) * R * Math.sin(k * Math.PI / 3 + Math.PI / 6)]); } const m = Math.max(1, Math.round(prog * C.length)); for (let j = 0; j < m; j++) { const [cx, cy] = C[j]; for (let i = 0; i < 260; i++) { const u = i / 260 * Math.PI * 2; add(cx + R * Math.cos(u), cy + R * Math.sin(u)); } } for (let i = 0; i < 520; i++) { const u = i / 520 * Math.PI * 2; add(0.9 * Math.cos(u), 0.9 * Math.sin(u)); } } },
  ];
  // live-v1.23.43 — figures that grow out of a rule (Yaniv 21.10: «I like shapes that develop out of the logic much more
  // than revealing the shape as a shape»), each from a world of the lomdot. `grow`: prog runs 0→1 over GROW_MS and the
  // figure is computed again from its rule at every step — nothing is drawn that the rule has not produced yet. Each
  // new cell is born in the rain's green and cools into the figure's colour.
  const LOGIC = (() => {
    const seg = (add, ax, ay, bx, by, per) => { const n = Math.max(2, Math.round(Math.hypot(bx - ax, by - ay) * per)); for (let k = 0; k <= n; k++) add(ax + (bx - ax) * k / n, ay + (by - ay) * k / n); };
    // Game of Life — the acorn, seven cells, on a torus; generations follow prog, computed forward from a cache
    const life = { W: 96, H: 64,   // measured: at 132 the acorn's growth stayed a small cluster
      gen: -1, a: null, b: null };
    // the bolt, grown once (~1000 cells, measured): biased diffusion-limited growth on a 121 × 95 lattice from the toroid's underside
    const BOLT = { W: 121, H: 95, top: 12, ord: null, par: null, hit: -1 };
    const bolt = () => { if (BOLT.ord) return BOLT; const { W, H, top } = BOLT, g = new Int32Array(W * H).fill(-1), ord = [], par = [], r = xs(1856), rnd = () => r() / 4294967296;
      const put = (i, p) => { g[i] = ord.length; ord.push(i); par.push(p); };
      for (let x = (W >> 1) - 7; x <= (W >> 1) + 7; x++) put(top * W + x, -1);
      let hit = -1;
      for (let n = 0; n < 20000 && hit < 0; n++) { let x = (W >> 1) + Math.round((rnd() + rnd() + rnd() - 1.5) * W * 0.42), y = H - 1;
        for (let s = 0; s < 6000; s++) { let nb = -1; const i = y * W + x; if (y > 0 && g[i - W] >= 0) nb = g[i - W]; else if (x > 0 && g[i - 1] >= 0) nb = g[i - 1]; else if (x < W - 1 && g[i + 1] >= 0) nb = g[i + 1]; else if (y < H - 1 && g[i + W] >= 0) nb = g[i + W];
          if (nb >= 0) { put(i, nb); if (y >= H - 3) hit = ord.length - 1; break; }
          const u = rnd(); if (u < 0.3) y--; else if (u < 0.5) y++; else if (u < 0.75) x--; else x++; if (y <= top || x < 0 || x >= W || y >= H) break; } }   // a walker that leaves the field is lost
      BOLT.ord = ord; BOLT.par = par; BOLT.hit = hit < 0 ? ord.length - 1 : hit; return BOLT; };
    // Chladni's plate: 2600 grains; f = cos(nπx')cos(mπy') − cos(mπx')cos(nπy'), three tones in turn
    const CHL = { n: -1, x: new Float32Array(2600), y: new Float32Array(2600) }, CHM = [[2, 3], [3, 5], [4, 7]];
    const chlReset = () => { const r = xs(1787), rnd = () => r() / 4294967296 * 2 - 1; for (let i = 0; i < CHL.x.length; i++) { CHL.x[i] = rnd(); CHL.y[i] = rnd(); } CHL.n = 0; };
    const chlStep = () => { const [n, m] = CHM[Math.min(2, Math.floor(CHL.n / 80))], f = (x, y) => { const a = (x + 1) * Math.PI / 2, b = (y + 1) * Math.PI / 2; return Math.cos(n * a) * Math.cos(m * b) - Math.cos(m * a) * Math.cos(n * b); };
      for (let i = 0; i < CHL.x.length; i++) { const x = CHL.x[i], y = CHL.y[i], v = Math.abs(f(x, y)), j = 0.05 * v; CHL.x[i] = clamp(x + j * (Math.random() * 2 - 1), -1, 1); CHL.y[i] = clamp(y + j * (Math.random() * 2 - 1), -1, 1); } CHL.n++; };
    // ENGINES (Yaniv 20.11 12:59: «יש לנו כמה לומדות חדשות על מנועים — שקפים שמדמים את הפעולה של המנועים») — drawn in
    // section and running on the clock, not on the growth, so they keep turning for as long as they are on screen.
    // live-v1.42.5. Helpers: a segment, a ring, a box, and a fixed scatter for the gas (the same particles every frame).
    const eseg = (add, x1, y1, x2, y2, d = 0.004) => { const n = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / d)); for (let i = 0; i <= n; i++) add(x1 + (x2 - x1) * i / n, y1 + (y2 - y1) * i / n); };
    const ering = (add, x, y, r, d = 0.004) => { const n = Math.max(8, Math.ceil(6.2832 * r / d)); for (let i = 0; i < n; i++) add(x + r * Math.cos(6.2832 * i / n), y + r * Math.sin(6.2832 * i / n)); };
    const hsh2 = (i, k) => { const h = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return h - Math.floor(h); }, eering = (add, x, y, r) => ering(add, x, y, r);
    const ebox = (add, x1, y1, x2, y2) => { eseg(add, x1, y1, x2, y1); eseg(add, x2, y1, x2, y2); eseg(add, x2, y2, x1, y2); eseg(add, x1, y2, x1, y1); };
    const ehsh = (i, k) => { const h = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return h - Math.floor(h); };
    // one cylinder of a four-stroke engine in section, its crank turned to θ and its cycle at φ (0..4π: intake,
    // compression, power, exhaust). cx: where it stands; sc: its size. Returns nothing; draws the gas by the stroke.
    const cylinder = (add, cx, sc, th, ph, t, detail) => {
      const X = (x) => cx + x * sc, Y = (y) => (y - 0.19) * sc, w = 0.27, head = 0.78, yc = -0.38, r = 0.2, L = 0.62;
      const pin = yc + r * Math.cos(th) + Math.sqrt(L * L - Math.pow(r * Math.sin(th), 2)), top = pin + 0.12, cpx = r * Math.sin(th), cpy = yc + r * Math.cos(th);
      eseg(add, X(-w - 0.03), Y(0), X(-w - 0.03), Y(head)); eseg(add, X(w + 0.03), Y(0), X(w + 0.03), Y(head));   // the walls
      eseg(add, X(-w - 0.03), Y(head), X(-0.17), Y(head)); eseg(add, X(-0.07), Y(head), X(0.07), Y(head)); eseg(add, X(0.17), Y(head), X(w + 0.03), Y(head));   // the head, two ports
      const st = Math.floor(ph / Math.PI), sp = ph / Math.PI - st, lift = Math.sin(sp * Math.PI) * 0.07;   // the stroke and how far through it
      const li = st === 0 ? lift : 0, le = st === 3 ? lift : 0;
      eseg(add, X(-0.12), Y(head - li), X(-0.12), Y(head + 0.2)); eseg(add, X(-0.18), Y(head - li), X(-0.06), Y(head - li));   // intake valve
      eseg(add, X(0.12), Y(head - le), X(0.12), Y(head + 0.2)); eseg(add, X(0.06), Y(head - le), X(0.18), Y(head - le));       // exhaust valve
      if (detail) { eseg(add, X(-0.17), Y(head), X(-0.4), Y(head + 0.22)); eseg(add, X(-0.07), Y(head + 0.04), X(-0.3), Y(head + 0.26)); eseg(add, X(0.17), Y(head), X(0.4), Y(head + 0.22)); eseg(add, X(0.07), Y(head + 0.04), X(0.3), Y(head + 0.26)); }   // the manifolds
      eseg(add, X(0), Y(head), X(0), Y(head + 0.09));   // the spark plug
      ebox(add, X(-w), Y(top - 0.2), X(w), Y(top)); eseg(add, X(-w), Y(top - 0.05), X(w), Y(top - 0.05));   // the piston and its ring
      eseg(add, X(0), Y(pin), X(cpx), Y(cpy)); ering(add, X(0), Y(pin), 0.025 * sc); ering(add, X(cpx), Y(cpy), 0.03 * sc);   // the rod
      ering(add, X(0), Y(yc), 0.05 * sc); eseg(add, X(0), Y(yc), X(cpx), Y(cpy));   // the crank
      for (let a = 0; a < 1.6; a += 0.04) add(X(-0.16 * Math.sin(th + 2.4 + a)), Y(yc - 0.16 * Math.cos(th + 2.4 + a)));   // its counterweight
      // the gas: the same particles, spread through what the chamber holds now — thin while it fills, packed by compression,
      // a burst at the spark, and thrown out through the open exhaust
      const N = detail ? 110 : 40, ch = head - top;
      for (let i = 0; i < N; i++) {
        const u = ehsh(i, 1), v = ehsh(i, 2);
        if (st === 0 && v > sp) { const k = v - sp; add(X(-0.12 - k * 0.6 + (u - 0.5) * 0.08), Y(head + 0.04 + k * 0.4)); continue; }   // still coming in
        if (st === 3 && v < sp) { const k = sp - v; add(X(0.12 + k * 0.6 + (u - 0.5) * 0.08), Y(head + 0.04 + k * 0.4)); continue; }  // already out
        const jit = st === 2 ? 0.02 * Math.sin(t * 0.03 + i) : 0;
        add(X((u * 2 - 1) * (w - 0.02) + jit), Y(top + 0.01 + v * (ch - 0.02) + jit));
      }
      if (st === 2 && sp < 0.22) { const k = 1 - sp / 0.22; for (let i = 0; i < (detail ? 420 : 160); i++) { const a = 6.2832 * ehsh(i, 3), rr = (0.04 + 0.22 * ehsh(i, 4)) * k; add(X(rr * Math.cos(a)), Y(head - 0.02 - Math.abs(rr * Math.sin(a)) * 0.8)); } }   // the spark
    };
    // live-v1.42.5 (Yaniv 20.11 13:28 — Jumo 223, Deltic, Jumo 205, Sabre, Nomad, Wankel, Wasp Major: «אם יש מנוע שעובר
    // יפה, תוסיף») — the ones whose idea reads in a moving section. Opposed pistons on a ring of crankshafts: N cranks at the
    // corners of a polygon, a cylinder along each side, two pistons in it meeting in the middle — three for the Deltic (one
    // crank turning against the others), four for the Jumo 223.
    const opposedRing = (add, N, t, rv, flip) => {
      const th = t * 0.0024, P = [...Array(N)].map((_, k) => { const a = (flip ? -Math.PI / 2 : Math.PI / 2) + k * 6.2832 / N; return [rv * Math.cos(a), rv * Math.sin(a)]; });
      const cr = 0.09, dir = (k) => (N === 3 && k === 1 ? -1 : 1);
      P.forEach(([x, y], k) => { ering(add, x, y, 0.12); ering(add, x, y, 0.05); const a = dir(k) * th + k * 2.1; eseg(add, x, y, x + cr * Math.cos(a), y + cr * Math.sin(a)); });   // the crankshafts
      for (let k = 0; k < N; k++) {
        const [ax, ay] = P[k], [bx, by] = P[(k + 1) % N], L = Math.hypot(bx - ax, by - ay), ux = (bx - ax) / L, uy = (by - ay) / L, nx = -uy, ny = ux, w = 0.06;
        const s0 = 0.16, s1 = L - 0.16; eseg(add, ax + ux * s0 + nx * w, ay + uy * s0 + ny * w, ax + ux * s1 + nx * w, ay + uy * s1 + ny * w); eseg(add, ax + ux * s0 - nx * w, ay + uy * s0 - ny * w, ax + ux * s1 - nx * w, ay + uy * s1 - ny * w);   // the cylinder
        const ph = th + k * 6.2832 / N, stroke = 0.5 * (1 - Math.cos(ph)), gap = 0.03 + 0.2 * stroke, m = L / 2;   // both pistons, mirror images
        for (const sgn of [-1, 1]) { const c = m + sgn * gap, cx = ax + ux * c, cy = ay + uy * c; eseg(add, cx + nx * w, cy + ny * w, cx - nx * w, cy - ny * w); const e = m + sgn * (gap + 0.1); eseg(add, cx, cy, ax + ux * e, ay + uy * e); }
        if (stroke < 0.12) { const k2 = 1 - stroke / 0.12; for (let i = 0; i < 90; i++) { const a = 6.2832 * hsh2(i, 9), r = 0.05 * k2 * hsh2(i, 10); add(ax + ux * m + Math.cos(a) * r, ay + uy * m + Math.sin(a) * r * 0.6); } }   // the firing
      }
    };
    // Apollonius: circles as [curvature, x, y, generation], by Descartes' theorem on curvature and curvature × centre
    let APO = null;
    const apo = () => { if (APO) return APO; const out = [], r0 = 1 / (1 + 2 / Math.sqrt(3)), C = (k, x, y) => [k, k * x, k * y];
      const O = [-1, 0, 0], I = [0, 1, 2].map((i) => { const u = Math.PI / 2 + i * 2.0944; return C(1 / r0, (1 - r0) * Math.cos(u), (1 - r0) * Math.sin(u)); });
      const emit = (c, g) => out.push([c[0], c[1] / c[0], c[2] / c[0], g]);
      emit(O, 0); I.forEach((c) => emit(c, 1));
      const rec = (a, b, c, d, g) => { const e = [0, 1, 2].map((t) => 2 * (a[t] + b[t] + c[t]) - d[t]); if (1 / Math.abs(e[0]) < 0.006 || g > 9) return; emit(e, g); rec(a, b, e, c, g + 1); rec(a, c, e, b, g + 1); rec(b, c, e, a, g + 1); };
      rec(I[0], I[1], I[2], O, 2); rec(O, I[0], I[1], I[2], 2); rec(O, I[1], I[2], I[0], 2); rec(O, I[0], I[2], I[1], 2);
      out.sort((p, q) => p[3] - q[3]); APO = out; return out; };
    const lifeReset = () => { const { W, H } = life; life.a = new Uint8Array(W * H); life.b = new Uint8Array(W * H); const cx = W >> 1, cy = H >> 1; [[0, 0], [1, 0], [1, -2], [3, -1], [4, 0], [5, 0], [6, 0]].forEach(([x, y]) => { life.a[(cy + y) * W + cx - 3 + x] = 1; }); life.gen = 0; };
    const lifeStep = () => { const { W, H, a, b } = life; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let n = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (dx || dy) n += a[((y + dy + H) % H) * W + (x + dx + W) % W]; const i = y * W + x; b[i] = n === 3 || (n === 2 && a[i]) ? 1 : 0; } life.a = b; life.b = a; life.gen++; };
    // a ray through a biconvex lens by Snell's law, n = 1.5; returns the polyline
    const LR = 0.8, LT = 0.3, cxL = -LT / 2 + LR, cxR = LT / 2 - LR;
    const refract = (dx, dy, nx, ny, eta) => { const ci = -(nx * dx + ny * dy), k = 1 - eta * eta * (1 - ci * ci); if (k < 0) return null; const f = eta * ci - Math.sqrt(k); return [eta * dx + f * nx, eta * dy + f * ny]; };
    const hit = (px, py, dx, dy, cx, far) => { const ox = px - cx, b = ox * dx + py * dy, c = ox * ox + py * py - LR * LR, d = b * b - c; if (d < 0) return null; const t = far ? -b + Math.sqrt(d) : -b - Math.sqrt(d); return [px + dx * t, py + dy * t]; };
    const ray = (y0) => { const P = [[-1, y0]]; const h1 = hit(-1, y0, 1, 0, cxL, false); if (!h1) return P; P.push(h1); let d = refract(1, 0, (h1[0] - cxL) / LR, h1[1] / LR, 1 / 1.5); if (!d) return P; const h2 = hit(h1[0], h1[1], d[0], d[1], cxR, true); if (!h2) return P; P.push(h2); d = refract(d[0], d[1], -(h2[0] - cxR) / LR, -h2[1] / LR, 1.5); if (!d) return P; const t = (1 - h2[0]) / d[0]; P.push([1, h2[1] + d[1] * t]); return P; };
    return [
      // optics: parallel rays meet a lens; the focus and its caustic come out of Snell's law alone
      { name: "קרני אור דרך עדשה", grow: true, still: true, plot: (add, prog) => { const ap = 0.46; for (let y = -ap; y <= ap; y += 0.004) { const s = Math.sqrt(LR * LR - y * y); add(cxL - s, y * 1.25); add(cxR + s, y * 1.25); } const L = prog * 2.6; for (let y0 = -0.42; y0 <= 0.421; y0 += 0.035) { const P = ray(y0); let left = L; for (let i = 1; i < P.length && left > 0; i++) { const [ax, ay] = P[i - 1], [bx, by] = P[i], len = Math.hypot(bx - ax, by - ay), f = Math.min(1, left / len); seg(add, ax, ay * 1.25, ax + (bx - ax) * f, (ay + (by - ay) * f) * 1.25, 160); left -= len; } } } },
      // mechanics: fifteen throws at one speed; the envelope parabola (no throw reaches past it) appears by itself
      { name: "זריקות · פרבולת הביטחון", grow: true, still: true, plot: (add, prog) => { const T = prog * 2.05; for (let a = 10; a <= 80; a += 5) { const th = a * Math.PI / 180, vx = Math.cos(th), vy = Math.sin(th), tE = Math.min(T, 2 * vy); for (let t = 0; t <= tE; t += 0.004) add(-0.95 + vx * t * 1.9, -0.82 + (vy * t - 0.5 * t * t) * 3.2); } } },
      // geometry of the Islam world: the eight-pointed star, constructed — circles, then two squares, then the {8/3} star
      { name: "כוכב שמונה · בנייה", grow: true, still: true, plot: (add, prog) => { const a = 0.32, C = []; for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) C.push([i * 2 * a, j * 2 * a]); const V = (c, k) => [c[0] + a * Math.cos(k * Math.PI / 4), c[1] + a * Math.sin(k * Math.PI / 4)]; const st = (p0, p1) => clamp((prog - p0) / (p1 - p0), 0, 1); C.forEach((c, n) => { const s1 = st(0.03 * n, 0.03 * n + 0.2); if (prog < 0.86) for (let i = 0, m = Math.floor(s1 * 220); i < m; i++) { const u = i / 220 * Math.PI * 2; add(c[0] + a * Math.cos(u), c[1] + a * Math.sin(u)); } const s2 = st(0.3 + 0.02 * n, 0.5 + 0.02 * n); if (prog < 0.86) for (let k = 0; k < Math.floor(s2 * 8); k++) { const p = V(c, k), q = V(c, k + 2); seg(add, p[0], p[1], q[0], q[1], 90); } const s3 = st(0.55 + 0.02 * n, 0.8 + 0.02 * n); for (let k = 0; k < Math.floor(s3 * 8 + 0.0001); k++) { const p = V(c, k), q = V(c, k + 3); seg(add, p[0], p[1], q[0], q[1], 130); } }); } },
      // probability: a Galton board — 900 balls, each falling left or right at twelve pegs; the bell builds itself
      { name: "לוח גלטון", grow: true, still: true, plot: (add, prog) => { const L = 12, w = 0.11, NB = Math.floor(prog * 900), r = xs(42), bins = new Int32Array(L + 1); for (let row = 0; row < L; row++) for (let j = 0; j <= row; j++) add((j - row / 2) * w, 0.92 - row * 0.06); for (let k = 0; k <= L + 1; k++) seg(add, (k - 0.5 - L / 2) * w, -0.96, (k - 0.5 - L / 2) * w, 0.16, 60); for (let b = 0; b < NB; b++) { let k = 0; for (let row = 0; row < L; row++) k += r() & 1; const n = bins[k]++; add((k - L / 2) * w + ((n % 3) - 1) * 0.026, -0.94 + Math.floor(n / 3) * 0.016); } } },
      // arithmetic: chords from n to 2n on a circle of 200 points; the cardioid is never drawn, only the chords
      { name: "לוח הכפל במעגל · ×2", grow: true, still: true, plot: (add, prog) => { const N = 200, R = 0.95; for (let i = 0; i < 520; i++) { const u = i / 520 * Math.PI * 2; add(R * Math.cos(u), R * Math.sin(u)); } const m = Math.floor(prog * N); for (let i = 1; i < m; i++) { const u = i / N * Math.PI * 2, v = (2 * i % N) / N * Math.PI * 2; seg(add, R * Math.cos(u), R * Math.sin(u), R * Math.cos(v), R * Math.sin(v), 55); } } },
      // gravitation: one planet under Newton's force plus a small 1/r³ term, step by step — the orbit precesses into a rosette
      { name: "מסלול שמסתובב · כבידה", grow: true, still: true, plot: (add, prog) => { add(0, 0); add(0.012, 0); add(-0.012, 0); add(0, 0.012); add(0, -0.012); let x = 0.78, y = 0, vx = 0, vy = 0.7; const GM = 0.5, dt = 0.002, N = Math.floor(prog * 26000); for (let i = 0; i < N; i++) { const r2 = x * x + y * y, r = Math.sqrt(r2), f = GM / r2 * (1 + 0.05 / r) / r; vx -= f * x * dt; vy -= f * y * dt; x += vx * dt; y += vy * dt; if (i % 2 === 0) add(x * 1.15, y * 1.15); } } },
      // live-v1.42.5 — «טור פורייה · גל ריבועי» retired (Yaniv 20.11 12:59: «צורה משעממת שנראית כמו גרף סינוס מוזר»)
      // ENGINES, 1: a four-stroke petrol engine, one cylinder in section — intake, compression, the spark, exhaust; the
      // valves open by the cam's timing, the crank and the rod turn the piston's line into a circle
      { name: "מנוע ארבע פעימות", grow: true, still: true, plot: (add, prog, t) => { const th = t * 0.0021; cylinder(add, 0, 1.12, th, th % 12.5664, t, true); } },
      // 2: four in a row on one crankshaft — pistons 1 and 4 together, 2 and 3 opposite; they fire 1-3-4-2, half a turn apart
      { name: "ארבעה צילינדרים בשורה · 1-3-4-2", grow: true, still: true, plot: (add, prog, t) => { const th = t * 0.0026, F = [0, 9.4248, 3.1416, 6.2832];
        [-0.75, -0.25, 0.25, 0.75].forEach((cx, k) => { const ct = th + (k === 1 || k === 2 ? Math.PI : 0); cylinder(add, cx, 0.68, ct, ((th - F[k]) % 12.5664 + 12.5664) % 12.5664, t, false); });
        eseg(add, -0.98, (-0.38 - 0.19) * 0.68, 0.98, (-0.38 - 0.19) * 0.68); } },   // the crankshaft, through the four cranks
      // 3: a gas turbine — the turboshaft of the Chinook (two of them turn its rotors). Air comes in at the left, the
      // compressor's stages squeeze it, it burns in the chamber, it turns the turbine (which turns the compressor and the
      // shaft) and leaves hot and fast through the nozzle
      { name: "טורבינת גז · מנוע הצ'ינוק", grow: true, still: true, plot: (add, prog, t) => {
        const R = (x) => x < -0.75 ? 0.4 : x < -0.1 ? 0.4 - (x + 0.75) * 0.26 : x < 0.3 ? 0.23 + 0.13 * Math.sin((x + 0.1) / 0.4 * Math.PI) : x < 0.65 ? 0.23 + (x - 0.3) * 0.2 : 0.3 - (x - 0.65) * 0.3;
        for (let x = -0.95; x <= 0.95; x += 0.003) { add(x, R(x) + 0.02); add(x, -R(x) - 0.02); }   // the casing
        eseg(add, -0.9, 0.012, 0.95, 0.012); eseg(add, -0.9, -0.012, 0.95, -0.012); eering(add, -0.92, 0, 0.04);   // the shaft and its nose
        // a stage: its disc as a line across the duct, and its blade tips passing over it as the shaft turns
        const stage = (x, rr, k, ph) => { eseg(add, x, -rr, x, rr); for (let j = 0; j < 3; j++) { const y = rr * Math.cos(t * 0.011 * k + ph + j * 2.0944); for (let d = -0.02; d <= 0.02; d += 0.004) { add(x + d, y); add(x + d, y + 0.01); } } };
        for (let i = 0; i < 7; i++) { const x = -0.72 + i * 0.09; stage(x, R(x) - 0.03, 1, i * 0.5); }   // the compressor
        for (let i = 0; i < 3; i++) { const x = 0.4 + i * 0.09; stage(x, R(x) - 0.03, 1.4, i * 0.9); }   // the turbine
        for (let i = 0; i < 260; i++) { const a = hsh2(i, 5), x = -0.02 + 0.28 * a, f = Math.sin(t * 0.018 + i * 1.7); if (f < 0) continue; add(x, (hsh2(i, 6) - 0.5) * 1.6 * (R(x) - 0.08) * (0.6 + 0.4 * f)); }   // the flame
        for (let i = 0; i < 70; i++) {   // the air, as streaks: slow and wide in the inlet, squeezed through the compressor, fast out of the nozzle
          const s0 = (t * 0.00016 + hsh2(i, 7)) % 1, x = -0.95 + 1.9 * Math.pow(s0, 1.4), y = (hsh2(i, 8) * 2 - 1) * (R(x) - 0.06), len = 0.02 + 0.07 * s0 * s0;
          eseg(add, x - len, y, x, y); }
      } },
      // live-v1.42.5 — the engines Yaniv named (20.11 13:28), those whose idea reads in a moving section:
      // the Wankel: a three-cornered rotor turning inside a two-lobed housing (an epitrochoid), its centre riding the
      // eccentric shaft three times as fast; three chambers grow and shrink, and fire as they pass the plug
      { name: "מנוע ונקל · רוטורי", grow: true, still: true, plot: (add, prog, t) => {
        const R = 0.62, e = 0.13, th = t * 0.0009;
        for (let a = 0; a < 6.2832; a += 0.004) { add(e * Math.cos(3 * a) + (R + 0.035) * Math.cos(a), e * Math.sin(3 * a) + (R + 0.035) * Math.sin(a)); add(e * Math.cos(3 * a) + (R + 0.1) * Math.cos(a), e * Math.sin(3 * a) + (R + 0.1) * Math.sin(a)); }   // the housing, inner and outer wall
        const cx = e * Math.cos(3 * th), cy = e * Math.sin(3 * th), V = [0, 1, 2].map((k) => [cx + R * Math.cos(th + k * 2.0944), cy + R * Math.sin(th + k * 2.0944)]);
        for (let k = 0; k < 3; k++) { const [x1, y1] = V[k], [x2, y2] = V[(k + 1) % 3], mx = (x1 + x2) / 2, my = (y1 + y2) / 2, ox = mx - cx, oy = my - cy, ol = Math.hypot(ox, oy);
          for (let u = 0; u <= 1; u += 0.004) { const b = 0.11 * Math.sin(Math.PI * u); add(x1 + (x2 - x1) * u + ox / ol * b, y1 + (y2 - y1) * u + oy / ol * b); } }   // the rotor's flanks
        ering(add, cx, cy, 0.2); ering(add, 0, 0, 0.12); ering(add, 0, 0, 0.03); eseg(add, 0, 0, cx, cy);   // its gear on the fixed gear, the shaft and its eccentric
        eseg(add, 0.7, 0.05, 0.86, 0.05); eseg(add, 0.7, -0.05, 0.86, -0.05);   // the plugs
        eseg(add, -0.86, 0.3, -0.62, 0.22); eseg(add, -0.86, -0.3, -0.62, -0.22);   // intake and exhaust
        for (let k = 0; k < 3; k++) { const a = ((th + k * 2.0944 + 1.0472) % 6.2832 + 6.2832) % 6.2832; if (a < 0.45) { const q = 1 - a / 0.45; for (let i = 0; i < 160; i++) { const ang = 6.2832 * hsh2(i, 11), r = 0.18 * q * hsh2(i, 12); add(0.6 + Math.cos(ang) * r * 0.5, Math.sin(ang) * r); } } }   // a chamber firing
      } },
      // the Napier Deltic: three crankshafts at the corners of an upside-down triangle, two pistons in each cylinder meeting
      // in the middle — no valves, no head; the third crank turns against the other two
      { name: "נאפייר דלטיק · משולש", grow: true, still: true, plot: (add, prog, t) => opposedRing(add, 3, t, 0.72, true) },
      // the Junkers Jumo 223: the same idea in a square — four crankshafts, four banks of opposed pistons
      { name: "יונקרס יומו 223 · ריבוע", grow: true, still: true, plot: (add, prog, t) => opposedRing(add, 4, t, 0.74, false) },
      // the Junkers Jumo 205: opposed-piston two-stroke diesel, upright — a crankshaft above and one below, geared together;
      // the lower piston uncovers the intake ports, the upper one the exhaust, and they meet to fire in the middle
      { name: "יונקרס יומו 205 · בוכנות נגדיות", grow: true, still: true, plot: (add, prog, t) => {
        const th = t * 0.0024, xs = [-0.5, 0, 0.5];
        eseg(add, -0.78, 0.78, 0.78, 0.78); eseg(add, -0.78, -0.78, 0.78, -0.78);   // the two crankshafts
        for (let g = 0; g < 5; g++) ering(add, 0.86, -0.72 + g * 0.36, 0.17);   // the gear train between them
        xs.forEach((x, k) => {
          const ph = th + k * 2.0944, st = 0.5 * (1 - Math.cos(ph)), gap = 0.04 + 0.34 * st, w = 0.14;
          eseg(add, x - w - 0.02, -0.55, x - w - 0.02, 0.55); eseg(add, x + w + 0.02, -0.55, x + w + 0.02, 0.55);   // the cylinder
          for (const yy of [-0.32, 0.32]) for (const sx of [-1, 1]) eseg(add, x + sx * (w + 0.06), yy - 0.04, x + sx * (w + 0.06), yy + 0.04);   // its ports
          for (const sgn of [-1, 1]) { const y = sgn * gap; ebox(add, x - w, y, x + w, y + sgn * 0.14); const pa = ph * sgn, py = sgn * 0.78, px = x + 0.1 * Math.sin(pa), pyy = py - sgn * 0.1 * Math.cos(pa); eseg(add, x, y + sgn * 0.07, px, pyy); ering(add, x, sgn * 0.78, 0.1); }
          if (st < 0.12) { const q = 1 - st / 0.12; for (let i = 0; i < 120; i++) { const a = 6.2832 * hsh2(i, 13), r = 0.12 * q * hsh2(i, 14); add(x + Math.cos(a) * r, Math.sin(a) * r * 0.4); } }   // it fires
          if (st > 0.8) for (let i = 0; i < 40; i++) { const q = hsh2(i + k * 50, 15); add(x + (hsh2(i, 16) - 0.5) * 0.24, -0.3 + q * 0.6); }   // scavenging: fresh air through
        });
      } },
      // the Pratt & Whitney R-4360 Wasp Major from the front: 28 cylinders in four rows of seven, each row turned a little
      // further — the «corncob». The pistons rise in turn round the crank; each fires every other turn, in the order
      // 1-3-5-7-2-4-6 within its row
      { name: "וואספ מייג'ור · 28 צילינדרים", grow: true, still: true, plot: (add, prog, t) => {
        const th = t * 0.0022;
        ering(add, 0, 0, 0.3); ering(add, 0, 0, 0.1); ering(add, 0, 0, 0.04);   // the crankcase, the hub
        for (let row = 3; row >= 0; row--) {
          const off = row * 6.2832 / 28, d = row === 0 ? 1 : 0.35 - row * 0.07, pin = [0.06 * Math.cos(th + row * 1.5708), 0.06 * Math.sin(th + row * 1.5708)];
          for (let k = 0; k < 7; k++) {
            const a = off + k * 6.2832 / 7, ca = Math.cos(a), sa = Math.sin(a), r0 = 0.32, r1 = 0.68 + row * 0.03, w = 0.045;
            const keep = (i) => d >= 1 || hsh2(i + k * 97 + row * 991, 17) < d;
            let i = 0; for (let r = r0; r <= r1; r += 0.004) { if (keep(i++)) { add(ca * r - sa * w, sa * r + ca * w); add(ca * r + sa * w, sa * r - ca * w); } }   // the barrel
            if (row === 0) for (let r = r0 + 0.12; r < r1; r += 0.035) eseg(add, ca * r - sa * (w + 0.02), sa * r + ca * (w + 0.02), ca * r + sa * (w + 0.02), sa * r - ca * (w + 0.02));   // its fins
            const rel = th + row * 1.5708 - a, rp = 0.36 + 0.09 * (1 + Math.cos(rel));   // the piston rises as the crank comes round to it
            if (row === 0) { eseg(add, ca * rp - sa * w, sa * rp + ca * w, ca * rp + sa * w, sa * rp - ca * w); eseg(add, pin[0], pin[1], ca * (rp - 0.02), sa * (rp - 0.02)); }
            const cyc = (((th + row * 1.5708 - a + (k % 2 ? 0 : 6.2832)) % 12.5664) + 12.5664) % 12.5664;   // two turns a cycle; odd and even fire on alternate turns
            if (row === 0 && cyc < 0.5) { const q = 1 - cyc / 0.5; for (let j = 0; j < 70; j++) { const rr = r1 - 0.06 * hsh2(j, 18), ww = (hsh2(j, 19) - 0.5) * 2 * w * q; add(ca * rr - sa * ww, sa * rr + ca * ww); } }
          }
        }
      } },
      // life sciences: Conway's Game of Life from the seven cells of the acorn
      // TESLA (Yaniv 12.11 20:55: «give some honour to Tesla — hint at his inventions»), 1: a Tesla coil's discharge.
      // The leader is grown, not drawn: walkers rise from the ground plate and freeze where they touch it (diffusion-
      // limited growth, biased upward), so it branches down from the toroid on its own. When a branch reaches the
      // ground, the channel from the toroid to that point takes the stroke.
      { name: "סליל טסלה · ברק", grow: true, still: true, plot: (add, prog) => { const B = bolt(), n = Math.floor(B.ord.length * Math.min(1, prog / 0.8)), sx = 1.9 / (B.H - 1), cx = (B.W - 1) / 2, P = (i) => [(i % B.W - cx) * sx, 0.95 - Math.floor(i / B.W) * sx];
        for (let u = 0; u < 6.283; u += 0.02) { add(0.3 * Math.cos(u), 0.95 - B.top * sx + 0.08 + 0.07 * Math.sin(u)); add(0.2 * Math.cos(u), 0.95 - B.top * sx + 0.08 + 0.035 * Math.sin(u)); }   // the toroid
        for (let x = -0.9; x <= 0.9; x += 0.012) add(x, -0.97);   // the ground plate
        for (let j = 0; j < n; j++) { const [x, y] = P(B.ord[j]); add(x, y); }
        if (prog > 0.8) { const f = 4 + Math.floor(16 * (1 - (prog - 0.8) / 0.2)); for (let i = B.hit; i >= 0; i = B.par[i]) { const [x, y] = P(B.ord[i]); for (let k = 0; k < f; k++) add(x, y); } } } },   // the stroke outweighs the leader 20:1, then dims
      // TESLA, 2: the rotating magnetic field of his induction motor. Three coils, 120° apart, each fed a current a third
      // of a cycle behind the last; each field only swells and shrinks along its own axis, yet their sum keeps one
      // length and turns. A rotor follows it, a little behind (the slip).
      { name: "השדה המסתובב · טסלה", grow: true, still: true, plot: (add, prog) => { const w = prog * 5 * 6.2832, ph = 2.0944, line = (x0, y0, x1, y1, n, m = 1) => { for (let i = 0; i <= n; i++) for (let k = 0; k < m; k++) add(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n); };
        const field = (a) => { let bx = 0, by = 0; for (let k = 0; k < 3; k++) { const u = Math.PI / 2 + k * ph, m = 0.44 * Math.cos(a - k * ph); bx += m * Math.cos(u); by += m * Math.sin(u); } return [bx, by]; };
        for (let k = 0; k < 3; k++) { const u = Math.PI / 2 + k * ph, c = Math.cos(u), s = Math.sin(u), m = 0.44 * Math.cos(w - k * ph);
          for (let i = 0; i < 8; i++) { const r = 0.7 + i * 0.035; line(r * c - 0.07 * s, r * s + 0.07 * c, r * c + 0.07 * s, r * s - 0.07 * c, 10); }   // the coil's windings
          line(0, 0, m * c, m * s, 40, 3); }
        const [bx, by] = field(w); line(0, 0, bx, by, 70, 10);
        for (let i = 0; i < Math.min(w, 6.2832) * 50; i++) { const [x, y] = field(w - i / 50); add(x, y); add(x, y); }   // where the sum's tip has been
        const rr = w * 0.93; for (let u = 0; u < 6.2832; u += 0.02) add(0.16 * Math.cos(u), 0.16 * Math.sin(u)); for (let k = 0; k < 3; k++) { const u = rr + k * ph; line(0, 0, 0.16 * Math.cos(u), 0.16 * Math.sin(u), 12); } } },
      // sound: the Mach cone. A source speeds up from half the speed of sound to more than twice it, sending out a circle
      // at each beat; while it is slower the circles nest, at the speed of sound they crowd at its nose, past it they
      // fall behind into a cone — the shock wave. Only circles are drawn
      { name: "חרוט מאך · מהירות הקול", grow: true, still: true, plot: (add, prog) => { const T = prog * 1.15, X = (t) => -0.95 + 0.45 * t + 0.95 * t * t;
        for (let ti = 0; ti <= T; ti += 0.035) { const r = 0.8 * (T - ti), cx = X(ti), n = Math.max(6, Math.ceil(r * 95)); for (let i = 0; i < n; i++) { const u = i / n * 6.2832; add(cx + r * Math.cos(u), 0.62 * r * Math.sin(u) * 1.6); } }
        const sx = X(T); for (let u = 0; u < 6.283; u += 0.3) for (let r = 0.01; r <= 0.03; r += 0.01) add(sx + r * Math.cos(u), r * Math.sin(u)); } },
      // sound: Chladni's figures. Sand on a square plate; where the plate moves the grains are kicked about, where it is
      // still they rest — so they gather on the nodal lines by themselves. The tone rises twice, and the figure re-forms
      { name: "תבניות כלדני · צליל", grow: true, still: true, plot: (add, prog) => { const target = Math.floor(prog * 240); if (CHL.n < 0 || target < CHL.n) chlReset(); while (CHL.n < target) chlStep();
        for (let i = 0; i < CHL.x.length; i++) add(CHL.x[i] * 0.92, CHL.y[i] * 0.92); for (let u = -0.92; u <= 0.92; u += 0.01) { add(u, 0.94); add(u, -0.94); add(0.94, u); add(-0.94, u); } } },
      // astronomy: a spiral galaxy out of plain ellipses. Each orbit is an ellipse, each a few degrees more turned than the
      // one inside it; no arm is drawn, yet where the ellipses crowd together the arms appear (Lin and Shu's density waves)
      { name: "גלקסיה מאליפסות", grow: true, still: true, plot: (add, prog, t) => { const N = 60, M = Math.max(1, Math.floor(prog * N)), sp = t * 0.00004; for (let k = 0; k < M; k++) { const a = 0.05 + k * 0.0148, b = a * 0.68, th = k * 0.105 + sp, c = Math.cos(th), s = Math.sin(th), n = Math.ceil(a * 70); for (let i = 0; i < n; i++) { const u = (i + 0.5 * Math.sin(i * 12.9898 + k * 78.233)) / n * 6.2832, x = a * Math.cos(u), y = b * Math.sin(u); add(x * c - y * s, x * s + y * c); } } } },
      // mechanics: a pendulum wave. Twenty-four pendulums in a row, each making one more swing than its neighbour in the
      // same time; seen from above they snake, split into two rows, three, scatter — and meet in one line again at the end
      { name: "גל מטוטלות", grow: true, still: true, plot: (add, prog) => { const N = 24, K = 18; for (let k = 0; k < N; k++) { const x = -0.9 + 1.8 * k / (N - 1), w = 6.2832 * (K + k);
        for (let j = 0; j < 6; j++) { const y = 0.62 * Math.cos(w * (prog - j * 0.0013)); if (j) { add(x, y); continue; } for (let r = 0.012; r <= 0.042; r += 0.015) for (let u = 0; u < 6.283; u += 0.5) add(x + r * Math.cos(u), y + r * Math.sin(u)); add(x, y); } } } },
      // geometry: Apollonius' gasket. Three circles touching inside a fourth; into every gap goes the circle that touches
      // all three around it (Descartes' theorem), and into its gaps the next — generation by generation
      { name: "אריזת אפולוניוס", grow: true, still: true, plot: (add, prog) => { const C = apo(), G = 1 + prog * 7.2; for (const [k, x, y, g] of C) { if (g > G) break; const r = 1 / Math.abs(k), n = Math.max(10, Math.ceil(r * 520)); for (let i = 0; i < n; i++) add(x + r * Math.cos(i / n * 6.2832), y + r * Math.sin(i / n * 6.2832)); } } },
      { name: "משחק החיים · בלוט", grow: true, still: true, plot: (add, prog) => { const target = Math.floor(prog * 360); if (life.gen < 0 || target < life.gen) lifeReset(); while (life.gen < target) lifeStep(); const { W, H, a } = life, sx = 2 / (W - 1), sy = sx; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (a[y * W + x]) { const px = -1 + x * sx, py = (H / 2 - y) * sy; add(px, py); add(px + sx * 0.4, py); add(px, py - sy * 0.4); add(px + sx * 0.4, py - sy * 0.4); } } },
    ];
  })();
  // live-v1.23.24 — fields: a value per cell rather than points. Escape-time fractals, the deepest use of the ramp.
  const FIELDS = [
    // a slow dive from the whole set into the seahorse valley
    { name: "קבוצת מנדלברוט", fn: (x, y, t) => { const z = Math.exp(-Math.max(0, t - 3500) * 0.00016), X = -0.5 - 0.2435 * (1 - z) + x * 1.45 * z, Y = 0.1314 * (1 - z) + y * 1.45 * z; let a = 0, b = 0, i = 0; const M = 60 + Math.round(60 * (1 - z)); for (; i < M && a * a + b * b < 16; i++) { const na = a * a - b * b + X; b = 2 * a * b + Y; a = na; } if (i >= M) return 0.42; const sm = i + 1 - Math.log2(Math.max(1e-9, Math.log(a * a + b * b) / 2)); return sm < 4 ? 0 : Math.sqrt(clamp(sm / M * 1.6, 0, 1)); } },
    { name: "קבוצת ז'וליה", fn: (x, y, t) => { const an = t * 0.00018, cr = 0.7885 * Math.cos(an), ci = 0.7885 * Math.sin(an); let a = x * 1.6, b = y * 1.6, i = 0; const M = 80; for (; i < M && a * a + b * b < 16; i++) { const na = a * a - b * b + cr; b = 2 * a * b + ci; a = na; } if (i >= M) return 0.42; const sm = i + 1 - Math.log2(Math.max(1e-9, Math.log(a * a + b * b) / 2)); return sm < 4 ? 0 : Math.sqrt(clamp(sm / M * 1.6, 0, 1)); } },
  ];


  // live-v1.23.47 — the figures of grc-labs.com (Yaniv, 21.10 12:09: «what about the shapes on the main page? Above all
  // the menorah, but you have many shapes there — add them too, in some random way»). Ported from
  // grc-labs.com/assets/js/screensaver.js v1.6.11 into this file's character field, so each one comes and goes with the
  // rain like every other figure: the Knesset menorah (the site's own ASCII art, as given), the Temple menorah (drawn,
  // then sampled), the spring, the torus knot, the cochlea and the Möbius strip (makeSurface), the pyramid and the cube
  // (makeSolid3D), Voyager (its point model), and the molecules (MOLS; removed at live-v1.39.26). Not ported: the consoles and dashboards (they
  // carry text, and Earth's screensaver has no captions), the portrait, and the plain sphere and donut (the torus is here).
  let BRAND = null;
  const SITE = (() => {
    // (Yaniv 28.10 22:07: «take only the menorah and build its silhouette in ASCII art, finer than what the screensaver
    // has»): traced from the plan of Benno Elkan's Knesset Menorah (he.wikipedia, «Menorah_plan22.jpg») — its outline filled,
    // shaded as rounded bronze lit from above (Elkan asked for one light, from above), edges drawn by their direction.
    // A sculpture permanently in a public place may be drawn (Israeli Copyright Act 2007, s.23); nothing of the plan's
    // own lettering is used.
    // (Yaniv 28.10 23:08: «I liked the close-ups of the menorah even more than the whole shape — all its beauty is in the
    // branches, not the foot»): a close-up — the seven branches and their cups, down to where they meet the stem; the
    // foot left out. 73 rows, 148 columns, traced again at that size, so the panels of the branches carry their rims.
    // live-v1.38.14 (Yaniv 06.11 11:49: «the menorah lost its leg — just add the leg, no need to see all of it»): the junction
    // opens into the stem, 13 rows down with one knop, cut off before the foot. 86 rows now.
    // live-v1.39.37 (Yaniv 15.11 08:56: «build it whole») — the menorah whole: below those 86 rows the stem goes on with two
    // more knops and the round medallion of its panel, flares into a collar, and stands on the three stepped slabs of its
    // base. Drawn here in the art's own hand (lit from the left and from above, outlines by direction), with the proportions
    // of the Knesset menorah; nothing of any drawing's lettering is used. 137 rows; the base begins at MEN_FOOT.
    const MENORAH_ART = ["                                                     _                                                                _                     _", "          _                                          -                    _                     _   ____      __      -    ___     ___      -______", " ________ - _______     ______ /\\_______      ______ - _______     _______-________      ______/-\\__----\\     --_____/-\\___---    /---_____/-------\\", "/--------/-\\-------    /------/---------_   |/------/-\\-------   |/----------------\\    |----------%%%---\\   |----------------+\\   |---------------|", "|----------------%#*\\  |--#------------#-+\\  \\-##%%%##-----###*\\  \\-----###----#-##*|    \\--------------+-|   \\---#---*##-----=-|   \\--------------|", " \\__----------------|   \\+-------------/_-/   \\+-******-----___/   \\*-********------/     |#********--/__/     \\-*#*******=--__/     \\*#********--/|", "    \\*#******=*--__/      \\-#******=-=|         |##******=-/         |#*********:--/      |-+*******-|           |%*******=-|          |#*******:|", "     |%******==:|          |%******=--|         |+#******-|          |#*******-+:|         |+*******-|           |%*******-|           |#*******:|", "     |----------|          |%******--=|         |+#******--|        /---****----|         |--*****----|         |--******---|        |%----------\\", "   |%%********---|        |---******--|       |%-----------|       |-#*********--\\        |-*********--|       |--*********--|        |----*****-/-|", "    |--*****-----/        |------------|       |-------**---|       \\-------------|        |-----------|        |--*****----/|        |-*******=|", "    |-********=:|          |%******=--|        |-#*******--|         |%*******--|          |%#******=-|          |%*******=|           |#******=|", "    |%********=-|         |-#******=-=|         |#*******-|          |%*******==|          |%*******=-|          |%*******=|           |#******=|", "    |%*-**-***=-|         |+#******=-=|         |%#******=|          |#*******==|         |-#*******=-|          |%*******=|           |#******=|", "    |%********==|          |%**-==*=-+|         |%#*-****=|         |%#*****=*==|          |%**-****--|         |-#*******=|           |+*-*-**=|", "    |%*-**-***==|          |%******=-+|         |%#******=|         |+#*******==|          |%*******=-|         |-#*-*==**=|           |#******=|", "    |%*******===|          |%**-*-*=-+|         |++****=*=|          |#***-***=+-|        |-#***-***=-|         |-#*******=|           |#*-*-=*=|", "    |%--*=-**===|          |%*******-+|         |+#******=-|         |#*********-|        |-#***-***=-|         |-#*-*****=|           |#******=|", "    |%*******===|          |%-*-=-=*-+|          |#*******-|         |#*********-|        |-********--|         |-#*******=-|          |+---***=|", "    |%-=-=*-**=+-|         |%*******-=|          |%*******-|        |%#*********:|         |#*******--|         |-#*******=-|         |+#******=|", "    |%********=+-|         |%*******-=|         /-#******--|        |##********=:|       |/-----*-----|         |-#*******=-|         |+*******+|", "    |%********=+:|         |-*******---|      |%-#********=-\\        |#********==|       |#----*****--|        /------------|        /-#********:|", "    |-********---|        |--*******---|        \\----*-------|       |-******----|         |+*******--|        |---******---|       |------***---|", "   |--*******----|         |------------|        |#*******-|        |-------------|        |+#******+-|         |-********--|        \\----*****---|", "    |-------------|        |+#******=-=|         |#*******-|        |-********---/         |+#******+-|         |+#***-***=|          |%*******+-/", "     |#********=:|          |%******==-|         |#*******-|        |+*********-|          |+#***-**-=|         |-#*******=|          |%*******=|", "     |##*******=-|         |-#*******==|         |#--**-=--|        |%***-=****=-|         |+********=|         |-#-*==-**=|          |%*******=|", "     |+#**-****=-|         |%********==|        |-#*******-|        |%=******=*=-|         |+********=|         |%#*******+|          |%*******=|", "     |%#*******=-|         |+#*******-=|         |%*******-|        |%=******=*=-|         |+********-|         |%#***-***=|         /-#*-*****=|", "    |-#***--***=-|          |#*******-=|       /@--*****---|       |*#=******=*=-|       |@-----*-----|         |-#-***--*=|        |--********=|", "    |-*********=-|          |%*******-=:|      |#--********-=|     |+#=******=*==|        \\------------|        |-#*******=|         \\-#****-**=|", "    |-#***-=***+-|        |/------------|        |----------|      |+#*********==|         |-------*--|        |----****----|         |#**-****=|", "     |#********+-|         \\-----**-----|        |#*****----|      |+#******-**==|         |-******--|          |-----------|         |#*******=|", "     |+**-*-***==|          |%#******--|        |+-*-*-**===-\\   _ |-#*********==| _______/-%****-**-|           |%*******:|          |#*******+:|", "     |-#*******-=|          |+#******-=:|       |#-*******-**-\\\\_-/---------------\\------@@-*-**--*+:|           |%*******=|          |#********:|", "     |--*****-----|         |+--***-*-=:|        |*-=-=***-**###----***********-----%%%####*-=*****-|           |+#*-*-***=|        |@--****-----|", "    |--*********--|         |+#******-=-|         \\*+***--******#*=-***********=*==**********--**+--/            |#*******=|         |----****--+-|", "    \\*---**-------|         |+#******==-|          \\+---**********==***********=*==***********+-__/              |%*******-|          |#********--|", "      |#**---**-=-|         /-----------|            \\-_=++********=*****-*******==*******+=-/_/               /|-------*---|         |%********:|", "      |%*******-=:|       |%--********--|               ___+++*****=*******---****=****++-__/                  |#-------**--|         |%*******+:|", "     |-#**-****=*:|         |#**---**--|                   \\___++**=************=*-*+=___/                       |--***-**-|          |%*******=|", "     |%********-*-|         |--****----|                       \\_\\-=************=*---/                          /@#*****---|          |%**----*=|", "     |-#-***-**-*-|         |+********--|                         \\+#*-*-*******=*-/                          /@%#*******-|           |%*******=|", "      |+*******---|         |#--***-**---\\                        |+#***********=-|                       __ /-%****--**+-|           |%*******+|", "    |%------------|        |+#********-**#*\\ ___                   |%=*==*******--|                      _--/%-**-===-**-|          |@-----------\\", "     |-----------/|         |#***-=***-***##\\---_______            |%***********-:|            ________//@%%#**-*******-/            |--------**--|", "     |-#**--***-|           |*******--******####-------_____     |/---***----------|      _____--*@@@@%%%#*****---***+-/             |-----****=|", "     |---*****=-|            \\-\\++---***********####%%#-----____ |-----------------|    __---@@%%%#####***********----/             /--#****--*-|", "     |--*******--|              \\__++******************#####----_ |%************-+-|___/--%%###*****************+=/-/              /-%********--|", "     |#***-*****-|                 ___+++*******************####-/-#************-*----@%%#*****************++=____                |-%**-=--***+|", "     |#****-*****-\\                   _\\__==+******************##-=*************-==-###***************++=-____                    |%#***-*****=|", "     |#**********-+|                      _____===++++***********=******=--*****-=-*************+++=______                        |%*********+-|", "     \\*+**---***-**+\\                          _________+=++*****==*************==-********++=______                             /--***=**-*+-/", "      \\+-+*****-***##+\\                                 ____+++***=***==--=*-***=*-*****+-/___                                 /@@#*--*****--/", "        \\*----*********\\                                    \\_\\+**-*************=*-**=-__/                                   /@@%#****-----/", "          \\*+**********#\\\\\\____                                \\---***-*-*=*****-*-=/-/                              ______//@%#********+-/", "            \\-**********###----______                           |-#*************-=-/                           ______-----@%#**********=-/", "             \\*************#####-----_______                     |#*************=-|                   _________------%%%###**********+--/", "               \\+++*******-****#####%-------_______              |%*************--|            _______---------@%%###****--**--****+--/", "                 \\-\\+*******-=*-****######%#%#-----___         |%------------------\\       ____-----%%%%%#######****---=**-*****+=--/", "                    \\_+++*****--*-**--******#########-\\____      |------------------|  __ /--@%%######*********--***********++=__-/", "                      ____+++***********--*-*******######--_____ |%**************-=| _ --/%%###********=--=-*-*********++==____", "                          ____-+=++***********=-==-*-**######---/%#**************=+-\\-/%%#******=--***=*********+++==______", "                              ________+==++++*******-*******####+****************==-+##*****************+++===_______", "                                      __________++++************=****************=--*************+++==________", "                                                _____=+****************-*-=******=--**********+=-_____", "                                                     _\\\\++***********************=--********=-/-/", "                                                        \\-\\+***-*******-==*******=-=******-/_/", "                                                           \\***==****************=-=****--/", "                                                            \\***=******=-*-******=-=**--/", "                                                             \\--=****************=-=+--/", "                                                              |-#*****************--:/", "                                                               \\___|-#*****-**=-|___/", "                                                                   |%#***-****=-|", "                                                                   |-#****-***=:|", "                                                                   |%#**-*****=-|", "                                                                  /-##***-****=--\\", "                                                                 |%@%##*******=-+-|", "                                                                  \\_-##******=-__/", "                                                                   |-#*****-**=-|", "                                                                   |%#***-****+-|", "                                                                   |%#***-****=-|", "                                                                   |-#****-***=:|", "                                                                   |%#**-*****=-|", "                                                                   |-#*****-**=-|", "                                                                   |%#***-****+-|", "                                                                   |+#***-***-+-|", "                                                                   |%#******-*=:|", "                                                                   |%#*-******+-|", "                                                                   |+#*-******=-|", "                                                                   |+#-*******=:|", "                                                                  /-#-****-****=:\\", "                                                                 |@%##*#*****#**=-|", "                                                                  \\_-#*--***-*=:_/", "                                                                   |%#*******-=-|", "                                                                   |%#****-***=:|", "                                                                   |%#***-*-**=:|", "                                                                   |-#********=-|", "                                                                   |-#**-*****+-|", "                                                                   |+#**-*****+-|", "                                                                   |%#*******-=:|", "                                                                   |-#******-*+-|", "                                                                  /--------------\\", "                                                                 /@%##******#***=-\\", "                                                                |@%###****#****#*=-|", "                                                                 \\@%##*#********=-/", "                                                                  \\--------------/", "                                                                   |-#********=:|", "                                                                   |+#*-****-*+-|", "                                                                   |+#********=:|", "                                                                   |%#********=:|", "                                                                   |+#*****-*-=-|", "                                                                   |+#********+-|", "                                                                   |%#****-*-*=:|", "                                                                   |-#****-***=-|", "                                                                  /-#**********+-\\", "                                                                 |@%##*##******#=-|", "                                                                  \\_%#********=:_/", "                                                                   |-#-*******+-|", "                                                                   |+#**-*****+-|", "                                                                   |%#*******-=-|", "                                                                   |-#-**-**-*=:|", "                                                                  /+#**********=:\\", "                                                                /-#***-**********=-\\", "                                                              /-#***************-**=-\\", "                                                          /@%##===%%#*#%*%***#=#***#**==-\\", "                                                         |%#*==-=-*=*=*===*-**-**=--+-*--:|", "                                                         |%#--------**=-==--*-*-=--**-=*-:|", "                                                         |________________________________|", "                                               /@%==*==##*#*######%*#**#**=#*%=#=*=*###***####**##=-\\", "                                              |%#=*--+==*+--==*=-=-=---=+-==-+-=**---**+=----=-*=---:|", "                                              |%#=+==+*=-=-=-==-+---=*--+-----*--=-==*-+--===----*=-:|", "                                              |______________________________________________________|", "                                  /@%*#*#=#***%*#*#*#**##*=#%==*#**=****#*=*###**####**#%=##*=*%=#######*=#*#**=-\\", "                                 |%#+-=+-*===-*++=*=--==*=-=*-=-=+=*==*--=---=---+-=+===+=*-*--*-===*==-+=--+=*--:|", "                                 |%#-=*+-=-=+*-*=-=-*+-==----=-=*--==*--==-=---====-+--=--*=---+==--*++---+**=---:|", "                                 |________________________________________________________________________________|"];
    const MEN_FOOT = 125;   // live-v1.39.37: the row where the base begins

    // live-v1.38.16 (Yaniv 06.11 12:13–13:09: «in a mysterious, interesting way, inside the stream»; «the light flows, but the
    // menorah is a shape») — Psalm 67 inside the Knesset menorah, as the traditional «למנצח» menorah lays it out: verse 8 in
    // the right outer branch … verse 2 in the left outer one, verse 5 down the centre and on into the stem, one letter a row.
    // Each letter replaces one character of the art and keeps that character's shade: nothing is lit, nothing is added. The
    // seven pieces of verse 1 (one over each cup) are not drawn with the art: drawArt plants them in the rain (MPLANT).
    const MENORAH_TXT = (() => {
      const A = MENORAH_ART, T = A.map((l) => Array(l.length).fill("")); T.pieces = [];
      const runs = (l) => { const out = []; let i = 0; while (i < l.length) { while (i < l.length && l[i] === " ") i++; if (i >= l.length) break; let j = i; while (j < l.length && !(l[j] === " " && l[j + 1] === " " && l[j + 2] === " ")) j++; out.push([i, j]); i = j; } return out; };
      const V = ["יברכנו אלהים וייראו אותו כל אפסי ארץ", "ארץ נתנה יבולה יברכנו אלהים אלהינו", "יודוך עמים אלהים יודוך עמים כלם", "ישמחו וירננו לאמים כי תשפט עמים מישור ולאמים בארץ תנחם סלה", "יודוך עמים אלהים יודוך עמים כלם", "לדעת בארץ דרכך בכל גוים ישועתך", "אלהים יחננו ויברכנו יאר פניו אתנו סלה"];
      const P = ["למנ", "צחב", "נגי", "נ", "תמז", "מור", "שיר"];
      const r8 = runs(A[8]); if (r8.length !== 7) return null;
      const ok = (ch) => ch && ch !== " " && "|/\\_".indexOf(ch) < 0;
      r8.slice().reverse().forEach(([a, b], bi) => {   // right to left: branch bi = verse 8 … 2
        let c = Math.round((a + b - 1) / 2); const w0 = b - a;
        T.pieces.push({ c: (a + b - 1) / 2, t: P[bi] });   // the top line: one piece over each cup, drawn above the art
        // the centre spreads its verse down to the foot of the stem; the other branches go one letter a row
        const step = bi === 3 ? Math.max(1, (MEN_FOOT - 3 - 8) / V[bi].length) : 1;   // live-v1.39.37: down the whole stem, to the collar
        let r = 8, rf = 8;
        for (const ch of V[bi]) {
          while (r < A.length) {   // follow the branch: the run that holds the column; where branches merge, keep the column
            const rr = runs(A[r]).find(([x, y]) => c >= x && c < y);
            if (rr && rr[1] - rr[0] <= w0 * 1.5) c = Math.round((rr[0] + rr[1] - 1) / 2);
            if (!ok(A[r][c])) { for (let d = 1; d <= 6; d++) { if (ok(A[r][c - d])) { c -= d; break; } if (ok(A[r][c + d])) { c += d; break; } } }   // a curve moved the branch: the nearest cell of the art
            if (ok(A[r][c])) break; r++; rf = r;
          }
          if (r >= A.length) break;
          if (ch !== " ") T[r][c] = ch;
          rf += step; r = Math.max(r + 1, Math.round(rf));
        }
      });
      return T;
    })();
    const DENS = " .:-=+*#%@";
    // a parametric surface into the field, z-buffered, lit as on the site (|n·L|, L = [0, 0.6, -0.8])
    const surf = (name, P, o) => ({ name, kind: "surf", fill: (t) => {
      val.fill(0); hot.fill(0); const zb = new Float32Array(gw * gh), A = t * 0.0009, B = t * 0.0011, ca = Math.cos(A), sa = Math.sin(A), cb = Math.cos(B), sb = Math.sin(B), K2 = 5, K1 = side / cw * 0.5 * K2 * (o.scale || 1) / o.ext;
      const rot = (p) => { const x1 = p[0] * cb + p[2] * sb, z1 = -p[0] * sb + p[2] * cb; return [x1, p[1] * ca - z1 * sa, p[1] * sa + z1 * ca]; };
      const du = o.du / 2, dv = o.dv / 2;
      for (let u = 0; u < o.uMax; u += du) for (let v = 0; v < o.vMax; v += dv) {
        const p0 = P(u, v), pu = P(u + du, v), pv = P(u, v + dv);
        const nx = (pu[1] - p0[1]) * (pv[2] - p0[2]) - (pu[2] - p0[2]) * (pv[1] - p0[1]), ny = (pu[2] - p0[2]) * (pv[0] - p0[0]) - (pu[0] - p0[0]) * (pv[2] - p0[2]), nz = (pu[0] - p0[0]) * (pv[1] - p0[1]) - (pu[1] - p0[1]) * (pv[0] - p0[0]);
        const rp = rot(p0), rn = rot([nx, ny, nz]), nl = Math.hypot(rn[0], rn[1], rn[2]) || 1, lum = Math.abs((rn[1] * 0.6 - rn[2] * 0.8) / nl), ooz = 1 / (K2 + rp[2]);
        const xp = Math.floor(gw / 2 + K1 * ooz * rp[0]), yp = Math.floor(gh / 2 - K1 * ooz * rp[1] * cw / fs);
        if (xp < 0 || xp >= gw || yp < 0 || yp >= gh) continue; const i = yp * gw + xp; if (ooz <= zb[i]) continue; zb[i] = ooz; val[i] = 0.08 + 0.92 * lum;
      } } });
    // a solid of triangles, each face sampled densely, flat-lit with a depth gradient, edges bright (makeSolid3D)
    const solid = (name, V, F, o) => {
      const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], nrm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }, cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
      const FN = F.map((f) => { let n = nrm(cross(sub3(V[f[1]], V[f[0]]), sub3(V[f[2]], V[f[0]]))); const c = [0, 1, 2].map((k) => (V[f[0]][k] + V[f[1]][k] + V[f[2]][k]) / 3); if (n[0] * c[0] + n[1] * c[1] + n[2] * c[2] < 0) n = n.map((x) => -x); return n; }), L = nrm([0.3, 0.7, -0.9]);
      return { name, kind: "solid", fill: (t) => {
        val.fill(0); hot.fill(0); const zb = new Float32Array(gw * gh), A = o.tiltFn ? o.tiltFn(t) : t * 0.0009, B = t * (o.spin || 0.0011), ca = Math.cos(A), sa = Math.sin(A), cb = Math.cos(B), sb = Math.sin(B), K2 = 5, K1 = side / cw * 0.5 * K2 * (o.scale || 1) / o.ext;
        const rot = (p) => { const x1 = p[0] * cb + p[2] * sb, z1 = -p[0] * sb + p[2] * cb; return [x1, p[1] * ca - z1 * sa, p[1] * sa + z1 * ca]; };
        const plot = (rp, v) => { const ooz = 1 / (K2 + rp[2]), xp = Math.floor(gw / 2 + K1 * ooz * rp[0]), yp = Math.floor(gh / 2 - K1 * ooz * rp[1] * cw / fs); if (xp < 0 || xp >= gw || yp < 0 || yp >= gh) return; const i = yp * gw + xp; if (ooz > zb[i]) { zb[i] = ooz; val[i] = v; } };
        const ST = 90;
        F.forEach((f, fi) => { const rn = rot(FN[fi]), lum = 0.3 + 0.7 * Math.max(0, rn[0] * L[0] + rn[1] * L[1] + rn[2] * L[2]), v0 = V[f[0]], e1 = sub3(V[f[1]], v0), e2 = sub3(V[f[2]], v0);
          for (let a = 0; a <= ST; a++) for (let b = 0; b <= ST - a; b++) { const rp = rot([v0[0] + e1[0] * a / ST + e2[0] * b / ST, v0[1] + e1[1] * a / ST + e2[1] * b / ST, v0[2] + e1[2] * a / ST + e2[2] * b / ST]), dz = clamp((1.5 - rp[2]) / 3, 0, 1); plot(rp, clamp(lum * (0.4 + 0.6 * dz), 0.06, 0.95)); } });
        (o.edges || []).forEach(([p, q]) => { const ea = rot(V[p]), eb = rot(V[q]); for (let k = 0; k <= 120; k++) { const f = k / 120; plot([ea[0] + (eb[0] - ea[0]) * f, ea[1] + (eb[1] - ea[1]) * f, ea[2] + (eb[2] - ea[2]) * f - 0.002], 1); } });
      } };
    };
    // Voyager: the dish, the booms, the golden record — the site's point model, sampled finer for this grid
    const VOY = []; { const add = (x, y, z, l) => VOY.push([x, y, z, l]);
      for (let ring = 0.10; ring <= 1.0; ring += 0.035) { const n = Math.max(30, Math.round(ring * 130)); for (let s = 0; s < n; s++) { const a = s / n * 6.2832; add(ring * Math.cos(a), ring * Math.sin(a), -0.5 * ring * ring, ring > 0.93 ? 11 : 6); } }
      for (let f = 0; f < 48; f++) add(0, 0, -0.5 + f * 0.0133, 8);
      for (let b = 0; b < 36; b++) { const a = b / 36 * 6.2832; add(0.24 * Math.cos(a), 0.24 * Math.sin(a), 0.18, 9); }
      for (let m = 0; m <= 1; m += 0.006) add(0.24 + m * 2.7, 0, 0.18, m > 0.96 ? 11 : 4);
      for (let m = 0; m <= 1; m += 0.012) add(-(0.24 + m * 1.15), -0.05, 0.18, 4);
      for (let g = 0; g < 36; g++) add(-1.42, -0.05, 0.18 + (g - 18) * 0.0093, 9);
      for (let m = 0; m <= 1; m += 0.012) add(0.10, -(0.24 + m * 1.25), 0.18, 4);
      for (let g = 0; g < 42; g++) { const a = g / 42 * 6.2832; add(0.34 + 0.13 * Math.cos(a), 0.13 * Math.sin(a), 0.20, 11); } }
    // a figure drawn on a small canvas and sampled cell by cell (the site's makeMenorah / makeBrand did the same)
    // `overlay`: lay the figure's cells over what is already in the field instead of replacing it (the wordmark under
    // the tetrahedron); `o.dy`: its centre below the screen's, as a fraction of `side`
    const raster = (name, draw, o) => ({ name, kind: "raster", brand: !!o.brand, cache: null, fill: function (_t, overlay) {
      const key = gw + "x" + gh;
      if (!(this.cache && this.cache.key === key)) { const sv0 = [val.slice(), hot.slice(), chr.slice()]; this.make(); this.cache = { key, v: val.slice(), h: hot.slice(), c: chr.slice() }; if (overlay) { val.set(sv0[0]); hot.set(sv0[1]); chr.set(sv0[2]); } }
      const C = this.cache;
      if (!overlay) { val.set(C.v); hot.set(C.h); chr.set(C.c); return; }
      for (let k = 0; k < C.v.length; k++) if (C.v[k] > 0) { val[k] = C.v[k]; hot[k] = C.h[k]; chr[k] = C.c[k]; }
    }, make: function () {
      val.fill(0); hot.fill(0); chr.fill(0);
      const bw = Math.min(gw - 2, Math.floor(side * o.w / cw)), bh = Math.min(gh - 2, Math.floor(side * o.h / fs)), W = bw, H = Math.max(8, Math.round(bh * fs / cw));
      const off = document.createElement("canvas"); off.width = W; off.height = H; const g = off.getContext("2d");
      g.fillStyle = "#000"; g.fillRect(0, 0, W, H); g.fillStyle = "#fff"; g.strokeStyle = "#fff"; draw(g, W, H);
      const d = g.getImageData(0, 0, W, H).data, q0 = (gw - bw) >> 1, r0 = clamp(((gh - bh) >> 1) + Math.round((o.dy || 0) * side / fs), 0, gh - bh);
      for (let r = 0; r < bh; r++) for (let c = 0; c < bw; c++) { const py = Math.min(H - 1, Math.round((r + 0.5) * fs / cw)), lum = d[(py * W + c) * 4]; if (lum <= 110) continue; const k = (r0 + r) * gw + q0 + c; val[k] = 0.62 + 0.36 * lum / 255; hot[k] = o.gold && (c + r) % 6 !== 0 ? 1 : 0; chr[k] = o.chars.charCodeAt((c * 7 + r * 3) % o.chars.length); }
    } });
    // live-v1.23.50 (Yaniv 21.10 13:14: «simply put GRC into the tetrahedron's screen, and under it all rights reserved»):
    // the wordmark, in the site's Space Grotesk, laid in gold under the tetrahedron and brought by the same rain
    BRAND = raster("GRC Labs", (o, W, H) => { let f = H; const face = (n) => "700 " + n + 'px "Space Grotesk", "IBM Plex Sans", Arial, sans-serif'; o.font = face(f); while (f > 4 && o.measureText("GRC Labs").width > W * 0.94) o.font = face(--f); o.textAlign = "center"; o.textBaseline = "middle"; o.fillText("GRC Labs", W / 2, H / 2 + 1); }, { w: 1.15, h: 0.26, dy: 0.5, gold: true, chars: "#@", brand: true });
    return [
      // live-v1.23.49 (Yaniv, 21.10 12:47: «you put the menorah that is not nice at all; we have a menorah we processed from
      // a real photograph in the Knesset»): this one, the site's MENORAH_ART. It is drawn on its own grid, one character of
      // the art per cell at the art's own size, as the site draws it — v1.23.47 resampled it onto the fine field and lost
      // its texture. The drawn Temple menorah is removed.
      { name: "מנורת הכנסת", kind: "art", art: MENORAH_ART, txt: MENORAH_TXT, fill: () => {} },
      surf("קפיץ", (u, v) => { const R2 = 1.0, R1 = 0.27, p = 0.105; return [(R2 + R1 * Math.cos(v)) * Math.cos(u), u * p - 4 * Math.PI * p + R1 * Math.sin(v), (R2 + R1 * Math.cos(v)) * Math.sin(u)]; }, { uMax: 8 * Math.PI, du: 0.06, dv: 0.10, vMax: 6.283, ext: 1.45 }),
      surf("קשר על טורוס", (u, v) => { const R2 = 1.6, R1 = 0.55, c = Math.cos(v + 2 * u); return [(R2 + R1 * c) * Math.cos(u), R1 * Math.sin(v + 2 * u), (R2 + R1 * c) * Math.sin(u)]; }, { uMax: 6.283, du: 0.035, dv: 0.05, vMax: 6.283, ext: 2.2 }),
      surf("שבלול", (u, v) => { const s = Math.exp(-0.18 * u), R = 1.7 * s, tb = 0.62 * s; return [(R + tb * Math.cos(v)) * Math.cos(u), tb * Math.sin(v) + 0.07 * u - 0.66, (R + tb * Math.cos(v)) * Math.sin(u)]; }, { uMax: 6 * Math.PI, du: 0.04, dv: 0.12, vMax: 6.283, ext: 2.2 }),
      surf("טבעת מביוס", (u, v) => { const w = (v - 0.4) * 0.95, h = 1 + w * Math.cos(u / 2); return [1.3 * h * Math.cos(u), 1.3 * w * Math.sin(u / 2), 1.3 * h * Math.sin(u)]; }, { uMax: 6.283, du: 0.04, dv: 0.04, vMax: 0.8, ext: 1.85 }),
      solid("קובייה", (() => { const s = 0.78; return [[-s, -s, -s], [s, -s, -s], [s, s, -s], [-s, s, -s], [-s, -s, s], [s, -s, s], [s, s, s], [-s, s, s]]; })(), [[0, 1, 2], [0, 2, 3], [5, 4, 7], [5, 7, 6], [4, 0, 3], [4, 3, 7], [1, 5, 6], [1, 6, 2], [4, 5, 1], [4, 1, 0], [3, 2, 6], [3, 6, 7]], { ext: 1.4, edges: [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]] }),
      { name: "מרכבה", kind: "merkaba", fill: (t) => fillMerkaba(t) },
      { name: "וויאג'ר", kind: "cloud", fill: (t) => {
        val.fill(0); hot.fill(0); const zb = new Float32Array(gw * gh), A = 0.42, B = t * 0.0006, ca = Math.cos(A), sa = Math.sin(A), cb = Math.cos(B), sb = Math.sin(B), K2 = 5, K1 = side / cw * 0.5 * K2 / 1.7;
        for (const p of VOY) { const x1 = p[0] * cb + p[2] * sb, z1 = -p[0] * sb + p[2] * cb, y2 = p[1] * ca - z1 * sa, z2 = p[1] * sa + z1 * ca, ooz = 1 / (K2 + z2), xp = Math.floor(gw / 2 + K1 * ooz * (x1 - 0.6)), yp = Math.floor(gh / 2 - K1 * ooz * y2 * cw / fs); if (xp < 0 || xp >= gw || yp < 0 || yp >= gh) continue; const i = yp * gw + xp; if (ooz > zb[i]) { zb[i] = ooz; val[i] = p[3] / 11; hot[i] = p[3] >= 11 ? 1 : 0; } }
      } },
    ];
  })();

  // --- the character field (v2) -------------------------------------------------------------------------------
  // One fine grid for every scene. A scene fills `val` (0..1 per cell, and `hot` for the tetrahedron's core);
  // one renderer turns it into characters, with the rain behind it and the coalesce / dissolve at its ends.
  const RAMP = " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
  const MONO = '"IBM Plex Mono", "Noto Sans Egyptian Hieroglyphs", ui-monospace, Menlo, monospace';
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const hex = (h) => { const n = parseInt(h.replace("#", "").slice(0, 6), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const mix = (a, b, k) => a.map((x, i) => Math.round(x + (b[i] - x) * k));
  // eight colour steps from the dim blue of the coast to the gold of the cities — one fillStyle per step, not per cell
  const SHADE = (() => { const lo = hex(COL.lo), md = hex(COL.mid), hi = hex(COL.hi); return Array.from({ length: 8 }, (_, i) => { const k = i / 7, c = k < 0.55 ? mix(lo, md, k / 0.55) : mix(md, hi, (k - 0.55) / 0.45); return `rgb(${c[0]},${c[1]},${c[2]})`; }); })();
  let dpr = 1, fs = 10, cw = 6, gw = 0, gh = 0, val = null, hot = null, sub = null, side = 0, born = null, chr = null, gold = null;   // chr: a figure's own character for a cell (the menorah's, an element's), 0 = the ramp
  // (Yaniv 28.10 22:07: «give the tetrahedron more resolution» on the GRC slide) — the figures' grid can be made finer for
  // one scene without touching the rain: the title slide draws on a grid 0.62 of the figures' own
  let fsBase = 10, gridScale = 1;
  function regrid(k) {
    gridScale = k; fs = Math.max(Math.round(4 * dpr), Math.round(fsBase * k)); cw = fs * 0.6;
    gw = Math.max(16, Math.floor(cv.width / cw)); gh = Math.max(16, Math.floor(cv.height / fs));
    val = new Float32Array(gw * gh); hot = new Uint8Array(gw * gh); sub = new Float32Array(gw * gh * 4); born = new Float64Array(gw * gh); chr = new Uint16Array(gw * gh); gold = new Uint8Array(gw * gh);
  }
  function size() {
    dpr = Math.min(devicePixelRatio || 1, 2); cv.width = cv.clientWidth * dpr; cv.height = cv.clientHeight * dpr;
    fsBase = clamp(Math.round(Math.min(cv.width, cv.height) / 112), Math.round(5 * dpr), Math.round(11 * dpr));   // v3: finer
    regrid(gridScale);
    side = Math.min(cv.width * 0.7, cv.height * 0.66);   // turned 45°, the corners of a full [-1, 1] shape still fit
    rainSize();
  }

  // points → a 2×2 sub-cell density, smoothed over the neighbours, normalised: thin curves stay thin, dense
  // regions climb the ramp — that is the depth
  function fillPoints(shape, t, prog) {
    sub.fill(0); val.fill(0); hot.fill(0);
    const sw = gw * 2, sh = gh * 2, cx = sw / 2, cy = sh / 2, ax = side / cw, ay = side / fs;
    const rg = shape.still ? 0 : t * 0.00012, c = Math.cos(rg), s = Math.sin(rg);
    shape.plot((nx, ny) => { const rx = nx * c - ny * s, ry = nx * s + ny * c, q = Math.round(cx + rx * ax), r = Math.round(cy - ry * ay); if (q >= 0 && q < sw && r >= 0 && r < sh) sub[r * sw + q] += 1; }, prog, t);
    let mx = 0;
    for (let r = 0; r < gh; r++) for (let q = 0; q < gw; q++) {
      const i0 = (r * 2) * sw + q * 2, own = sub[i0] + sub[i0 + 1] + sub[i0 + sw] + sub[i0 + sw + 1];
      let nb = 0;
      if (q > 0) nb += sub[i0 - 1] + sub[i0 + sw - 1]; if (q < gw - 1) nb += sub[i0 + 2] + sub[i0 + sw + 2];
      if (r > 0) nb += sub[i0 - sw] + sub[i0 - sw + 1]; if (r < gh - 1) nb += sub[i0 + 2 * sw] + sub[i0 + 2 * sw + 1];
      const v = own ? own + nb * 0.35 : nb * 0.18; val[r * gw + q] = v; if (v > mx) mx = v;
    }
    const k = mx > 0 ? 1 / Math.max(2.2, mx * 0.62) : 0;
    // a cell the shape passes through starts at mid-ramp, so a thin curve reads as clearly as a dense fractal;
    // a cell lit only by a neighbour stays a faint halo
    for (let r = 0, i = 0; r < gh; r++) for (let q = 0; q < gw; q++, i++) { const v = val[i]; if (!v) continue; const i0 = (r * 2) * sw + q * 2, own = sub[i0] + sub[i0 + 1] + sub[i0 + sw] + sub[i0 + sw + 1]; val[i] = own ? 0.38 + 0.62 * clamp(Math.pow(v * k, 0.7), 0, 1) : clamp(v * k * 0.9, 0, 0.22); }
  }

  // live-v1.23.50 (Yaniv, 21.10 13:14: «we have shapes trapped inside a ball; I like the ball less — we have a way out of
  // it»): the fractal fields were cut by a round window; they now fill the whole screen, and their streams pass over
  // the whole width (passStart(P, true))
  function fillField(f, t) {
    val.fill(0); hot.fill(0);
    const half = side / 2, x0 = (cv.width - gw * cw) / 2, y0 = (cv.height - gh * fs) / 2;
    for (let r = 0; r < gh; r++) for (let q = 0; q < gw; q++) {
      const x = (x0 + (q + 0.5) * cw - cv.width / 2) / half, y = -(y0 + (r + 0.5) * fs - cv.height / 2) / half;
      val[r * gw + q] = f.fn(x, y, t);
    }
  }
  // live-v1.38.17 (Yaniv 06.11 13:47, a brief: «a tribute to the 1990s PC demoscene — visuals made only from math»): the
  // demo, ONE scene kind of its own, once a cycle in a figure's slot. Seven classic effects back to back, no audio and no
  // text: plasma, a tunnel, a morph (torus → sphere → torus knot), metaballs, the orb (13:50: «a ball with a halo that
  // looks electromagnetic» — here a dipole's field lines round a lit sphere), fire, and a sine wave of glyphs over the
  // fire's last seconds. Each effect writes a field in [0,1] per cell of the fine grid; two effects hand over by
  // blending their fields before the ramp; drawField does the rest — born in the rain's green, cooling into gold, blue
  // and the floor, laid down and taken away by the streams like any figure. Calmer than an intro: ~6.8 s an effect,
  // ~41 s in all. Buffers and tables are made on resize, nothing per frame. Measured: 4.6 KB minified (esbuild) — above the
  // brief's ~4 KB by about the orb, a seventh effect it did not have.
  // QA: #saver=demo, or #saver=demoN (0–6) to hold effect N.
  const DEMO_FX = 6800, DEMO_X = 1400, DEMO_WAVE = 5 * DEMO_FX + 3000, DEMO_OUT = 6 * DEMO_FX + 900, MNU = 300, MNV = 120;
  let D = null;
  const sstep = (e) => (e <= 0 ? 0 : e >= 1 ? 1 : e * e * (3 - 2 * e));
  // the morph's three surfaces on one (u, v) grid, evaluated once: a torus, a sphere (v as latitude), the torus knot
  const MT = (() => { const N = (MNU + 1) * (MNV + 1) * 3, T = [new Float32Array(N), new Float32Array(N), new Float32Array(N)]; let k = 0;
    for (let i = 0; i <= MNU; i++) for (let j = 0; j <= MNV; j++, k += 3) { const u = i / MNU * 6.2832, v = j / MNV * 6.2832, cu = Math.cos(u), su = Math.sin(u), f = v / 2, c = Math.cos(v + 2 * u), w = 1 + 0.34 * c, a = 1 + 0.42 * Math.cos(v);
      T[0].set([a * cu, 0.42 * Math.sin(v), a * su], k); T[1].set([1.15 * Math.sin(f) * cu, 1.15 * Math.cos(f), 1.15 * Math.sin(f) * su], k); T[2].set([w * cu, 0.34 * Math.sin(v + 2 * u), w * su], k); }
    return T; })();
  function demoAlloc() {
    if (D && D.gw === gw && D.gh === gh && D.side === side) return;
    const n = gw * gh, half = side / 2, x0 = (cv.width - gw * cw) / 2, y0 = (cv.height - gh * fs) / 2;
    D = { gw, gh, side, A: new Float32Array(n), B: new Float32Array(n), H: new Float32Array(n), Z: new Float32Array(n), X: new Float32Array(gw), Y: new Float32Array(gh), ang: new Float32Array(n), idz: new Float32Array(n), dk: new Float32Array(n), P: new Float32Array((MNU + 1) * (MNV + 1) * 3), bx: new Float32Array(5), by: new Float32Array(5), fl: 0, last: -1 };
    for (let q = 0; q < gw; q++) D.X[q] = (x0 + (q + 0.5) * cw - cv.width / 2) / half;
    for (let r = 0; r < gh; r++) D.Y[r] = -(y0 + (r + 0.5) * fs - cv.height / 2) / half;
    for (let r = 0, k = 0; r < gh; r++) for (let q = 0; q < gw; q++, k++) { const d = Math.hypot(D.X[q], D.Y[r]); D.ang[k] = Math.atan2(D.Y[r], D.X[q]) / Math.PI; D.idz[k] = 1 / Math.max(d, 0.04); D.dk[k] = sstep(d * 1.4); }
  }
  const DEMO = [
    (o, t) => { const cx = 0.6 * Math.sin(t * 0.00021), cy = 0.4 * Math.cos(t * 0.00017);   // plasma
      for (let r = 0, k = 0; r < gh; r++) { const y = D.Y[r], sy = Math.sin(y * 2.8 - t * 0.0005); for (let q = 0; q < gw; q++, k++) { const x = D.X[q], v = Math.sin(x * 2.2 + t * 0.0007) + sy + Math.sin((x + y) * 1.6 + t * 0.0004) + Math.sin(Math.hypot(x - cx, y - cy) * 4.5 - t * 0.0009); o[k] = 0.04 + 0.96 * sstep(sstep((v + 4) / 8)); } } },
    (o, t) => { const a = t * 0.00003, z = t * 0.0006;   // the tunnel: angle and 1/distance, XOR-textured, darker inwards
      for (let k = 0; k < o.length; k++) { const x = ((D.ang[k] * 4 + a) * 8) & 15, y = ((D.idz[k] * 0.6 + z) * 8) & 15; o[k] = (0.18 + 0.78 * ((x ^ y) / 15)) * D.dk[k]; } },
    (o, t) => { const s = t / DEMO_FX, w1 = sstep((s - 0.12) / 0.3), w2 = sstep((s - 0.55) / 0.3), P = D.P, Z = D.Z;   // the morph
      for (let k = 0; k < P.length; k++) { const a = MT[0][k] + (MT[1][k] - MT[0][k]) * w1; P[k] = a + (MT[2][k] - a) * w2; }
      o.fill(0); Z.fill(0); const A = t * 0.0004, B = t * 0.0005, ca = Math.cos(A), sa = Math.sin(A), cb = Math.cos(B), sb = Math.sin(B), K1 = side / cw * 0.5 * 5 / 1.45, S = MNV + 1;
      for (let i = 0; i < MNU; i++) for (let j = 0; j < MNV; j++) { const k = (i * S + j) * 3, ku = k + S * 3, kv = k + 3;
        const ux = P[ku] - P[k], uy = P[ku + 1] - P[k + 1], uz = P[ku + 2] - P[k + 2], vx = P[kv] - P[k], vy = P[kv + 1] - P[k + 1], vz = P[kv + 2] - P[k + 2];
        let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const x1 = P[k] * cb + P[k + 2] * sb, z1 = -P[k] * sb + P[k + 2] * cb, y2 = P[k + 1] * ca - z1 * sa, z2 = P[k + 1] * sa + z1 * ca;
        const n1 = nx * cb + nz * sb, m1 = -nx * sb + nz * cb, ny2 = ny * ca - m1 * sa, nz2 = ny * sa + m1 * ca, nl = Math.hypot(n1, ny2, nz2) || 1, ooz = 1 / (5 + z2);
        const xp = Math.floor(gw / 2 + K1 * ooz * x1), yp = Math.floor(gh / 2 - K1 * ooz * y2 * cw / fs); if (xp < 0 || xp >= gw || yp < 0 || yp >= gh) continue;
        const c = yp * gw + xp; if (ooz <= Z[c]) continue; Z[c] = ooz; o[c] = 0.08 + 0.92 * Math.abs((ny2 * 0.6 - nz2 * 0.8) / nl); } },
    (o, t) => { const bx = D.bx, by = D.by;   // metaballs on Lissajous paths: a soft band round the threshold, blue inside
      for (let i = 0; i < 5; i++) { bx[i] = 0.85 * Math.sin(t * 0.00023 * (1 + i * 0.37) + i * 1.9); by[i] = 0.55 * Math.sin(t * 0.00017 * (1.3 + i * 0.29) + i * 0.7); }
      for (let r = 0, k = 0; r < gh; r++) for (let q = 0; q < gw; q++, k++) { let f = 0; for (let i = 0; i < 5; i++) { const dx = D.X[q] - bx[i], dy = D.Y[r] - by[i]; f += 0.09 / (dx * dx + dy * dy + 1e-4); }
        const b = (f - 1) / 0.3; o[k] = Math.max(0.95 * Math.exp(-b * b), f > 1 ? 0.42 : 0); } },
    (o, t) => { const R = 0.36, A = 0.35 * Math.sin(t * 0.00019), ca = Math.cos(A), sa = Math.sin(A), lx = -0.42, ly = 0.52, lz = 0.74;   // the orb: a dipole's field lines, r = L·sin²θ, pulses flowing along them
      for (let r = 0, k = 0; r < gh; r++) for (let q = 0; q < gw; q++, k++) { const x = D.X[q], y = D.Y[r], px = x * ca - y * sa, py = x * sa + y * ca, d = Math.hypot(px, py) || 1e-6;
        if (d < R) { const z = Math.sqrt(R * R - d * d); o[k] = 0.22 + 0.62 * Math.max(0, (x * lx + y * ly + z * lz) / R) + 0.08 * Math.sin(px * 40 + t * 0.003) * Math.sin(py * 37 - t * 0.0023); continue; }
        const s = px / d, L = d / Math.max(s * s, 1e-3), g = Math.sin(L * 7), f = L < 3 ? 1 - L / 3 : 0, p = Math.pow(0.5 + 0.5 * Math.sin(py / d * 7 - t * 0.0021 + L * 3), 4);
        o[k] = Math.max(0.5 * Math.exp(-(d - R) * 5), Math.exp(-g * g * 18) * f * (0.42 + 0.58 * p)); } },
    (o, t) => { const H = D.H; if (t - D.fl > 2000) D.fl = t - 2000;   // fire: the bottom rows seeded, heat carried up by averaging, decaying as it rises
      for (; D.fl < t; D.fl += 40) { for (let q = 0; q < gw; q++) { const v = Math.random() < 0.45 ? 1 : 0.15 * Math.random(), k = (gh - 2) * gw + q; H[k + gw] = v; H[k] = Math.max(H[k] * 0.5, v); }   // hot points scattered on the bottom
        for (let r = 0; r < gh - 2; r++) for (let q = 1; q < gw - 1; q++) { const b = (r + 1) * gw + q; H[r * gw + q] = Math.max(0, (H[b - 1] + H[b] + H[b + 1] + H[b + gw]) * 0.25 - 0.016); } }   // flames to about half the height (measured)
      for (let k = 0; k < o.length; k++) { const h = H[k] * 1.5; o[k] = h < 0.05 ? 0 : Math.min(1, h); } },
    (o, t) => { const L = gw * 0.55, hx = gw * 1.1 - t / 6200 * (gw * 1.1 + L), n = RAIN_POOL.length, g = Math.floor(t / 170);   // a sine wave of glyphs, no words
      for (let q = Math.max(0, Math.floor(hx)); q < Math.min(gw, hx + L); q++) { const e = Math.min(1, (q - hx) / 6, (hx + L - q) / 6), yc = gh * 0.45 + gh * 0.17 * Math.sin(q * 0.09 - t * 0.0016);
        for (let r = Math.round(yc) - 1; r <= Math.round(yc) + 1; r++) { if (r < 0 || r >= gh) continue; const k = r * gw + q, v = e * (0.92 - 0.22 * Math.abs(r - yc)); if (v > o[k]) { o[k] = v; chr[k] = RAIN_POOL.charCodeAt(((q * 31 + r * 17 + g) >>> 0) % n); } } } },
  ];
  function fillDemo(sc, tt) {
    demoAlloc(); hot.fill(0); chr.fill(0); if (tt < D.last) { D.H.fill(0); D.fl = 0; D.off = 0; } D.last = tt;
    const lt = (i) => (i ? seq - i * DEMO_FX + DEMO_X : tt);
    tt = Math.max(0, tt);   // the first frame can come a hair before the scene's own start
    if (ph === "in") D.off = Math.max(0, tt - DEMO_FX * 0.5);   // while the streams lay it down, the plasma plays and the sequence waits
    const seq = sc.seq = tt - (D.off || 0);
    if (sc.pin !== undefined) { const p = sc.pin; if (p === 6) { DEMO[5](val, tt); DEMO[6](val, tt % 7000); } else DEMO[p](val, p === 2 ? tt % DEMO_FX : tt); return; }
    const i = Math.min(5, Math.floor(seq / DEMO_FX)), w = i < 5 ? sstep((seq - (i + 1) * DEMO_FX + DEMO_X) / DEMO_X) : 0;
    DEMO[i](D.A, lt(i));
    if (w > 0) { DEMO[i + 1](D.B, lt(i + 1)); for (let k = 0; k < val.length; k++) val[k] = D.A[k] + (D.B[k] - D.A[k]) * w; } else val.set(D.A);
    if (seq > DEMO_WAVE) DEMO[6](val, seq - DEMO_WAVE);
  }
  function fillTorus(t) {
    val.fill(0); hot.fill(0);
    const zb = new Float32Array(gw * gh), A = t * 0.0009, B = t * 0.0006, R1 = 1, R2 = 2, K2 = 5, K1 = Math.min(side / cw, side / fs * 1.67) * K2 * 0.36 / (R1 + R2);
    const ca = Math.cos(A), sa = Math.sin(A), cb = Math.cos(B), sb = Math.sin(B), stT = 0.025, stP = 0.008;
    for (let th = 0; th < 6.2832; th += stT) { const ct = Math.cos(th), st = Math.sin(th);
      for (let ph = 0; ph < 6.2832; ph += stP) { const cp = Math.cos(ph), sp = Math.sin(ph);
        const circ = R2 + R1 * ct, x = circ * (cb * cp + sa * sb * sp) - R1 * st * ca * sb;
        const y = circ * (sb * cp - sa * cb * sp) + R1 * st * ca * cb, ooz = 1 / (K2 + ca * circ * sp + R1 * st * sa);
        const xp = Math.floor(gw / 2 + K1 * ooz * x), yp = Math.floor(gh / 2 - K1 * ooz * y * 0.6);
        if (yp < 0 || yp >= gh || xp < 0 || xp >= gw) continue;
        const i = yp * gw + xp; if (ooz <= zb[i]) continue; zb[i] = ooz;
        const lum = cp * ct * sb - ca * ct * sp - sa * st + cb * (ca * st - ct * sa * sp);
        val[i] = clamp(0.1 + 0.9 * lum / 1.42, 0.06, 1); } }
  }

  // «our tetrahedron» — the logo's SDF (grc-labs.com logo.js; the same LOCKED geometry as moon.js: circumradius
  // 1.94, cavity 0.95, edge 0.021), ray-marched once per cell. The faces take the key light; the spherical cavity
  // glows from its core in gold, the way the site's mark is lit from inside.
  const TN = [[0.57735, 0.57735, 0.57735], [0.57735, -0.57735, -0.57735], [-0.57735, 0.57735, -0.57735], [-0.57735, -0.57735, 0.57735]];
  const RIN = 1.94 / 3, RS = 0.95, RK = 0.021;
  const smax = (a, b, k) => { const h = clamp(0.5 + 0.5 * (a - b) / k, 0, 1); return b + (a - b) * h + k * h * (1 - h); };
  const sdf = (x, y, z) => { const d = (n) => n[0] * x + n[1] * y + n[2] * z; const t = smax(smax(d(TN[0]), d(TN[1]), RK), smax(d(TN[2]), d(TN[3]), RK), RK) - RIN; return smax(t, -(Math.sqrt(x * x + y * y + z * z) - RS), RK); };
  // live-v1.23.57 — the Merkaba (Yaniv, 21.10 21:53, from a gold pendant): a star tetrahedron as an open frame of gold
  // beams — the twelve edges of two interlocking tetrahedra, one pointing up and one down, each a round bar —
  // ray-marched like our tetrahedron and turned slowly in depth. Lit as polished metal: a warm key, a cool fill from
  // below, a tight highlight; drawn in its own gold ramp (from bronze to pale gold), not the blue-to-gold of the figures.
  const MK = (() => { const R = 1.15 / Math.sqrt(3), V = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]].map((v) => v.map((x) => x * R)), E = [];
    for (const sg of [1, -1]) for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) { const a = V[i].map((x) => x * sg), b = V[j].map((x) => x * sg); E.push([a, [b[0] - a[0], b[1] - a[1], b[2] - a[2]]]); }
    return E.map(([a, ba]) => ({ a, ba, bb: ba[0] * ba[0] + ba[1] * ba[1] + ba[2] * ba[2] })); })();
  const MK_R = 0.075;   // measured: at 0.055 the beams read as hairlines
  const sdfMk = (x, y, z) => { let d = 1e9; for (const e of MK) { const px = x - e.a[0], py = y - e.a[1], pz = z - e.a[2], h = clamp((px * e.ba[0] + py * e.ba[1] + pz * e.ba[2]) / e.bb, 0, 1), qx = px - e.ba[0] * h, qy = py - e.ba[1] * h, qz = pz - e.ba[2] * h, dd = qx * qx + qy * qy + qz * qz; if (dd < d) d = dd; } return Math.sqrt(d) - MK_R; };
  // (Yaniv 28.10 22:07: «in the Merkaba, give more of the angle that shows the Star of David, and change the shape's
  // texture to something more pleasant»). Seen along the axis through two opposite points of the star tetrahedron, it IS
  // the Star of David — two triangles, one up and one down. It now looks along that axis most of the time and turns
  // slowly ABOUT it, so the star turns in place; now and then it leans out of it (a swing that is mostly near zero —
  // sin⁵) to show that it has depth. Its metal is softer: a wider, gentler highlight, and a quiet glyph ramp of its own.
  const MK_AXIS = (() => { const n = [1, 1, 1].map((x) => x / Math.sqrt(3)), e1 = [1 / Math.sqrt(2), -1 / Math.sqrt(2), 0], e2 = [n[1] * e1[2] - n[2] * e1[1], n[2] * e1[0] - n[0] * e1[2], n[0] * e1[1] - n[1] * e1[0]]; return [e1, e2, n]; })();
  const MK_GLYPH = " .·:-=+*%";
  function mkRot(t) {   // view → shape: B · Rx(lean) · Rz(spin)
    const spin = t * 0.00022, sw = Math.sin(t * 0.00009), lean = 0.66 * Math.pow(sw, 5), lean2 = 0.08 * Math.sin(t * 0.00017);
    const cz = Math.cos(spin), sz = Math.sin(spin), cx = Math.cos(lean), sx = Math.sin(lean), cy2 = Math.cos(lean2), sy2 = Math.sin(lean2);
    const [e1, e2, n] = MK_AXIS;
    return (v) => { let x = v[0] * cz - v[1] * sz, y = v[0] * sz + v[1] * cz, z = v[2]; const y1 = y * cx - z * sx, z1 = y * sx + z * cx; const x2 = x * cy2 + z1 * sy2, z2 = -x * sy2 + z1 * cy2;
      return [e1[0] * x2 + e2[0] * y1 + n[0] * z2, e1[1] * x2 + e2[1] * y1 + n[1] * z2, e1[2] * x2 + e2[2] * y1 + n[2] * z2]; };
  }
  function fillMerkaba(t) {
    val.fill(0); hot.fill(0); gold.fill(0); chr.fill(0);
    const rot = mkRot(t);
    const ro = rot([0, 0, 6.5]), nrm = (l) => { const n = Math.hypot(...l); return l.map((x) => x / n); }, LK = rot(nrm([0.55, 0.7, 0.6])), LF = rot(nrm([-0.4, -0.8, 0.3]));
    const scale = side * 0.95, half = scale / 2, q0 = Math.max(0, Math.floor((cv.width - scale) / 2 / cw)), q1 = Math.min(gw, Math.ceil((cv.width + scale) / 2 / cw)), r0 = Math.max(0, Math.floor((cv.height - scale) / 2 / fs)), r1 = Math.min(gh, Math.ceil((cv.height + scale) / 2 / fs));
    for (let r = r0; r < r1; r++) for (let q = q0; q < q1; q++) {
      const u = ((q + 0.5) * cw - cv.width / 2) / half * 0.42, v = -((r + 0.5) * fs - cv.height / 2) / half * 0.42;
      const n0 = Math.hypot(u, v, 1.7), rd = rot([u / n0, v / n0, -1.7 / n0]);
      const b = ro[0] * rd[0] + ro[1] * rd[1] + ro[2] * rd[2], c = 6.5 * 6.5 - 1.6, disc = b * b - c; if (disc <= 0) continue;   // bounding sphere
      let tt = -b - Math.sqrt(disc), hit = false, px = 0, py = 0, pz = 0;
      for (let i = 0; i < 64; i++) { px = ro[0] + rd[0] * tt; py = ro[1] + rd[1] * tt; pz = ro[2] + rd[2] * tt; const d = sdfMk(px, py, pz); if (d < 0.003) { hit = true; break; } tt += d * 0.95; if (tt > 9) break; }
      if (!hit) continue;
      const e = 0.003, nx = sdfMk(px + e, py, pz) - sdfMk(px - e, py, pz), ny = sdfMk(px, py + e, pz) - sdfMk(px, py - e, pz), nz = sdfMk(px, py, pz + e) - sdfMk(px, py, pz - e), nl = Math.hypot(nx, ny, nz) || 1;
      const ux = nx / nl, uy = ny / nl, uz = nz / nl, dk = Math.max(0, ux * LK[0] + uy * LK[1] + uz * LK[2]), df = Math.max(0, ux * LF[0] + uy * LF[1] + uz * LF[2]);
      const hx = LK[0] - rd[0], hy = LK[1] - rd[1], hz = LK[2] - rd[2], hn = Math.hypot(hx, hy, hz) || 1, spc = Math.pow(Math.max(0, (ux * hx + uy * hy + uz * hz) / hn), 10);
      const k = r * gw + q, v2 = clamp(0.2 + 0.55 * dk + 0.2 * df + 0.32 * spc, 0.12, 1); val[k] = v2; gold[k] = 1;
      chr[k] = MK_GLYPH.charCodeAt(1 + Math.min(MK_GLYPH.length - 2, Math.floor(v2 * (MK_GLYPH.length - 1))));
    }
  }
  function fillTetra(t) {
    val.fill(0); hot.fill(0);
    const yaw = t * 0.00024, pitch = 0.42 + t * 0.00017, roll = Math.sin(t * 0.0001) * 0.3;
    const cy_ = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch), cr = Math.cos(roll), sr = Math.sin(roll);
    // R = Rz(roll)·Rx(pitch)·Ry(yaw); the ray is rotated by R into the shape's frame
    const R = [cy_ * cr + sy * sp * sr, -cy_ * sr + sy * sp * cr, sy * cp, cp * sr, cp * cr, -sp, -sy * cr + cy_ * sp * sr, sy * sr + cy_ * sp * cr, cy_ * cp];
    const rot = (v) => [R[0] * v[0] + R[1] * v[1] + R[2] * v[2], R[3] * v[0] + R[4] * v[1] + R[5] * v[2], R[6] * v[0] + R[7] * v[1] + R[8] * v[2]];
    const ro = rot([0, 0, 7.5]), L = (() => { const l = TITLE_LIGHT(t), n = Math.hypot(...l); return l.map((x) => x / n); })();
    const core = 0.85 + 0.15 * Math.sin(t * 0.0021);
    const scale = side * 0.74, half = scale / 2, cyT = cv.height / 2 - side * 0.13, q0 = Math.max(0, Math.floor((cv.width - scale) / 2 / cw)), q1 = Math.min(gw, Math.ceil((cv.width + scale) / 2 / cw)), r0 = Math.max(0, Math.floor((cyT - half) / fs)), r1 = Math.min(gh, Math.ceil((cyT + half) / fs));   // v1.23.50: smaller and higher, the wordmark under it
    for (let r = r0; r < r1; r++) for (let q = q0; q < q1; q++) {
      const u = ((q + 0.5) * cw - cv.width / 2) / half * 0.42, v = -((r + 0.5) * fs - cyT) / half * 0.42;
      const n0 = Math.hypot(u, v, 1.7), rd = rot([u / n0, v / n0, -1.7 / n0]);
      // bounding sphere of radius 2 round the origin
      const b = ro[0] * rd[0] + ro[1] * rd[1] + ro[2] * rd[2], c = 7.5 * 7.5 - 4, disc = b * b - c; if (disc <= 0) continue;
      let tt = -b - Math.sqrt(disc), hit = false, px = 0, py = 0, pz = 0;
      for (let i = 0; i < 56; i++) { px = ro[0] + rd[0] * tt; py = ro[1] + rd[1] * tt; pz = ro[2] + rd[2] * tt; const d = sdf(px, py, pz); if (d < 0.004) { hit = true; break; } tt += d * 0.9; if (tt > 10) break; }
      if (!hit) continue;
      const e = 0.004, nx = sdf(px + e, py, pz) - sdf(px - e, py, pz), ny = sdf(px, py + e, pz) - sdf(px, py - e, pz), nz = sdf(px, py, pz + e) - sdf(px, py, pz - e), nl = Math.hypot(nx, ny, nz) || 1;
      const k = r * gw + q, dl = Math.hypot(px, py, pz);
      if (dl < RS + 0.03) {                                  // inside the cavity: lit by the core
        // the wall faces the core everywhere, so the glow is graded by how squarely we look into it
        const cd = Math.max(0, -(rd[0] * px + rd[1] * py + rd[2] * pz) / dl);
        val[k] = clamp(0.22 + 0.78 * cd * cd * core, 0, 1); hot[k] = 1;
      } else {
        // a flat face takes one light everywhere, which reads as one repeated character; depth (nearer is brighter)
        // and a broad highlight give each face its gradient
        const ux = nx / nl, uy = ny / nl, uz = nz / nl, dk = Math.max(0, ux * L[0] + uy * L[1] + uz * L[2]);
        const hx = L[0] - rd[0], hy = L[1] - rd[1], hz = L[2] - rd[2], hn = Math.hypot(hx, hy, hz) || 1, sp_ = Math.pow(Math.max(0, (ux * hx + uy * hy + uz * hz) / hn), 12);
        const near = clamp((8.6 - tt) / 3.2, 0, 1);
        const a = TN.map((n) => n[0] * px + n[1] * py + n[2] * pz).sort((x, y) => y - x), edge = a[0] - a[1] < 0.035 ? 0.3 : 0;   // the tetrahedron's edges, drawn bright
        val[k] = clamp(0.05 + 0.42 * dk + 0.3 * sp_ + 0.38 * near * (0.4 + 0.6 * dk) + edge, 0.05, 1);
      }
    }
  }

  // live-v1.23.43 — the matrix of grc-labs.com, as it is there (Yaniv 21.10 09:36: «it really looks better than the
  // matrix we made in Earth; bring that uniformity back»). Ported from grc-labs.com/assets/js/screensaver.js v1.6.11,
  // `rainState`: its character set exactly (katakana, kanji, Hebrew in Frank Ruhl, digits, Greek without π, symbols,
  // the shading ramp), its soft green head and fading trail, its speeds (0.42–1.02 rows a frame at 60 fps, × 0.6, the
  // calm speed of its hold), a column reborn at once just above the top, a curtain that falls in from the top when the
  // screensaver opens. Not ported: the red letters — they are the site's own challenge.
  const KANA = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンﾊﾋﾌﾍﾎ";
  const KANJI = "日月火水木金土山川田力心目耳口手中大小上下天空雨風";
  const HEB_RAIN = "אבגדהוזחטיכךלמםנןסעפףצץקרשת";
  const RAIN_BASE = KANA + KANJI + HEB_RAIN + "0123456789" + "ΣΔΛΦΩΘΞΨμβαλσ" + "#%&<>*+=/¥§∞" + ".,-~:;=!*#$@";
  // live-v1.23.46 (Yaniv, 21.10 11:40: «the leading letter's colour does matter; and Hebrew letters in the matrix's
  // characters matter to me»): the Hebrew letters weigh three times in the pool (about 40% of the rain, was ~18%), in
  // Frank Ruhl, which is loaded before the first frame; the head is a clearly brighter, paler green with a soft glow
  const RAIN_POOL = RAIN_BASE + HEB_RAIN + HEB_RAIN;
  const MONO_RAIN = '"IBM Plex Mono", "Frank Ruhl Libre", "Noto Sans Egyptian Hieroglyphs", monospace';
  // HIERO (Yaniv 12.11 20:55: «can we put Egyptian hieroglyphs into the letters?»): 38 signs — the uniliteral ones,
  // the Egyptian «alphabet» that the first alphabet, and through it the Hebrew one, grew from — plus the ankh, the eye,
  // the scarab, the sun, the djed, the was-sceptre and the feather. About one cell in eleven, chosen by the cell's own
  // hash, so a cell keeps its sign. Noto Sans Egyptian Hieroglyphs, subset to these 38 (9.6 KB), self-hosted. The ten
  // widest signs were left out; the rest are drawn no wider than 1.25 cells (gfill).
  const HIERO = [..."𓄿𓇋𓇌𓅱𓃀𓊪𓅓𓈖𓂋𓉔𓎛𓐍𓄡𓋴𓈎𓎡𓎼𓏏𓍿𓆓𓋹𓂀𓆣𓇳𓊽𓌀𓆄𓈗𓆰𓍯𓊹𓇼𓁹𓂻𓆎𓅃𓃒𓊖"];
  const streamCh = (i, row) => { const h = ((i * 374761393) ^ (row * 668265263)) >>> 0; return (h >>> 21) % 11 === 0 ? HIERO[(h >>> 9) % HIERO.length] : RAIN_POOL.charAt(h % RAIN_POOL.length); };
  const gfill = (ch, x, y, w) => { if (ch.length < 2) return ctx.fillText(ch, x, y); ctx.fillText(ch, x, y, w * 1.25); ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 0.6 * dpr; ctx.strokeText(ch, x, y, w * 1.25); };   // a sign's strokes are finer than a letter's: a thin outline of its own colour evens them
  const anyCh = () => RAIN_POOL.charAt((Math.random() * RAIN_POOL.length) | 0);
  const RAIN_SP = 0.3;   // (Yaniv 23.10 09:39: «slow the matrix's fall further — it gives an interesting calm»; 0.4 in live-v1.23.52)   // live-v1.23.52: with the head gliding the rain can stay slow without stuttering (0.36 in v1.23.51, 0.42 in v1.23.45)   // live-v1.23.45: slower than the site's 0.6 (Yaniv 21.10 11:01); the rest of the rain is the site's
  let rfs = 16, rcw = 12, rrh = 15, rcols = 0, rrows = 0, rTrail = 12, rhead = null, rspd = null;   // rcw / rrh: the rain's column and row steps
  // A figure's two passes ride on the rain's own columns. Per column: 0 not in the figure, 1 waiting for its stream to
  // come over the top of the figure, 2 the stream is passing (line = its head, in px), 3 passed. IN lays the figure
  // down above its line; OUT takes it away above its line — downwards, at the stream's speed.
  const IN = { st: null, line: null }, OUT = { st: null, line: null };
  let figTop = 0, figBot = 0, figL = 0, figR = 0;
  // live-v1.23.48 (Yaniv, 21.10 12:37: «the rain should fall a little denser — it leaves columns empty for a long time»):
  // a column waits for its whole trail to leave before its stream is reborn, so it stood empty for most of a cycle.
  // Now there are more streams than columns: the first `rcols` are one per column (the figures' passes ride on them),
  // and EXTRA more fall in columns chosen afresh at every rebirth — so a column is rarely empty for long.
  const EXTRA = 1.0;
  let rcol = null, nstr = 0;
  function rainSize() {
    rfs = Math.round(clamp(Math.round(cv.width / dpr / 84), 10, 17) * dpr);
    // live-v1.23.52 — back to the site's square cell, one letter per column and per row. The closer grid of v1.23.51
    // overlapped the wide glyphs (katakana, kanji are a full em) and turned the rain muddy; the density comes from the
    // extra streams instead (EXTRA)
    rcw = rfs; rrh = rfs; rcols = Math.ceil(cv.width / rcw); rrows = Math.ceil(cv.height / rrh);
    rTrail = Math.max(12, Math.round(rrows * 0.55)); nstr = rcols + Math.round(rcols * EXTRA);
    rhead = new Float64Array(nstr); rspd = new Float64Array(nstr); rcol = new Int32Array(nstr);
    for (let i = 0; i < nstr; i++) { rcol[i] = i < rcols ? i : (Math.random() * rcols) | 0; rhead[i] = Math.floor(Math.random() * (rrows + rTrail)) - rTrail * 0.5; rspd[i] = 0.42 + Math.random() * 0.6; }
    for (const P of [IN, OUT]) { P.st = new Int8Array(rcols).fill(3); P.line = new Float32Array(rcols).fill(P === IN ? 1e9 : -1); }
    qs = []; QPLANT = new Map(); plantEretz(); litB = new Float32Array(rcols * rrows); litOf = null;
  }
  function rainFill() { for (let i = 0; i < nstr; i++) rhead[i] = -Math.floor(Math.random() * rrows * 0.95); }   // the curtain falls in from the top
  function rainStep(kf) {
    for (let i = rcols; i < nstr; i++) {
      rhead[i] += rspd[i] * RAIN_SP * kf;
      if ((Math.floor(rhead[i]) - rTrail) * rrh > cv.height) { rhead[i] = -(Math.random() * 6); rspd[i] = 0.42 + Math.random() * 0.6; rcol[i] = (Math.random() * rcols) | 0; }
    }
    for (let i = 0; i < rcols; i++) {
      rhead[i] += rspd[i] * RAIN_SP * kf;
      if ((Math.floor(rhead[i]) - rTrail) * rrh > cv.height) { rhead[i] = -(Math.random() * 6); rspd[i] = 0.42 + Math.random() * 0.6; }
      const hp = rhead[i] * rrh;
      for (const P of [IN, OUT]) {
        if (P.st[i] === 1 && hp <= figTop) P.st[i] = 2;
        if (P.st[i] === 2) { if (hp > figBot) { P.st[i] = 3; P.line[i] = 1e9; } else P.line[i] = hp; }
      }
    }
  }
  // a pass begins: every column the figure spans waits for its stream; the rest count as passed
  function passStart(P, full) {
    figL = full ? 0 : Math.max(0, Math.floor((cv.width / 2 - side * 0.72) / rcw)); figR = full ? rcols - 1 : Math.min(rcols - 1, Math.floor((cv.width / 2 + side * 0.72) / rcw));
    figTop = full ? 0 : Math.max(0, cv.height / 2 - side * 0.72); figBot = (full ? cv.height : Math.min(cv.height, cv.height / 2 + side * 0.72)) + rrh * 6;
    for (let i = 0; i < rcols; i++) { const inFig = i >= figL && i <= figR; P.st[i] = inFig ? 1 : 3; P.line[i] = inFig ? -1 : (P === IN ? 1e9 : -1); }
  }
  function passEnd(P) { for (let i = 0; i < rcols; i++) { P.st[i] = 3; P.line[i] = 1e9; } }
  function passFrac(P) { let d = 0; for (let i = figL; i <= figR; i++) if (P.st[i] === 3) d++; return figR >= figL ? d / (figR - figL + 1) : 1; }
  // `I` 0→1 is how strongly the rain shows — all of it between figures, a faint veil behind a settled one
  // live-v1.23.52 (Yaniv, 21.10 15:05: «for some reason the matrix on the main page looks much, much better — see if you
  // can find the differences»). Measured against grc-labs.com's rainState, three differences:
  //  1. its head steps a row every 1.4–2.3 frames (speed 0.6–1); ours, slowed to 0.36, held a cell ~4 frames and then
  //     jumped — a stutter. The head now GLIDES: it is drawn at its exact, fractional place, sliding from one cell into
  //     the next, and the letter it carries is the one that will stay in that cell — so it moves smoothly however slow
  //     the rain is, and the trail it leaves is still the site's fixed letters
  //  2. the site's grid is square, a letter wide; ours was 0.8 — see rainSize
  //  3. the site's head is a normal-weight letter; ours had become bold and drawn twice — heavy. It is normal weight
  //     again, brighter and with a soft glow, so it reads as light rather than ink
  // (Yaniv 23.10 09:39: «in the original matrix the rows are not always fixed, and sometimes they ride over one another —
  // there is an interesting effect in it that may help us with the transitions to the shapes»). Measured on
  // grc-labs.com: its rain is one grid drawn in two frames — the content window and the full screen, whose tops differ
  // by a fraction of a row — and between them it clears the screen only partly (a veil of 0.18), so for a moment the
  // old rows show through the new ones, half a row apart. Here that is the passage into and out of a figure: as a
  // figure begins, the whole rain grid slides half a row down while the screen is only partly cleared, so its rows ride
  // over their own after-images; as the figure leaves, it slides back. Between figures the rows are whole again — the
  // hidden lines need them aligned.
  const G_MS = 1500;
  let gT0 = -1e9, gFrom = 0, gTo = 0;
  const rOffAt = (now) => { const p = clamp((now - gT0) / G_MS, 0, 1), e = p * p * (3 - 2 * p); return gFrom + (gTo - gFrom) * e; };
  const ghostVeil = (now) => { const p = (now - gT0) / G_MS; return p < 0 || p >= 1 ? 1 : 0.16 + 0.84 * p * p; };
  function ghostTo(now, to) { if (Math.abs(to - gTo) < 0.5) return; gFrom = rOffAt(now); gTo = to; gT0 = now; }
  // HORIZONTAL (Yaniv 12.11 20:55: «more horizontal rain like that, but fewer at a time; when a horizontal head meets a
  // falling one, let something happen — the letter held longer, as if the meeting meant something and left a presence»).
  // At most two horizontal streams at once, a new one every 5–13 s, gliding along a row on the rain's own cells, in
  // either direction, at about the falling speed. Where a horizontal head and a falling head share a cell, the letter
  // there is lit: white for a moment with a short cross of light round it, then gold, and it fades over ~12 s.
  const HS = [], MEET = new Map(); let hsNext = 0, hsLast = 0;
  function hrain(I, now) {
    const dt = hsLast ? Math.min(80, now - hsLast) / 16.667 : 1; hsLast = now;
    if (now > hsNext && HS.length < 2 && rcols > 20 && rrows > 8) { const d = Math.random() < 0.5 ? 1 : -1; HS.push({ r: 2 + ((Math.random() * (rrows - 4)) | 0), x: d > 0 ? -1 : rcols, d, v: 0.2 + Math.random() * 0.14, L: 10 + ((Math.random() * 14) | 0) }); hsNext = now + 5000 + Math.random() * 8000; }
    for (let i = HS.length - 1; i >= 0; i--) {
      const s = HS[i]; s.x += s.d * s.v * dt; const hc = Math.floor(s.x), y = s.r * rrh;
      if (s.d > 0 ? hc - s.L > rcols : hc + s.L < 0) { HS.splice(i, 1); continue; }
      ctx.fillStyle = RG.trail;
      for (let t = 1; t < s.L; t++) { const c = hc - s.d * t; if (c < 0 || c >= rcols) continue; ctx.globalAlpha = I * ((1 - t / s.L) * 0.6 + 0.05); gfill(rainCh(c, s.r), c * rcw, y, rcw); }
      if (hc < 0 || hc >= rcols) continue;
      ctx.fillStyle = RG.head; ctx.globalAlpha = Math.max(0.85, I); ctx.shadowColor = "rgba(170,255,140,0.9)"; ctx.shadowBlur = 10 * dpr; gfill(rainCh(hc, s.r), hc * rcw, y, rcw); ctx.shadowBlur = 0;
      for (let k = 0; k < nstr; k++) if (rcol[k] === hc && Math.floor(rhead[k]) - 1 === s.r) { const key = hc * 8192 + s.r; if (!MEET.has(key)) MEET.set(key, now); }
    }
    for (const [key, t0] of MEET) {
      const a = (now - t0) / 1000; if (a > 12) { MEET.delete(key); continue; }
      const c = Math.floor(key / 8192), r = key % 8192, x = c * rcw, y = r * rrh, k = a < 4 ? 1 : 1 - (a - 4) / 8;
      // live-v1.39.33 (Yaniv 15.11 07:56: «להבליט קצת פחות») — no white flash, a smaller glow, a fainter cross that fades sooner
      ctx.shadowColor = "rgba(232,199,116,0.55)"; ctx.shadowBlur = (a < 1.5 ? 7 : 4) * dpr;
      ctx.fillStyle = SHADE[7]; ctx.globalAlpha = k * (0.4 + 0.25 * I); gfill(rainCh(c, r), x, y, rcw);
      if (a < 1.2) { ctx.shadowBlur = 0; ctx.fillStyle = SHADE[7]; ctx.globalAlpha = (1 - a / 1.2) * 0.35; for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) gfill(rainCh(c + dc, r + dr), (c + dc) * rcw, (r + dr) * rrh, rcw); }
    }
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;
  }
  function rain(I) {
    const now = performance.now(), off = rOffAt(now);
    ctx.globalAlpha = ghostVeil(now); ctx.fillStyle = RAIN_BG; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.save(); ctx.translate(0, off);
    ctx.font = "400 " + rfs + "px " + MONO_RAIN; ctx.textBaseline = "top"; ctx.textAlign = "start"; ctx.direction = "ltr";
    ctx.fillStyle = RG.trail;
    for (let k = 0; k < nstr; k++) {
      const h = Math.floor(rhead[k]) - 1, c = rcol[k], x = c * rcw;   // h: the newest fixed cell, just behind the gliding head
      for (let tr = TAIL.length; tr < rTrail; tr++) {
        const y = (h - tr) * rrh; if (y <= -rrh) break; if (y >= cv.height) continue;
        ctx.globalAlpha = I * ((1 - tr / rTrail) * 0.58 + 0.06); gfill(rainCh(c, h - tr), x, y, rcw);
      }
    }
    // a short tail just behind the head (v1.23.47): three letters fading from the head's colour into the trail's
    for (let j = 0; j < TAIL.length; j++) {
      ctx.fillStyle = TAIL[j]; ctx.globalAlpha = I * (0.9 - 0.12 * j);
      for (let k = 0; k < nstr; k++) { const h = Math.floor(rhead[k]) - 1 - j, y = h * rrh; if (y > -rrh && y < cv.height) gfill(rainCh(rcol[k], h), rcol[k] * rcw, y, rcw); }
    }
    ctx.fillStyle = RG.head; ctx.globalAlpha = Math.max(0.85, I); ctx.shadowColor = "rgba(170,255,140,0.9)"; ctx.shadowBlur = 10 * dpr;
    for (let k = 0; k < nstr; k++) { const y = (rhead[k] - 1) * rrh, hr = Math.floor(rhead[k]); if (y > -rrh && y < cv.height) { if (MPLANT && MPLANT.has(rcol[k] * 8192 + hr)) { MGLINT.set(rcol[k] * 8192 + hr, now); continue; } gfill(rainCh(rcol[k], hr), rcol[k] * rcw, y, rcw); } }
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    hrain(I, now);
    // a light gold glint, a second long, where a head has just crossed a letter of the top line — then it is rain again
    if (MPLANT && MGLINT.size) {
      ctx.shadowColor = "rgba(232,199,116,0.7)"; ctx.shadowBlur = 6 * dpr; ctx.fillStyle = SHADE[7];
      for (const [key, t] of MGLINT) { const a = 1 - (now - t) / 1100; if (a <= 0 || !MPLANT.has(key)) { MGLINT.delete(key); continue; } ctx.globalAlpha = 0.85 * a * a; ctx.fillText(MPLANT.get(key), Math.floor(key / 8192) * rcw, (key % 8192) * rrh); }
      ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    }
    quotes(I, now);
    ctx.restore();
  }

  // live-v1.24.6 (Yaniv, 22.10 23:12–23:17: «the matrix's letters never really change, so we can use the letters
  // themselves — write «ארצ» hidden in it, and lines of content and quotes»; «better that we take quotes from Sefer
  // Yetzirah for now»). Two things are now hidden in the rain, both made of its own fixed cells:
  //  1. «ארצ» — a few cells per screen are planted with א, ר, צ one under the other. They fall in the rain's own green,
  //     at its own speed, with nothing to mark them: there for whoever reads the rain
  //  2. a line of Sefer Yetzirah — live-v1.24.7 (Yaniv, 22.10 23:34: «set these sentences in rows, not down a column;
  //     keep the mystery — always put a random matrix character between the letters of the sentences themselves»).
  //     The line is planted in a ROW of the rain's own cells, read right to left, with a matrix glyph (never a Hebrew
  //     letter) between every two of its letters, and three where words part. Nothing writes it: the rain's streams
  //     fall through that row as always, and wherever a head crosses one of its cells the cell catches — it stays,
  //     in a pale gold, after the stream has gone. The line assembles itself out of order, as the rain happens to pass,
  //     holds while it can be read by whoever reads every second letter, and fades back into the rain. A long line
  //     wraps at a word onto a row two below, right-aligned as Hebrew is.
  // The text is the Warsaw 1884 edition (Sefaria, «Sefer Yetzirah, Warsaw 1884»), copied letter for letter; the
  // punctuation is left out. One at a time or two, between figures; each is shown once before any repeats.
  const YETZIRAH = [
    "בשלשים ושתים נתיבות פליאות חכמה",                 // 1:1
    "עשר ספירות בלימה",                                 // 1:3
    "עשר ולא תשע עשר ולא אחת עשרה",                    // 1:4
    "הבן בחכמה וחכם בבינה",                             // 1:4
    "והעמד דבר על בוריו",                               // 1:4
    "עומק ראשית ועומק אחרית",                           // 1:5
    "צפייתן כמראה הבזק",                                // 1:6
    "ודברו בהן ברצוא ושוב",                             // 1:6
    "נעוץ סופן בתחלתן ותחלתן בסופן",                    // 1:7
    "כשלהבת קשורה בגחלת",                               // 1:7
    "בלום פיך מלדבר ולבך מלהרהר",                       // 1:8
    "חקקן חצבן שקלן והמירן צרפן",                       // 2:2
    "אין בטובה למעלה מענג ואין ברעה למטה מנגע",         // 2:4
    "יצר מתהו ממש ועשה אינו ישנו",                      // 2:6
    "שתי אבנים בונות שני בתים",                         // 4:12
    "מה שאין הפה יכול לדבר ואין האוזן יכולה לשמוע",     // 4:12
    "הטוב מבחין את הרע והרע מבחין את הטוב",             // 6:2
  ];
  // earth/saver branch (Yaniv 23.10 00:13: «add one horizontal matrix stream that opens the row the text is in. Don't
  // leave it static with the colour; give it an effect that reveals it only to whoever looks for it there, inside that
  // row. Time it in a very interesting, clever way»). Nothing is lit until the rain itself hands the line over: the line
  // waits, unseen, until a falling head crosses its first cell — and there the head TURNS, and runs along the row, right
  // to left, at a reader's pace. Behind it each cell glows and goes out: the matrix glyphs between the letters within a
  // second, the letters themselves a little slower — so for a moment, just behind the head, the words stand out of the
  // noise, and only for whoever is following it. It slows at each gap between words, as an eye does. At the end of a row
  // it waits for the next head to cross the next row's first cell (a breath, as when turning a line) — or goes on by
  // itself after a moment. Nothing stays: when the last letter has gone out, the line is rain again.
  const Q_HEAD = [236, 255, 214], Q_GLOW = [214, 236, 170], Q_HSP = 0.3, Q_WAIT = 2400, Q_LET = 2600, Q_FIL = 1000, Q_EVERY = [6000, 9000];
  const Q_FILL = RAIN_BASE.replace(/[א-ת]/g, "");   // the glyphs between the letters: the matrix's, never Hebrew
  let PLANT = new Map(), QPLANT = new Map(), qs = [], qDeck = [], qNext = 0;
  let MPLANT = null; const MGLINT = new Map();   // live-v1.38.16: the menorah's top line in the rain, and when a head last crossed each letter
  const rainCh = (c, r) => (MPLANT && MPLANT.get(c * 8192 + r)) || PLANT.get(c * 8192 + r) || QPLANT.get(c * 8192 + r) || streamCh(c, r);
  function plantEretz() {
    PLANT = new Map(); if (rrows < 10) return;
    const n = Math.max(2, Math.round(rcols / 40));
    for (let i = 0; i < n; i++) { const c = (Math.random() * rcols) | 0, r = 2 + ((Math.random() * (rrows - 6)) | 0); ["א", "ר", "צ"].forEach((ch, j) => PLANT.set(c * 8192 + r + j, ch)); }
  }
  // lay a line out in rows, right to left: letter, glyph, letter …; a space is three glyphs; a row holds at most `run`
  // cells and breaks at a word onto the row two below, starting again at the right (c0)
  function qLayout(text, c0, r0, run, seed) {
    const cells = [], fill = (c, r) => Q_FILL.charAt((((c * 2654435761) ^ (r * 40503) ^ (seed | 0)) >>> 0) % Q_FILL.length);
    let c = c0, r = r0;
    text.split(" ").forEach((w, wi) => {
      const need = 2 * w.length - 1 + (wi ? 3 : 0);
      if (wi && c0 - c + need > run) { r += 2; c = c0; } else if (wi) { for (let k = 0; k < 3; k++) { cells.push({ c, r, ch: fill(c, r), q: false, g: true }); c--; } }
      for (let i = 0; i < w.length; i++) { if (i) { cells.push({ c, r, ch: fill(c, r), q: false }); c--; } cells.push({ c, r, ch: w[i], q: true }); c--; }
    });
    return cells;
  }
  // live (earth/saver branch, Yaniv 22.10 23:43–23:51: «not one fixed coded sentence — whole paragraphs, changing now and
  // then or on every refresh»; «take the sentence "מהו האחד?", and quotes from ספר ההר — the loyalty to the land, the
  // water, nature and the animals»). The lines now come from /saver-art.json, fetched the first time the screensaver
  // starts: whole mishnayot of Sefer Yetzirah (each checked against Sefaria's Warsaw 1884 text) and passages of ספר ההר
  // in its author's spelling. A fresh shuffle every time the page loads; none repeats until all have been shown. A
  // paragraph is shown alone and held for as long as it takes to read; «מהו האחד?» is always followed by its answer,
  // 1:7 — «…שאדון יחיד ואין לו שני ולפני אחד מה אתה סופר». Until the file arrives (or if it never does) the short
  // lines above are used.
  const Q_OK = /^[\u05D0-\u05EA\u05F3 ?]{2,240}$/;   // \u05F3 «׳», as in «ה׳»
  let qTexts = YETZIRAH.map((t) => ({ src: "ספר יצירה", t })), qThen = "", ART = null, artP = null;
  function loadArt() {
    if (artP) return artP;
    artP = fetch(cv.dataset.art || "/saver-art.json", { credentials: "omit" }).then((r) => (r.ok ? r.json() : null)).then((j) => {
      if (!j || !Array.isArray(j.texts)) return;
      const t = j.texts.filter((x) => x && typeof x.t === "string" && Q_OK.test(x.t)); if (t.length) { qTexts = t; qDeck = []; }
      ART = Array.isArray(j.art) ? j.art.filter((a) => a && a.w > 0 && a.h > 0 && typeof a.d === "string" && a.d.length === a.w * a.h && /^[0-9a-f]+$/.test(a.d)) : [];
    }).catch(() => {});
    return artP;
  }
  const qLong = (t) => t.length > 60;
  function qSpawn(now) {
    if (!qDeck.length) { qDeck = qTexts.map((_, i) => i); for (let i = qDeck.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [qDeck[i], qDeck[j]] = [qDeck[j], qDeck[i]]; } }
    const forced = qThen ? qTexts.findIndex((x) => x.src === qThen) : -1, pick = forced >= 0 ? forced : qDeck[qDeck.length - 1];
    const entry = qTexts[pick], text = entry.t, run = Math.min(rcols - 4, 64);
    if (rcols < 24 || rrows < 12) return false;
    if (qLong(text) && qs.length) return false;   // a paragraph is shown alone
    if (qs.some((q) => q.long)) return false;
    for (let t = 0; t < 12; t++) {
      const probe = qLayout(text, 0, 0, run, 0), wide = -Math.min(...probe.map((x) => x.c)), tall = Math.max(...probe.map((x) => x.r));
      const c0 = wide + 1 + ((Math.random() * Math.max(1, rcols - wide - 3)) | 0), r0 = 2 + ((Math.random() * Math.max(1, rrows - tall - 5)) | 0);
      if (c0 >= rcols - 1 || r0 + tall >= rrows - 2) continue;
      if (qs.some((q) => r0 <= q.r1 + 3 && r0 + tall >= q.r0 - 3)) continue;
      const cells = qLayout(text, c0, r0, run, (Math.random() * 1e9) | 0), at = new Map();
      for (const x of cells) x.t = 0;
      const rows = []; for (const x of cells) { const row = rows.find((w) => w[0].r === x.r); if (row) row.push(x); else rows.push([x]); }
      if (forced >= 0) { qThen = ""; const k = qDeck.indexOf(forced); if (k >= 0) qDeck.splice(k, 1); } else qDeck.pop();
      const n = cells.filter((x) => x.q).length;
      qs.push({ cells, rows, ri: 0, x: 0, go: false, wait: now, r0, r1: r0 + tall, done: 0, n, long: qLong(text), then: entry.then || "" }); return true;
    }
    if (forced < 0) qDeck.pop();   // it does not fit this screen: skip it rather than try it forever
    return false;
  }
  function quoteStep(now, kf, spawn) {
    if (spawn && now >= qNext) { if (qs.length < 2) qSpawn(now); qNext = now + Q_EVERY[0] + Math.random() * (Q_EVERY[1] - Q_EVERY[0]); }
    for (const q of qs) {
      if (q.done) continue;
      const row = q.rows[q.ri];
      if (!q.go) {   // the hand-over: a falling head crosses the row's first cell (or the line goes on by itself)
        const c0 = row[0].c, r = row[0].r;
        for (let k = 0; k < nstr && !q.go; k++) { const h = Math.floor(rhead[k]); if (rcol[k] === c0 && (h === r || h === r + 1)) q.go = true; }
        if (q.go || now - q.wait > Q_WAIT) { q.go = true; q.x = 0; }
        continue;
      }
      const cur = row[Math.min(row.length - 1, Math.floor(q.x))];
      q.x += Q_HSP * kf * (cur && cur.g ? 0.45 : 1);   // it slows between words
      // each cell it passes lights — and from then on the rain carries that cell's letter, so nothing changes under the eye
      for (let j = 0; j < Math.min(row.length, Math.floor(q.x)); j++) { const x = row[j]; if (!x.t) { x.t = now; QPLANT.set(x.c * 8192 + x.r, x.ch); } }
      if (q.x >= row.length) { q.ri++; q.go = false; q.wait = now; if (q.ri >= q.rows.length) q.done = now; }
    }
    const gone = (q) => q.done && now - q.done > Q_LET + 400;
    for (const q of qs) if (gone(q)) { for (const x of q.cells) QPLANT.delete(x.c * 8192 + x.r); if (q.then) { qThen = q.then; qNext = Math.min(qNext, now + 1500); } }
    qs = qs.filter((q) => !gone(q));
  }
  function quotes(I, now) {
    if (!qs.length) return;
    ctx.font = "400 " + rfs + "px " + MONO_RAIN; ctx.textBaseline = "top"; ctx.textAlign = "start"; ctx.direction = "ltr";
    const A = Math.max(0.6, I);
    for (const q of qs) {
      for (const x of q.cells) {
        if (!x.t) continue;
        const age = now - x.t, life = x.q ? Q_LET : Q_FIL; if (age >= life) continue;
        const k = 1 - age / life, f = Math.min(1, age / 500);   // the head's colour for a moment, then the glow, going out into the trail's green
        const col = f < 1 ? Q_HEAD.map((v, i) => Math.round(v + (Q_GLOW[i] - v) * f)) : Q_GLOW.map((v, i) => Math.round(v + (RG_TRAIL[i] - v) * (1 - k)));
        ctx.fillStyle = `rgb(${col})`; ctx.globalAlpha = A * k * (x.q ? 0.95 : 0.6);
        ctx.fillText(x.ch, x.c * rcw, x.r * rrh);
      }
      if (q.go && !q.done) {   // the horizontal head glides, as the falling ones do, carrying the letter it will leave
        const row = q.rows[q.ri], pos = q.x, cell = row[Math.min(row.length - 1, Math.floor(pos))];
        ctx.fillStyle = RG.head; ctx.globalAlpha = A; ctx.shadowColor = "rgba(170,255,140,0.9)"; ctx.shadowBlur = 10 * dpr;
        ctx.fillText(cell.ch, (row[0].c - pos) * rcw, row[0].r * rrh); ctx.shadowBlur = 0;
      }
    }
    ctx.globalAlpha = 1;
  }


  // live-v1.23.43 — one logic for colour, in and out (Yaniv 21.10: «find a logic in the passage of colours between the
  // shapes and the matrix»). Everything comes from the rain: a cell of a figure appears just behind a falling head, in
  // the rain's green, and cools over COOL into its own gold or blue. Leaving, the next head turns each cell back into
  // rain — a green glyph that fades within a few rows above the head — so the figure is taken away downwards, in step
  // with the matrix. A figure that grows (`grow`) is born the same way wherever its rule adds a cell.
  const COOL = 650;
  // live-v1.23.50 (Yaniv 21.10 13:14: «if the leading letter's colour could match the colour of the letter it reveals in
  // the shape itself, it would add to the motion and the smooth flow»): over a figure, the head that lays a cell down is
  // that cell's own colour, lightened — so the stream turns gold over gold and blue over blue as it writes
  const GOLDS = ["#3a2410", "#5a3818", "#7f5320", "#a8752a", "#c99634", "#e2b84a", "#f4d77a", "#fff1c2"];   // bronze → pale gold
  const GOLD_HEADS = GOLDS.map((g) => { const m = mix(hex(g), [255, 255, 255], 0.45); return `rgb(${m[0]},${m[1]},${m[2]})`; });
  const HEADS = SHADE.map((sc) => { const c = sc.match(/\d+/g).map(Number), m = mix(c, [255, 255, 255], 0.45); return `rgb(${m[0]},${m[1]},${m[2]})`; });
  const MIXT = SHADE.map((sc) => { const c = sc.match(/\d+/g).map(Number), h = mix(c, [255, 255, 255], 0.45); return Array.from({ length: 6 }, (_, j) => { const m = mix(h, c, j / 5); return `rgb(${m[0]},${m[1]},${m[2]})`; }); });
  // live-v1.23.49 — ASCII art at its own character size, under the same rule as every figure: a cell appears behind its
  // column's stream in the rain's green and cools into its colour (the dense strokes gold, the rest blue), and leaves
  // the same way, downwards
  const ART_D = " .:-=+*#%@";
  // live (earth/saver branch, Yaniv 22.10 23:34: «make, out of the matrix, a delicate ASCII of the tetrahedron moving
  // inside the matrix itself»; 23:51: «ספר ההר has pictures that could perhaps be broken into interesting ASCII here»).
  // A LIT scene is not drawn over the rain: it is the rain. Every cell of the rain already holds its own fixed letter;
  // a lit scene is a light that falls on those letters — a photograph from ספר ההר, or our tetrahedron turning and
  // drifting — and each letter glows as bright as the light on it. No letter is changed. The light is laid down where
  // the streams pass (the figures' IN pass) and taken away the same way (OUT); the streams keep falling through it.
  const LIT_PAL = { rain: [[22, 52, 20], [104, 190, 78], [236, 242, 196]], gold: [[44, 28, 10], [196, 148, 58], [255, 241, 196]], ember: [[44, 14, 8], [214, 98, 34], [255, 228, 160]] };
  const LIT_RAMP = {}; for (const k in LIT_PAL) { const [a, m, b] = LIT_PAL[k]; LIT_RAMP[k] = Array.from({ length: 24 }, (_, i) => { const v = i / 23, p = v < 0.5 ? a : m, q = v < 0.5 ? m : b, f = v < 0.5 ? v * 2 : v * 2 - 1; return `rgb(${p.map((x, j) => Math.round(x + (q[j] - x) * f))})`; }); }
  let litB = null, litOf = null;
  function litImage(a) {   // the picture, fitted to the screen in whole rain cells, sampled bilinearly
    litB.fill(0);
    let Hc = Math.floor(rrows * 0.88), Wc = Math.round(Hc * a.w / a.h);
    if (Wc > rcols * 0.94) { Wc = Math.floor(rcols * 0.94); Hc = Math.round(Wc * a.h / a.w); }
    const c0 = Math.floor((rcols - Wc) / 2), r0 = Math.floor((rrows - Hc) / 2), at = (x, y) => parseInt(a.d.charAt(y * a.w + x), 16) / 15;
    for (let r = 0; r < Hc; r++) for (let c = 0; c < Wc; c++) {
      const u = clamp((c + 0.5) / Wc * a.w - 0.5, 0, a.w - 1), v = clamp((r + 0.5) / Hc * a.h - 0.5, 0, a.h - 1), x0 = Math.floor(u), y0 = Math.floor(v), x1 = Math.min(a.w - 1, x0 + 1), y1 = Math.min(a.h - 1, y0 + 1), fx = u - x0, fy = v - y0;
      const b = (at(x0, y0) * (1 - fx) + at(x1, y0) * fx) * (1 - fy) + (at(x0, y1) * (1 - fx) + at(x1, y1) * fx) * fy;
      const rr = r0 + r, cc = c0 + c; if (rr >= 0 && rr < rrows && cc >= 0 && cc < rcols) litB[rr * rcols + cc] = b;
    }
  }
  // the tetrahedron, ray-cast cell by cell: the face a cell's ray enters lights it (Lambert), and where two faces meet
  // — the ray enters both almost at once — or where the ray only grazes the solid, the edge is drawn brighter
  const TET_N = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]].map((v) => v.map((x) => -x / Math.sqrt(3))), TET_H = 1 / 3;
  const TET_L = (() => { const l = [-0.45, -0.55, -0.7], m = Math.hypot(...l); return l.map((x) => x / m); })();
  function litTetra(now) {
    litB.fill(0);
    // as large as the screen allows (a phone is tall and narrow), and it drifts only as far as it stays whole
    const R = Math.min(rrows * 0.46, rcols * 0.44), dx = Math.max(0, rcols / 2 - R) * 0.8, dy = Math.max(0, rrows / 2 - R) * 0.6;
    const cx = rcols / 2 + dx * Math.sin(now * 0.00009), cy = rrows / 2 + dy * Math.sin(now * 0.00013 + 1);
    const ya = now * 0.00021, pa = 0.55 + 0.35 * Math.sin(now * 0.00011), cy1 = Math.cos(ya), sy1 = Math.sin(ya), cp = Math.cos(pa), sp = Math.sin(pa);
    const N = TET_N.map(([x, y, z]) => { const x1 = x * cy1 + z * sy1, z1 = -x * sy1 + z * cy1; return [x1, y * cp - z1 * sp, y * sp + z1 * cp]; });
    const c0 = Math.max(0, Math.floor(cx - R)), c1 = Math.min(rcols - 1, Math.ceil(cx + R)), r0 = Math.max(0, Math.floor(cy - R)), r1 = Math.min(rrows - 1, Math.ceil(cy + R));
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
      const x = (c + 0.5 - cx) / R, y = (r + 0.5 - cy) / R;
      let tin = -1e9, tin2 = -1e9, fin = -1, fin2 = -1, tout = 1e9, fout = -1, miss = false;
      for (let i = 0; i < 4; i++) {
        const n = N[i], nz = n[2], num = TET_H - (n[0] * x + n[1] * y - 3 * nz);
        if (Math.abs(nz) < 1e-9) { if (num < 0) { miss = true; break; } continue; }
        const t = num / nz;
        if (nz < 0) { if (t > tin) { tin2 = tin; fin2 = fin; tin = t; fin = i; } else if (t > tin2) { tin2 = t; fin2 = i; } } else if (t < tout) { tout = t; fout = i; }
      }
      if (miss || fin < 0 || tin > tout) continue;
      const n = N[fin]; let b = 0.1 + 0.34 * Math.max(0, n[0] * TET_L[0] + n[1] * TET_L[1] + n[2] * TET_L[2]);
      // how far, on the screen, this cell is from the edge where its face meets the next one (or the outline): the gap in
      // t over how fast that gap grows across the screen. Within about a cell, the edge is lit
      const gap = (j, dt) => { const m = N[j]; const gx = -n[0] / n[2] + m[0] / m[2], gy = -n[1] / n[2] + m[1] / m[2]; return dt / Math.max(1e-6, Math.hypot(gx, gy)) * R; };
      if (fin2 >= 0) { const d = gap(fin2, tin - tin2); if (d < 1.2) b = Math.max(b, 0.74 - d * 0.2); }
      if (fout >= 0) { const d = gap(fout, tout - tin); if (d < 1.0) b = Math.max(b, 0.52 - d * 0.2); }
      litB[r * rcols + c] = b;
    }
  }
  function drawLit(now, pal) {
    const ramp = LIT_RAMP[pal] || LIT_RAMP.rain, band = rrh * 6, near = rrh * 3;
    ctx.save(); ctx.translate(0, rOffAt(now));   // on the rain's own grid, wherever the grid is
    ctx.font = "400 " + rfs + "px " + MONO_RAIN; ctx.textBaseline = "top"; ctx.textAlign = "start"; ctx.direction = "ltr";
    for (let r = 0; r < rrows; r++) {
      const y = r * rrh;
      for (let c = 0; c < rcols; c++) {
        const b = litB[r * rcols + c]; if (b < 0.08) continue;
        const Lin = IN.line[c]; if (y >= Lin) continue;
        let k = 1; const Lout = OUT.line[c]; if (y < Lout) { const d = Lout - y; if (d >= band) continue; k = 1 - d / band; }
        const dh = Lin < 1e8 ? Lin - y : 1e9;
        ctx.fillStyle = dh < near ? RG.head : ramp[Math.min(23, Math.floor(b * 24))];   // laid down just behind a head, it is the head's colour first
        ctx.globalAlpha = k * Math.min(1, b * 1.15); gfill(rainCh(c, r), c * rcw, y, rcw);   // dark is absent, not dim
      }
    }
    ctx.globalAlpha = 1; ctx.restore();
  }
  function drawArt(now, art, txt) {
    const ah = art.length, aw = Math.max(...art.map((l) => l.length)), afs = Math.max(3 * dpr, Math.floor(Math.min(cv.height * 0.9 / ah, cv.width * 0.92 / (aw * 0.6))))   /* live-v1.39.37: the whole menorah is 137 rows — let it fit */, acw = afs * 0.6;
    const x0 = Math.round((cv.width - aw * acw) / 2), y0 = Math.round((cv.height - ah * afs) / 2), band = rrh * 5, coolPx = rrh * 4;
    ctx.font = afs + "px " + MONO; ctx.textBaseline = "top"; ctx.textAlign = "start"; ctx.direction = "ltr";
    let cur = ""; const style = (s) => { if (s !== cur) { ctx.fillStyle = s; cur = s; } };
    ctx.fillStyle = RAIN_BG;   // as in drawField: each laid character clears its place, in front of the rain
    for (let r = 0; r < ah; r++) { const line = art[r], y = y0 + r * afs; for (let c = 0; c < line.length; c++) { if (line.charAt(c) === " ") continue; const x = x0 + c * acw, i = clamp(Math.floor((x + acw / 2) / rcw), 0, rcols - 1); if (y < IN.line[i] && y >= OUT.line[i]) ctx.fillRect(x, y, acw, afs); } }
    for (let r = 0; r < ah; r++) { const line = art[r], y = y0 + r * afs;
      for (let c = 0; c < line.length; c++) { const ch = line.charAt(c); if (ch === " ") continue; const di = ART_D.indexOf(ch) < 0 ? 8 : ART_D.indexOf(ch);   // an outline glyph (| / \ _) is the brightest
        const x = x0 + c * acw, i = clamp(Math.floor((x + acw / 2) / rcw), 0, rcols - 1), Lin = IN.line[i], Lout = OUT.line[i];
        if (y >= Lin) continue;
        const tx = txt && txt[r] && txt[r][c];   // a letter of the psalm, in the shade of the character it replaces
        if (y < Lout) { const d = Lout - y; if (d >= band) continue; ctx.globalAlpha = (1 - d / band) * 0.75; style(RG.trail); gfill(tx || streamCh(c, r), x, y, acw); ctx.globalAlpha = 1; continue; }
        const k = Lin > 1e8 ? 1 : (Lin - y) / coolPx;
        const s = di >= 7 ? 7 : Math.min(6, 1 + di);
        if (k < 0.12) { style(HEADS[s]); ctx.fillText(anyCh(), x, y); continue; }
        style(k >= 1 ? SHADE[s] : MIXT[s][Math.min(5, Math.floor(k * 6))]); ctx.fillText(tx || ch, x, y);
      } }
    // the top line «למנצח בנגינת מזמור שיר» is not drawn here: it is planted in the rain, one letter a rain cell, a piece over
    // each cup, right to left — seen only where a stream flows through it, and as a head crosses a letter it glints gold
    if (txt && txt.pieces) {
      const key = x0 + ":" + y0 + ":" + rcw;
      if (!MPLANT || MPLANT.key !== key) {
        MPLANT = new Map(); MPLANT.key = key; const r0 = Math.max(0, Math.floor(y0 / rrh) - 2);
        for (const p of txt.pieces) { const ci = Math.floor((x0 + (p.c + 0.5) * acw) / rcw), n = p.t.length; for (let k = 0; k < n; k++) MPLANT.set((ci + Math.floor(n / 2) - k) * 8192 + r0, p.t[k]); }
      }
    }
  }
  // live-v1.23.50 — «© GRC Labs · all rights reserved» under the wordmark, opened with the main site's decrypt effect
  // (grc-labs.com/assets/js/decrypt.js: every 28 ms the letters not yet reached are random; one more is fixed every three
  // frames). It decrypts once the figure is in, and scrambles away from its end when the figure starts to leave. Random
  // letters are drawn from the run's own script, so the Hebrew and the Latin each keep their direction while scrambled.
  const DEC_LA = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&/<>*+", DEC_HE = "אבגדהוזחטיכלמנסעפצקרשת";
  const RIGHTS = "כל הזכויות שמורות · \u2066© " + new Date().getFullYear() + " GRC Labs\u2069";   // the Latin run isolated (LRI…PDI), so it reads «© 2026 GRC Labs» inside the Hebrew line
  // live-v1.23.53 (Yaniv, 21.10 20:18: «add the same effect to GRC Labs too, and let this whole screen appear complete —
  // the tetrahedron logo, GRC Labs and all rights reserved. It is an important slide»): the tetrahedron's scene is the
  // title slide. The tetrahedron comes in with the rain; then «GRC Labs» decrypts under it, in the site's Space Grotesk,
  // and the rights line decrypts after it; the three stand together, whole, for TITLE_MS; leaving, both lines scramble
  // away from their ends and fade while the rain takes the tetrahedron. The rain-laid ASCII wordmark is replaced.
  const TITLE_MS = 9000;
  function decrypt(str, k) {
    let out = "";
    for (let i = 0; i < str.length; i++) { const ch = str[i]; if (ch === " " || ch === "\u2066" || ch === "\u2069" || ch === "·" || i < k) { out += ch; continue; } const set = /[\u05D0-\u05EA]/.test(ch) ? DEC_HE : DEC_LA; out += set[(Math.random() * set.length) | 0]; }
    return out;
  }
  // (Yaniv 23.10 09:39: «on the GRC slide, "all rights reserved" must also match the rest of the slide»): the line is set
  // in the slide's own terms — the relief's monospace face, one glyph to a cell on the relief's grid, in the study's
  // palette — and still decrypts as on grc-labs.com. The Latin run is laid out left to right inside the Hebrew line.
  function rights(now) {
    if (ph === "in") return;
    const f = ph === "hold" ? (now - pt0) / 28 : 1e9, B = logoBox();
    const yr = String(new Date().getFullYear()), heRun = NO_WORDS ? "" : "כל הזכויות שמורות", laRun = "© " + yr + " GRC Labs" + (NO_WORDS ? " · All rights reserved" : "");
    // visual order, left to right: the Latin run, the separator, then the Hebrew run reversed (it reads right to left).
    // live-v1.42.4 (Yaniv 20.11 12:59) — on the GRC slide the screensaver's version leads it, read from the page's own mark
    const vr = SCENES[si] && SCENES[si].ver ? VERSION : "";
    const cells = [...(vr ? [...vr, " ", "·", " "] : []), ...laRun, ...(heRun ? [" ", "·", " ", ...[...heRun].reverse()] : [])], nR = cells.length;
    const kR = Math.min(nR, Math.max(0, Math.floor((f - 50) / 3)));
    if (f <= 50) return;
    const cs = B.tz, cw = cs * 0.62, x0 = Math.round(cv.width / 2 - nR * cw / 2), y = B.ry;   // under the line, as small as it
    ctx.font = "400 " + cs + "px " + MONO_RAIN; ctx.textBaseline = "alphabetic"; ctx.textAlign = "center"; ctx.direction = "ltr";
    // it decrypts from its reading start — the right end — as the Hebrew is read; the Latin last
    for (let i = 0; i < nR; i++) {
      const ch = cells[i], j = nR - 1 - i; if (ch === " ") continue;
      const fixed = j < kR, set = /[\u05D0-\u05EA]/.test(ch) ? DEC_HE : DEC_LA, glyph = fixed || ch === "·" ? ch : set[(Math.random() * set.length) | 0];
      ctx.fillStyle = MUTED; ctx.globalAlpha = fixed ? 1 : 0.5;   // the site's muted grey for its small print
      ctx.fillText(glyph, x0 + i * cw + cw / 2, y);
    }
    ctx.textAlign = "start"; ctx.globalAlpha = 1;
  }

  function drawField(now, grow) {
    const x0 = Math.round((cv.width - gw * cw) / 2), y0 = Math.round((cv.height - gh * fs) / 2), n = RAMP.length - 1, band = rrh * 5, coolPx = rrh * 4;
    ctx.font = fs + "px " + MONO_RAIN; ctx.textBaseline = "top"; ctx.textAlign = "start"; ctx.direction = "ltr";
    let cur = "";
    const style = (s) => { if (s !== cur) { ctx.fillStyle = s; cur = s; } };
    // live-v1.23.51 — the rain flows on behind the figure (VEIL), so each laid cell first clears its own place: the
    // figure stands in front of the rain, the rain is seen around and between its strokes
    ctx.fillStyle = RAIN_BG;
    for (let q = 0; q < gw; q++) {
      const x = x0 + q * cw, i = clamp(Math.floor((x + cw / 2) / rcw), 0, rcols - 1), Lin = IN.line[i], Lout = OUT.line[i];
      for (let r = 0; r < gh; r++) { const y = y0 + r * fs; if (val[r * gw + q] > 0.02 && y < Lin && y >= Lout) ctx.fillRect(x, y, cw, fs); }
    }
    for (let q = 0; q < gw; q++) {
      const x = x0 + q * cw, i = clamp(Math.floor((x + cw / 2) / rcw), 0, rcols - 1), Lin = IN.line[i], Lout = OUT.line[i];
      for (let r = 0; r < gh; r++) {
        const k = r * gw + q, v = val[k]; if (v <= 0.02) continue;
        const y = y0 + r * fs;
        if (y >= Lin) continue;                                            // its stream has not come yet
        if (y < Lout) {                                                    // taken away: rain for a few rows, then nothing
          const d = Lout - y; if (d >= band) continue;
          ctx.globalAlpha = (1 - d / band) * 0.75; style(RG.trail); gfill(streamCh(q, r), x, y, cw); ctx.globalAlpha = 1; continue;
        }
        // how far the cell has cooled: by time since it was born (a growing figure), or by its distance behind the
        // head (any other figure — a turning figure's edge is not re-born every frame)
        let c;
        if (grow) { if (!born[k]) born[k] = now; c = (now - born[k]) / COOL; }
        else c = Lin > 1e8 ? 1 : (Lin - y) / coolPx;
        const s = hot[k] ? 7 : Math.min(6, Math.floor(v * 7.2)), ch = chr[k] ? String.fromCharCode(chr[k]) : RAMP.charAt(1 + Math.min(n - 1, Math.floor(v * n)));
        if (gold[k]) { const g = Math.min(7, Math.floor(v * 8)); style(c < 0.12 ? GOLD_HEADS[g] : GOLDS[g]); ctx.fillText(c < 0.12 ? anyCh() : ch, x, y); continue; }   // the Merkaba's own metal
        if (c < 0.12) { style(HEADS[s]); ctx.fillText(anyCh(), x, y); continue; }   // the head, lit in the colour it is about to leave behind
        style(c >= 1 ? SHADE[s] : MIXT[s][Math.min(5, Math.floor(c * 6))]);
        ctx.fillText(ch, x, y);
      }
    }
  }

  // the rain curtain first, as on live; the tetrahedron opens, over the globe it has just orbited as the moon; then a
  // figure that grows from a rule and a figure that is drawn, by turns; the matrix flows between every two (RAIN_MS);
  // a fractal field after every eighth; the torus last
  // live-v1.23.47 — a random order (Yaniv 21.10 12:09: «in some random way»): every cycle shuffles the rule figures, the
  // drawn ones and the site's together; the tetrahedron and the GRC·LABS wordmark open, the wordmark returns after every
  // sixth figure, a fractal field after every eighth, the torus closes. `#saver=N` fixes the shuffle, so N names a scene.
  const RAIN = { kind: "rain", dur: RAIN_MS };
  // the lit scenes: our tetrahedron twice (it is the brand), and the photographs of ספר ההר (they wait for the file)
  // (Yaniv 23.10 09:39: «the triangle that lights out of the matrix is too bright and not really clear — remove it, or
  // reduce both its light and its exposure»): once a cycle, 12 s, its faces dim and its edges carrying the shape
  const LITS = [{ kind: "lit", tetra: true, pal: "gold", hold: 12000, veil: 0.55, name: "הטטרהדר בתוך הגשם" },
    ...[0, 1, 2, 3].map((ai) => ({ kind: "lit", ai, hold: 9000, veil: 0.2, name: "תמונה מספר ההר" }))];
  function buildScenes(seed) {
    const r = xs(seed), figs = [...LOGIC.map((s) => ({ kind: "points", s, grow: true })), ...SHAPES.map((s) => ({ kind: "points", s })), ...SITE.map((f) => ({ kind: "site", f })), ...LITS, { kind: "demo", name: "דמו" }];
    for (let i = figs.length - 1; i > 0; i--) { const j = r() % (i + 1); [figs[i], figs[j]] = [figs[j], figs[i]]; }
    // live-v1.42.7 — on grc-labs.com the GRC slide carries no Hebrew words (Yaniv 20.11 14:34): its canvas says data-words="off"
    const out = [{ kind: "rain", dur: 12000 }, { kind: "tetra", name: "הטטרהדר שלנו", about: !NO_WORDS, ver: true }];   // live-v1.39.6 — the words live in the GRC slide, once a cycle
    figs.forEach((f, i) => { out.push(RAIN, f); if (i % 8 === 3) out.push(RAIN, { kind: "field", f: FIELDS[(i >> 3) % FIELDS.length] }); if (i % 10 === 9) out.push(RAIN, { kind: "tetra", name: "הטטרהדר שלנו" }); });
    out.push(RAIN, { kind: "torus", name: "טורוס" }, RAIN);
    return out;
  }
  let SCENES = buildScenes((Math.random() * 1e9) >>> 0);

  let on = false, raf = 0, si = 0, t0 = 0, last = 0, idle = 0, ph = "", pt0 = 0, fno = 0, stride = 1;
  function enter(now) {
    const S = SCENES[si]; if (S.kind === "lit" && !S.tetra && !(ART && ART[S.ai])) { si = (si + 1) % SCENES.length; return enter(now); }   // a picture that has not arrived is skipped
    t0 = pt0 = now; ph = SCENES[si].kind === "rain" ? "" : "in"; fno = 0;
    if (!ph) qNext = Math.max(qNext, now + 2500);
    if (SCENES[si].kind === "tetra") { titleN++; study = STUDIES[titleN % STUDIES.length]; }
    { const want = SCENES[si].kind === "tetra" && !markGL() ? 0.62 : 1; if (want !== gridScale) regrid(want); }   // the ASCII title tetrahedron, finer; the WebGL mark needs no grid
    ghostTo(now, ph && SCENES[si].kind !== "tetra" ? Math.round(rrh / 2) : 0);   // into a figure the rows slide half a row; between figures they are whole
    if (ph) { passStart(IN, SCENES[si].kind === "field" || SCENES[si].kind === "lit" || SCENES[si].kind === "demo"); passEnd(OUT); for (let i = 0; i < rcols; i++) OUT.line[i] = -1; born.fill(0); val.fill(0); hot.fill(0); chr.fill(0); gold.fill(0); fno = 0; const f = SCENES[si].f; if (f && f.kind === "mol") f.m = null; }
  }
  function next(now) { si = (si + 1) % SCENES.length; if (si === 0) SCENES = buildScenes((Math.random() * 1e9) >>> 0); enter(now); }
  function compute(sc, now, tt) {
    if (sc.kind === "points") fillPoints(sc.s, now, sc.grow ? clamp(tt / GROW_MS, 0.02, 1) : Math.min(1, 0.3 + 0.7 * tt / DRAW_MS));
    else if (sc.kind === "site") sc.f.fill(now);
    else if (sc.kind === "field") fillField(sc.f, tt); else if (sc.kind === "demo") fillDemo(sc, tt); else if (sc.kind === "tetra") fillTetra(now);
    else if (sc.kind === "lit") { if (sc.tetra) litTetra(now); else if (litOf !== sc) { litImage(ART[sc.ai]); litOf = sc; } } else fillTorus(now);
  }
  function frame(now) {
    if (!on) return;
    raf = requestAnimationFrame(frame);
    const kf = Math.min(80, now - last) / 16.667; last = now;   // the rain moves by real time, as on grc-labs.com
    const sc = SCENES[si], tt = now - t0;
    if (sc.kind === "tetra") { titleFrame(now, kf, tt); return; }
    if (!ph) { if (tt >= sc.dur && !(qs.some((q) => q.long) && tt < sc.dur + 36000)) { next(now); return; } }   // a paragraph is read to its end
    else if (ph === "in") { if (passFrac(IN) >= 1 || now - pt0 > IN_MAX) { passEnd(IN); ph = "hold"; pt0 = now; } }
    else if (ph === "hold") { const ripe = sc.kind === "demo" ? sc.pin === undefined && sc.seq >= DEMO_OUT : sc.kind === "points" ? tt >= (sc.grow ? GROW_MS : DRAW_MS) + 800 : now - pt0 >= (sc.kind === "tetra" ? TITLE_MS : sc.hold || HOLD_MS); if (now - pt0 >= 1500 && ripe) { passStart(OUT, sc.kind === "field" || sc.kind === "lit" || sc.kind === "demo"); ph = "out"; pt0 = now; ghostTo(now, 0); } }
    else if (passFrac(OUT) >= 1 || now - pt0 > OUT_MAX) { next(now); return; }
    rainStep(kf); quoteStep(now, kf, !ph && tt < sc.dur - 5000);
    // the rain recedes as the figure is laid down and returns as it is taken away (grc-labs.com: down to 0.13–0.16)
    // live-v1.23.51 (Yaniv 21.10 14:54: «when the matrix comes back it is somehow too black — give it back its colour;
    // it can keep flowing behind the picture»): the rain no longer sinks to 0.16 behind a figure; it stays at 0.6, so
    // it never has to climb back out of black when the figure leaves
    const VEIL = sc.veil || 0.6, I = !ph ? 1 : ph === "in" ? 1 - (1 - VEIL) * passFrac(IN) : ph === "hold" ? VEIL : VEIL + (1 - VEIL) * passFrac(OUT);
    rain(I);
    if (!ph) return;
    // the rain runs at 60 fps; a heavy figure (the ray-marched tetrahedron, a fractal) is recomputed every 2nd or 3rd
    // frame and drawn every frame, so the streams never stutter
    if (fno++ % stride === 0) { const c0 = performance.now(); compute(sc, now, tt); const ms = performance.now() - c0; stride = ms > 14 ? 3 : ms > 7 ? 2 : 1; }
    if (!(sc.f && sc.f.txt) && MPLANT) { MPLANT = null; MGLINT.clear(); }   // the plant lives only while the menorah is the scene
    if (sc.kind === "lit") drawLit(now, sc.pal || (ART && ART[sc.ai] && ART[sc.ai].pal)); else if (sc.f && sc.f.art) drawArt(now, sc.f.art, sc.f.txt); else drawField(now, !!sc.grow);
    if (sc.kind === "tetra") rights(now);
  }
  // live-v1.23.54 (Yaniv, 21.10 20:30: «the logo and GRC should not be erased — they should appear whole and fade out
  // whole, not break apart. Maybe add a horizontal bar that rolls the matrix away and then rolls it back»): the title
  // slide is no longer laid down column by column. A glowing horizontal edge sweeps down the screen and rolls the
  // matrix away, uncovering the slide whole (the site's «drain»); the slide fades in as it is uncovered; it stands for
  // TITLE_MS; then the edge sweeps back up and rolls the matrix back over it while it fades out whole. Nothing on the
  // slide is scrambled or broken on the way out.
  const WIPE_MS = 1700;
  // live-v1.23.55 (Yaniv, 21.10 21:34: «bring GRC on the slide back to an interesting ASCII display like the tetrahedron
  // and all rights reserved; if we have more effects we can change now and then on the slide, that could be nice —
  // maybe raise the resolution, or change the logo's lighting and colours. Be artistic, creative, interesting,
  // intriguing»). «GRC Labs» is a relief in ASCII: the letters (Space Grotesk, drawn once) are blurred into a height
  // field, and each cell is lit from its slope like the tetrahedron's faces — so the name has depth and catches the
  // light. It settles out of the rain's letters, left to right, like the site's decrypt. Each appearance of the slide is
  // a different study: its own resolution, light and palette, and the tetrahedron's key light moves with it.
  // (Yaniv 23.10 09:39: «GRC should not be static — let there be some motion inside the letters, and vary it a little so
  // it is not boring»): every study now has a motion of its own INSIDE the letters (`flow`: light added to a cell at
  // column c, row r, time t), and there are six: a wave of light running along the name, bands rising through it, a
  // scanning band, embers crackling, rain falling inside the letters, and ripples from the middle. Each appearance of
  // the slide is the next study.
  const sHash = (c, r, k) => ((((c * 73856093) ^ (r * 19349663) ^ (k * 83492791)) >>> 0) % 1000) / 1000;
  const STUDIES = [
    { name: "gold, a wave running along the name", res: 0.62, pal: "gold", light: (t) => [Math.cos(t * 0.0006) * 0.8, 0.55, 0.6], flow: (c, r, t) => 0.28 * Math.max(0, Math.sin(c * 0.22 + r * 0.35 - t * 0.0042)) },
    { name: "fine grain, bands rising from below", res: 0.48, pal: "gold", light: (t) => [Math.sin(t * 0.0004) * 0.5, -0.75, 0.45], flow: (c, r, t) => 0.3 * Math.pow(Math.max(0, Math.sin(r * 0.8 + c * 0.05 + t * 0.0035)), 3) },
    { name: "ice, a scanning band", res: 0.56, pal: "ice", light: (t) => [-0.4, 0.5, 0.75], scan: true, flow: (c, r, t) => 0.12 * (sHash(c, r, Math.floor(t / 140)) - 0.5) },
    { name: "embers, crackling round a pulsing core", res: 0.66, pal: "ember", light: (t) => [0.3 * Math.cos(t * 0.0011), 0.3 * Math.sin(t * 0.0011), 0.9], pulse: true, flow: (c, r, t) => 0.32 * Math.pow(sHash(c, r, Math.floor(t / 110)), 6) },
    { name: "the matrix, falling inside the letters", res: 0.58, pal: "green", light: (t) => [-0.3, 0.6, 0.7], rain: true, flow: (c, r, t, wh) => { const hp = (t * 0.009 + sHash(c, 7, 1) * wh * 4) % (wh * 2.6) - wh * 0.3, d = hp - r; return d < 0 ? 0 : d < 0.9 ? 0.75 : 0.5 * Math.exp(-d / 2.2); } },
    { name: "ripples from the middle", res: 0.52, pal: "ice", light: (t) => [0.2, 0.7, 0.65], flow: (c, r, t, wh, ww) => 0.3 * Math.max(0, Math.sin(Math.hypot(c - ww / 2, (r - wh / 2) * 2.4) * 0.45 - t * 0.005)) },
  ];
  let titleN = -1, study = STUDIES[0];
  const TITLE_LIGHT = (t) => (titleN < 0 ? [-0.5, 0.62, 0.6] : study.light(t));
  const PALS = { gold: [COL.lo, COL.mid, COL.hi], ice: ["#2c4a63", "#7fb4c9", "#e8f6ff"], ember: ["#4a2a1a", "#c2703a", "#ffd9a0"], green: ["#173a1a", "#4e9428", "#c6ffa8"] };
  const palRamp = (name) => { const [a, b, c] = PALS[name].map(hex); return Array.from({ length: 10 }, (_, i) => { const k = i / 9, m = k < 0.5 ? mix(a, b, k / 0.5) : mix(b, c, (k - 0.5) / 0.5); return `rgb(${m[0]},${m[1]},${m[2]})`; }); };
  // (Yaniv 29.10 15:55: «take the logo's design from the main page too — no ASCII is needed here; maybe add tailored
  // information security, with dignity»): the name is grc-labs.com's own logo — «GRC» in its white, «·LABS» in its green,
  // Space Grotesk 700 at -0.02em, the dot at 0.82 of the letters — and under it the site's own line, «TAILORED
  // INFORMATION SECURITY», in its gold IBM Plex Mono, spaced 0.26em. Both decrypt in as on the site (decrypt.js: the
  // letters not yet reached are random, redrawn every 28 ms; one more is fixed every three), then stand still. The ASCII
  // relief of the name is gone.
  // live-v1.42.4 — the version the Worker wrote into the page's mark («live-v…»); nothing when it was not filled
  // live-v1.42.6 — the same file runs on grc-labs.com too (Yaniv 20.11 14:16): there the canvas names its own version and its
  // pictures' file (data-version="site-v…", data-art="…"); on Earth neither is set, and the mark and /saver-art.json are read
  const VERSION = (() => { const d = cv.dataset.version || ""; if (/^(live|site)-v\d+(\.\d+){1,2}$/.test(d)) return d; const v = document.querySelector(".mark .ver"); const t = v ? v.textContent.trim() : ""; return /^live-v\d+\.\d+\.\d+$/.test(t) ? t : ""; })();
  const LOGO_W = "rgb(234,240,248)", LOGO_G = "rgb(99,178,46)", TAG_GOLD = "rgb(240,180,41)", MUTED = "rgb(107,118,137)";
  const LOGO = [["G", 0], ["R", 0], ["C", 0], ["·", 1], ["L", 1], ["A", 1], ["B", 1], ["S", 1]], TAGLINE = "TAILORED INFORMATION SECURITY";
  const LOGO_FACE = (n) => "700 " + n + 'px "Space Grotesk", "IBM Plex Sans", Arial, sans-serif';
  // where the name, the line and the rights sit — the name's size from the slide's, never wider than 82% of the screen
  function logoBox() {
    const fz = Math.max(18 * dpr, Math.round(Math.min(side * 0.22, cv.width * 0.17))), ls = -0.02 * fz;
    ctx.font = LOGO_FACE(fz); const wDot = (() => { ctx.font = LOGO_FACE(Math.round(fz * 0.82)); const w = ctx.measureText("·").width; ctx.font = LOGO_FACE(fz); return w; })();
    const adv = LOGO.map(([ch]) => (ch === "·" ? wDot : ctx.measureText(ch).width) + ls), w = adv.reduce((a, b) => a + b, 0) - ls;
    const base = Math.round(cv.height / 2 + side * 0.33 + fz * 0.74), tz = Math.max(9 * dpr, Math.round(fz * 0.15)), ty = Math.round(base + fz * 0.4);
    return { fz, adv, x0: cv.width / 2 - w / 2, base, tz, ty, ry: Math.round(ty + tz * 2.4) };
  }
  function drawLogo(now) {
    const B = logoBox(), f = ph === "hold" ? (now - pt0) / 28 : ph === "in" ? -1 : 1e9, tick = Math.floor(now / 28);
    const kL = Math.floor(Math.max(0, f) / 3), rnd = (i) => DEC_LA.charAt((i * 7919 + tick * 104729) % 26);
    ctx.textBaseline = "alphabetic"; ctx.direction = "ltr"; ctx.textAlign = "center";
    let x = B.x0;
    LOGO.forEach(([ch, g], i) => {
      const fixed = ch === "·" || i < kL;
      ctx.font = LOGO_FACE(ch === "·" ? Math.round(B.fz * 0.82) : B.fz); ctx.fillStyle = g ? LOGO_G : LOGO_W; ctx.globalAlpha = fixed ? 1 : 0.55;
      ctx.fillText(fixed ? ch : rnd(i), x + (B.adv[i] + 0.02 * B.fz) / 2, B.base); x += B.adv[i];
    });
    ctx.globalAlpha = 1;
    // the line: from f = 25, one letter fixed every three frames; spaced by hand, so a random glyph keeps its letter's place
    if (f < 25) { ctx.textAlign = "start"; return; }
    const kT = Math.floor((f - 25) / 3), sp = B.tz * 0.6 + B.tz * 0.26, n = TAGLINE.length, tx = cv.width / 2 - (n * sp - B.tz * 0.26) / 2;
    ctx.font = "400 " + B.tz + "px " + MONO;
    for (let i = 0; i < n; i++) { const ch = TAGLINE[i]; if (ch === " ") continue; const fixed = i < kT; ctx.fillStyle = TAG_GOLD; ctx.globalAlpha = fixed ? 1 : 0.5; ctx.fillText(fixed ? ch : rnd(i + 11), tx + i * sp + B.tz * 0.3, B.ty); }
    ctx.globalAlpha = 1; ctx.textAlign = "start";
  }
  // (Yaniv 28.10 23:08: «try putting the original tetrahedron from the main page here, enlarged — I think it will be
  // nicer»): the title slide's mark is grc-labs.com's own — the shader of assets/js/logo.js, which moon.js carries
  // (window.__grcMark), drawn large on a WebGL canvas of its own and laid into the slide, so the wipe and the fade take it
  // with the rest. Lit and moved as on the site (logo.js CFG): the tumble (yaw 0.36, pitch 0.60, × spin 0.6; roll 0.08 at
  // 0.13), the bob, the core breathing at 0.9 every 5 s, the green scan line every 12 s, the white outer mark, and the key
  // «sun» from its wordmark with the bounce from the other side. No WebGL: the ASCII tetrahedron stays.
  let GM = null;                                                     // null: not tried yet; false: not available
  function markGL() {
    if (GM !== null) return GM;
    const S = window.__grcMark; if (!S) return false;                  // moon.js not run (yet): the ASCII one, and try again next time
    GM = false;
    const c = document.createElement("canvas"), gl = c.getContext("webgl", { antialias: false, alpha: true, premultipliedAlpha: false, preserveDrawingBuffer: true });
    if (!gl) return GM;
    const sh = (type, src) => { const o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o); return o; };
    const prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, S.VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, S.FRAG)); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return GM;
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const pl = gl.getAttribLocation(prog, "p"); gl.enableVertexAttribArray(pl); gl.vertexAttribPointer(pl, 2, gl.FLOAT, false, 0, 0);
    const U = {}; "u_res u_bob u_rin u_rs u_round u_svis u_scan u_coreI u_coreFall u_rim u_glint u_edgePx u_edgeW u_shell u_ssaa u_amb u_key u_bounce u_albedo u_alpha u_gc u_gr u_behind u_over u_tint u_coreCol u_greenCol u_keyDir u_bounceDir u_rot".split(" ").forEach((u) => { U[u] = gl.getUniformLocation(prog, u); });
    const lowEnd = (navigator.hardwareConcurrency || 8) <= 4 || /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || "");
    return (GM = { c, gl, U, ssaa: lowEnd ? 0 : 1, t: 0, yaw: 0, pitch: 0, last: -1 });
  }
  const n3 = (x, y, z) => { const l = Math.hypot(x, y, z) || 1; return [x / l, y / l, z / l]; };
  const qm = (a, b) => [a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3], a[0] * b[1] + a[1] * b[0] + a[2] * b[3] - a[3] * b[2], a[0] * b[2] - a[1] * b[3] + a[2] * b[0] + a[3] * b[1], a[0] * b[3] + a[1] * b[2] - a[2] * b[1] + a[3] * b[0]];
  const qa = (x, y, z, ang) => { const h = ang * 0.5, s2 = Math.sin(h); return [Math.cos(h), x * s2, y * s2, z * s2]; };
  const q2m = (q) => { const [w, x, y, z] = q; return [1 - 2 * (y * y + z * z), 2 * (x * y + w * z), 2 * (x * z - w * y), 2 * (x * y - w * z), 1 - 2 * (x * x + z * z), 2 * (y * z + w * x), 2 * (x * z + w * y), 2 * (y * z - w * x), 1 - 2 * (x * x + y * y)]; };
  // one frame of the mark, `px` device pixels square; returns its canvas, or null when there is no WebGL
  function drawMark(now, px) {
    const M = markGL(); if (!M) return null;
    const { c, gl, U } = M, TAU = Math.PI * 2;
    if (c.width !== px) { c.width = c.height = px; }
    const dt = M.last < 0 ? 0 : Math.min(0.1, (now - M.last) / 1000); M.last = now;
    M.t += dt; M.yaw += 0.36 * 0.6 * dt; M.pitch += 0.60 * 0.6 * dt;
    const t = M.t, R = q2m(qm(qa(0, 0, 1, Math.sin(t * 0.13) * 0.08), qm(qa(1, 0, 0, M.pitch), qa(0, 1, 0, M.yaw)))), ph = t % 12;
    // the key «sun» as on grc-labs.com's home page, where the wordmark stands above the mark — so the mark looks as it
    // does there (dark faces, bright edges and rims); lit from the slide's own name, below, it read as another object
    const key = n3(0, 1.7, 0.7), bounce = n3(-key[0], -key[1], -0.3);
    const u1 = (n, v) => U[n] && gl.uniform1f(U[n], v), u3 = (n, a, b, d) => U[n] && gl.uniform3f(U[n], a, b, d);
    gl.viewport(0, 0, px, px); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(U.u_res, px, px); gl.uniform2f(U.u_bob, Math.sin(t * TAU / 11) * 0.012, Math.sin(t * TAU / 7) * 0.025);
    u1("u_rin", 1.94 / 3.0); u1("u_rs", 0.95); u1("u_round", 0.021); u1("u_svis", 0.10);   // LOCKED (logo.js)
    gl.uniformMatrix3fv(U.u_rot, false, R);
    u1("u_scan", ph < 0.9 ? ph / 0.9 : -1); u1("u_coreI", 0.9 * (0.85 + 0.15 * Math.sin(t * TAU / 5))); u1("u_coreFall", 6.0);
    u1("u_amb", 0.04); u1("u_key", 1.0); u1("u_bounce", 0.18); u3("u_keyDir", ...key); u3("u_bounceDir", ...bounce);
    u1("u_albedo", 0.8); u1("u_rim", 0.245); u1("u_glint", 0.175); u1("u_edgePx", 1.2 * dpr); u1("u_edgeW", 0.22); u1("u_shell", 6.0); u1("u_ssaa", M.ssaa);
    u3("u_coreCol", 0.949, 0.965, 0.980); u3("u_greenCol", 0.388, 0.698, 0.176); u3("u_tint", 1, 1, 1);   // the white outer mark, held (logo.js v1.60)
    u1("u_alpha", 1); gl.uniform2f(U.u_gc, -1e5, -1e5); u1("u_gr", 0); u1("u_behind", 0); u1("u_over", 1);   // moon.js's globe occlusion: off
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    return c;
  }
  function titleFrame(now, kf, tt) {
    if (ph === "in" && now - pt0 >= WIPE_MS) { ph = "hold"; pt0 = now; }
    else if (ph === "hold" && now - pt0 >= (SCENES[si].about ? ABOUT_AT + aboutMs() : TITLE_MS)) { ph = "out"; pt0 = now; if (SCENES[si].about) aboutNext = true; }
    else if (ph === "out" && now - pt0 >= WIPE_MS) { next(now); return; }
    rainStep(kf); quoteStep(now, kf, false); rain(1);
    // live-v1.39.6 — the words: once the name, its line and the rights stand (ABOUT_AT), the mark dims behind them
    const q = !SCENES[si].about ? 0 : ph === "hold" ? clamp((now - pt0 - ABOUT_AT) / 900, 0, 1) : ph === "out" ? 1 : 0;
    const ease2 = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
    const p = ph === "in" ? ease2(clamp((now - pt0) / WIPE_MS, 0, 1)) : ph === "hold" ? 1 : 1 - ease2(clamp((now - pt0) / WIPE_MS, 0, 1));
    const edge = p * (cv.height + 30 * dpr);                         // above the edge: the slide; below it: the matrix
    const mpx = Math.round(side * 1.15), mark = drawMark(now, mpx);
    if (!mark && fno++ % stride === 0) { const c0 = performance.now(); fillTetra(now); const ms = performance.now() - c0; stride = ms > 14 ? 3 : ms > 7 ? 2 : 1; }
    for (let i = 0; i < rcols; i++) { IN.line[i] = 1e9; OUT.line[i] = -1; }   // the slide is whole: no column passes
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, cv.width, Math.max(0, edge)); ctx.clip();
    ctx.globalAlpha = 1; ctx.fillStyle = RAIN_BG; ctx.fillRect(0, 0, cv.width, cv.height);
    if (mark) ctx.drawImage(mark, Math.round(cv.width / 2 - mpx / 2), Math.round(cv.height / 2 - side * 0.17 - mpx / 2)); else drawField(now, false);
    if (q > 0) aboutWords(q, ph === "hold" ? now - pt0 - ABOUT_AT : aboutMs());
    else if (aboutNext) { aboutNext = false; AB_I = (AB_I + 1) % ABOUT.length; AL = null; }   // live-v1.42.3: the next part, once this one is gone
    drawLogo(now); rights(now, p);
    ctx.globalAlpha = 1 - p; ctx.fillStyle = RAIN_BG; ctx.fillRect(0, 0, cv.width, cv.height);   // the whole slide fades with the wipe
    ctx.restore(); ctx.globalAlpha = 1;
    if (edge > 2 && edge < cv.height) {                              // the glowing leading edge, as on the site
      const g = ctx.createLinearGradient(0, edge - 12 * dpr, 0, edge + 2 * dpr);
      g.addColorStop(0, `rgba(${RG_HEAD},0)`); g.addColorStop(1, `rgba(${RG_HEAD},0.55)`);
      ctx.fillStyle = g; ctx.fillRect(0, edge - 12 * dpr, cv.width, 14 * dpr);
    }
  }
  // live-v1.39.2 → live-v1.39.6 (Yaniv 11.11 16:20–17:35): the words that say what this is no longer have a slide of their
  // own. They stand in the GRC slide, once a cycle: after the name, its line and the rights have settled (ABOUT_AT), the
  // tetrahedron dims behind them and the words come up above the name.
  // live-v1.39.7 (Yaniv 11.11 18:08–19:02): three parts now — the universe, the person and the machine, the invitation —
  // and they scroll up slowly, like credits, through the space above the name, fading in at its foot and out at its head.
  // The slide holds until the last line has left. Canvas text, right to left, centred; the canvas is aria-hidden.
  const ABOUT_AT = 5000, ABOUT_LINE_MS = 700, ABOUT_HEAD_MS = 900, ABOUT_IN_MS = 600, ABOUT_READ_MS = 2400, ABOUT_EXIT_MS = 1300;   // live-v1.42.4
  const ABOUT = [
    { h: ["עוד לפני שהיו לנו מילים..", "עוד לפני שהיו מנגינות..", "", "כבר אז העולם פעל לפי חוקים.."], poem: true, p: [
      ["מזה אלפי שנים אנו מגלים אותם — כוכב אחר כוכב, תא אחר תא."],
      ["כאן הידע הזה מתכנס, תחום אחר תחום, לשיעורים חיים שאפשר לגעת בהם."],
      ["הידע נבנה וסודר עבורך, באהבה גדולה", "לאחדות הבריאה המופלאה — החיים, היקום וכל השאר."],
      ["וגם כדי להתכונן בקלות למבחנים."]], end: "בהצלחה!" },   // live-v1.39.15: «בהצלחה!» bold, a line of its own
    { h: "כאן אתה לא המוצר. כאן אתה התכלית.", p: [
      ["אנו בני אנוש. המכונה עובדת כאן עבורך, ולא ממך."],
      ["אנחנו לא שומרים עליך פרופיל ולא מוכרים את המידע שלך.", "בחשבון רגיל נשמרים רק המייל שלך והלומדות שבחרת."],
      ["בינה מלאכותית — רק במינימום ההכרחי. מקסימום שיטות אנושיות."],
      ["הכול למען משימתו הגדולה של האדם על פני האדמה —", "לשמור על הגן, לעבדה ולשמרה."]] },
    { h: "רוצה שנמצא לך דרך?", p: [
      ["מנוי פותח את הלומדות. ובקרוב — מסלול אישי, דינמי, בקצב שלך, כמו כפפה ליד."],
      ["עשרה מוזמנים ייבחרו לפיילוט. ההרשמה תיפתח בקרוב."],
      ["נשמח לכל הערה, שאלה ותובנה אנושית. אנו כאן לשירותך."]] },
  ];
  const HEB = '"IBM Plex Sans Hebrew", "IBM Plex Sans", Arial, sans-serif';
  const wrapRtl = (text, maxW) => { const out = []; let line = ""; for (const w of text.split(" ")) { const t2 = line ? line + " " + w : w; if (line && ctx.measureText(t2).width > maxW) { out.push(line); line = w; } else line = t2; } if (line) out.push(line); return out; };
  // the column, laid out once for a size: each line with its offset from the column's top, its face and its colour
  let AL = null;
  // live-v1.42.3 (Yaniv 20.11 12:22: «להציג רק חלק אחד מ-3 המקטעים בכל הפעלה... כדי שלא ישעמם») — one part a showing. Which
  // one a visit starts with is drawn at random, and each later showing in the same visit takes the next; nothing is
  // remembered between visits (the screensaver stores nothing). All three stand in full on /principles.
  let AB_I = Math.floor(Math.random() * ABOUT.length), aboutNext = false;
  function aboutLayout() {
    const B = logoBox(), top = Math.round(cv.height * 0.05), bottom = Math.round(B.base - B.fz * 1.05);
    const key = cv.width + "x" + cv.height + "@" + dpr + "#" + AB_I;
    if (AL && AL.key === key) return AL;
    const W2 = Math.min(cv.width * 0.86, 780 * dpr), part = ABOUT[AB_I];   // live-v1.42.3: one part a showing
    // live-v1.42.4 (Yaniv 20.11 12:59: «צריך לחכות שהמילה האחרונה תסיים את הגלילה וזה בזבוז זמן») — no scroll: the part is
    // laid out to stand whole in the space (smaller type when it would not fit) and its lines appear where they stand
    const lay = (f) => {
      const hz = Math.round(Math.max(20, Math.min(36, cv.width / dpr / 20)) * dpr * f), bz = Math.round(hz * 0.58), gap = Math.round(bz * 0.8);
      const lines = []; let y = 0;
      // live-v1.39.27 — a heading may be lines of a poem; live-v1.39.34 — "" is a stanza break; live-v1.39.35 — the poem is a
      // heading, bold and large like «כאן אתה לא המוצר», in the slide's one font
      const hf = "600 " + hz + "px " + HEB;
      ctx.font = hf;
      for (const x of [].concat(part.h)) {
        if (!x) { y += hz * 0.8; continue; }
        for (const l of wrapRtl(x, W2)) { y += hz; lines.push({ t: l, y, font: hf, col: LOGO_W, a: 1, head: true }); y += hz * (part.poem ? 0.5 : 0.25); }
      }
      y += gap * 1.2;
      ctx.font = "400 " + bz + "px " + HEB;
      part.p.forEach((para, k) => {
        const last = k === part.p.length - 1;
        for (const l of para.flatMap((x) => wrapRtl(x, W2))) { y += bz; lines.push({ t: l, y, font: "400 " + bz + "px " + HEB, col: last ? TAG_GOLD : LOGO_W, a: last ? 1 : 0.9, close: last && !part.end }); y += bz * 0.5; }
        y += gap;
      });
      if (part.end) { const ez = Math.round(bz * 1.25); y += ez; lines.push({ t: part.end, y, font: "700 " + ez + "px " + HEB, col: TAG_GOLD, a: 1, close: true }); y += ez * 0.5; }   // live-v1.39.15
      return { lines, height: y };
    };
    let L = lay(1); if (L.height > bottom - top) L = lay(Math.max(0.55, (bottom - top) / L.height * 0.97));
    const y0 = top + Math.max(0, (bottom - top - L.height) / 2);
    // each line its moment: a heading line 0.9 s after the one before, a body line 0.7 s, the closing line a breath later
    let at = 0; for (const l of L.lines) { l.y += y0; l.at = at; at += l.head ? ABOUT_HEAD_MS : ABOUT_LINE_MS; if (l.close) l.at += 300; }
    const lastAt = L.lines.length ? L.lines[L.lines.length - 1].at : 0;
    return (AL = { key, lines: L.lines, top, bottom, exitAt: lastAt + ABOUT_IN_MS + ABOUT_READ_MS });
  }
  /** How long the words need: every line in, a moment to read the last, and the exit. */
  const aboutMs = () => aboutLayout().exitAt + ABOUT_EXIT_MS;
  // live-v1.42.4 — the words: each line rises a little into place as it fades in; after a moment to read the last, the
  // others step back quietly and the closing line leaves with weight — it brightens, its letters spread, it turns the
  // matrix's green and falls into the rain, blurring as it goes
  function aboutWords(q, t) {
    const L2 = aboutLayout(), { top, bottom } = L2, x = cv.width / 2;
    ctx.globalAlpha = 0.84 * q; ctx.fillStyle = RAIN_BG; ctx.fillRect(0, 0, cv.width, bottom + Math.round(logoBox().fz * 0.1));   // the mark, dimmed
    ctx.save(); ctx.direction = "rtl"; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    const ex = (t - L2.exitAt) / ABOUT_EXIT_MS;                     // < 0 before the exit, 0..1 during it
    for (const l of L2.lines) {
      const k = clamp((t - l.at) / ABOUT_IN_MS, 0, 1); if (k <= 0) continue;
      const ein = 1 - Math.pow(1 - k, 3);
      let a = q * l.a * ein, y = l.y + (1 - ein) * 10 * dpr;
      ctx.font = l.font; ctx.fillStyle = l.col;
      if (ex > 0 && !l.close) a *= clamp(1 - ex / 0.3, 0, 1);       // the rest steps back in the first third
      if (ex > 0 && l.close) {
        const e = clamp(ex, 0, 1), up = clamp(e / 0.22, 0, 1), fall = clamp((e - 0.22) / 0.78, 0, 1);
        ctx.save(); ctx.translate(x, y + fall * fall * 90 * dpr); ctx.scale(1 + 0.18 * up, 1 + 0.18 * up);
        try { ctx.letterSpacing = (fall * 0.9).toFixed(2) + "em"; if (fall > 0) ctx.filter = "blur(" + (fall * 3 * dpr).toFixed(1) + "px)"; } catch (_) { /* older engines: no spread, no blur */ }
        ctx.shadowColor = "rgba(240,200,90,0.8)"; ctx.shadowBlur = (1 - fall) * up * 18 * dpr;
        ctx.fillStyle = fall > 0.15 ? SHADE[6] : l.col; ctx.globalAlpha = a * (1 - fall); ctx.fillText(l.t, 0, 0);
        ctx.restore(); continue;
      }
      if (a <= 0 || y < top - 4 * dpr || y > bottom + 60 * dpr) continue;
      ctx.globalAlpha = a; ctx.fillText(l.t, x, y);
    }
    ctx.restore();
    ctx.globalAlpha = 1; ctx.direction = "ltr"; ctx.textAlign = "start";
  }
  function start() {
    if (on || document.hidden) return;
    const tree = document.getElementById("tree"); if (tree && !tree.hidden) { arm(); return; }
    try { document.fonts && (document.fonts.load('400 16px "Frank Ruhl Libre"', "אבג"), document.fonts.load('400 16px "Noto Sans Egyptian Hieroglyphs"', "\u{132F9}"), document.fonts.load('700 16px "Space Grotesk"', "GRC Labs")); } catch (_) {}   // Hebrew in the rain: the face, not a fallback
    // live-v1.23.58 (Yaniv, 21.10 22:12: «please give randomness between the shapes in the screensaver»): the order was
    // shuffled once when the page loaded, so every time the screensaver woke on the same page it played the same
    // sequence from the top. It is shuffled afresh each time it starts (and, as before, each time a cycle ends)
    SCENES = buildScenes((Math.random() * 1e9) >>> 0); loadArt();
    on = true; cv.hidden = false; size(); rainFill(); si = 0; last = performance.now(); enter(last);   // the rain curtain first, as on live
    requestAnimationFrame(() => cv.classList.add("on"));
    raf = requestAnimationFrame(frame);
  }
  function stop() { if (!on) return; on = false; cancelAnimationFrame(raf); cv.classList.remove("on"); cv.hidden = true; }
  function arm() { clearTimeout(idle); idle = setTimeout(start, IDLE_MS); }
  // the press that wakes it is swallowed: it lands on the screensaver, not on the globe or a button under it
  cv.addEventListener("pointerdown", (e) => { e.preventDefault(); e.stopPropagation(); stop(); arm(); });
  for (const ev of ["pointerdown", "pointermove", "keydown", "wheel", "touchstart", "scroll"]) addEventListener(ev, (e) => {
    if (on) { if (ev === "pointermove" && e.pointerType === "mouse" && Math.hypot(e.movementX || 0, e.movementY || 0) < 3) return; if (ev === "keydown") e.preventDefault(); stop(); }
    arm();
  }, { passive: ev !== "keydown", capture: true });
  addEventListener("resize", () => { if (on) size(); });
  document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); else arm(); });
  // for a quick look without waiting a minute: earth.grc-labs.com/#saver (or #saver=N to begin at scene N)
  // (#saver=lit / #saver=lit3 — picture 0, or picture 3, of the file; #saver=tlit — the tetrahedron in the rain)
  const hm = location.hash.match(/^#saver(?:=(\d{1,3}|(lit|tlit|mk|men|demo)(\d{0,2})))?$/);   // mk: the Merkaba; men: the menorah; demo, demoN (live-v1.38.17)
  if (hm) setTimeout(() => { start(); if (hm[1] !== undefined) { SCENES = buildScenes(2026); const go = () => { if (hm[2] === "demo") { si = Math.max(0, SCENES.findIndex((s) => s.kind === "demo")); if (hm[3] !== "") SCENES[si] = { kind: "demo", name: "דמו", pin: clamp(+hm[3], 0, 6) }; } else if (hm[2] === "mk" || hm[2] === "men") { const want = hm[2] === "mk" ? "merkaba" : "art"; si = Math.max(0, SCENES.findIndex((s) => s.f && s.f.kind === want)); } else if (hm[2]) { const all = SCENES.map((s, i) => [s, i]).filter(([s]) => s.kind === "lit" && (hm[2] === "tlit" ? s.tetra : !s.tetra)); si = ((hm[2] === "lit" ? all.find(([s]) => s.ai === +(hm[3] || 0)) : all[0]) || all[0] || [0, 0])[1]; } else si = Math.min(SCENES.length - 1, +hm[1]); enter(performance.now()); }; hm[2] ? loadArt().then(go) : go(); } }, 300);
  arm();
})();
