# Changelog — GRC·LABS

All notable changes to grc-labs.com. Newest first.

## v1.26 — 2026-06-12

### Added
- A 3D cochlea — a logarithmic spiral shell winding inward, rendered like the torus.

### Changed
- The Menorah is now green and coalesces in and out through the matrix.
- The solar system's orbital plane tilts over time — a shifting perspective.
- Voyager broadcasts light transmission signals from its dish.
- The portrait is rendered with edge detection — a cleaner, sketch-like face.
- "Coming soon" teasers appear far less often, and removed the Möbius strip.

## v1.25 — 2026-06-12

### Added
- The Knesset Menorah — rendered in gold from hand-supplied ASCII art, coalescing out of the matrix.

### Changed
- Recreated the ASCII portrait — posterized and higher-contrast, so the face reads cleanly instead of as noise.
- The butterfly curve is denser, so its wings fill in.

## v1.24 — 2026-06-12

### Added
- More torus-style 3D surfaces — a sphere, a Möbius strip, a coil spring, and a twisted torus, all rendered like the spinning donut.

### Changed
- The "brain" window's second pane now streams varied network commands (ss, dig, ping, traceroute, arp, nmap, curl, whois) instead of the reasoning log; network commands moved out of the focus pane, which now stays on SOC work.
- The encryption scene now runs in reverse — a big salted cipher block decrypts to reveal one line: the slogan.
- The geometry shapes (golden spiral and the rest) now rotate continuously, so they never freeze mid-scene.
- Removed the contact line from the terminal (it lives on the molecule and in the rotating-words scene) and dropped the oscilloscope scene (kept the audio waveform).

## v1.23 — 2026-06-12

### Added
- A rotating-words scene — the slogan, the contact line, LinkedIn and "coming soon" teasers scramble in like the site title.
- Real SOC operations in the terminal — SIEM detection of hostile sources, alert triage (MITRE technique + IOC enrichment), and threat hunting.

### Changed
- The molecule is now true 3D — rotating, with depth-shaded atoms and bonds.
- The 3D solids (cube, tetrahedron, pyramid) read clearly as 3D now — ambient light plus a depth gradient across each face — and are zoomed in; the pyramid uses precise Giza proportions and sweeps from a top-down to a side view.
- The portrait now uses the brighter artwork with its background removed.
- Shortened the matrix wipe between scenes.
- Added a copyright notice (code and footer).
- Removed the RF scene.

## v1.22 — 2026-06-11

### Added
- An audio-waveform oscilloscope — just the signal, filled from the centre line.

### Changed
- Removed the RF scene and the GRC·LABS brand screen.

## v1.21 — 2026-06-11

### Added
- Three new ASCII scenes — an analog oscilloscope with a live sweeping trace, an AES encryption illustration (plaintext turning to ciphertext round by round), and a 3D tribute to Voyager.
- More terminal commands — netstat, nslookup, mpremote and an SMTP session — alongside the existing ones.

### Changed
- The pyramid is now a single 3D solid that turns to show top-down and side views; dropped the flat pyramid scenes and the π scene.
- The GRC·LABS illustration now uses the site's display font.
- Higher ASCII resolution for the 3D shapes.
- The contact line is now a short "צור קשר", left-aligned at the top of the terminal.
- Replaced the circuit-board scene with the oscilloscope.

## v1.20 — 2026-06-11

### Added
- A 3D cube and a tetrahedron with a hollow sphere at its centre — rendered like the torus.

### Changed
- The matrix rain now uses a richer charset (katakana, kanji, Greek and symbols, with the digits of π streaming through) and coalesces in and out more smoothly.
- The contact line now sits at the top of the terminal session, in green.
- RF is now a conversation between components — packets hop node to node with wave rings at the sender.
- Every molecule scene now carries the contact line.
- Dropped the Menorah and removed the sun over the pyramids.

## v1.19 — 2026-06-11

### Changed
- The Menorah now has straight, angular branches (Knesset style) instead of curved ones.

## v1.18 — 2026-06-11

### Added
- A π scene — the digits of π spiral outward as if being computed, place by place.
- A 3D RF link — spherical wavefronts broadcasting from an antenna.

### Changed
- GRC·LABS now coalesces out of the matrix rain and dissolves back, instead of the flat ASCII-art.
- The Menorah is now unlit and coalesces out of the matrix and back, in its classic seven-branched shape.
- The portrait now shows only for a moment as the matrix forms and clears.

## v1.17 — 2026-06-11

### Added
- More terminal scripts in the focus pane — alongside `pip install`, an SSH login to the workspace, a `ping google.com` reachability check, and an interactive Python session running the risk model — each themed to the chosen service.
- Four new ASCII scenes — a drawn Giza scene sampled into ASCII, the seven-branched Temple Menorah in gold with flickering flames, a printed-circuit board with chips and travelling signal pulses, and an orbital astronomy simulation.

## v1.16 — 2026-06-11

### Added
- GRC·LABS rendered as live ASCII art — a decrypt reveal that keeps shimmering.

### Changed
- The "brain" window varies again — one, two or three panes — and its reasoning pane now keeps working: a looping analysis log that ticks each pass off with "done · OK" instead of going idle.
- The ASCII portrait now coalesces out of the matrix rain and dissolves back into it — no longer static.

## v1.15 — 2026-06-11

### Changed
- The 3D pyramid now holds a steady three-quarter angle (slow spin) so its faces read clearly, with ASCII shading varying across each face.
- Dropped the framed message banner — the matrix rain carries the message moments now.

## v1.14 — 2026-06-11

### Fixed
- The ASCII portrait now crops tight on the face so it fills the frame, centred — no longer small, low or clipped.

## v1.13 — 2026-06-11

### Added
- A real 3D rotating pyramid — z-buffered and face-shaded, spinning like the torus.

### Changed
- The "brain" window now always splits into three panes — a focus stream, a reasoning log, and a live 3D render — with different content each time.
- The matrix rain now honours π — each column streams the digits of π, and the π glyph itself surfaces in amber.
- The ASCII portrait now fits the frame cleanly (no longer clipped) and cycles through a few renderings.
- Replaced the "Tailored Information Security" message with the GRC·LABS mark.

## v1.12 — 2026-06-11

### Added
- A live "thinking" indicator in the status bar — a spinner and rotating Hebrew status words (בטיפול / בבדיקה / התנעה) — so the session never reads as idle.

### Changed
- Removed the static holds — the geometry shimmers, the pyramids catch a slow light sweep, and the brain window more often runs a live 3D render.

## v1.11 — 2026-06-11

### Changed
- The screensaver's "brain" window now varies its layout — sometimes a single focus pane, sometimes focus plus a reasoning log, sometimes a three-pane split that adds a live 3D render — so it never reads the same twice.
- ASCII scenes now lay down a faint dot field in the empty cells, giving the space form.
- Restored the previous ASCII portrait rendering — it read better.

### Fixed
- Removed the "install app" (PWA) prompt — the site stays a plain page, nothing to install.

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
