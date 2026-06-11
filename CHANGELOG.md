# Changelog — GRC·LABS

All notable changes to grc-labs.com. Newest first.

## v1.10 — 2026-06-11

### Changed
- Window transitions are back to the matrix-rain wipe — it fills, then drains down and out to reveal the next window, replacing the sideways slide.
- The "brain" window's right pane now reads as a live CLI reasoning log — prompt, spinner, a tree of checks and a status column — instead of a drawn thought-tree.
- Gave the Giza pyramids real depth — a sunlit face and a shadowed face meeting at a bright ridge, with shadows cast on the sand.
- Opened up the water molecule's bond angle.
- Changed a screensaver message line to "Name your challenge".

### Fixed
- The ASCII portrait now reads clearly — reworked tone mapping — and the subject window surfaces a little more often.

## v1.9 — 2026-06-11

### Changed
- Rebuilt the screensaver as one continuous tmux-style session — a persistent status bar, windows that switch with a slide, and no full-screen swaps; everything now flows inside the CLI.
- Updated the title on the subject card to CEO.

### Added
- A "brain" window — a focused `pip install` stream on the left and a lateral thought-tree on the right that fans each service's sub-topics out, so the work reads as thinking broad and deep at once.
- More ASCII animations — a rotating torus, an oscilloscope-style lissajous curve and Conway's Game of Life; the golden spiral now bleeds full-screen.
- Hebrew message windows — the slogan and short calls-to-action decrypt inside a self-drawing frame.
- The digit streams — in the rain and the message scramble — are now the decimals of π and e, not random noise.
- Planted a handful of short Hebrew lines that surface briefly and sparsely inside the ASCII — an Easter egg, found rather than shown.
- Added more ASCII figures to the rotation — the Sierpiński gasket, the Lorenz attractor, a butterfly curve, golden-angle phyllotaxis, base molecules (water, CO₂, methane, ammonia, salt) and the Giza pyramids.

## v1.8 — 2026-06-11

### Changed
- Softened the screensaver's pacing — gentler typing, longer holds, and clearer separation between the `pip install`, `ssh-keygen` and response blocks.
- Reworked the matrix transition between scenes — it now fills the screen, flows all the way to the bottom and drains out before the next scene fades up, instead of cutting off mid-animation.
- Dropped the breathing zoom from the geometry and portrait scenes — calmer, less busy.
- Spaced the GET commands further apart — one service per cycle, then two other scenes before the next GET.

## v1.7 — 2026-06-11

### Changed
- Reworked the screensaver's GET scenes into a bash/pip flow — `pip install` resolves and installs dependencies, a faked `ssh-keygen` produces a fingerprint and a dense randomart signature, then the service response.
- Geometry scenes are now square ASCII-art grids — golden spiral, sine waves, DNA helix; dropped the sunflower and tree shapes.
- The matrix wipe between scenes now sweeps the full screen over about three seconds.

## v1.6 — 2026-06-10

### Changed
- Rebuilt the screensaver as a single scene console — matrix rain now only opens and wipes between scenes (no curtain), everything else plays inside one terminal, and the glitch/scanline effects are gone. Calmer and more fluid.
- GET scenes now run a winget-style install, a readable typed response with a CLI "processing" beat, an output that opens with an SSH-randomart signature, and the Hebrew call-to-action inline in the terminal.
- Added large ASCII geometry scenes — golden spiral, sunflower phyllotaxis, sine waves, fractal tree, DNA helix — plus an occasional breathing ASCII portrait.

## v1.5 — 2026-06-10

### Changed
- Softened the screensaver's coalescing text — the GRC·LABS wordmark and capability/credential names now emerge and melt back into the rain as a ghosted glow, not hard text.
- Reinstated the ASCII-portrait mode (intermittent) with stronger contrast so the face reads clearly in green, plus a brief decrypt reveal.
- Added subtle CRT effects — scanlines, a slow sweep, and an occasional glitch.

## v1.4 — 2026-06-10

### Changed
- Refined the Privacy & DPO wording — aligned with national privacy-authority requirements.
- Rebalanced the hero — a smaller, supporting portrait so the wordmark and value proposition lead.
- Reworked the screensaver — the demo terminal is now a raw full-screen console that runs winget-style GET installs, each streaming a full service response (a different command every cycle). Matrix rain still resolves into GRC·LABS; triggers after 9s idle.
- Set the site to English-only for now — hid the Hebrew toggle (Hebrew content and RTL support remain in the code, ready to switch back on).

## v1.3 — 2026-06-10

### Changed
- Screensaver enhancements — a wider, centered terminal window, richer Matrix rain that resolves into more lines (capabilities and credentials), expanded GET sequences, and stylized demo-only shell commands.
- Aligned the certification badges directly beneath the portrait, and gave the contact section a stronger, framed treatment.
- Sharpened the challenge section copy and refined the Hebrew hero line.

## v1.2 — 2026-06-09

### Added
- Favicon and full icon set — the green pulse-dot mark.
- Cyber screensaver — Matrix rain that resolves into the slogan, and a typed GET-command terminal. Appears after 30s idle; any key, click or scroll dismisses it. Honors reduced-motion.
- This public version-history page.

### Changed
- Sharpened the Hebrew copy — a stronger credentials heading and a pass of native-Hebrew fixes.

## v1.1 — 2026-06-09

### Internal
- Rebuilt the single-file site into a structured static project — separate styles, scripts and image assets. No visible change.

## v1.0 — 2025-03-16

- Public launch — Tailored Information Security. The GRC·LABS practice goes live.
