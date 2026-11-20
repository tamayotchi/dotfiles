# Storytelling guide

Each walkthrough is a short story told in 6–10 steps. Every step changes one thing in the
diagram, moves the metrics, and explains why. This guide captures the pattern of the reference
course (designed-to-scale) and how to apply it to your own features.

## The rhythm: tension → relief, repeated

The reference lesson "Timeouts & Retries" has 11 steps:

| # | chapter | step | what moves |
|---|---|---|---|
| 1 | problem | One slow service takes down another | payments hot, threads 200/200, success 40% |
| 2 | solution | Set a timeout, have a fallback | link label "timeout 800 ms", success 72% |
| 3 | technique | Retry the blips | retry packets, success 97% |
| 4 | problem | Retries become a storm | *caused by step 3*: 4× load, success 18% |
| 5 | solution | Back off, with jitter | HUD card with backoff bars, load 1.2× |
| 6 | technique | Circuit breaker | new breaker block, payments dead |
| 7 | solution | Half-open, then closed | breaker tag CLOSED, all green |
| 8 | technique | Retries must not charge twice | card: idempotency key walk-through |
| 9 | technique | Pass the deadline along | tags with time budgets |
| 10 | technique | Bulkheads | pool tags |
| 11 | recap | Recap | takeaways + "Next up" |

What to copy from it:

- **Open with pain the audience recognizes**, with red metrics. Don't open with architecture.
- **Each fix creates the next problem** ("retry" → "retry storm"). That's what holds attention.
- **One change per step.** Add one entity, or change one link, or heat up or kill one node.
  The animation then shows exactly what changed.
- **Metrics carry the plot.** Every step moves at least one metric, and the colors tell the story
  at a glance (red → amber → green).
- **End on a recap** of 3–5 bold takeaways, plus a `next` callout.

## Step anatomy

```
short     "Backoff"                     ← timeline, ≤ 14 chars
chapter   solution                      ← colored chip
title     "Back off, with jitter"       ← a claim, ≤ ~40 chars
body[0]   what we do / what happens     ← concrete, with numbers
body[1]   consequence / how it works    ← 1–2 sentences
callout   one sentence worth remembering
changes   + / ~ / − lines mirroring the diagram and metric deltas
metrics   new values
scene     the diagram after this step
```

- The body runs 40–90 words in total. If you need more, split the step.
- Introduce each new term once with `<span class="term">…</span>`. Use `<b>` for the one number
  or word that matters, and `<code>` for identifiers, endpoints and config keys from the codebase.
- Callout kinds:
  - `warn`: a pitfall, or why the problem happens.
  - `tip`: practical advice or tooling ("resilience4j does this").
  - `insight`: a mental model or analogy.
  - `decision`: what was chosen and what was rejected.
  - `next`: only on the recap step.
- `changes` lines read like a changelog: `+ Retry budget: 10%`, `~ Load 4× → 1.2×`, `- Polling`.
- Title verbs: "One slow service takes down another", "Hand out a presigned URL instead",
  "A bad photo crashes the worker".

## Picking metrics (2–4)

Choose the numbers the audience cares about, and keep the same set for the whole walkthrough.

| audience / feature | good metrics |
|---|---|
| reliability | success %, p99 latency, error rate, load multiplier, threads/connections busy |
| performance | p50/p99, throughput, CPU %, cache hit rate |
| cost | $/month, egress GB, instances |
| product feature | conversion %, time-to-task, steps/clicks, support tickets/week, adoption % |
| data pipeline | freshness/lag, rows/s, failed records, backlog |
| developer experience | build time, deploy time, flaky tests, PR cycle time |

Set `good`/`warn` thresholds so the colors match your story: step 1 mostly red, the end mostly
green. Use `format: "text"` with `{ value, level }` for qualitative states ("stuck", "resting",
"normal").

