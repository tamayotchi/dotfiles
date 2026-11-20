#!/usr/bin/env node
// Build a feature walkthrough: validate a deck (JSON or ESM module) and inline it into a
// single self-contained HTML file.
//
//   node build.mjs <deck.json|deck.mjs> [-o out.html] [--open] [--check]
//
// A deck module (.mjs/.js) must `export default` the deck object (it may use helpers to
// build repeated scene pieces). Cast/wire references are resolved here, so the runtime only
// ever sees plain, fully expanded scenes.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const args = process.argv.slice(2);
const flag = n => args.includes(n);
const opt = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
if (flag("--icons")) { console.log(Object.keys(JSON.parse(fs.readFileSync(path.join(root, "assets/icons.json"), "utf8"))).sort().join("\n")); process.exit(0); }
const input = args.find((a, i) => !a.startsWith("-") && args[i - 1] !== "-o");
if (!input) {
  console.error("usage: node build.mjs <deck.json|deck.mjs> [-o out.html] [--open] [--check]");
  process.exit(2);
}
const inPath = path.resolve(input);
const outPath = path.resolve(opt("-o") || inPath.replace(/\.(json|mjs|js)$/i, "") + ".html");

let deck;
if (/\.(mjs|js)$/i.test(inPath)) deck = (await import(pathToFileURL(inPath).href + `?t=${Date.now()}`)).default;
else {
  const raw = fs.readFileSync(inPath, "utf8");
  try { deck = JSON.parse(raw); }
  catch (e) {
    const m = /position (\d+)/.exec(e.message);
    if (m) { const pos = +m[1], line = raw.slice(0, pos).split("\n").length; console.error(`✗ JSON parse error at line ${line}: ${e.message}`); }
    else console.error(`✗ JSON parse error: ${e.message}`);
    process.exit(1);
  }
}

const ICONS = JSON.parse(fs.readFileSync(path.join(root, "assets/icons.json"), "utf8"));
const errors = [], warnings = [];
const err = (p, m) => errors.push(`${p}: ${m}`), warn = (p, m) => warnings.push(`${p}: ${m}`);
const isObj = v => v && typeof v === "object" && !Array.isArray(v);
const camel = n => String(n).replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
const ICON_ALIAS = { home: "house", trash: "trash2", warning: "alert", "alert-triangle": "alert", "dollar-sign": "dollar", "refresh-cw": "refresh", "message-square": "message", "bar-chart": "chartBar", "pie-chart": "chartPie" };
const iconName = n => ICONS[n] ? n : ICONS[ICON_ALIAS[n]] ? ICON_ALIAS[n] : camel(n);
const iconOk = n => !n || ICONS[iconName(n)];
const ICON_LIST = Object.keys(ICONS).sort();
const suggest = n => { const s = String(n).toLowerCase().replace(/[^a-z]/g, ""); const hits = ICON_LIST.filter(k => k.toLowerCase().includes(s.slice(0, 4)) || s.includes(k.toLowerCase())); return hits.length ? ` (did you mean: ${hits.slice(0, 5).join(", ")}?)` : ""; };
const checkIcon = (p, n) => { if (n && !iconOk(n)) warn(p, `unknown icon "${n}"${suggest(n)} — available: run with --icons`); };


const ENTITY_TYPES = new Set(["service", "block", "users", "crowd", "db", "queue", "device", "zone", "note"]);
const COLORS = new Set(["blue", "green", "orange", "yellow", "purple", "red", "teal", "pink", "gray", "slab", "dark"]);
const TONES = new Set(["paper", "red", "green", "amber", "violet", "blue", "gray", "teal"]);
const CHAPTERS = new Set(["setup", "context", "problem", "solution", "technique", "tradeoff", "insight", "decision", "demo", "result", "recap"]);
const CALLOUTS = new Set(["warn", "tip", "insight", "decision", "next", "info"]);
const KINDS = new Set(["req", "res", "retry", "slow", "ping", "event", "write", "msg", "heavy", "fail"]);
const LINK_STYLES = new Set(["solid", "dashed", "off", "hot", "good"]);
const HEADS = new Set(["end", "both", "none", "start"]);
const FORMATS = new Set(["num", "ms", "s", "%", "x", "$", "bytes", "text"]);

