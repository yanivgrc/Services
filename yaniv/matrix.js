// Matrix rain behind the card + an ASCII frame drawn around .shell.
// One fixed canvas, ~22 steps/s, paused when the tab is hidden, static under prefers-reduced-motion.

const GLYPHS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789'
  + 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎ:.=*+-<>¦|';
const BG = '8,11,20';
const GREEN = '#63B22E', HEAD = '#C9F7A8', FRAME = 'rgba(99,178,46,.75)', LABEL = '#F0B429';
const pick = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];

export function startMatrix(canvas, shell) {
  const ctx = canvas.getContext('2d', { alpha: false });
  canvas.dir = 'ltr';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0, H = 0, dpr = 1, cell = 14, cols = 0, drops = [], speed = [], raf = 0, last = 0;

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.direction = 'ltr'; ctx.textAlign = 'left';
    cell = W < 420 ? 13 : 15;
    cols = Math.ceil(W / cell);
    drops = Array.from({ length: cols }, () => Math.random() * -H / cell);
    speed = Array.from({ length: cols }, () => 0.45 + Math.random() * 0.75);
    ctx.fillStyle = `rgb(${BG})`; ctx.fillRect(0, 0, W, H);
    if (reduce) staticField();
  }

  function rain() {
    ctx.fillStyle = `rgba(${BG},.085)`;           // trail fade
    ctx.fillRect(0, 0, W, H);
    ctx.font = `${cell}px "IBM Plex Mono", ui-monospace, monospace`;
    ctx.textBaseline = 'top';
    for (let i = 0; i < cols; i++) {
      const y = Math.floor(drops[i]) * cell, x = i * cell;
      ctx.fillStyle = GREEN; ctx.globalAlpha = 0.8;
      ctx.fillText(pick(), x, y - cell);
      ctx.fillStyle = HEAD; ctx.globalAlpha = 1;
      ctx.fillText(pick(), x, y);
      ctx.globalAlpha = 1;
      drops[i] += speed[i];
      if (y > H && Math.random() > 0.975) drops[i] = Math.random() * -20;
    }
  }

  function staticField() {
    ctx.font = `${cell}px "IBM Plex Mono", ui-monospace, monospace`;
    ctx.textBaseline = 'top';
    for (let i = 0; i < cols; i++) for (let y = 0; y < H; y += cell) {
      if (Math.random() < 0.12) { ctx.fillStyle = GREEN; ctx.globalAlpha = 0.15 + Math.random() * 0.35; ctx.fillText(pick(), i * cell, y); }
    }
    ctx.globalAlpha = 1;
    frame();
  }

  // ASCII box around the shell: ┌─[ label ]──┐ │ │ └──[ label ]─┘
  function frame() {
    const r = shell.getBoundingClientRect();
    if (r.bottom < 0 || r.top > H) return;
    const cw = 8.4, ch = 15, fs = 13;
    const x0 = Math.round(r.left - cw * 0.9), x1 = Math.round(r.right);
    const y0 = Math.round(r.top - ch * 0.75), y1 = Math.round(r.bottom - ch * 0.25);
    const n = Math.max(2, Math.floor((x1 - x0) / cw));
    const step = (x1 - x0) / n;
    ctx.font = `500 ${fs}px "IBM Plex Mono", ui-monospace, monospace`;
    ctx.textBaseline = 'top';
    ctx.fillStyle = `rgb(${BG})`;
    ctx.fillRect(x0 - 2, y0 - 2, x1 - x0 + cw + 4, ch + 2);
    ctx.fillRect(x0 - 2, y1 - 2, x1 - x0 + cw + 4, ch + 2);
    ctx.fillRect(x0 - 2, y0, cw + 3, y1 - y0);
    ctx.fillRect(x1 - 1, y0, cw + 3, y1 - y0);
    ctx.fillStyle = FRAME;
    for (let i = 0; i <= n; i++) {
      const x = x0 + i * step;
      const top = i === 0 ? '┌' : i === n ? '┐' : '─';
      const bot = i === 0 ? '└' : i === n ? '┘' : '─';
      ctx.fillText(top, x, y0); ctx.fillText(bot, x, y1);
    }
    for (let y = y0 + ch; y < y1 - ch * 0.5; y += ch) { ctx.fillText('│', x0, y); ctx.fillText('│', x0 + n * step, y); }
    const label = (txt, x, y, color) => {
      const w = ctx.measureText(txt).width;
      ctx.fillStyle = `rgb(${BG})`; ctx.fillRect(x - 3, y - 1, w + 6, ch);
      ctx.fillStyle = color; ctx.fillText(txt, x, y);
    };
    label('[ SUBJECT // Y.DADON ]', x0 + step * 3, y0, LABEL);
    const bl = '[ SECURE CHANNEL ]';
    label(bl, x0 + n * step - ctx.measureText(bl).width - step * 3, y1, FRAME);
  }

  function loop(t) {
    raf = requestAnimationFrame(loop);
    if (t - last < 45) return;                     // ~22 fps is plenty for rain
    last = t;
    rain(); frame();
  }

  function play() { if (!raf && !reduce) raf = requestAnimationFrame(loop); }
  function pause() { cancelAnimationFrame(raf); raf = 0; }

  resize();
  addEventListener('resize', () => { resize(); if (reduce) staticField(); });
  addEventListener('scroll', () => { if (reduce) { ctx.fillStyle = `rgb(${BG})`; ctx.fillRect(0, 0, W, H); staticField(); } }, { passive: true });
  document.addEventListener('visibilitychange', () => (document.hidden ? pause() : play()));
  play();
}

