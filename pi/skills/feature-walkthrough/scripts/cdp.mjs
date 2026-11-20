// Minimal Chrome DevTools Protocol helper (no dependencies; needs Node >= 22 for global WebSocket).
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import net from "node:net";

export function findChrome() {
  return [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium", "/usr/bin/chromium-browser",
  ].find(p => p && fs.existsSync(p));
}
const freePort = () => new Promise(res => { const s = net.createServer(); s.listen(0, () => { const p = s.address().port; s.close(() => res(p)); }); });
export const sleep = ms => new Promise(r => setTimeout(r, ms));

export async function withPage({ width = 1600, height = 1000 } = {}, fn) {
  if (typeof WebSocket === "undefined") throw new Error("Node >= 22 is required (global WebSocket).");
  const chrome = findChrome();
  if (!chrome) throw new Error("No Chrome/Chromium found. Set CHROME_PATH to a Chromium-based browser binary.");
  const port = await freePort(), profile = fs.mkdtempSync(path.join(os.tmpdir(), "fw-cdp-"));
  const proc = spawn(chrome, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run", "--no-default-browser-check", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, `--window-size=${width},${height}`, "about:blank"], { stdio: "ignore" });
  const cleanup = () => { try { proc.kill("SIGKILL"); } catch { } setTimeout(() => { try { fs.rmSync(profile, { recursive: true, force: true }); } catch { } }, 300); };
  try {
    let tabs;
    for (let i = 0; i < 100 && !tabs; i++) { try { tabs = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); } catch { await sleep(100); } }
    const tab = tabs?.find(t => t.type === "page");
    if (!tab) throw new Error("Could not connect to Chrome.");
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    let id = 0; const pending = new Map(), events = [];
    ws.onmessage = m => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } else if (d.method) events.push(d); };
    const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, d => d.error ? rej(new Error(`${method}: ${d.error.message}`)) : res(d.result)); ws.send(JSON.stringify({ id: i, method, params })); });
    await send("Page.enable"); await send("Runtime.enable");
    await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
    const evaluate = async expr => {
      const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
      return r.result.value;
    };
    const goto = async url => { await send("Page.navigate", { url }); for (let i = 0; i < 100; i++) { await sleep(100); try { if (await evaluate("document.readyState") === "complete") break; } catch { } } };
    const screenshot = async file => { const r = await send("Page.captureScreenshot", { format: "png" }); fs.writeFileSync(file, Buffer.from(r.data, "base64")); return file; };
    const errors = () => events.filter(e => e.method === "Runtime.exceptionThrown").map(e => e.params.exceptionDetails?.exception?.description || e.params.exceptionDetails?.text);
    const result = await fn({ send, evaluate, goto, screenshot, errors });
    ws.close();
    return result;
  } finally { cleanup(); }
}