// ---------- normalise deck shape ----------
if (Array.isArray(deck)) deck = { lessons: deck };
if (deck.steps) deck = { title: deck.title, lessons: [deck] };
if (!deck.sections) deck.sections = [{ title: deck.sectionTitle || "", lessons: deck.lessons || [] }];
delete deck.lessons;
if (!deck.title) warn("deck", "missing title");

const ids = new Set();
deck.sections.forEach((sec, si) => {
  if (!Array.isArray(sec.lessons) || !sec.lessons.length) err(`sections[${si}]`, "needs a non-empty lessons array");
  (sec.lessons || []).forEach((lesson, li) => resolveLesson(lesson, `sections[${si}].lessons[${li}]`));
});

function merge(base, over) {
  if (over === true || over === undefined) return structuredClone(base);
  if (!isObj(over)) return over;
  const out = structuredClone(base || {});
  for (const [k, v] of Object.entries(over)) out[k] = v;
  return out;
}

function resolveLesson(L, p) {
  if (!L.id) err(p, "missing id"); else if (!/^[a-z0-9][a-z0-9-]*$/.test(L.id)) err(`${p}.id`, `"${L.id}" must be kebab-case (a-z, 0-9, -)`);
  if (ids.has(L.id)) err(`${p}.id`, `duplicate lesson id "${L.id}"`); ids.add(L.id);
  if (!L.title) err(p, "missing title");
  if (!Array.isArray(L.steps) || !L.steps.length) { err(p, "needs a non-empty steps array"); return; }
  const cast = L.cast || {}, wires = L.wires || {};
  const metrics = L.metrics || {};
  for (const [k, d] of Object.entries(metrics)) {
    if (!isObj(d)) { err(`${p}.metrics.${k}`, "must be an object {label, icon, format, good, warn}"); continue; }
    if (!d.label) warn(`${p}.metrics.${k}`, "missing label");
    checkIcon(`${p}.metrics.${k}.icon`, d.icon);
    if (d.format && !FORMATS.has(d.format)) warn(`${p}.metrics.${k}.format`, `unknown format "${d.format}" (use ${[...FORMATS].join(", ")})`);
    for (const c of ["good", "warn"]) if (d[c] && !/^\s*(<=|>=|<|>|==|=|!=)\s*-?[\d.]+\s*$/.test(String(d[c]))) err(`${p}.metrics.${k}.${c}`, `"${d[c]}" must look like ">=99" or "<800"`);
  }
  if (Object.keys(metrics).length > 5) warn(`${p}.metrics`, `${Object.keys(metrics).length} metrics — more than 4–5 crowds the stage`);
  for (const k of L.legend || []) { const kind = Array.isArray(k) ? k[0] : k; if (!KINDS.has(kind)) warn(`${p}.legend`, `unknown packet kind "${kind}"`); }
  (L.goals || []).forEach((g, i) => { if (!g.text) err(`${p}.goals[${i}]`, "missing text"); if (!(g.step >= 1 && g.step <= L.steps.length)) err(`${p}.goals[${i}].step`, `must be 1..${L.steps.length} (1-based)`); });
  L.steps.forEach((s, si) => {
    const sp = `${p}.steps[${si}]`;
    if (!s.title) err(sp, "missing title");
    if (!s.short) warn(sp, "missing short (timeline label)"); else if (s.short.length > 16) warn(`${sp}.short`, `"${s.short}" is long for the timeline (≤ 14 chars reads best)`);
    if (s.chapter && !CHAPTERS.has(s.chapter)) warn(`${sp}.chapter`, `unknown chapter "${s.chapter}" (use ${[...CHAPTERS].join(", ")})`);
    if (s.body && !Array.isArray(s.body)) s.body = [String(s.body)];
    if ((s.body || []).join(" ").replace(/<[^>]+>/g, "").length > 900) warn(`${sp}.body`, "very long body — keep each step to ~2 short paragraphs");
    if (s.callout) { if (!CALLOUTS.has(s.callout.kind)) warn(`${sp}.callout.kind`, `unknown kind "${s.callout.kind}"`); if (!s.callout.text) err(`${sp}.callout`, "missing text"); }
    for (const k of Object.keys(s.metrics || {})) if (!metrics[k]) err(`${sp}.metrics.${k}`, `metric "${k}" is not defined in lesson.metrics`);
    for (const k of Object.keys(metrics)) if (s.metrics && !(k in s.metrics)) warn(`${sp}.metrics`, `no value for "${k}" (shows —)`);
    // ---- scene ----
    const sc = s.scene || (s.scene = { entities: {}, links: {}, flows: [] });
    const ents = {};
    let entSrc = sc.entities || {};
    if (Array.isArray(entSrc)) entSrc = Object.fromEntries(entSrc.map(id => [id, true]));
    for (const [id, v] of Object.entries(entSrc)) {
      if (v === false || v === null) continue;
      const base = cast[id];
      if ((v === true || (isObj(v) && !v.type && !("x" in v) && !("x0" in v))) && !base) { err(`${sp}.scene.entities.${id}`, `no cast entry "${id}" to inherit from (define lesson.cast.${id} or give a full entity)`); continue; }
      const e = merge(base, v);
      e.type = e.type || "service";
      if (!ENTITY_TYPES.has(e.type)) err(`${sp}.scene.entities.${id}.type`, `unknown type "${e.type}"`);
      if (e.type === "zone") { if (e.x0 === undefined && e.x === undefined) err(`${sp}.scene.entities.${id}`, "zone needs x0,x1,y0,y1 or x,y,sx,sy"); }
      else if (typeof e.x !== "number" || typeof e.y !== "number") err(`${sp}.scene.entities.${id}`, "needs numeric x and y");
      if (e.color && !COLORS.has(e.color)) warn(`${sp}.scene.entities.${id}.color`, `unknown color "${e.color}" (use ${[...COLORS].join(", ")})`);
      if (e.tone && !TONES.has(e.tone)) warn(`${sp}.scene.entities.${id}.tone`, `unknown tone "${e.tone}"`);
      checkIcon(`${sp}.scene.entities.${id}.icon`, e.icon);
      for (const [ti, t] of (e.tags || []).entries()) { if (isObj(t)) { checkIcon(`${sp}.scene.entities.${id}.tags[${ti}].icon`, t.icon); if (t.tone && !TONES.has(t.tone)) warn(`${sp}.scene.entities.${id}.tags[${ti}].tone`, `unknown tone "${t.tone}"`); } }
      if (e.tags && !Array.isArray(e.tags)) err(`${sp}.scene.entities.${id}.tags`, "must be an array");
      for (const k of ["heat", "cpu", "dead", "dim"]) if (typeof e[k] === "boolean") e[k] = e[k] ? 1 : 0;
      if (typeof e.label === "string" && e.type === "service" && e.label.length > 14 && !e.label.includes("\n")) warn(`${sp}.scene.entities.${id}.label`, `"${e.label}" is long for a block — split into two lines with ["Line 1","Line 2"]`);
      ents[id] = e;
    }
    sc.entities = ents;
    const links = {};
    let linkSrc = sc.links || {};
    if (Array.isArray(linkSrc)) linkSrc = Object.fromEntries(linkSrc.map(id => [id, true]));
    for (const [id, v] of Object.entries(linkSrc)) {
      if (v === false || v === null) continue;
      const base = wires[id];
      if ((v === true || (isObj(v) && !v.from)) && !base) { err(`${sp}.scene.links.${id}`, `no wire "${id}" to inherit from (define lesson.wires.${id} or give {from,to})`); continue; }
      const l = merge(base, v);
      if (!ents[l.from]) err(`${sp}.scene.links.${id}.from`, `entity "${l.from}" is not in this step's scene`);
      if (!ents[l.to]) err(`${sp}.scene.links.${id}.to`, `entity "${l.to}" is not in this step's scene`);
      if (l.style && !LINK_STYLES.has(l.style)) warn(`${sp}.scene.links.${id}.style`, `unknown style "${l.style}"`);
      if (l.heads && !HEADS.has(l.heads)) warn(`${sp}.scene.links.${id}.heads`, `unknown heads "${l.heads}"`);
      if (l.labelTone && !TONES.has(l.labelTone)) warn(`${sp}.scene.links.${id}.labelTone`, `unknown tone "${l.labelTone}"`);
      if (l.fail !== undefined && !(l.fail >= 0 && l.fail <= 1)) err(`${sp}.scene.links.${id}.fail`, "must be 0..1");
      for (const [vi, pt] of (l.via || []).entries()) {
        const refs = typeof pt === "string" ? [pt] : Array.isArray(pt) ? pt.filter(x => typeof x === "string").map(x => /^([\w-]+?)([+-][\d.]+)?$/.exec(x)?.[1]) : [];
        for (const r of refs) if (r && !ents[r]) err(`${sp}.scene.links.${id}.via[${vi}]`, `entity "${r}" is not in this step's scene`);
      }
      links[id] = l;
    }
    sc.links = links;
    (sc.flows || []).forEach((f, fi) => {
      const fp = `${sp}.scene.flows[${fi}]`;
      const routes = f.routes ? f.routes.map(r => r.route || r.path) : [f.route];
      if (!f.routes && !Array.isArray(f.route)) err(fp, "needs route: [linkId, ...] or routes: [{route:[...]}]");
      for (const r of routes) for (const lid of r || []) if (!links[lid]) err(fp, `route uses link "${lid}" which is not in this step's scene.links`);
      for (const k of [f.kind, ...(f.pattern || []), ...((f.routes || []).map(r => r.kind))]) if (k && !KINDS.has(k)) warn(fp, `unknown packet kind "${k}"`);
      for (const r of routes) { if (!r) continue; for (let i = 0; i < r.length - 1; i++) { const a = links[r[i]], b = links[r[i + 1]]; if (a && b && a.to !== b.from) warn(fp, `route hop "${r[i]}" → "${r[i + 1]}" is not continuous (${a.to} ≠ ${b.from})`); } }
      if (f.rate !== undefined && !(f.rate > 0 && f.rate <= 12)) warn(fp, `rate ${f.rate} — use 0.2..8 packets/second`);
    });
    if (s.scene.card) {
      const c = s.scene.card; checkIcon(`${sp}.scene.card.icon`, c.icon);
      if (!c.lines && !c.bars && !c.table) warn(`${sp}.scene.card`, "card has no lines, bars or table");
      for (const [bi, b] of (c.bars || []).entries()) if (!(b.from >= 0 && b.to <= 1 && b.to >= b.from)) err(`${sp}.scene.card.bars[${bi}]`, "from/to must satisfy 0 <= from <= to <= 1");
    }
    if (!Object.keys(ents).length) warn(`${sp}.scene`, "empty scene");
  });
  delete L.cast; delete L.wires;
}

