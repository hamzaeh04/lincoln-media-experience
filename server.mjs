// Local server: serves the site and speaks short lines (the visitor's name) with Kokoro,
// the same free voice used for the recorded clips. The model loads once at startup and stays
// in memory, so each line takes about a second instead of a 90 MB download in the visitor's browser.
// Usage:  npm run dev    → http://localhost:5178
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { KokoroTTS } from "kokoro-js";

const PORT = Number(process.env.PORT || 5178);
const VOICE = process.env.VOICE || "af_heart";
const SPEED = Number(process.env.SPEED || 0.92);
const root = new URL(".", import.meta.url).pathname;

const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json", ".mp3": "audio/mpeg", ".wav": "audio/wav",
  ".glb": "model/gltf-binary", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".ico": "image/x-icon",
};

let tts = null;
const loading = KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", { dtype: "q8", device: "cpu" })
  .then((m) => { tts = m; console.log(`Voice ready (${VOICE})`); })
  .catch((e) => console.error("Voice failed to load:", e.message));

// Lines are generated one at a time; cache the last few so pre-generated names are instant
let queue = Promise.resolve();
const cache = new Map();
function speak(text) {
  if (cache.has(text)) return cache.get(text);
  const job = (queue = queue.then(async () => Buffer.from((await tts.generate(text, { voice: VOICE, speed: SPEED })).toWav())));
  cache.set(text, job);
  job.catch(() => cache.delete(text));
  if (cache.size > 50) cache.delete(cache.keys().next().value);
  return job;
}

function readBody(req, limit = 2000) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (c) => { data += c; if (data.length > limit) { reject(new Error("too large")); req.destroy(); } });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  try {
    if (url.pathname === "/api/say") {
      if (req.method === "GET") {
        res.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-store" });
        return res.end(JSON.stringify({ ok: true, ready: !!tts }));
      }
      if (req.method !== "POST") { res.writeHead(405); return res.end(); }
      const { text } = JSON.parse(await readBody(req));
      const clean = String(text || "").replace(/[^\p{L}\p{M}\p{N}' .,?!…-]/gu, "").replace(/\s+/g, " ").trim().slice(0, 160);
      if (!clean) { res.writeHead(400); return res.end(); }
      await loading;
      if (!tts) { res.writeHead(503); return res.end(); }
      const t = Date.now();
      const wav = await speak(clean);
      console.log(`said in ${Date.now() - t}ms: ${clean}`);
      res.writeHead(200, { "Content-Type": "audio/wav", "Content-Length": wav.length, "Cache-Control": "no-store" });
      return res.end(wav);
    }

    // Static files (no caching, so edits always show up after a refresh)
    let path = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
    if (path.endsWith("/")) path += "index.html";
    const file = join(root, path);
    if (!file.startsWith(root) || /[/\\](node_modules|\.env)/.test(path)) { res.writeHead(404); return res.end(); }
    let info = await stat(file).catch(() => null);
    let target = file;
    // Folder URLs (/services/seo) serve their index.html, like Vercel does
    if (info && info.isDirectory()) { target = join(file, "index.html"); info = await stat(target).catch(() => null); }
    if (!info || !info.isFile()) {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(await readFile(join(root, "404.html")).catch(() => "Not found"));
    }
    res.writeHead(200, { "Content-Type": TYPES[extname(target)] || "application/octet-stream", "Cache-Control": "no-cache" });
    res.end(await readFile(target));
  } catch (e) {
    console.error(e.message);
    if (!res.headersSent) res.writeHead(500);
    res.end();
  }
}).listen(PORT, () => console.log(`The Lincoln Media → http://localhost:${PORT}`));
