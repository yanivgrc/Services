# Claude Code — Operating Instructions for GRC·LABS

This file tells you (Yaniv) exactly what to paste into Claude Code, in order.
`BRIEF.md` is the full context; this is the runbook.

---

## 0. One-time setup — create the dedicated folder

You asked for a dedicated folder for this work. In your terminal:

```bash
# pick where your projects live, e.g. ~/Projects
cd ~/Projects

# get the live repo (this becomes your dedicated folder: ./Services)
git clone https://github.com/yanivgrc/Services.git grc-labs
cd grc-labs

# copy BRIEF.md AND the latest index.html from this handoff into the folder.
#   The index.html in this handoff is the most up-to-date version (with the
#   newest Hebrew rewrite, credentials, etc). If it differs from the cloned one,
#   use THIS one — overwrite the repo's index.html with it before refactoring.

# install the project skills so Claude Code loads them automatically:
mkdir -p .claude/skills
#   copy the three skill folders from this handoff into .claude/skills/ :
#     .claude/skills/grc-copywriter-he/SKILL.md
#     .claude/skills/grc-copywriter-en/SKILL.md
#     .claude/skills/grc-changelog/SKILL.md

# launch Claude Code in this folder
claude
```

If you don't have Claude Code yet: install Node.js (v18+), then
`npm install -g @anthropic-ai/claude-code`, then run `claude`.
(If anything here differs, check https://docs.claude.com — installation details
change over time.)

Everything below is pasted **into Claude Code**, one prompt at a time. Wait for
each to finish and review the result before sending the next.

---

## Prompt 1 — orient

```
Read BRIEF.md in this folder fully. Then read index.html and summarize back to
me: the design concept, the current file structure, and the first task you'll
do. Don't change anything yet.
```

## Prompt 2 — refactor to a real structure (the foundation)

```
Do the FIRST TASK from BRIEF.md section 3: refactor the monolithic index.html
into a clean static-site structure (separate CSS, JS modules, and decode the
base64 portraits into real image files under assets/img/).

Requirements:
- The rendered site must be visually identical to https://grc-labs.com in dark
  AND light themes, English AND Hebrew, desktop AND mobile.
- Keep the CNAME file untouched.
- No build step, no frameworks — it stays a plain static site.
- Yaniv's national ID must never appear anywhere (see BRIEF.md section 6).
- Work in small commits, each leaving the site working. Show me the new file
  tree and a diff summary before committing.
```

## Prompt 3 — verify the refactor

```
Open the refactored site locally and verify it against the live site: toggle
theme, toggle language, and check a ~390px mobile width. List anything that
differs from https://grc-labs.com and fix it. Then commit.
```

## Prompt 4 — favicon / icon set

```
Implement BRIEF.md section 4 "Favicon / page icon": design a sharp icon that
reads at 16px, built around the green pulse dot / a minimal GRC·LABS monogram.
Generate a full icon set (favicon.ico, PNG sizes, apple-touch-icon, SVG) into
the project and wire it into <head>. Show me the icon before finalizing.
```

## Prompt 4b — version-updates page (/changelog)

```
Implement BRIEF.md section 9 and use the grc-changelog skill: create the root
CHANGELOG.md and a styled on-site /changelog page (bilingual EN/HE, dark+light,
green accent, mono version numbers, full RTL in Hebrew), linked discreetly from
the footer. Seed it with v1.0 = public launch, and log the structural refactor
and the favicon as their own entries. Use the grc-copywriter-he and
grc-copywriter-en skills for the entry wording. Show me before committing.
```

## Prompt 5 — the screensaver (the centerpiece)

```
Build the cyber screensaver from BRIEF.md section 5 as assets/js/screensaver.js.

- Trigger after 30s of no interaction; ANY interaction instantly dismisses it
  and resets the timer.
- Cycle three modes with smooth transitions:
  1) Matrix rain in the site's phosphor green that periodically coalesces to
     spell "Tailored Information Security".
  2) Yaniv's portrait as green ASCII art (use the existing portrait image).
  3) Typed terminal "GET ..." lines pulled from the real credentials and
     capabilities: GET CISO, GET DPO, GET ISO 27001, GET CISSP, GET CISM,
     GET IR, GET GRC — each returning a one-line description.
- Respect prefers-reduced-motion (static frame, no animation).
- Pure canvas/CSS/JS, no heavy libs. Pause on tab hidden. Match the theme.
- Self-contained and easy to disable.

Build it behind a small feature flag so we can turn it on/off easily. Show me a
working version before committing.
```

## Prompt 6 — ship

```
Walk me through deploying: confirm the site still works in all theme/language/
viewport combinations, then push to origin main so GitHub Pages publishes to
grc-labs.com. Remind me to hard-refresh to bypass cache.
```

---

## How to ask for future ideas

Once the structure exists, new features are easy. Pattern for any new idea:

```
In the GRC·LABS project (see BRIEF.md for concept and constraints):
<describe the feature>. Keep it consistent with the classified-lab aesthetic
and the green accent, respect reduced-motion and both themes/languages, work in
small commits, and never expose the national ID. Show me before committing.
```

## Guardrails to keep reminding Claude Code

- Static site only — no build step / framework without your OK.
- Never delete CNAME.
- National ID never appears anywhere.
- Every change verified in dark+light, EN+HE, desktop+mobile.
- Small, described commits; site always working.
