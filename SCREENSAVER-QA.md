# Screensaver — QA & improvement checklist

Living checklist for the GRC·LABS cyber screensaver (`assets/js/screensaver.js`).
Worked task by task; updated after each. **Do not break approved/working functionality.**

## QA method (real visual QA)
- Headless Chrome screenshots → reviewed as images.
- Harness: `chrome --headless=new --no-sandbox --user-data-dir=C:\grcqa\prof --screenshot=C:\grcqa\<n>.png --window-size=1280,800 --virtual-time-budget=<ms> "file:///…/index.html?saver=now&win=<w>&shape=<n>"`
- `?saver=now` forces full opacity instantly (no fade) for capture — dev-path only.
- Scene shape indices (VIZ_BUILDERS): 0-7 point shapes (spiral/sin/helix/lissajous/sierpinski/lorenz/butterfly/phyllotaxis), 8 torus, 9 life, 10 molecule, 11 pyramid-3d, 12 cube, 13 tetra+sphere, 14 scope, 15 audio-scope, 16 astro, 17 crypto, 18 voyager. Windows: brain, viz, msg, rain, subject, (brand=retired).

## Tasks
- [x] Stand up real screenshot QA (Chrome headless + puppeteer-core + http server)
- [x] **Molecule → true 3D** (rotating, depth atoms/bonds, CTA kept) — verified
- [x] **3D solids shading** — ambient + depth gradient; zoomed; reads 3D — verified (cube/pyramid/tetra)
- [x] **Pyramids** — precise Giza proportions, top↔side sweep, ASCII — verified
- [x] **Portrait** — portrait-light.jpg + background chroma-keyed out — verified over http
- [x] **Shorten matrix wipe**
- [x] **Rotating-words scene** + "version upgrade soon..", "coming soon.." — verified
- [x] **LinkedIn link** — in the rotating-words scene (linkedin.com/in/yaniv-dadon) — verified
- [x] **Copyright** — code header + footer ©
- [x] **Remove RF** dead code
- [x] **GET more realistic** — SOC tracks (SIEM detection, triage w/ MITRE+IOCs, threat hunt) — verified
- [~] **ASCII-only for the art** — geometric shapes are ASCII; orbit/audio/labels still use `·` (U+00B7) — minor, deferred
- [~] status-bar bottom-right overlap — looks like small-font scaling, not a double-draw; OK
- [x] Verify key scenes (torus/molecule/brain/words/portrait/cube/pyramid/tetra) — no breakage
- [ ] Commit + push

## QA findings (per scene) — from real screenshots
- **molecule (10):** flat 2D circles + thin lines. → make 3D (rotating, depth-shaded). [TASK]
- **3D solids cube(12)/pyramid(11)/tetra(13)/voyager(18):** flat-per-face luminance → each face is a flat fill of ONE repeated char → reads flat. Fix: ambient + a depth gradient *within* each face so the char varies across it. Lighting also too harsh on the cube (one face bright, others invisible). Shapes a bit small.
- **pyramid (11):** tilt-sweep top view looks like a flat slab of `====`; needs the depth-gradient fix to read 3D from above.
- **tetra+sphere (13):** good — wireframe cage + shaded sphere + dot field. Could be larger.
- **audio scope (15):** good waveform; signal a touch busy.
- **crypto (17):** good — AES, key, hex block, rounds. Centered OK.
- **voyager (18):** recognizable (dish+booms) but cluttered/small.
- **brain/GET:** reads like a product menu ("To receive X service…"), not SOC operations. → make it read like real SOC work. [TASK] CTA "צור קשר" at top scrolls off as content fills.
- **status bar:** bottom-right `y.dadon@grc-labs  HH:MM` looks doubled/garbled at small size — verify it isn't drawn twice.
- **rain/matrix:** rich charset (katakana/kanji/π/Greek) looks great.

