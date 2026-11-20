#!/usr/bin/env node
// Layout lint for a built walkthrough: overlapping blocks/tags/labels, links that pass through
// other entities, and scenes too spread out to read. Runs the runtime's own geometry code in
// headless Chrome, so results match what the audience will see.
//
//   node check.mjs <deck.html> [--strict]
import path from "node:path";
import { pathToFileURL } from "node:url";
import { withPage } from "./cdp.mjs";

const args = process.argv.slice(2);
const file = args.find(a => !a.startsWith("-"));
if (!file) { console.error("usage: node check.mjs <deck.html> [--strict]"); process.exit(2); }

const { issues, errs } = await withPage({}, async ({ evaluate, goto, errors }) => {
  await goto(`${pathToFileURL(path.resolve(file)).href}?shot#/`);
  await evaluate("document.fonts.ready.then(() => true)");
  const issues = JSON.parse(await evaluate("JSON.stringify(lintDeck())"));
  return { issues, errs: errors() };
});
if (errs.length) { console.error("Page errors:"); for (const e of errs) console.error(`  ${e}`); }
if (!issues.length) { console.log("✓ layout clean: no overlaps, crossings or over-wide scenes"); process.exit(errs.length ? 1 : 0); }
let last = "";
for (const i of issues) { if (i.where !== last) { console.log(`\n${i.where}`); last = i.where; } console.log(`  ${i.kind === "crossing" ? "✗" : "⚠"} [${i.kind}] ${i.msg}`); }
console.log(`\n${issues.length} layout issue(s). Fix coordinates/labels, rebuild and re-run.`);
process.exit(args.includes("--strict") || errs.length ? 1 : 0);
