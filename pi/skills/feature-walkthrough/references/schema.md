# Deck schema

A deck is JSON (or an ES module whose `export default` is the deck — useful when you want
helper functions to generate repeated pieces). `build.mjs` validates it, resolves `cast`/`wires`
references, and inlines it into one HTML file.

## Minimal skeleton

```json
{
  "title": "Checkout",
  "lang": "en",
  "sections": [{ "title": "Payments", "lessons": [{
    "id": "card-retries",
    "title": "Card Retries",
    "summary": "What happens when a card payment times out.",
    "minutes": 5, "level": "intermediate", "illustrative": true,
    "metrics": { "ok": { "label": "Checkouts OK", "icon": "cart", "format": "%", "good": ">=99", "warn": ">=95" } },
    "legend": ["req", "res", "fail"],
    "goals": [{ "text": "Why one slow call hurts everyone", "step": 1 }],
    "cast": {
      "users": { "type": "users", "x": 0, "y": -18, "label": "shoppers" },
      "api":   { "type": "service", "x": 0, "y": -6, "color": "orange", "icon": "cart", "label": ["Checkout", "API"] }
    },
    "wires": { "ua": { "from": "users", "to": "api", "heads": "both" } },
    "steps": [{
      "short": "Slow call", "chapter": "problem",
      "title": "Payments answer in 30 s",
      "body": ["First paragraph.", "Second paragraph."],
      "callout": { "kind": "warn", "text": "One-sentence lesson." },
      "changes": ["+ Added thing", "~ Changed thing", "- Removed thing"],
      "metrics": { "ok": 40 },
      "scene": {
        "entities": { "users": true, "api": { "heat": 0.9, "cpu": 0.98 } },
        "links": { "ua": { "label": "POST /checkout", "fail": 0.4 } },
        "flows": [{ "route": ["ua"], "rate": 1.5, "bounce": true }]
      }
    }]
  }]}]
}
```

Shorthands accepted by the builder: `{ "title", "lessons": [...] }` (one unnamed section), or a
single lesson object (has `steps`) at the top level.

## Deck

| field | type | notes |
|---|---|---|
| `title` | string | top bar + overview heading. Last word gets a highlighter mark. |
| `subtitle` | string | top bar, muted |
| `summary` | html | overview page text (multi-walkthrough decks) |
| `author` | string | top bar right |
| `icon` | icon | brand mark (default `workflow`) |
| `lang` | `"en"` \| `"es"` | UI chrome language. Content is whatever you write. |
| `ui` | object | override any UI string, e.g. `{ "next": "Weiter", "chapters": { "problem": "Problem" } }` |
| `theme` | `"light"` \| `"dark"` | initial theme (user can toggle with `T`) |
| `id` | string | key for progress in localStorage (defaults to title) |
| `sections` | Section[] | `{ title, color?, num?, lessons: Lesson[] }` — color: sand, green, violet, orange, blue, teal, rose, olive, slate, amber, red |

More than one walkthrough → overview page at `#/` plus a sidebar. One walkthrough → opens it directly.

## Lesson (one walkthrough)

| field | type | notes |
|---|---|---|
| `id` | kebab-case | unique; URL is `#/<id>/<step>` |
| `title`, `summary` | string / html | header |
| `minutes` | number | badge |
| `level` | `beginner` \| `intermediate` \| `advanced` \| text | badge |
| `illustrative` | bool | shows an "illustrative numbers" badge — set it whenever numbers are not sourced |
| `metrics` | `{ key: MetricDef }` | 2–4 recommended, displayed in order |
| `legend` | `(kind \| [kind, label])[]` | packet legend under the stage |
| `goals` | `{ text, step }[]` | "You'll learn"; `step` is **1-based**; ticks on when reached; click jumps |
| `cast` | `{ id: Entity }` | reusable entity definitions (resolved at build) |
| `wires` | `{ id: Link }` | reusable link definitions (resolved at build) |
| `steps` | Step[] | 6–10 is the sweet spot |

