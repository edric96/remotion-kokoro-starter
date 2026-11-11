# remotion-kokoro-starter

**Vertical Shorts with a voiceover nobody recorded.** Write your lines in `video.json`, run two commands, get a 1080×1920 MP4 with an AI voice and captions that follow it.

- **Local voice, no API keys:** [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) (Apache-2.0) runs on your CPU through [kokoro-js](https://www.npmjs.com/package/kokoro-js). There are 20+ English voices and no per-minute cost.
- **Captions that land on the words:** every line becomes its own WAV, and the timeline uses each file's real length. Captions are spread across that length, so there is no forced-alignment step and no drift.
- **Plain [Remotion](https://www.remotion.dev):** one React component (`src/Short.tsx`, about 100 lines) that you can restyle however you like.

<p align="center"><img src="docs/preview.gif" width="270" alt="Preview: captions timed to a Kokoro voiceover"></p>

## Quick start
```bash
npm install
npm run tts        # voiceover: public/voice/<n>.wav + src/durations.json (first run downloads the model, ~90 MB)
npm run render     # out/short.mp4
```
Preview and tweak live with `npm run studio`.

Requires Node.js 20+. Works on macOS, Windows and Linux.

## Your own video
Edit `video.json`:
```json
{
  "voice": "af_heart",
  "speed": 1.05,
  "lines": [
    { "say": "First line of the voiceover.", "image": "img/1.jpg" },
    { "say": "Second line, in another voice.", "voice": "bm_george" }
  ]
}
```
- `image` (optional) is a file in `public/`, shown with a slow zoom. Lines without an image get a gradient.
- `voice` per line (optional) overrides the default. Voice names: `af_*` / `am_*` are American female/male, `bf_*` / `bm_*` are British. See the [voice list](https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX).
- Write numbers out ("twenty three percent"). TTS reads digits and symbols unreliably.

Then `npm run tts && npm run render` again.

## How the timing works
1. `tts.mjs` generates each line, trims leading and trailing silence, and saves the length in seconds to `src/durations.json`.
2. `src/Root.tsx` sets each line's duration to its WAV length plus a 0.3 s gap.
3. `Captions` splits the line into chunks of 4 words or fewer (breaking at punctuation) and spreads them evenly over the audio.

## Want the full pipeline?
This starter is the voice-and-captions core of **[Zero Cost Shorts](https://hoanglm.gumroad.com/l/zero-cost-shorts)**, the pipeline I use for a faceless story channel. The kit adds:
- a retention-tuned story format: hook card on frame 0, labels, payoff that loops, AI video clips per image
- music synthesized in code plus a frame-0 hit, so Content ID has nothing to match
- a brand config: name, colours, 5 font presets
- 11 QA checks before upload, and the upload text written for you
- Claude Code commands that write the script, print image prompts and review the render

## Licences
- This repo: MIT.
- Kokoro-82M and kokoro-js: Apache-2.0.
- Inter font: SIL Open Font License 1.1.
- **Remotion** has its own licence: free for individuals, companies with up to 3 employees and non-profits; larger companies need a [company licence](https://www.remotion.dev/license).
- YouTube and TikTok ask you to disclose synthetic or altered content. Mention "AI narration" in your descriptions.