## Done this session (verified by screenshot over http://localhost)
- Real screenshot QA harness (Chrome headless + puppeteer-core + local http server).
- `?saver=now` forces opacity; `?qa=N` time-multiplier (dev aids).
- **3D solids reworked** — ambient + depth gradient within faces → cube/pyramid/tetra now read clearly 3D (verified). Zoomed in.
- **Pyramid** — converged onto shared renderer, precise Giza ratio, tilt sweep top↔side, ASCII-only (verified).
- **Molecule → 3D** — real 3D coords, rotation, depth-sized/shaded atoms + bonds, CTA kept (verified, NH₃).
- **Portrait** — portrait-light.jpg (brighter) + background chroma-keyed out from the source corner colour (verified over http; file:// taints getImageData — not a real bug).
- **Matrix wipe shortened** (fill 1050→620, drain 1900→1050, rise 850→620).
- **RF** dead code removed.
- **Copyright** — header comment in screensaver.js + © line in index footer.
- Found existing asset: `assets/img/linkedin_thumb_image.png`.

## Note
- file:// taints the canvas (cross-origin image) → portrait getImageData throws. QA over http://localhost:8099 instead. Real site is same-origin → fine.

## Round 2 (this session, verified by screenshot)
- [x] Removed the contact CTA from the brain/TMUX focus pane (lives on molecule + rotating-words).
- [x] Removed the electronics oscilloscope scene (kept the audio waveform).
- [x] Brain **pane 2 → varied network commands** (ss/dig/ping/traceroute/arp/nmap/curl/whois), looping; network commands removed from pane 1 (now SOC: SIEM/triage/hunt/ssh/pip/python).
- [x] Crypto **reversed** — big salted hex block decrypts to reveal one line: the slogan.
- [x] More torus-style 3D surfaces — sphere, Möbius, spring, twisted-torus (shared makeSurface renderer).
- [x] Geometry shapes (golden spiral etc.) **rotate continuously** — fixes "stuck in the middle".
- Shape indices now: 8 torus, 9 sphere, 10 möbius, 11 spring, 12 twisted-torus, 13 molecule, 14 pyramid, 15 cube, 16 tetra+sphere, 17 audio-scope, 18 astro, 19 crypto, 20 voyager.

## Round 3 (this session, verified)
- [x] **Menorah** — supplied Knesset-Menorah ASCII art rendered in gold, coalescing out of the matrix (shape 21). Verified.
- [x] **Butterfly** — densified (2600→5200 pts) so the wings fill in. Verified.
- [x] **Face recreated** — posterized ramps (clean v1·clean/v2·ink/v3·line), higher contrast, slightly lower res → reads clearly now (no new photo available, so recreated the ASCII). Verified.
- Cicada: offered as an alternative to the butterfly; did the butterfly instead. Cicada (prime-cycle insect) could be a future scene.

## Round 4 (this session, verified)
- [x] Menorah → **green**, coalesces in/out through the matrix. Verified.
- [x] Removed the **Möbius** strip.
- [x] **"Coming soon"** teasers now appear only ~40% of the time (one teaser, randomized).
- [x] Added a **3D cochlea** (logarithmic spiral shell). Verified.
- [x] **Voyager** broadcasts light transmission signal rings from its dish. Verified.
- [x] **Solar system** orbital plane tilts over time — a shifting perspective.
- [x] **Face** recreated with edge detection — crisp feature outlines + subtle tonal fill (sketch look). Verified.
- Shape indices now: 8 torus, 9 sphere, 10 spring, 11 twisted-torus, 12 cochlea, 13 molecule, 14 pyramid, 15 cube, 16 tetra+sphere, 17 audio, 18 astro, 19 crypto, 20 voyager, 21 menorah.

## Round 5 (this session, verified)
- [x] **Face → reverted to the first versions** — back to `portrait-dark.jpg` + simple luminance→RAMP sampling with the original v1·soft / v2·hard / v3·block variants (dropped the chroma-key + edge-detection rendering). Verified — the face emerges/dissolves through the matrix as before.
- [x] **Menorah forms FROM the matrix motion** — no longer an alpha-blended image. Each cell scrambles through matrix glyphs, condenses as a downward-sweeping wave reaches it, then locks into its menorah glyph (brief bright flash on lock); on exit the last-formed cells unlock first back into falling glyphs. FILL 700 / CO 1700 / HOLD 2200 / DIS 1700. Verified mid-formation + fully formed.
- [x] **Cochlea → snail (שבלול), not horn (שופר)** — flattened the vertical climb (0.26·u → 0.07·u), more coils (uMax 5π→6π), tighter inward taper. Reads as a flat coiled shell with an aperture. Verified.

## Round 6 (this session, verified)
- [x] **Dense matrix everywhere** — rewrote the rain (background layer, dedicated window, AND the between-scene wipe) as full falling streams with bright heads + fading trails. Drops seed in-view, trail ≈55% of rows, low-alpha floor (0.20) so it's never sparse. Verified.
- [x] **Hebrew in the matrix** — `HEB_RAIN` letters stream alongside katakana/kanji/greek/symbols; Hebrew cells highlight amber. Verified.
- [x] **π removed from the rain completely** — no PI_D streaming, no π glyph (stripped from `RAIN_BASE` and the menorah scramble set); deleted the dead `makePiDigits` (π·digits) scene. Verified.
- [x] **צור קשר on Voyager and Audio** — bright Hebrew CTA at the top of both scenes. Verified.
- [x] **Removed TRANSMIT** — deleted `makeWords` and dropped `'msg'` from the window rotation + dispatch.
- [x] **Menorah centering bug fixed** — `build()` cached `ox/oy` from the first R it saw, which was the rise-in transition (R.y = C.h·0.5 ≈ 389); the cache key `(R.w<<1)^R.h` ignored R.y so it never recomputed. Now only the layout (fs/cells/blkW/blkH) is cached; `ox/oy` are recomputed each frame from the live R. Verified centred via bounding-box probe + screenshot.

## Round 7 (this session, verified)
- [x] **Scriptural Hebrew font** — loaded Frank Ruhl Libre (Google Fonts); `STAMF` for the "צור קשר" CTAs + the planted ghost line, and the rain routes Hebrew through it (`MONO_RAIN = IBM Plex Mono → Frank Ruhl Libre → monospace`). Closest web font to Torah-scroll ktav; true STAM/sofer script needs a licensed hosted font (noted for the user). Verified.
- [x] **Removed amber from the matrix** — Hebrew (and everything) now a single green in both rain renderers + the transition wipe. Verified.
- [x] **Unified alphabet** — added the shape RAMP chars (`.,-~:;=!*#$@`, `RAMP_CH`) to `RAIN_BASE` so the matrix and the 3D/shape scenes share one vocabulary. Verified.
- [x] **Full-screen transitions** — the wipe was cutting off mid-screen because FILL ended on a fixed 620ms and re-seeded at fill→drain. Now: fill runs until `mtx.reachedBottom()` (every column has swept the full height) with a 1700ms cap, NO mid-reset (the full curtain carries straight into the drain), drain 1500ms / rise 900ms. Verified across fill/drain/reveal frames — rain covers top-to-bottom, new window revealed centred.

## Round 8 (this session, verified)
- [x] **New Hebrew ASCII portrait + background removed** — the subject is rebuilt from Hebrew letters (`HEB_FACE` ramp, light→dense), rendered in monospace Hebrew (Courier New) so the grid stays aligned. The gray studio background is chroma-keyed out (sample the four corners → key pixels within `V.bgT` distance), keeping both the near-black beard and the white face. Two-tier colour (bright face / solid-green beard). Verified via burst capture (`burst.js`).
- [x] **Portrait lingers** — HOLD 350→1700ms so the face actually reads (and is QA-catchable).
- [x] **One persistent matrix** — replaced the three separate rain instances (per-scene `makeRainLayer`, `makeRain`, transition `mtx`) with a single shared `rainState`. Every scene and the wipe draw the SAME streams, so the matrix never resets/pops between a scene and the transition — addresses "the matrix just disappears / things appear and vanish."
- [x] **Smooth transitions** — fill fades the rain up (FADE_MS 240) and runs until `reachedBottom()` (full-height coverage); drain runs until `cleared()` (the whole curtain has drained) with a generous 2800ms cap so it never cuts off mid-wipe. RISE 950.
- [x] **Matrix recedes behind formed shapes** — dropped the rain-layer intensity floor; the portrait fades the rain to ~20% as the face forms so the portrait reads cleanly (the dense look is still carried by the transitions and the rain window, which pass full intensity).
- QA tools added: `C:\grcqa\burst.js` (multi-frame capture + brightest-green scoring to find a formed frame), `probe.js`.

## Round 9 (this session, verified)
- [x] **Killed the jump between matrices** — root cause: after a drain the streams are off-screen below, so the next fade built the matrix up from empty (looked like a reset). Now `rainState.fill(FS)` reseeds a full spread curtain at each fade start, and the fade crossfades it in (globalAlpha 0→1) — a full matrix appears immediately, no build-up. Also keyed the grid on WIDTH only so the content area and the full screen share one matrix (no reseed when switching).
- [x] **Paced fall (accelerate/decelerate)** — added a speed multiplier to `rainState.draw`. Fade accelerates in (0.5→1.6), hold settles to a calm (~1.6→0.85), drain accelerates away (1.0→3.6).
- [x] **Full-screen matrix / tmux green line** — transitions now draw the matrix over the whole screen (0,0,W,H), covering the tmux bar and its green divider line during fade/hold; `drawStatus` is skipped then and the bar returns during the drain, revealed in place with the scene.
- [x] **Every scene through the matrix** — the unified full-screen matrix now brackets every scene (each dissolves into the full matrix and emerges as it drains), giving the "one connected system" feel the user asked for. (Per-shape letter-by-letter coalesce for the live 3D scenes remains a larger future effort; the menorah/face/brand already do it.)
- Verified: full-screen matrix at 4s has no status bar/green line; drain at ~7.6s reveals the SOC scene + tmux bar in place; no runtime errors.

## Not done / for next time
- Hebrew face in a true STAM/sofer script would need a hosted monospace Hebrew font; Courier New is the grid-safe stand-in.
- Beard chroma-key is marginal (beard black is close to the bg gray) — `bgT` is tuned per-variant; if a future photo has a different background, retune.

_(filled at the end)_
