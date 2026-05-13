# Window Heat Recovery Ventilator — High-Level Design

## Problem

Design a **window-mounted decentralized heat recovery ventilator** for a single room.
The device should sit in a window insert and do all of the following:

- exhaust stale indoor air,
- bring in fresh outdoor air,
- transfer heat from outgoing air to incoming air,
- improve incoming air quality with filtration,
- fit within a long, shallow rectangular envelope suitable for a window,
- avoid major permanent building modifications.

Current concept envelope from the placeholder CAD body:

- height: about `150 mm`
- length: about `960 mm`
- thickness: about `58 mm`

Current fan assumption under discussion:

- `2 × 100 × 100 × 30 mm` fans

Hard constraints currently implied by the project:

- must fit into a window-oriented rectangular panel,
- must keep the intake and exhaust air streams separated,
- should be practical for DIY fabrication,
- should support at least one fan for exhaust and one fan for supply,
- should include a central heat-transfer region,
- should leave room for filtration and sealing,
- should be quiet enough to be usable indoors.

This HLD does **not** assume final manufacturing yet. It compares realistic build directions before any detailed CAD or fabrication choices are locked.

## Approach

Recommended concept: a **single-room window insert HRV** with a slim outer shell, a **central plate-style heat exchanger**, two fan modules, and a removable filter service path.

With the updated concept direction, the current layout is:

- **two side-by-side `100 × 100 × 30 mm` fans** near one end of the insert,
- the original shallow panel height remains about `150 mm`,
- visible circular openings on the front and back faces for each fan,
- **front vent tubes** so only the vent area gains extra thickness,
- a central heat-exchanger block represented by **diagonal aluminum X-style / chevron-like plates**.


High-level airflow concept:

```text
Room side                                              Outside side

  stale room air  ---> [exhaust fan] --->\
                                           \
                                            > [sealed heat-exchanger core] > ---> exhaust out
                                           /
fresh air in  <--- [supply fan]  <--------/

At the same time:
- outgoing warm air gives heat to incoming cool air,
- the two streams stay physically separated,
- filters are placed where they are easy to replace,
- the whole unit is sealed into a window insert frame.
```

More concrete spatial concept for the window form factor:

```text
+--------------------------------------------------------------------------------------+
| Exhaust fan | Supply fan | filter / routing | diagonal aluminum core | outlet / hood |
+--------------------------------------------------------------------------------------+

One likely role split:
- left fan = exhaust fan
- right fan = supply fan

Front / back face idea:

|  O===  O===  |   diagonal X-core   |   hood   |

Where `O===` means a circular vent with a short tube projecting out from the face.

Cross-section through thickness:

outside skin
  |
  |  [outer hood / weather side]
  |  [air path A]  / / / diagonal aluminum plates / / /
  |  [filter slot] \ \ \ diagonal aluminum plates \ \ \
  |
inside skin
```

This keeps the `150 mm` height and uses the available `960 mm` length to package the two fan bodies side by side in X.

### Recommended system behavior

- **Balanced ventilation:** airflow in and out should be approximately matched.
- **Counterflow or near-counterflow core:** preferred over a simple short crossflow because it offers better recovery per volume.
- **Replaceable filters:** incoming air gets particulate filtration first; exhaust side may get a coarse protective prefilter if needed.
- **Blower-based airflow:** use blower-style fans because the core and filters create static-pressure load.
- **Serviceable construction:** core, filters, and fan modules should be removable independently.

### Why this approach is recommended

It matches both the user's concept image and the external research:

- decentralized, per-room use,
- retrofit-friendly,
- no ceiling ducting,
- practical for one-room air quality improvement,
- realistic path from prototype to refined product.

## Key Interfaces

1. **Window opening interface**
   - Outer rectangular panel must seal against the window opening.
   - May require foam gasket, compression seal, or adjustable trim.

2. **Indoor air interface**
   - Room-side intake/exhaust openings must not short-circuit directly into each other.
   - Interior geometry should encourage room mixing rather than immediate recirculation.

3. **Outdoor air interface**
   - Outdoor intake and exhaust must be physically separated or baffled to reduce re-ingestion.
   - Must resist rain ingress and wind-driven backflow.

4. **Heat-exchanger core interface**
   - Core must mount to the housing with airtight sealing.
   - Air streams must stay isolated even under fan pressure.

5. **Fan module interface**
   - Fans must mount to plenum geometry with low leakage and vibration isolation.
   - Fan replacement should not require destroying the housing.

6. **Filter interface**
   - Filter cassette must be accessible for replacement.
   - Filter frame must bypass-seal so dirty air cannot leak around it.

7. **Condensation interface**
   - If condensation forms, the unit needs a controlled path for drainage or evaporation management.
   - Wet surfaces must not drip into the room.

8. **Power and controls interface**
   - Requires low-voltage power input and fan control.
   - Future smart controls may use CO2 / PM / humidity sensing.

## Dictionary