**Truthfulness:** take numbers from code, config, dashboards, docs or the user. If they're
estimates, set `"illustrative": true` and keep them plausible and consistent from step to step.
Never present invented numbers as production data. In your reply, say which values are sourced
(with file paths) and which are illustrative.

## Visual vocabulary

| meaning | how |
|---|---|
| under stress | `heat: 0.6–1`, `cpu: 0.9`, red tag ("200/200 threads") |
| down / broken | `dead: 1` + tag `{ "text": "DOWN", "tone": "red", "icon": "alert" }` |
| not relevant right now | `dim: 1`, links `style: "off"` |
| new component | just add it (it drops in with a spotlight) |
| failures | link `fail: 0.3`, or `kind: "fail"` |
| slow / waiting | `kind: "slow"`, `hold: 2` (blinking wait at the far end) |
| retries | `kind: "retry"` or `pattern: ["req","req","retry"]` |
| async / events | `queue` entity, `kind: "msg"` / `"event"`, dashed links |
| writes | `kind: "write"` |
| large payloads | `kind: "heavy"` |
| health checks | `kind: "ping"` |
| config value or rule | link label ("timeout 800 ms") or tag |
| protocol / sequence / numbers | HUD `card` with `lines` |
| timing | HUD `card` with `bars` |
| comparison | HUD `card` with `table` |
| ownership / boundaries | `zone` |

## Shapes of story by feature type

**Backend feature or reliability fix**: problem (incident-like) → fix → technique → new problem
→ fix → trade-off → recap.

**Product / UI feature**: user pain (users + device, bad UX metric) → the new flow (device tags
show UI states, blocks are frontend/backend modules) → edge cases (empty, error, offline) →
guardrails (validation, rate limits, permissions) → rollout (feature flag zone, % of users) →
results → recap.

**Data pipeline**: sources → ingest → queue/stream → processors → warehouse → dashboards. Then
problems: late data, duplicates, backfill. Show lag/freshness metrics.

**Migration / refactor**: before (monolith, pain metrics) → strangler steps (new service appears,
old part `dim` then removed) → dual-write / shadow traffic (`routes` with weights) → cut-over →
cleanup → recap.

**Incident postmortem**: timeline-driven. Card `bars` for the timeline; steps cover trigger →
blast radius → detection → mitigation → root cause → fixes. Use a blameless tone.

**Whole project overview**: one walkthrough per subsystem or major feature (2–6), grouped in
sections. Start with a "Big picture" walkthrough that uses `setup` steps to bring in components
one at a time (users → edge → services → data → async → third parties), then a recap.

## From code to story (research checklist)

1. **Entry points**: routes/handlers, CLI commands, consumers, cron jobs.
2. **The main path** of the feature: request → handlers → services → stores → responses.
3. **Collaborators**: databases, caches, queues, external APIs (look at clients/SDKs and env vars).
4. **Numbers**: timeouts, retries, limits, batch sizes, TTLs, pool sizes, SLAs (config files,
   constants).
5. **Failure handling**: catch blocks, retries, fallbacks, DLQs, circuit breakers, idempotency.
6. **Decisions**: ADRs, PR descriptions, commit messages, comments ("we chose X because…").
7. **Change history**, for "what this PR/branch does":
   `git log --oneline main..HEAD`, `git diff --stat main...HEAD`, then read the key hunks.
8. **Tests**: they name the edge cases worth a step.

Turn the findings into a fact sheet (component → role → file), then map it like this:

- components → `cast`
- calls → `wires`
- the story → `steps`

## Presenting tips (to pass on to the user)

- Present in **Presenter mode** (`P`) and step with `→` or a clicker (PageDown).
- Pause on the problem steps and let the red metrics sit for a moment.
- `R` replays a step's animation if someone missed it.
- Share the single HTML file. It works offline (fonts fall back to the system monospace).
- Deep-link to a step in chat: `feature.html#/<lesson-id>/4`.