// Decrypt-style reveal for a text element (the site's signature effect).
export function decrypt(el, ms = 650) {
  const final = el.textContent;
  if (!final || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  el.setAttribute('aria-label', final);
  const t0 = performance.now();
  const tick = (t) => {
    const p = Math.min(1, (t - t0) / ms);
    const keep = Math.floor(final.length * p);
    el.textContent = [...final].map((c, i) => (i < keep || c === ' ' ? c : pick())).join('');
    if (p < 1) requestAnimationFrame(tick); else { el.textContent = final; el.removeAttribute('aria-label'); }
  };
  requestAnimationFrame(tick);
}

// Portrait reveal: the illustration first appears as ASCII, rows resolve top-down, then the image fades in.
export function asciiPortrait(img) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const box = img.parentElement;
  const run = () => {
    const size = img.clientWidth || 102, cols = 26, cell = size / cols;
    const src = document.createElement('canvas'); src.width = src.height = cols;
    const sctx = src.getContext('2d', { willReadFrequently: true });
    try { sctx.drawImage(img, 0, 0, cols, cols); } catch { return; }
    let px; try { px = sctx.getImageData(0, 0, cols, cols).data; } catch { return; }
    const ramp = ' .:-=+*#%@';
    const L = new Float32Array(cols * cols);
    for (let k = 0; k < L.length; k++) L[k] = (px[k * 4] * 0.3 + px[k * 4 + 1] * 0.59 + px[k * 4 + 2] * 0.11) / 255;
    // flood-fill the dark background from the edges; dark cells it cannot reach are the beard/hair
    const bg = new Uint8Array(L.length), stack = [];
    for (let k = 0; k < cols; k++) stack.push(k, (cols - 1) * cols + k, k * cols, k * cols + cols - 1);
    while (stack.length) {
      const k = stack.pop();
      if (bg[k] || L[k] >= 0.24) continue;
      bg[k] = 1;
      const r = (k / cols) | 0, q = k % cols;
      if (r > 0) stack.push(k - cols); if (r < cols - 1) stack.push(k + cols);
      if (q > 0) stack.push(k - 1); if (q < cols - 1) stack.push(k + 1);
    }
    const c = document.createElement('canvas'), dpr = Math.min(devicePixelRatio || 1, 2);
    c.className = 'ascii'; c.setAttribute('aria-hidden', 'true');
    c.width = c.height = Math.round(size * dpr);
    c.style.cssText = `position:absolute;left:${img.offsetLeft}px;top:${img.offsetTop}px;width:${size}px;height:${size}px;pointer-events:none;transition:opacity .5s`;
    box.append(c);
    const x = c.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0);
    x.font = `${cell * 1.15}px "IBM Plex Mono", monospace`; x.textBaseline = 'top'; x.direction = 'ltr';
    img.style.opacity = '0';
    const t0 = performance.now(), dur = 1100;
    const draw = (t) => {
      const p = Math.min(1, (t - t0) / dur), solved = Math.floor(cols * p);
      x.fillStyle = '#0C1120'; x.fillRect(0, 0, size, size);
      for (let r = 0; r < cols; r++) for (let q = 0; q < cols; q++) {
        const k = r * cols + q, lum = L[k];
        // background grey is skipped; black beard -> dense green; light face -> pale ramp
        let ch, col;
        if (r > solved) { ch = Math.random() < 0.25 ? pick() : ' '; col = 'rgba(99,178,46,.5)'; }
        else if (lum < 0.24) { ch = bg[k] ? ' ' : (Math.random() < 0.5 ? '#' : '%'); col = '#4E8F24'; }
        else { ch = ramp[Math.min(ramp.length - 1, 3 + ((lum - 0.24) / 0.76 * 7) | 0)]; col = lum > 0.7 ? '#E6FFD6' : '#9BE85B'; }
        if (ch === ' ') continue;
        x.fillStyle = col;
        x.fillText(ch, q * cell, r * cell);
      }
      if (p < 1) requestAnimationFrame(draw);
      else setTimeout(() => { img.style.transition = 'opacity .5s'; img.style.opacity = '1'; c.style.opacity = '0'; setTimeout(() => c.remove(), 600); }, 350);
    };
    requestAnimationFrame(draw);
  };
  if (img.complete && img.naturalWidth) run(); else img.addEventListener('load', run, { once: true });
}
