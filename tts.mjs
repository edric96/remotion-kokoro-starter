// npm run tts: one WAV per line of video.json → public/voice/<n>.wav, and each line's length → src/durations.json.
// Kokoro-82M (Apache-2.0) runs locally on the CPU. The first run downloads the model (~90 MB) into the Hugging Face cache.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { KokoroTTS } from "kokoro-js";

const video = JSON.parse(readFileSync("video.json", "utf8"));
const SILENCE = 0.01;

/** Writes 16-bit mono WAV with leading/trailing silence trimmed (40 ms kept). Returns the length in seconds. */
function saveTrimmed(audio, path) {
  const x = audio.audio;
  let a = 0, b = x.length - 1;
  while (a < b && Math.abs(x[a]) < SILENCE) a++;
  while (b > a && Math.abs(x[b]) < SILENCE) b--;
  const pad = Math.round(audio.sampling_rate * 0.04);
  const pcm = x.subarray(Math.max(0, a - pad), Math.min(x.length, b + pad));
  const buf = Buffer.alloc(44 + pcm.length * 2);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + pcm.length * 2, 4); buf.write("WAVE", 8);
  buf.write("fmt ", 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(audio.sampling_rate, 24); buf.writeUInt32LE(audio.sampling_rate * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write("data", 36); buf.writeUInt32LE(pcm.length * 2, 40);
  pcm.forEach((v, i) => buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), 44 + i * 2));
  writeFileSync(path, buf);
  return pcm.length / audio.sampling_rate;
}

const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", { dtype: "q8", device: "cpu" });
mkdirSync("public/voice", { recursive: true });
const durations = [];
for (const [i, line] of video.lines.entries()) {
  const audio = await tts.generate(line.say, { voice: line.voice || video.voice, speed: video.speed });
  durations.push(+saveTrimmed(audio, `public/voice/${i}.wav`).toFixed(3));
  console.log(`line ${i}: ${durations[i]}s`);
}
writeFileSync("src/durations.json", JSON.stringify(durations) + "\n");
