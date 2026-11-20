---
name: feature-walkthrough
description: Turn a project, feature, PR/branch, or system design into an interactive step-by-step walkthrough (animated isometric architecture diagram, narrative panel, live metrics, timeline) delivered as one self-contained HTML file for presenting or explaining to a team. Use when the user wants to explain, present, demo, or onboard people on how a feature/project works, or asks for a visual explainer, walkthrough, or "deck" of a codebase or design.
---

# Feature walkthrough

This skill produces a single `.html` file. Each walkthrough is 6–10 steps, and every step has:

- a diagram change: blocks drop in, links draw, packets flow, nodes heat up or die
- a chapter chip (Problem, Solution, How it works, Trade-off, …)
- short narrative text with a callout and a "What changed" list
- metrics that animate and turn red, amber or green
- a timeline and "You'll learn" goals

A deck can hold several walkthroughs (one per feature), grouped in sections, with an overview
page. It works offline and is presented with the keyboard or a clicker.

The format reproduces the pattern of https://designed-to-scale.vercel.app (see
`references/storytelling.md`). The engine is original code in `assets/template.html`. Don't edit
it for normal requests; you only author deck JSON.

## Files

| path | use |
|---|---|
| `scripts/build.mjs` | validate the deck and inline it into HTML. `--check` validates only, `--open` opens the result, `--icons` lists icon names |
| `scripts/check.mjs` | layout lint in headless Chrome: overlaps, links crossing entities, scenes too wide |
| `scripts/snapshot.mjs` | PNG per step (`--steps 1,4,9`, `--lesson id`, `--dark`, `--overview`, `--size WxH`) |
| `references/storytelling.md` | **read before outlining**: narrative rhythm, step anatomy, metrics, story shapes per feature type, research checklist |
| `references/schema.md` | **read before authoring**: every field, entity type, link, flow, card |
| `references/layout.md` | coordinates, spacing rules, recipes, how to fix lint messages |
| `examples/photo-uploads.json` | full English example (9 steps, backend feature, uses cast/wires, cards, every metric type) |
| `examples/avisos-envio.json` | Spanish example (`lang: "es"`, product feature, device/zone/fan-out) |

Requirements: Node ≥ 22, and Chrome/Chromium/Edge/Brave for check and snapshot (`CHROME_PATH`
overrides detection).

## Workflow

1. **Scope.** Settle these before starting:
   - **Target**: a repo path, a feature, a PR/branch, a design doc, or a plain description.
   - **Audience**: team, leadership, or new hires. This sets depth and metrics.
   - **Language**: write the content in the user's language; set `lang` (`en`/`es`, or `ui` overrides).
   - **Size**: one feature means one walkthrough. A project means 2–6 walkthroughs plus an
     optional "Big picture" one.

   Ask only when the target is genuinely ambiguous. Otherwise proceed.
2. **Research. Facts before story.** Follow the checklist in `references/storytelling.md`
   (entry points, main path, collaborators, numbers, failure handling, decisions, git history,
   tests). For a branch or PR, use `git log --oneline <base>..HEAD` and
   `git diff --stat <base>...HEAD`, then read the key hunks. Build a fact sheet: component →
   role → file, real numbers with their source, failure modes, and decisions with rejected
   alternatives. For large repos, parallelize with subagents if available.
3. **Outline.** Write one row per step: chapter, short label, title, the single diagram change,
   and the metric deltas. Follow the tension → relief rhythm: open with pain the audience
   recognizes, let each fix reveal the next problem, and end with a recap. If the user wants to
   review first, show the outline and wait. Otherwise continue.
4. **Author** `walkthroughs/<slug>/<slug>.json` in the user's project, or wherever they ask.
   - Start from the closest example.
   - Define every component once in `cast` and every connection once in `wires`. Steps then
     reference them by id (`true` or small overrides).
   - Keep ids stable across steps so they animate.
   - Pick coordinates with `references/layout.md`: actor bottom-left, main path up-right along
     +y, branches along ±x.
   - Set `"illustrative": true` unless every number is sourced.
5. **Build.** Run `node <skill>/scripts/build.mjs walkthroughs/<slug>/<slug>.json`. Fix all
   errors (✗) and any warnings that matter (⚠: unknown icons, long labels, missing values).
6. **Lint the layout.** Run `node <skill>/scripts/check.mjs walkthroughs/<slug>/<slug>.html`.
   Fix and rebuild until it's clean. At most, a few ≤ 5 px tag-over-line overlaps may remain.
   The lint uses the real renderer geometry.
7. **Look at it.** Run
   `node <skill>/scripts/snapshot.mjs <html> --steps 1,<middle>,<a card step>,<last> --out /tmp/<slug>-shots`
   and read the PNGs. Check for clutter, illegible small scenes, cards hiding content, text
   overflow, and whether step 1 reads as "problem" at a glance. Iterate on the JSON, not the
   template.
8. **Deliver.** Open the file with `build.mjs … --open` or `open <html>`. Reply with:
   - the path
   - a 1-line summary per walkthrough
   - which numbers are sourced (with files) and which are illustrative
   - the controls: `→`/`←` or clicker, `P` presenter mode, `R` replay, `Space` pause,
     `T` theme, deep links `#/<id>/<step>`

   Offer to adjust the story, depth, or language.

## Rules

- **One idea per step.** Each step changes the diagram and moves a metric. Keep bodies to
  40–90 words; split anything longer.
- **Truthful numbers.** Never present invented metrics as real. Mark estimates `illustrative`.
- **Respect the visual budget.** 4–9 entities per scene, at most 4 metrics, at most 2 tags per
  entity, link labels of 22 characters or fewer, block labels of 10 characters or fewer per line.
- **Keep the same cast across steps.** Bring things in, dim them, or kill them rather than
  re-laying out the scene. Moving an entity is an animation, so do it only when it means
  something.
- **Escaping.** Body and callout text are HTML. Escape literal `<`/`>` as `&lt;`/`&gt;`, or wrap
  them in `<code>`.
- **Don't touch `assets/template.html`** unless the user asks for a new capability. If you do,
  rebuild the examples and run check and snapshot on them.
- **Keep the repo clean.** Put screenshots in `/tmp`. Commit only the JSON and HTML, and only if
  the user wants them versioned.
