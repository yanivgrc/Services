# GRC·LABS — Project Brief

This document is the single source of truth for the GRC-Labs website. Read it
fully before touching code. It is written for a developer (human or Claude Code)
picking the project up fresh.

---

## 1. What this is

A representative marketing landing page for **GRC-Labs** — a private
cybersecurity, GRC (governance, risk & compliance) and privacy consultancy run
by **Yaniv Dadon**, a working CISO with 20+ years in security and engineering.

- **Live site:** https://grc-labs.com
- **Hosting:** GitHub Pages, repo `yanivgrc/Services`, `main` branch. A `CNAME`
  file points the domain at the repo — **never delete it.**
- **Audience:** decision-makers and technical leadership at organizations that
  need senior, hands-on security — government and enterprise grade.
- **Languages:** English (default) + Hebrew, full RTL. Bilingual via a JS i18n
  object with `data-i18n` attributes.

The official slogan is **"Tailored Information Security"** and it runs through
the whole site as a recurring thread.

---

## 2. Design concept — "the classified cyber lab"

The whole aesthetic is a deliberate, restrained "classified lab dossier" feel.
Keep this discipline; do not let it drift into generic SaaS or neon-cyberpunk.

- **Dark theme (default):** night-blue background (`#080B14`) with a faint
  blueprint grid and a phosphor-green signature accent.
- **Light theme:** "blueprint on paper" — light background, dark grid.
- **Theme toggle = black-hat / white-hat.** The button is action-oriented:
  shows **GO WHITE** (in dark) / **GO BLACK** (in light), with a fedora-hat icon
  of the destination. This is a nod to attacker vs. defender. Keep it.
- **Brand accent: green.** `LABS` in the logo, the pulsing header dot, the
  `// tailored` notes, and the credential marks are all green. The green is
  tuned to roughly match the CISSP / ISC2 grass-green (dark `#63B22E`,
  light `#4C8A1E`). Amber is the secondary UI accent.
- **Signature animation:** text "decrypt" scramble on headings (`data-decrypt`).
- **Fonts:** Space Grotesk (display), IBM Plex Sans (body), IBM Plex Mono
  (codes / utility), IBM Plex Sans Hebrew (Hebrew).

### Page sections, in order
topbar → hero (eyebrow, GRC·LABS title, sub, meta, portrait + certification
trust strip) → Capabilities (9 cards) → Credentials (6 certification badges) →
The Labs (6 project cards + classified R&D banner) → The Challenge (teaser +
cipher easter egg) → Contact → footer.

---

## 3. Current state — and the first job

The site currently ships as **one monolithic `index.html`** (~160 KB): all CSS
and JS are inline, and the two portrait illustrations are embedded as enormous
base64 strings. That was fine for a single-file drop onto GitHub Pages, but it
is the wrong foundation for building richer features over time.

### >>> FIRST TASK: refactor into a real project structure <<<

Before building anything new, split the monolith into a maintainable structure.
Suggested layout (adapt as you see fit, but separate concerns):

```
/
├── index.html            # markup only
├── assets/
│   ├── css/styles.css     # extracted styles
│   ├── js/
│   │   ├── i18n.js        # the EN/HE translation object
│   │   ├── theme.js       # black-hat/white-hat toggle
│   │   ├── decrypt.js     # heading scramble animation
│   │   └── screensaver.js # NEW — see section 5
│   └── img/
│       ├── portrait-dark.jpg
│       └── portrait-light.jpg   # decode the base64 back into real files
├── CNAME                 # keep exactly as-is
├── favicon / icon set    # see section 4
└── BRIEF.md              # this file
```

**Constraints during refactor:**
- The live rendered result must be visually identical to the current site,
  in both themes, both languages, and on mobile.
- Decode the base64 portraits into real image files and reference them normally.
- Verify before committing: open the page, switch theme, switch language,
  check mobile width. Compare against https://grc-labs.com.
- Keep everything working as a static site — GitHub Pages serves plain files,
  no build step unless Yaniv opts into one.

---

## 4. Near-term polish

### Favicon / page icon
The current page has no proper icon. Design a small, sharp icon that reads at
16px: built around the green `·` separator / pulse dot, or a minimal monogram.
Ship a full set (favicon.ico, PNG sizes, apple-touch-icon, SVG if possible) and
wire it into `<head>`.

### Certification badges
CISSP and CISM badges are hotlinked from Credly's CDN:
- CISSP: `https://images.credly.com/images/6eeb0a98-33cb-4f72-bfc3-f89d65a3286c/linkedin_thumb_image.png`
  → verify page `https://www.credly.com/badges/997e8e29-fea2-4a2b-abc1-b8697b5e2783`
- CISM: `https://images.credly.com/images/d0891dee-6360-496c-9981-40652523b502/linkedin_thumb_dbdea6794f1a6bbcc18d90eea923421aac7df6b5.png`
  → verify page `https://www.credly.com/badges/e3d5220b-04f4-4b10-b3de-7a09eb6f9cbb`

