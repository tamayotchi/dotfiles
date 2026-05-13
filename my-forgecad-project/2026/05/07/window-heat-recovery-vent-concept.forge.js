const span = Param.number("Window Span", 960, { min: 400, max: 1600, unit: "mm" });
const height = Param.number("Panel Height", 150, { min: 120, max: 320, unit: "mm" });
const depth = Param.number("Panel Depth", 58, { min: 40, max: 160, unit: "mm" });
const shellWall = Param.number("Shell Wall", 4, { min: 2, max: 12, unit: "mm" });
const fanModuleLength = Param.number("Fan Module Length", 280, { min: 220, max: 420, unit: "mm" });
const coreLength = Param.number("Core Length", 140, { min: 140, max: 460, unit: "mm" });
const hoodLength = Param.number("Outdoor Hood Length", 180, { min: 80, max: 320, unit: "mm" });
const fanSize = Param.number("Fan Size", 100, { min: 60, max: 140, unit: "mm" });
const fanThickness = Param.number("Fan Thickness", 30, { min: 15, max: 50, unit: "mm" });
const fanGapX = Param.number("Fan Gap", 18, { min: 4, max: 50, unit: "mm" });
const ventTubeLength = Param.number("Vent Tube Length", 55, { min: 20, max: 120, unit: "mm" });
const ventTubeWall = Param.number("Vent Tube Wall", 3, { min: 1.5, max: 8, unit: "mm" });
const fanForwardOffset = Param.number("Fan Forward Offset", 8, { min: 0, max: 14, unit: "mm" });
const flowYOffset = Param.number("Flow Y Offset", 11, { min: 0, max: 20, unit: "mm" });
const rearPortGapZ = Param.number("Rear Port Gap", 10, { min: 2, max: 30, unit: "mm" });

const corePlateCount = 6;
const corePlateTilt = 16;

scene({
  background: { top: '#d7dce4', bottom: '#798795' },
  camera: { position: [1120, -760, 320], target: [20, 0, 75], fov: 30 },
  views: {
    hero: {
      camera: { position: [1120, -760, 320], target: [20, 0, 75], up: [0, 0, 1], fov: 30 },
    },
    front: {
      camera: { position: [0, -1900, 75], target: [0, 0, 75], up: [0, 0, 1], fov: 28 },
    },
    back: {
      camera: { position: [0, 1900, 75], target: [0, 0, 75], up: [0, 0, 1], fov: 28 },
    },
    side: {
      camera: { position: [0, -1500, 75], target: [0, 0, 75], up: [0, 0, 1], fov: 20 },
    },
  },
  environment: { preset: 'studio', intensity: 0.18, background: false },
  lights: [
    { type: 'ambient', color: '#efe7dc', intensity: 0.18 },
    { type: 'directional', position: [320, -400, 420], target: [0, 0, 80], color: '#ffe2bf', intensity: 2.9, castShadow: true },
    { type: 'directional', position: [-280, 220, 260], target: [0, 0, 70], color: '#d8ebff', intensity: 0.9 },
  ],
  ground: { visible: true, color: '#cfd5dc', height: -8, receiveShadow: true },
  postProcessing: {
    bloom: { intensity: 0.03, threshold: 0.94, radius: 0.25 },
    vignette: { darkness: 0.38, offset: 0.35 },
    toneMappingExposure: 1.08,
  },
});

const transitionLength = Math.max((span - fanModuleLength - coreLength - hoodLength) / 2, 40);
const fanModuleX = -span / 2 + fanModuleLength / 2;
const roomTransitionX = fanModuleX + fanModuleLength / 2 + transitionLength / 2;
const coreX = roomTransitionX + transitionLength / 2 + coreLength / 2;
const outdoorTransitionX = coreX + coreLength / 2 + transitionLength / 2;
const hoodX = outdoorTransitionX + transitionLength / 2 + hoodLength / 2;

