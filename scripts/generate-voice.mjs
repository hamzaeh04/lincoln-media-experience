// Generates the guide's voice with Kokoro (free, open source, Apache-2.0), running locally.
// Usage:  npm run voice                      (first run downloads the ~90 MB voice model once)
//         VOICE=af_nicole SPEED=0.9 npm run voice
//         ONLY=intro-1,intro-2 npm run voice   (regenerate just some lines)
// Soft female voices to try: af_heart (warm), af_bella, af_nicole (very soft, breathy), bf_emma (British)
// Lines come from voice-lines.js (the same file the site uses).
import { KokoroTTS } from "kokoro-js";
import { mkdirSync, unlinkSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const root = new URL("../", import.meta.url).pathname;
const src = readFileSync(root + "voice-lines.js", "utf8");
const LINES = JSON.parse(src.slice(src.indexOf("= {") + 2, src.lastIndexOf("}") + 1));

const voice = process.env.VOICE || "af_heart";
const speed = Number(process.env.SPEED || 0.92);
const only = process.env.ONLY ? new Set(process.env.ONLY.split(",")) : null;
const outDir = root + "assets/voice/";
mkdirSync(outDir, { recursive: true });

console.log(`Loading Kokoro (voice: ${voice}, speed: ${speed})…`);
const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", { dtype: "q8", device: "cpu" });

for (const [key, line] of Object.entries(LINES)) {
  if (only && !only.has(key)) continue;
  process.stdout.write(`${key.padEnd(14)} … `);
  const audio = await tts.generate(line.say, { voice, speed });
  const wav = `${outDir}${key}.wav`, mp3 = `${outDir}${key}.mp3`;
  await audio.save(wav);
  // Short fades so clips never click; 96 kbps mono keeps files small
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", wav, "-af", "afade=t=in:d=0.04,areverse,afade=t=in:d=0.12,areverse", "-ac", "1", "-b:a", "96k", mp3]);
  unlinkSync(wav);
  console.log("saved");
}
console.log(`Done → ${outDir}`);