These thumbs carry some background padding. **Preferred upgrade:** Yaniv
downloads the official square transparent PNGs from Credly and drops them into
`assets/img/`; then reference them locally so they're crisp and not dependent on
Credly's CDN. The other four credentials (ISO 27001 LA, DPO, CISO, Cloud) stay
text-only — they're institutional and have no shareable badge.

---

## 5. The big idea — the cyber screensaver

This is the centerpiece of "make it amazing over time."

**Trigger:** after **30 seconds of no interaction** (no scroll, mouse, key,
touch), an animated full-screen overlay fades in. **Any interaction**
(touch / mouse / key / scroll) instantly dismisses it and resets the timer.

**Content — cycle through three modes**, transitioning smoothly between them:

1. **Matrix rain** — falling green glyphs in the site's phosphor green, that
   periodically coalesce to spell **"Tailored Information Security"** before
   dissolving back into the rain.
2. **ASCII portrait** — Yaniv's portrait rendered as ASCII / ANSI art in green
   on the dark background. (Source: the existing portrait illustration.)
3. **"GET …" terminal lines** — typed-out commands that pull from the site's
   real credentials and capabilities, e.g.
   `> GET CISO`, `> GET DPO`, `> GET ISO 27001`, `> GET CISSP`, `> GET CISM`,
   `> GET IR`, `> GET GRC` … each "returning" a one-line description. This ties
   the screensaver directly to the real content and doubles as a subtle
   credentials flex.

**Design rules:**
- Respect `prefers-reduced-motion` — if set, use a static frame, no animation.
- Respect the active theme (green-on-dark; a tasteful light-theme variant is a
  bonus, not required).
- Pure canvas/CSS/JS, no heavy libraries. Keep it performant; pause animation
  when the tab is hidden (`visibilitychange`).
- It must never trap the user — first interaction always exits cleanly.
- Keep the typography and green consistent with the rest of the site.

Build it as `assets/js/screensaver.js`, self-contained and easy to toggle off.

---

## 6. Non-negotiables

- **PRIVACY — critical.** Yaniv's national ID number appears on the source
  certificate documents. It must **NEVER** appear anywhere in the site, code,
  comments, alt text, or commits. Only name + credential details.
- **No fake credentials or claims.** Everything stated is real and backed by
  proof. Don't invent certifications, clients, or project details.
- **The Labs projects stay deliberately vague** (SENTINEL, BEDROCK, VAULT,
  REFORGE, BEACON, ECHO + a classified R&D banner). Mystery is intentional;
  don't over-explain them. Patents: "patent pending" framing is fine, never
  disclose the underlying tech.
- **Hebrew is source-quality, not translated.** It was rewritten from scratch
  as native Hebrew. If you touch it, keep it native — don't regress to literal
  translations of the English. Pro-grade Hebrew copywriting is still a future
  improvement Yaniv may bring a human copywriter in for.
- **Accessibility:** keep aria states on toggles, alt text on images,
  aria-hidden on decorative elements, focus-visible, and reduced-motion support.

---

## 7. Working agreement

- Commit in small, described steps. Each commit should leave the site working.
- After any change: verify dark + light, EN + HE, desktop + mobile.
- Don't add a build step, framework, or dependency without Yaniv's say-so —
  it's a static site and should stay trivially deployable to GitHub Pages.
- When in doubt about scope or a destructive action, ask rather than guess.

---

## 8. Skills (in .claude/skills/)

This project ships with three Claude Code skills. Install them at
`.claude/skills/<name>/SKILL.md` so they load automatically when relevant:

- **grc-copywriter-he** — Hebrew copywriting. Triggers on any Hebrew writing,
  rewriting, or review. Encodes the "source-language, not translation" rule,
  the voice, term-handling, and spelling. Use it for every Hebrew string.
- **grc-copywriter-en** — English copywriting. Triggers on any English copy
  work. Encodes Yaniv's "working CISO, not a brochure" voice and the buzzword
  ban. English is the default language, so this matters most.
- **grc-changelog** — Version history. Owns CHANGELOG.md + the on-site
  /changelog page, the versioning scheme, and bilingual entry format. Run it at
  the END of any shipped change.

The copy skills own *wording*; the changelog skill owns *structure/process* and
defers to the copy skills for the actual text.

---

## 9. Version-updates page (/changelog)

The site will keep evolving, so it maintains a public bilingual version history:
a root `CHANGELOG.md` plus a styled on-site `/changelog` page that matches the
classified-lab aesthetic (dark/light, green accent, mono version numbers, RTL
Hebrew). Link it discreetly from the footer ("version history" / "עדכוני
גרסאות"). See the `grc-changelog` skill for the full format and workflow.

Seed it with: `v1.0` = public launch, and log the structural refactor as its own
entry. Every future feature (favicon, screensaver, copy passes) gets an entry.