const innerHeight = height - shellWall * 2;
const innerDepth = depth - shellWall * 2;
const fanHoleRadius = fanSize * 0.38;
const portOuterRadius = fanHoleRadius + 10;
const fanRowWidth = fanSize * 2 + fanGapX;
const fanFitsInLength = fanRowWidth <= fanModuleLength - 20;
const fanZ = shellWall + innerHeight / 2;
const exhaustFanY = -fanForwardOffset;
const supplyFanY = fanForwardOffset + 8;
const frontTubeCenterY = -depth / 2 - ventTubeLength / 2 - 2;
const frontTubeMouthY = -depth / 2 - ventTubeLength - 2;
const leftFanX = fanModuleX - (fanSize / 2 + fanGapX / 2);
const rightFanX = fanModuleX + (fanSize / 2 + fanGapX / 2);
const flowPathDepth = Math.max(innerDepth / 2 - 10, 12);
const exhaustPathY = -flowYOffset;
const supplyPathY = flowYOffset;
const coreChannelHeight = Math.max(fanSize * 0.46, 46);
const coreOffsetZ = Math.min(24, Math.max((innerHeight - coreChannelHeight) / 2 - 6, 10));
const upperCoreZ = fanZ + coreOffsetZ;
const lowerCoreZ = fanZ - coreOffsetZ;
const filterLength = Math.min(42, transitionLength * 0.45);
const filterX = roomTransitionX - transitionLength / 2 + filterLength / 2 + 10;
const coreCaseHeight = innerHeight - 14;
const plateZoneHeight = coreCaseHeight - 26;
const plateSpacing = corePlateCount > 1 ? plateZoneHeight / (corePlateCount - 1) : 0;
const rampLength = Math.max(42, transitionLength * 0.44);
const coreEntryX = coreX - coreLength / 2;
const exhaustRampStartX = leftFanX + fanSize / 2 + 6;
const exhaustRampEndX = Math.min(exhaustRampStartX + rampLength, coreEntryX - 20);
const supplyRampStartX = rightFanX + fanSize / 2 + 6;
const supplyRampEndX = Math.min(supplyRampStartX + rampLength, filterX - filterLength / 2 - 12);
const supplyFilterEntryX = filterX - filterLength / 2;
const supplyFilterExitX = filterX + filterLength / 2;
const rearPortCenterOffsetZ = portOuterRadius + rearPortGapZ / 2;
const rearUpperPortZ = fanZ + rearPortCenterOffsetZ;
const rearLowerPortZ = fanZ - rearPortCenterOffsetZ;
const rearTubeCenterX = hoodX + hoodLength / 2 + ventTubeLength / 2 + 2;
const rearTubeFaceX = hoodX + hoodLength / 2 + ventTubeLength + 4;

console.log('Concept layout (mm):', {
  transitionLength,
  fanModuleLength,
  coreLength,
  hoodLength,
  fanFitsInLength,
  fanRowWidth,
  ventTubeLength,
});

function diagonalVolume(x1, z1, x2, z2, yCenter, yDepth, zThickness, color, opacity = 0.4) {
  const dx = x2 - x1;
  const dz = z2 - z1;
  const length = Math.hypot(dx, dz);
  const angleDeg = Math.atan2(dz, dx) * 180 / Math.PI;
  return box(length, yDepth, zThickness)
    .rotateY(-angleDeg)
    .placeReference('center', [(x1 + x2) / 2, yCenter, (z1 + z2) / 2])
    .color(color)
    .material({ opacity, roughness: 0.45 });
}

function straightLane(startX, endX, yCenter, zCenter, yDepth, zThickness, color, opacity = 0.42) {
  const laneLength = Math.max(endX - startX, 4);
  return box(laneLength, yDepth, zThickness)
    .placeReference('center', [(startX + endX) / 2, yCenter, zCenter])
    .color(color)
    .material({ opacity });
}