### MetricDef

| field | notes |
|---|---|
| `label` | short, uppercase in UI ("p99 latency") |
| `icon` | icon name |
| `format` | `num` (1.2k) · `ms` (820 ms / 1.3 s) · `s` (12 s / 4 min / 2 h) · `%` · `x` (1.2×) · `$` · `bytes` · `text` |
| `unit` | suffix appended after formatting |
| `good`, `warn` | conditions like `">=99"`, `"<=800"`. Numeric value → good if `good` holds, else warn if `warn` holds, else bad. No conditions → neutral. |
| `levels` | for text values: `{ "4×": "bad", "1×": "good" }` |

Per-step value: number, string, `null` (shows —), or `{ "value": "stuck", "level": "bad" }` (level: good, warn, bad, none). Numbers animate between steps and show ▲/▼ against the previous step.

## Step

| field | notes |
|---|---|
| `short` | timeline label, ≤ 14 chars; also used in the "Next: …" button |
| `chapter` | `setup` `context` `problem` `solution` `technique` (shown as "How it works") `tradeoff` `insight` `decision` `demo` `result` `recap` — sets the colored chip |
| `title` | a claim, not a topic ("Retries become a storm", not "Retries") |
| `body` | array of HTML paragraphs. Allowed: `<b>`, `<em>`, `<code>`, `<span class="term">` (highlighted new term), `<ul class="takeaways"><li>…` (recap), `<table>` |
| `callout` | `{ kind, text, label?, icon? }` — kinds: `warn` (Watch out), `tip` (Good to know), `insight` (Key idea), `decision`, `next` (Up next), `info` |
| `changes` | "What changed" list; prefix `+` added, `~` changed, `-` removed |
| `metrics` | `{ key: value }` for every metric of the lesson |
| `scene` | `{ entities, links, flows, card }` |

## Scene

### entities

`{ id: true | overrides | fullEntity }` (or an array of ids = all `true`).

- `true` → use `cast[id]` as is.
- object without `type`/`x` → shallow-merged onto `cast[id]` (e.g. `{ "heat": 0.8, "tags": [...] }`).
- object with `type`/`x` → standalone entity.

**Keep ids stable across steps**: an id present in consecutive steps animates (moves, heats up,
dies, grows); a new id drops in with a spotlight; a missing id fades out. Override props reset
each step — a step only has what it lists.

Common props on all types: `opacity` (0–1), `lift` (px).

| type | props (defaults) |
|---|---|
| `service` (alias `block`) | `x`, `y`, `s` 4 (footprint, grid units), `h` 46 (px), `color` blue, `icon` server, `label` (string or `["Line 1","Line 2"]`, ≤ ~10 chars/line), `sub` (small 3rd line), `heat` 0–1 (red glow = under stress), `cpu` 0–1 (gauge pill; omit to hide), `dead` 0/1 (grey + red ✕), `dim` 0–1 (faded = not relevant now), `tags`, `pills` above\|below |
| `users` (alias `crowd`) | `x`, `y`, `s` 7 (or `sx`,`sy`), `count` 12, `label` (pill below, users icon), `tags` |
| `db` | `x`, `y`, `r` 1.7, `h` 40, `color` purple, `icon` database, `label` (below), `tags`, `heat`, `cpu`, `dead`, `dim` |
| `queue` | `x`, `y`, `n` 4 (cubes, animates), `dir` `[0,1]` or `[1,0]`, `color` yellow, `label` (below), `icon` (label icon, default inbox), `tags` |
| `device` | `x`, `y`, `form` laptop\|phone, `icon` (on screen), `label` (below, user icon), `tags` |
| `zone` | `x0`,`x1`,`y0`,`y1` (or `x`,`y`,`sx`,`sy`), `label`, `tone`, `icon`, `labelAt` bottom\|top\|left\|right — dashed floor area (VPC, region, third party, team ownership). Drawn under everything. |
| `note` | `x`, `y`, `z` 0, `text`, `tone`, `icon` — free-floating pill annotation |

