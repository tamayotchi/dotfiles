# Window Heat Recovery Ventilator Project

This project started from a simple rectangular panel intended to fit into a window opening.
The goal is to turn that panel into a **window-mounted heat recovery ventilator (HRV / recuperator)** that:

- brings fresh air into the room,
- exhausts stale room air,
- transfers heat between outgoing and incoming air,
- improves indoor air quality with filtration,
- fits into a window insert instead of requiring permanent wall or whole-house duct installation.

## Why this project exists

The initial rectangular solid was created as a placeholder for the window insert body.
The longer-term idea is a compact decentralized unit for one room:

- one air path for **exhausting room air**,
- one air path for **bringing fresh air in**,
- a **heat-transfer box/core in the middle** made with aluminum or another thermally conductive material,
- fan-driven airflow on both sides,
- filtration so the incoming air is cleaner than the outside air.

A reference concept image shows a slim horizontal unit with:

- two separated air streams,
- a warm/cold split concept,
- a central body that likely contains the heat-exchange section,
- end sections that look suitable for fans or duct transitions.

## Current CAD concept

Current geometry files:

- `2026/05/07/basic-square.forge.js` — original placeholder window panel
- `2026/05/07/window-heat-recovery-vent-concept.forge.js` — rough concept model for the HRV layout

Current placeholder window envelope:

- Height: `150 mm`
- Length: `960 mm`
- Thickness: `58 mm`

Current placeholder panel details:

- two grooves at `18 mm` and `40 mm` through the thickness direction,
- groove thickness `3.5 mm`,
- grooves currently applied on the **X-end faces only**.

Current fan assumption for the concept:

- `2 × axial fans`
- fan body size: `100 × 100 × 30 mm`

Current concept update:

- the rough concept model now shows **two `100 × 100 × 30 mm` fans side by side along the length**,
- the concept uses the original shallow window envelope again at about `150 mm` height,
- **front vent tubes** now extend outward so only the vent area gets extra thickness,
- front and back circular fan openings are shown for both fans,
- the heat-exchanger zone now shows **diagonal aluminum X-style / chevron-like plates** instead of simple straight internal lines,
- the intake and exhaust transition paths are now separated better so the previous overlap is reduced in the concept.

The concept file is still a **blockout / approach study**, not yet the final ventilator assembly.

## Research notes from the referenced YouTube video

Video:

- `https://www.youtube.com/watch?v=_tusH1Zbmx0`
- Title: **DIY Heat Recovery Ventilator: From 55% to 90% Efficiency (Real Tests)**
- Channel: **DIY Yarik**

I could not use the direct YouTube fetcher because it required Google login or a Gemini API key in this environment, but I was able to obtain the video's auto-generated English subtitles with `yt-dlp` and extract the relevant points.

### Relevant transcript highlights

#### 1. Decentralized per-room units make sense for this use case

The video argues for a **decentralized** system:

- one smart recuperator per room,
- easier installation,
- lower cost,
- no large central ducting,
- better fit for retrofits.

That matches this project well because a **window insert** is also decentralized and retrofit-friendly.

#### 2. Tubular heat exchangers hit a limit

The creator reports that an earlier aluminum tube design had:

- low airflow,
- moderate efficiency,
- poor scaling behavior,
- more noise when enlarged.

Takeaway for this project:

- do **not** assume a tube-based core is the best option,
- a **plate-style heat exchanger** is a stronger starting point for a compact window unit.

#### 3. Plate heat exchanger is the key concept

The video says the biggest improvement came from switching to a **plate heat exchanger** where:

- the air streams move in opposite directions,
- the streams stay physically separated,
- heat transfers through thin walls between channels.

Takeaway:

- the middle box in this project should likely become a **counterflow or crossflow plate core**.

#### 4. Material matters a lot

The transcript compares materials:

- plastic / polycarbonate: easy to work with, easier to seal, but poor thermal conductivity,
- aluminum: much better heat transfer,
- copper: even better, but harder to form and seal well.

Takeaway:

- for a practical first build, **aluminum plates** are a good target,
- sealing and manufacturability matter just as much as conductivity,
- copper may be a later optimization, not the first prototype.

#### 5. Airtightness is critical

One of the strongest findings from the video is that **air leaks between channels ruin performance**.
Even small leaks allow the incoming and outgoing streams to mix.

Takeaway:

- the core cassette must be designed around **airtight separation**,
- service panels, fan mounts, and filter frames must all compress against gaskets or sealant-friendly surfaces,
- this is likely more important than chasing theoretical efficiency numbers too early.

#### 6. Real efficiency is lower than marketing claims

The video warns that claims like `90%` or `98%` are often lab numbers, not real installed performance.
The creator considers stable real-world efficiency around `73–75%` to be an honest result.

Takeaway:

- project goals should use **real installed efficiency targets**, not idealized marketing numbers,
- success should be defined by practical airflow + acceptable noise + decent recovery + clean incoming air.

#### 7. Filtration matters, not just heat recovery

The creator emphasizes that outdoor air quality can be poor and recommends treating filtration as essential.
The tested final approach used:

- a fine particulate filter (described in the transcript as **HEPA / HPA13**),
- a **TiO2 photocatalytic filter**,
- later plans for a better carbon filter.

Takeaway:

- incoming-air filtration should be part of the architecture from the start,
- a replaceable filter cassette is a first-class requirement,
- static pressure from the filter stack directly affects fan choice.

#### 8. Fan type matters

The video prefers **centrifugal blower-type fans** instead of quiet inline fans because the system needs enough static pressure to push through:

- the heat-exchanger core,
- filters,
- narrow channels,
- seals and bends.

Takeaway:

- start the architecture assuming **blower fans**, not open axial PC fans,
- especially if good filtration is required.

#### 9. Noise and insulation are major next steps

The video notes future work on:

- vibration isolation,
- duct silencing,
- better insulation,
- reduced noise.

Takeaway:

- the window-mounted unit must include a noise strategy from the beginning,
- otherwise it may work technically but be unpleasant to use in a bedroom or office.

## External reference sources used in planning

Additional sources aligned with the concept:

- Make: **Heat Exchanger That Creates Fresh Air**
- Instructables: **Heat Recovery Ventilation**
- Ecohome / Lunos single-room HRV references
- Healthy Home Guide notes about DIY HRV + filtration

Common ideas across these references:

- separate supply and exhaust paths,
- thin conductive material for the exchange surfaces,
- counterflow or crossflow geometry,
- balanced airflow,
- filtration on incoming air,
- careful sealing,
- condensation management,
- low-noise operation.

## Planning artifacts

High-level design document:

- `2026/05/07/window-heat-recovery-vent-hld.md`

Video research notes:

- `2026/05/07/video-notes.md`

## Proposed next project

After reviewing the HLD, create a separate ForgeCAD project folder for the real build, likely something like:

- `2026/05/07/window-heat-recovery-vent/`

Expected future contents:

- `main.forge.js` — top-level assembly
- `parts/window-frame-panel.forge.js`
- `parts/heat-exchanger-core.forge.js`
- `parts/fan-module.forge.js`
- `parts/filter-cassette.forge.js`
- `parts/end-cap-or-hood.forge.js`
- `parts/drain-or-condensation-feature.forge.js`
- `hld.md`
- later: `lld.md`

## Immediate next questions to resolve

1. What exact window opening must this fit?
2. Is the current `150 × 960 × 58 mm` envelope fixed, or just a starting placeholder?
3. Are the selected fans definitely `100 × 100 × 30 mm`, or is there still flexibility?
4. Should the diagonal aluminum X-style heat-exchanger concept stay, or do you want a different internal core geometry?
5. Should the first build prioritize:
   - easiest fabrication,
   - highest efficiency,
   - lowest noise,
   - strongest filtration,
   - or lowest cost?
6. Should condensation be collected and drained, or avoided by membrane / warm-side design?
7. Is this meant to be removable seasonally or left in the window full-time?

Once these are answered, the next step should be a proper low-level design and then the actual ForgeCAD assembly build.