function makeFanFace(x, yPos, zPos, accentColor) {
  const plate = box(fanSize, 4, fanSize)
    .placeReference('center', [x, yPos, zPos]);
  const hole = cylinder(8, fanHoleRadius)
    .rotateX(90)
    .placeReference('center', [x, yPos, zPos]);
  const ringOuter = cylinder(4, fanHoleRadius + 7)
    .rotateX(90)
    .placeReference('center', [x, yPos, zPos]);
  const ringInner = cylinder(6, fanHoleRadius + 1)
    .rotateX(90)
    .placeReference('center', [x, yPos, zPos]);

  return [
    {
      name: `${accentColor}-fan-face-${x}-${yPos}`,
      shape: difference(plate, hole)
        .color('#56606b')
        .material({ opacity: 0.96, roughness: 0.58 }),
    },
    {
      name: `${accentColor}-fan-ring-${x}-${yPos}`,
      shape: difference(ringOuter, ringInner)
        .color(accentColor)
        .material({ opacity: 0.96, metalness: 0.18, roughness: 0.42 }),
    },
  ];
}

function makeEndPortFace(xPos, yPos, zPos, accentColor) {
  const plate = box(4, fanSize * 0.8, fanSize * 0.8)
    .placeReference('center', [xPos, yPos, zPos]);
  const hole = cylinder(8, fanHoleRadius)
    .rotateY(90)
    .placeReference('center', [xPos, yPos, zPos]);
  const ringOuter = cylinder(4, fanHoleRadius + 7)
    .rotateY(90)
    .placeReference('center', [xPos, yPos, zPos]);
  const ringInner = cylinder(6, fanHoleRadius + 1)
    .rotateY(90)
    .placeReference('center', [xPos, yPos, zPos]);

  return [
    {
      name: `${accentColor}-end-face-${xPos}-${zPos}`,
      shape: difference(plate, hole)
        .color('#56606b')
        .material({ opacity: 0.96, roughness: 0.58 }),
    },
    {
      name: `${accentColor}-end-ring-${xPos}-${zPos}`,
      shape: difference(ringOuter, ringInner)
        .color(accentColor)
        .material({ opacity: 0.96, metalness: 0.18, roughness: 0.42 }),
    },
  ];
}

function makeVentTube(x, zPos, color) {
  const outer = cylinder(ventTubeLength, portOuterRadius)
    .rotateX(90)
    .placeReference('center', [x, frontTubeCenterY, zPos]);
  const inner = cylinder(ventTubeLength + 2, Math.max(portOuterRadius - ventTubeWall, 2))
    .rotateX(90)
    .placeReference('center', [x, frontTubeCenterY, zPos]);

  return difference(outer, inner)
    .color(color)
    .material({ opacity: 0.92, roughness: 0.52, metalness: 0.08 });
}

function makeRearTube(zPos, color) {
  const outer = cylinder(ventTubeLength, portOuterRadius)
    .rotateY(90)
    .placeReference('center', [rearTubeCenterX, 0, zPos]);
  const inner = cylinder(ventTubeLength + 2, Math.max(portOuterRadius - ventTubeWall, 2))
    .rotateY(90)
    .placeReference('center', [rearTubeCenterX, 0, zPos]);

  return difference(outer, inner)
    .color(color)
    .material({ opacity: 0.92, roughness: 0.52, metalness: 0.08 });
}

const shellOuter = box(span, depth, height)
  .placeReference('center', [0, 0, height / 2]);
const shellInner = box(
  Math.max(span - shellWall * 2, 1),
  Math.max(depth - shellWall * 2, 1),
  Math.max(height - shellWall * 2, 1),
).placeReference('center', [0, 0, height / 2]);
const shell = difference(shellOuter, shellInner)
  .color('#f0eee8')
  .material({ opacity: 0.28, roughness: 0.5 });

const windowInsertPlate = box(span, 8, height)
  .placeReference('center', [0, 0, height / 2])
  .color('#d8ddd8')
  .material({ roughness: 0.9, metalness: 0.05, opacity: 0.45 });

