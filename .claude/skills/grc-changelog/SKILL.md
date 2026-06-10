---
name: grc-changelog
description: >-
  Maintains the GRC-Labs version history — both the CHANGELOG.md file and the
  on-site /changelog (version updates) page. Use this skill whenever a change
  ships or is about to ship, or when the user says "log this", "update the
  changelog", "bump the version", "add a release note", "what changed", or asks
  to create/edit the version-updates page. Trigger it at the END of any feature
  work on this site (refactor, favicon, screensaver, copy changes, etc.) so the
  change gets recorded consistently and bilingually. This skill defines the
  format, the versioning scheme, the bilingual page, and how each entry is
  written so the history stays clean as the site evolves.
---

# GRC-Labs — Changelog & Version Updates

The site is going to keep evolving, so it keeps a public, bilingual version
history. There are two artifacts, kept in sync:

1. **`CHANGELOG.md`** — the source of truth at the repo root (machine- and
   developer-friendly).
2. **`/changelog` page** — an on-site, styled, bilingual (EN/HE) page that
   matches the site's "classified lab" aesthetic and reads the same content.

## Versioning scheme

Use **CalVer-ish dated releases** with a simple incrementing version, since this
is a single evolving site, not a library:

- Format: `vMAJOR.MINOR — YYYY-MM-DD`
- **MINOR** bumps for features and content (favicon, screensaver, copy passes).
- **MAJOR** bumps for big reworks (the structural refactor, a redesign).
- The very first entry should be `v1.0 — <date>` = "Public launch" (the site
  as it first went live on grc-labs.com).
- The refactor (monolith → structured static site) is a notable entry — log it.

## Entry categories

Group changes under these headings (omit empty ones), Keep-a-Changelog style:

- **Added** — new features/sections (screensaver, favicon, a new capability).
- **Changed** — changes to existing behavior/content (copy rewrites, restyle).
- **Fixed** — bug fixes (RTL glitch, broken badge link).
- **Security / Privacy** — anything touching the privacy posture.
- **Internal** — refactors, structure, tooling (not user-facing but worth a
  line for history).

## How to write an entry

- One line per change, past tense, plain language: "Added the cyber screensaver
  (Matrix rain, ASCII portrait, GET-command terminal)."
- User-facing voice — concise, no internal jargon dumps. This page is public.
- **Bilingual:** every entry exists in English AND native Hebrew. For the
  Hebrew, defer to the `grc-copywriter-he` skill's rules (source-quality, terms
  in English, correct RTL). For English tightness, defer to `grc-copywriter-en`.
- **No PII, ever** — never reference Yaniv's national ID. Don't expose secrets,
  internal paths, or anything that weakens security.
- Keep Labs project internals vague, consistent with the rest of the site.

## CHANGELOG.md format

```markdown
# Changelog — GRC·LABS

All notable changes to grc-labs.com. Newest first.

## v1.2 — 2025-XX-XX
### Added
- ...
### Changed
- ...

## v1.1 — 2025-XX-XX
### Internal
- Refactored the single-file site into a structured static project.

## v1.0 — 2025-XX-XX
- Public launch: Tailored Information Security.
```

## The on-site /changelog page

- A new section/page styled to match: dark/light themes, green accent, mono
  type for version numbers, the same blueprint feel. Reuse existing CSS vars and
  components — don't reinvent styling.
- Bilingual via the same i18n mechanism (`data-i18n` + the I18N object), full
  RTL in Hebrew. Version numbers and dates stay LTR.
- Each release: version + date heading, then grouped entries.
- Link it discreetly (footer is ideal — "version history" / "עדכוני גרסאות").
- Respect `prefers-reduced-motion` if any animation is added; keep it
  accessible (headings, lists, aria where relevant).
- Optional nice touch: a small "decrypt" reveal on version numbers, consistent
  with the site's `data-decrypt` signature — only if it doesn't hurt clarity.

## Workflow (run this at the end of a change)

1. Determine the bump (MINOR for most, MAJOR for big reworks).
2. Add a dated entry to `CHANGELOG.md` under the right categories, newest first.
3. Mirror the entry into the `/changelog` page's i18n content, EN + HE.
4. Keep both in sync — the page should never disagree with the file.
5. Verify the page in dark+light, EN+HE, desktop+mobile (per the project's
   working agreement) before committing.
6. Use a clear commit message, e.g. `changelog: v1.2 — add screensaver`.

## When to consult the copy skills

- Writing/editing the Hebrew side of any entry → use `grc-copywriter-he`.
- Tightening the English side → use `grc-copywriter-en`.
- This skill owns *structure and process*; the copy skills own *wording*.
