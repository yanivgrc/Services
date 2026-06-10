# Changelog — GRC·LABS

All notable changes to grc-labs.com. Newest first.

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