const fanModuleVolume = box(fanModuleLength, innerDepth, innerHeight)
  .placeReference('center', [fanModuleX, 0, shellWall + innerHeight / 2])
  .color('#434c57')
  .material({ opacity: 0.18 });

const exhaustFanFrame = box(fanSize + 10, fanThickness + 8, fanSize + 10)
  .placeReference('center', [leftFanX, exhaustFanY, fanZ])
  .color('#59606a')
  .material({ opacity: 0.42 });

const supplyFanFrame = box(fanSize + 10, fanThickness + 8, fanSize + 10)
  .placeReference('center', [rightFanX, supplyFanY, fanZ])
  .color('#59606a')
  .material({ opacity: 0.42 });

const exhaustFanBody = box(fanSize, fanThickness, fanSize)
  .placeReference('center', [leftFanX, exhaustFanY, fanZ])
  .color('#d96c3f');

const supplyFanBody = box(fanSize, fanThickness, fanSize)
  .placeReference('center', [rightFanX, supplyFanY, fanZ])
  .color('#3c86d1');

const frontExhaustTube = makeVentTube(leftFanX, fanZ, '#e7ecef');
const frontSupplyTube = makeVentTube(rightFanX, fanZ, '#e7ecef');

const frontFanFaces = [
  ...makeFanFace(leftFanX, frontTubeMouthY, fanZ, '#f08c62'),
  ...makeFanFace(rightFanX, frontTubeMouthY, fanZ, '#5dade2'),
];

const outdoorPortFaces = [
  ...makeEndPortFace(hoodX + hoodLength / 2 + 2, exhaustPathY, upperCoreZ, '#f08c62'),
  ...makeEndPortFace(hoodX + hoodLength / 2 + 2, supplyPathY, lowerCoreZ, '#5dade2'),
];

const filterCassette = box(filterLength, flowPathDepth + 8, coreChannelHeight - 6)
  .placeReference('center', [filterX, supplyPathY, lowerCoreZ])
  .color('#63b67a')
  .material({ opacity: 0.88 });

const coreCase = box(coreLength, innerDepth - 6, coreCaseHeight)
  .placeReference('center', [coreX, 0, shellWall + coreCaseHeight / 2])
  .color('#c5ccd3')
  .material({ metalness: 0.55, roughness: 0.35, opacity: 0.8 });

const corePlateClip = box(coreLength - 18, innerDepth - 12, coreCaseHeight - 10)
  .placeReference('center', [coreX, 0, shellWall + coreCaseHeight / 2]);

const upperCoreZone = box(coreLength - 24, flowPathDepth, coreChannelHeight)
  .placeReference('center', [coreX, exhaustPathY, upperCoreZ])
  .color('#ff8787')
  .material({ opacity: 0.22 });

const lowerCoreZone = box(coreLength - 24, flowPathDepth, coreChannelHeight)
  .placeReference('center', [coreX, supplyPathY, lowerCoreZ])
  .color('#91d5ff')
  .material({ opacity: 0.22 });

const corePlates = Array.from({ length: corePlateCount }, (_, index) => {
  const z = shellWall + 16 + index * plateSpacing;
  const angle = index % 2 === 0 ? corePlateTilt : -corePlateTilt;
  const rawPlate = box(coreLength - 24, innerDepth - 16, 4)
    .rotateY(-angle)
    .placeReference('center', [coreX, 0, z]);

  return {
    name: `Diagonal Aluminum Plate ${index + 1}`,
    shape: intersection(rawPlate, corePlateClip)
      .color('#aab4be')
      .material({ metalness: 0.78, roughness: 0.32, opacity: 0.96 }),
  };
});

const exhaustRamp = diagonalVolume(
  leftFanX + fanSize / 2 + 6,
  fanZ,
  exhaustRampEndX,
  upperCoreZ,
  exhaustPathY,
  flowPathDepth,
  coreChannelHeight - 10,
  '#ff6b6b',
  0.42,
);

