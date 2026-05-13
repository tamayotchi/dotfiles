const width = Param.number("Width", 150, { min: 10, max: 500, unit: "mm" });
const length = Param.number("Length", 960, { min: 10, max: 2000, unit: "mm" });
const thickness = Param.number("Thickness", 58, { min: 1, max: 200, unit: "mm" });
const lineOffset = Param.number("Line Offset", 18, { min: 0, max: 100, unit: "mm" });
const lineThickness = Param.number("Line Thickness", 3.5, { min: 0.5, max: 20, unit: "mm" });
const lineDepth = Param.number("Line Depth", 10, { min: 0.5, max: 20, unit: "mm" });

scene({
  background: { top: '#d9e1ea', bottom: '#7f8c99' },
  camera: { position: [900, -1100, 700], target: [0, 0, 0], fov: 40 },
  environment: { preset: 'studio', intensity: 0.2, background: false },
  lights: [
    { type: 'ambient', color: '#efe7dc', intensity: 0.18 },
    { type: 'directional', position: [120, -140, 160], target: [0, 0, 0], color: '#ffe2bf', intensity: 2.6, castShadow: true },
    { type: 'directional', position: [-120, 100, 120], target: [0, 0, 0], color: '#d4e6fb', intensity: 0.8 },
  ],
  ground: { visible: true, color: '#c7ced6', height: -1, receiveShadow: true },
  postProcessing: {
    bloom: { intensity: 0.02, threshold: 0.95, radius: 0.25 },
    vignette: { darkness: 0.35, offset: 0.35 },
    toneMappingExposure: 1.1,
  },
});

const baseBoard = box(width, length, thickness)
  .placeReference('center', [0, 0, thickness / 2]);

function makeXSideLine(zCenter, side) {
  return box(width + 0.2, lineDepth + 0.2, lineThickness)
    .placeReference('center', [
      0,
      side * (length / 2 - lineDepth / 2),
      zCenter,
    ]);
}

const lineCenters = [lineOffset, thickness - lineOffset];
console.log('Line centers (mm):', lineCenters.join(', '));

const grooveCutters = lineCenters.flatMap((zCenter) => [
  makeXSideLine(zCenter, -1),
  makeXSideLine(zCenter, 1),
]);

const board = difference(baseBoard, grooveCutters)
  .color('#000000');

return { board };