| Term | What it is |
|------|-----------|
| HRV / recuperator | A ventilator that brings in fresh air while recovering heat from outgoing air. |
| Decentralized unit | A small local ventilator for one room instead of one large system for the whole building. |
| Supply air | Fresh air brought into the room. |
| Exhaust air | Indoor air sent out of the room. |
| Heat-exchanger core | The middle part where the two air streams pass near each other and exchange heat without mixing. |
| Plate heat exchanger | A core made from many thin layers or plates that create alternating air channels. |
| Counterflow | Air streams travel in opposite directions for better heat exchange. |
| Plenum | A chamber that spreads air between a fan and smaller channels or openings. |
| Static pressure | Resistance the fan must overcome because of filters, narrow passages, and bends. |
| Filter cassette | A removable filter holder or tray. |
| Airtightness | The ability to prevent unintended leakage between air paths or to the outside. |
| Short-circuiting airflow | When intake and exhaust are too close and the unit re-breathes its own exhaust. |
| Condensation | Water forming when warm humid air cools on a colder surface. |

## Alternatives

| Option | Description | Tradeoff |
|--------|-------------|----------|
| **A — Recommended:** plate-core window HRV with two side-by-side fans | Long rectangular housing, central aluminum plate core, one supply fan and one exhaust fan placed side by side along the length, removable filters, sealed window insert. | Best match to the current envelope; strongest balance of fit, clarity, and realistic DIY progression, but sealing and fabrication are still non-trivial. |
| B — Tubular aluminum exchanger in window body | Parallel tubes with incoming/outgoing air around or through them, plus fans at the ends. | Easier to imagine geometrically, but research suggests airflow/noise scaling is poor and efficiency gains are limited. |
| C — Pair of regenerative single-duct units | Two smaller reversing-flow units with ceramic or thermal-mass cores, alternating direction over time. | Good commercial precedent for retrofit use, but a different operating concept than the user's current rectangular two-path idea; more control complexity and less aligned with the current concept geometry. |

### Recommendation

Choose **Option A**.

Reason:

- It directly fits the user's mental model of a rectangular window insert with a central thermal box.
- External references suggest the plate-core architecture is the most promising path for practical airflow and heat recovery.
- It creates a clean path for later CAD decomposition: housing, core, fan module, filter cassette, and weather hood.

## Usage Guide

1. User measures the open window gap and installs the rectangular insert panel into the opening.
2. User compresses seals around the panel so outdoor air can only move through the device. ⚠️ If the window/panel seal is poor, overall performance collapses.
3. User connects low-voltage power to the unit.
4. Supply fan draws outdoor air through the intake side and through the incoming-air filter.
5. Exhaust fan pulls stale room air through the exhaust side.
6. Both air streams pass through separate channels inside the heat-exchanger core.
7. Heat transfers from the warmer stream to the cooler stream without mixing the air.
8. The incoming air enters the room warmer than raw outdoor air. ⚠️ If intake and exhaust leak into each other, indoor air quality may worsen instead of improve.
9. User periodically opens the service panel and replaces or cleans the filters. ⚠️ If access is awkward, maintenance will be skipped.
10. During cold or humid operation, any condensation is captured and directed safely away from the indoor side. ⚠️ Without drainage strategy, water may collect inside the housing.
11. User adjusts speed or relies on automatic control based on indoor air quality targets. ⚠️ High filtration may require higher-pressure fans than initially expected.
12. User lives with the unit day to day. ⚠️ If the noise signature is annoying, the device may be technically correct but practically unusable.

## Concerns

1. The current `150 × 960 × 58 mm` envelope may be too thin once realistic filter depth, fan depth, core depth, insulation, and service structure are included.
2. Two `100 × 100 × 30 mm` fans do fit side by side in the current length, but they consume much of the left module and leave less room for silencers, guards, and service access.
3. A shallow window-friendly housing conflicts with the need for a reasonably deep and efficient heat-exchanger core.
4. The diagonal X-style aluminum core concept may be visually right for the user's intent, but it still needs validation as a manufacturable, sealable channel geometry.
5. Intake and exhaust on the outdoor side may short-circuit in windy conditions unless hood geometry or baffling is carefully designed.
6. Filter pressure drop may force the design away from simple axial fans and toward centrifugal blowers, increasing size and acoustic complexity.
7. Airtight sealing between adjacent core channels is likely the hardest single fabrication challenge.
8. A DIY aluminum core may deliver worse real performance than expected if plate spacing, flatness, or bonding quality is inconsistent.
9. The central core may need to be removable for cleaning or replacement, which complicates sealing and structure.
10. Noise and vibration may make a window-mounted bedroom unit unpleasant unless isolation and muffling are integrated early.
11. Service access for filters and fans could conflict with the desire for a slim, visually clean insert.
12. The room-side intake and supply openings must be arranged to avoid immediate local recirculation.
13. Safety around power, moisture, UV filtration components, and outdoor exposure must be addressed before any build intended for unattended use.
14. The current concept does not yet define whether humidity recovery is required or if sensible heat recovery alone is enough.
15. The first prototype may need to prioritize measurement and sealing over aesthetics.

## Decisions

To be filled after review.

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | TBD | TBD |
| 2 | TBD | TBD |
| 3 | TBD | TBD |