for (const w of warnings) console.warn(`⚠ ${w}`);
if (errors.length) { for (const e of errors) console.error(`✗ ${e}`); console.error(`\n${errors.length} error(s), ${warnings.length} warning(s) — nothing written.`); process.exit(1); }
const nLessons = deck.sections.reduce((n, s) => n + s.lessons.length, 0), nSteps = deck.sections.reduce((n, s) => n + s.lessons.reduce((m, l) => m + l.steps.length, 0), 0);
if (flag("--check")) { console.log(`✓ valid: ${nLessons} walkthrough(s), ${nSteps} steps, ${warnings.length} warning(s)`); process.exit(0); }

const used = new Set(), walk = v => { if (Array.isArray(v)) v.forEach(walk); else if (isObj(v)) { for (const [k, x] of Object.entries(v)) { if (k === "icon" && typeof x === "string") { used.add(iconName(x)); if (ICON_ALIAS[x]) used.add(ICON_ALIAS[x]); } walk(x); } } };
walk(deck);
const builtin = ["workflow", "expand", "sun", "moon", "zoomOut", "replay", "pause", "play", "clock", "signal", "listOrdered", "info", "file", "check", "arrowRight", "arrowLeft", "alert", "bulb", "sparkles", "flag", "cpu", "users", "user", "inbox", "smartphone", "database", "server"];
const icons = Object.fromEntries([...used, ...builtin].filter(k => ICONS[k]).map(k => [k, ICONS[k]]));
const safe = s => JSON.stringify(s).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
let html = fs.readFileSync(path.join(root, "assets/template.html"), "utf8");
html = html.replace("/*__DECK__*/null", () => safe(deck)).replace("/*__ICONS__*/{}", () => safe(icons)).replace("/*__TITLE__*/", () => String(deck.title || "Walkthrough").replace(/[<&]/g, ""));
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, html);
console.log(`✓ ${path.relative(process.cwd(), outPath) || outPath} — ${nLessons} walkthrough(s), ${nSteps} steps, ${warnings.length} warning(s)`);
if (flag("--open")) { try { execFileSync(process.platform === "darwin" ? "open" : process.platform === "win32" ? "explorer" : "xdg-open", [outPath]); } catch { } }
