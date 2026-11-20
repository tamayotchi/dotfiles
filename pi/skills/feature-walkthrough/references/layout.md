# Layout guide

## Coordinate system

Entities sit on an isometric floor grid. Screen position (before camera fit):

```
screen_x = 14 · (x + y)
screen_y =  7 · (x − y) − z
```

```
              up-left = −x        up-right = +y
                         ╲       ╱
                          ╲     ╱
                            (0,0)
                          ╱     ╲
                         ╱       ╲
          down-left = −y          down-right = +x  (closer to the viewer)
```

- Screen **right** = +x and +y together; screen **up** = −x and +y together.
- From a desired screen spot `(sx, sy)` → `x = (sx/14 + sy/7) / 2`, `y = (sx/14 − sy/7) / 2`.
- Bigger `x − y` is lower on screen and drawn in front.
- The camera fits the whole scene automatically each step, so absolute position doesn't matter.
  Spacing between entities does.

## Default composition

Put the actor (users/device) at the **bottom-left**. The main request path runs **up-right
along +y**, and side branches go along **±x**. That's the diagonal in the reference
screenshots, and it leaves the top-right and bottom-right corners free for the HUD card.

```
users (0,-20) ──► gateway (0,-10) ──► service (0,0) ──► db (0,10)
                                          │ +x
                                          ▼
                                      queue (7,0) ──► worker (14,0)
```

## Spacing rules (lint enforces the result, these get you there first try)

| pair | min center distance |
|---|---|
| service ↔ service along y | 6 units (with tags above: 7) |
| service ↔ service along x | 7 units (+x moves toward the viewer and tall blocks occlude) |
| users platform (s 7) ↔ anything | 10 units |
| queue of n cubes | its length ≈ 1.55·n; leave ≥ 3 units at both ends |
| db ↔ service | 7 units |

- Tags stack **upward** (~26 px each, about 2 grid units). Leave space toward −x/+y above
  tagged entities, or use `"pills": "below"` on services.
- Keep a scene within about 40 × 30 grid units. `check.mjs` warns when it would render below 75%.
- Small supporting entities: `s: 3, h: 36`. The hero entity of a step can be `s: 5`.
- Block labels: at most about 10 characters per line, 2 lines. Put details in `sub` or tags.

## Links

- Straight from center to center, clipped at the entity outlines.
- If a straight line would cross another entity (lint: `[crossing]`), add `via` elbows:
  `"via": [[19.5, 9], [0, 9]]`, or with refs `"via": [["worker", "store+5"]]`.
- Use direction to say who calls whom. `heads: "both"` means request/response.
- Labels are auto-placed beside the line, avoiding entities. Keep them at 22 characters or fewer.
  Nudge with `labelAt: 0.3`. If a short link has no room, drop the label and use a tag on the
  target instead.

## Recipes (coordinates that work)

**Client → API → DB**
users (0,-18) · api (0,-6) · db (0,6)

**Load balancer fan-out**
users (0,-20) · lb (0,-10, s 3.4, color orange, icon split) · servers (−8,1) (0,1) (8,1) — a row
along x reads as a diagonal going down-right; 8 units apart keeps the blocks from touching.
Flow: `{ "routes": [{ "route": ["ul","l1"] }, { "route": ["ul","l2"] }, { "route": ["ul","l3"] }], "bounce": true }`

**Async pipeline**
producer (0,0) → queue (7,0, dir [1,0], n 3) → worker (14,0) → store (14,8)

**Pub/sub**
publisher (0,−8) → bus queue (0,0, dir [0,1]) → consumers (−7,8) (0,8) (7,8) with `fanout: true`

**Third party / boundary**
zone `{ "x0": 6, "x1": 18, "y0": 2, "y1": 16, "label": "Stripe", "tone": "violet" }` around the
external blocks. The label sits outside the bottom corner.

**Before/after in one walkthrough**
Keep the same ids. Step N shows `old` with `dim: 1` and `style: "off"` links, and step N+1
removes it. The fade-out makes the change obvious.

## Fixing lint messages

| message | fix |
|---|---|
| `"a" overlaps "b"` | move one apart (+2–3 units), or shrink `s`/`h` of the minor one |
| `"a" tag overlaps "b"` | fewer or shorter tags, `pills: "below"`, or move b away from a's −x/+y side |
| `link "x" label overlaps …` | shorten the label, `labelAt` 0.3/0.7, or move it to a tag |
| `"zone" label overlaps …` | `labelAt: "top"` / `"left"` / `"right"` |
| `[crossing] link passes through "c"` | `via` elbow around c, or move c off the line |
| `[scale] will render at 60%` | tighten coordinates, drop non-essential entities, or split the step |

Small overlaps (≤ 5 px) of a tag over a link line are fine. Overlaps between bodies, labels or
text never are.
