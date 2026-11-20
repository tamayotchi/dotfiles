#!/usr/bin/env node
// Screenshot built walkthrough steps with headless Chrome so the layout can be checked visually.
//
//   node snapshot.mjs <deck.html> [--lesson id] [--steps all|1,3,5] [--out dir] [--size 1600x1000] [--dark] [--overview]
//
// Writes <out>/<lesson>-<NN>.png (default out: <deck dir>/shots). Transitions are skipped
// (?shot) so each PNG shows the settled scene with packets in flight.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { withPage, sleep } from "./cdp.mjs";

const args = process.argv.slice(2);
const VAL = ["--lesson", "--steps", "--out", "--size"];
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const file = args.find((a, i) => !a.startsWith("-") && !VAL.includes(args[i - 1]));
if (!file) { console.error("usage: node snapshot.mjs <deck.html> [--lesson id] [--steps all|1,3,5] [--out dir] [--size 1600x1000] [--dark] [--overview]"); process.exit(2); }
const htmlPath = path.resolve(file);
const outDir = path.resolve(opt("--out", path.join(path.dirname(htmlPath), "shots")));
const [width, height] = opt("--size", "1600x1000").split("x").map(Number);
fs.mkdirSync(outDir, { recursive: true });
const base = `${pathToFileURL(htmlPath).href}?shot${args.includes("--dark") ? "&dark" : ""}`;

await withPage({ width, height }, async ({ evaluate, goto, screenshot, errors }) => {
  await goto(`${base}#/`);
  await evaluate("document.fonts.ready.then(() => true)");
  const lessons = await evaluate("JSON.stringify(deck.lessons.map(l => ({ id: l.id, n: l.steps.length })))").then(JSON.parse);
  const pick = lessons.filter(l => !opt("--lesson") || l.id === opt("--lesson"));
  if (!pick.length) throw new Error(`No lesson "${opt("--lesson")}". Available: ${lessons.map(l => l.id).join(", ")}`);
  if (args.includes("--overview") && lessons.length > 1) { await sleep(400); console.log(`✓ ${path.relative(process.cwd(), await screenshot(path.join(outDir, "overview.png")))}`); }
  const stepsArg = opt("--steps", "all");
  for (const l of pick) {
    const steps = stepsArg === "all" ? Array.from({ length: l.n }, (_, i) => i + 1) : stepsArg.split(",").map(Number).filter(n => n >= 1 && n <= l.n);
    for (const s of steps) {
      await evaluate(`location.hash = "#/${l.id}/${s}"; true`);
      await sleep(1300); // let a few packets travel
      const out = path.join(outDir, `${l.id}-${String(s).padStart(2, "0")}.png`);
      await screenshot(out);
      console.log(`✓ ${path.relative(process.cwd(), out)}`);
    }
  }
  const errs = errors();
  if (errs.length) { console.error("\nPage errors:"); for (const e of errs) console.error(`  ${e}`); process.exitCode = 1; }
});
