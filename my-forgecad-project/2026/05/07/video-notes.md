# Video Notes — DIY Heat Recovery Ventilator: From 55% to 90% Efficiency (Real Tests)

Source video:
- https://www.youtube.com/watch?v=_tusH1Zbmx0
- Channel: DIY Yarik

## Note on transcription method

Direct YouTube extraction was blocked in this environment by login/API requirements, so the notes below were produced from the video's auto-generated English subtitles retrieved with `yt-dlp`.

## Practical transcript summary

### Why the project matters

The creator is strongly motivated by indoor air quality, especially particulate pollution and the need for filtration in addition to ventilation.

### Evolution of the design

1. **Early versions**
   - about `55%` efficiency
   - too low for a satisfying result

2. **Tubular aluminum heat exchanger**
   - around `71%` efficiency at minimum power
   - dropped to around `62%` as airflow increased
   - airflow was only about `25 m³/h`
   - scaling tube size did not improve results enough
   - larger tubing increased airflow but also increased noise

3. **Polycarbonate plate exchanger**
   - airflow improved relative to tubes
   - thermal performance was poor
   - efficiency around `40%`
   - easy to work with, but poor conductivity compared with metals

4. **Aluminum plate exchanger**
   - better thermal path
   - main problem became **airtightness**
   - leaks between channels destroyed performance
   - after extensive sealing work, performance stabilized
   - final reported real operating efficiency: about `73–75%`

5. **Copper plate prototype**
   - harder to form and seal accurately
   - promising performance
   - around `90%` at medium power in prototype conditions
   - still under development

## Key technical lessons for this project

### 1. Plate cores beat tube cores for this use case

For a compact room unit, the video strongly suggests using a **plate-style core** instead of a tubular one.

### 2. Sealing matters as much as conductivity

Even a conductive material fails if the channels leak and the air streams mix.

### 3. Marketing efficiency is not real installed efficiency

The creator warns that published `90–98%` numbers are often idealized lab results. A stable `73–75%` in real operation is presented as an honest and good outcome.

### 4. Filtration must be treated as a core requirement

The video treats filtration as essential, not optional.

Mentioned filter approach:
- fine particle filter (`HEPA/HPA13` as stated in subtitles)
- `TiO2` photocatalytic stage
- future plan for better carbon filtration

### 5. Fan selection must account for static pressure

The creator argues against weak inline fans for this type of build because:
- filters add resistance,
- the core adds resistance,
- leaks become worse under pressure differences,
- useful performance needs pressure-capable blower fans.

### 6. Noise and insulation are still open engineering work

Future improvements mentioned in the video:
- better thermal insulation,
- vibration isolation,
- duct silencing,
- overall noise reduction.

## Relevance to the window project

These notes support a first-pass architecture with:

- decentralized single-room operation,
- a central **aluminum plate heat-exchanger box**,
- one controlled supply path and one controlled exhaust path,
- blower fans instead of simple axial fans,
- replaceable filters,
- explicit sealing strategy,
- condensation management,
- later optimization for noise.

## Best takeaways to carry into the next ForgeCAD build

1. Model the **core as a separate sealed component**.
2. Model **filter service access** as a first-class feature.
3. Leave space for **blower fans**, not just decorative fan circles.
4. Add **outdoor intake/exhaust separation** so the unit does not breathe its own exhaust.
5. Treat **airtightness and condensate handling** as architecture, not cleanup details.