Colors: `blue` `green` `orange` `yellow` `purple` `red` `teal` `pink` `gray` `slab` `dark`.
Tones (tags, notes, zones, link labels): `paper` `red` `green` `amber` `violet` `blue` `gray` `teal`.
Tag: `{ "text": "4× normal load", "tone": "red", "icon": "alert" }` or a plain string.

### links

`{ id: true | overrides | { from, to, ... } }` (or an array of ids).

| prop | notes |
|---|---|
| `from`, `to` | entity ids present in the same step |
| `via` | elbow points: `[x, y]`, `"entityId"`, or `["api+3", "db"]` (x from api.x+3, y from db.y) |
| `label`, `labelTone`, `icon` | pill auto-placed beside the line (≤ ~22 chars) |
| `labelAt` | 0–1 along the line (default .5) to nudge the label |
| `style` | `solid` · `dashed` (async/optional) · `off` (grey, disabled/cached) · `hot` (red) · `good` (green) |
| `heads` | `end` (default) · `both` (request/response) · `none` · `start` |
| `fail` | 0–1 probability a packet reaching the end of this link bursts red ✕ |

### flows

Packets that run once the step's transition settles. Each flow:

| prop | notes |
|---|---|
| `route` | `[linkId, ...]` traveled `from → to`; consecutive links must connect (`a.to == b.from`) |
| `routes` | alternative: `[{ "route": [...], "kind"?, "weight"? }]`; round-robin, or `"pick": "weights"`; `"fanout": true` sends on all routes at once |
| `kind` | `req` (orange) · `res` (green) · `retry` (amber) · `slow` (amber, slow) · `ping` (hollow green, health check) · `event` (violet) · `write` (dark square) · `msg` (amber square) · `heavy` (big orange square) · `fail` (always bursts red at the end) |
| `pattern` | kinds cycled per packet, e.g. `["req","req","req","slow"]` |
| `rate` | packets per second (0.2–4 typical; > 4 reads as "flood") |
| `bounce` | return along the same route as a green response |
| `hold` | seconds to wait (blinking) at the far end before returning — "waiting" |
| `speed` | multiplier (default 1) |

### card

A HUD panel docked automatically in a free corner of the stage (the camera shrinks the
diagram if no corner is free).

| prop | notes |
|---|---|
| `title`, `icon` | header |
| `lines` | monospace lines; prefix `! ` red, `= ` bold result, `# ` muted comment, `+ ` green |
| `bars` | timeline bars `{ label, from, to, tone, note }` with `0 ≤ from ≤ to ≤ 1`; tones red, green, amber, blue, violet, gray |
| `table` | `[[header...], [row...], ...]` |
| `corner` | `auto` (default) · `tl` · `tr` · `bl` · `br` |
| `width` | max width px (default 440) |

## Icons

~220 Lucide icons, camelCase (`creditCard`, `heartPulse`, `gitBranch`); kebab-case is also
accepted. List them with `node scripts/build.mjs --icons`. Unknown icons produce a warning with
suggestions. Handy picks: server, database, globe, users, user, smartphone, monitor, cloud,
boxes, package, inbox, mail, bell, message, send, radio, zap, cpu, timer, clock, hourglass,
gauge, activity, chartLine, alert, skull, check, close, shield, lock, key, fingerprint, idCard,
creditCard, cart, dollar, search, filter, layers, split, merge, gitBranch, workflow, webhook,
repeat, refresh, unplug, plug, bot, brain, image, file, fileText, code, terminal, flag, rocket.

## Runtime controls (for your reply to the user)

`←`/`→` (also PageUp/PageDown, clicker-friendly) step · `1`–`9` jump · `R` replay the step ·
`Space` pause packets · `P` presenter mode (hides chrome, goes fullscreen) · `T` light/dark ·
`F` reset zoom · ctrl/⌘-scroll or double-click to zoom the diagram, drag to pan.
Deep links: `deck.html#/<lesson-id>/<step>`.