const supplyRamp = diagonalVolume(
  rightFanX + fanSize / 2 + 6,
  fanZ,
  supplyRampEndX,
  lowerCoreZ,
  supplyPathY,
  flowPathDepth,
  coreChannelHeight - 10,
  '#74c0fc',
  0.42,
);

const exhaustRoomLane = straightLane(
  exhaustRampEndX,
  coreEntryX,
  exhaustPathY,
  upperCoreZ,
  flowPathDepth,
  coreChannelHeight - 10,
  '#ff6b6b',
);

const supplyPreFilterLane = straightLane(
  supplyRampEndX,
  supplyFilterEntryX,
  supplyPathY,
  lowerCoreZ,
  flowPathDepth,
  coreChannelHeight - 10,
  '#74c0fc',
);

const supplyPostFilterLane = straightLane(
  supplyFilterExitX,
  coreEntryX,
  supplyPathY,
  lowerCoreZ,
  flowPathDepth,
  coreChannelHeight - 10,
  '#74c0fc',
);

const exhaustOutdoorLane = straightLane(
  coreX + coreLength / 2,
  hoodX + hoodLength / 2 - 12,
  exhaustPathY,
  upperCoreZ,
  flowPathDepth,
  coreChannelHeight - 10,
  '#ff6b6b',
);

const supplyOutdoorLane = straightLane(
  coreX + coreLength / 2,
  hoodX + hoodLength / 2 - 12,
  supplyPathY,
  lowerCoreZ,
  flowPathDepth,
  coreChannelHeight - 10,
  '#74c0fc',
);

const outdoorHood = box(hoodLength, depth + 28, innerHeight)
  .placeReference('center', [hoodX, 0, shellWall + innerHeight / 2])
  .color('#d9dde2')
  .material({ roughness: 0.65 });

const roomSideBracketTop = box(90, depth + 8, 8)
  .placeReference('center', [fanModuleX - 90, 0, height + 8])
  .color('#8b97a4');

const roomSideBracketBottom = box(90, depth + 8, 8)
  .placeReference('center', [fanModuleX - 90, 0, -8])
  .color('#8b97a4');

return [
  { name: 'Window Insert Plate', shape: windowInsertPlate },
  { name: 'Outer Shell', shape: shell },
  { name: 'Fan Module Volume', shape: fanModuleVolume },
  { name: 'Front Exhaust Tube', shape: frontExhaustTube },
  { name: 'Front Supply Tube', shape: frontSupplyTube },
  { name: 'Exhaust Fan Frame', shape: exhaustFanFrame },
  { name: 'Supply Fan Frame', shape: supplyFanFrame },
  { name: 'Exhaust Fan Body', shape: exhaustFanBody },
  { name: 'Supply Fan Body', shape: supplyFanBody },
  ...frontFanFaces,
  ...outdoorPortFaces,
  { name: 'Supply Filter Cassette', shape: filterCassette },
  { name: 'Heat Exchanger Core Case', shape: coreCase },
  { name: 'Upper Core Temperature Zone', shape: upperCoreZone },
  { name: 'Lower Core Temperature Zone', shape: lowerCoreZone },
  ...corePlates,
  { name: 'Exhaust Ramp', shape: exhaustRamp },
  { name: 'Supply Ramp', shape: supplyRamp },
  { name: 'Exhaust Room Lane', shape: exhaustRoomLane },
  { name: 'Supply Pre-Filter Lane', shape: supplyPreFilterLane },
  { name: 'Supply Post-Filter Lane', shape: supplyPostFilterLane },
  { name: 'Exhaust Outdoor Lane', shape: exhaustOutdoorLane },
  { name: 'Supply Outdoor Lane', shape: supplyOutdoorLane },
  { name: 'Outdoor Hood Volume', shape: outdoorHood },
  { name: 'Top Mount Bracket', shape: roomSideBracketTop },
  { name: 'Bottom Mount Bracket', shape: roomSideBracketBottom },
];
