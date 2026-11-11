import { loadFont } from "@remotion/google-fonts/Inter";
import { AbsoluteFill, Html5Audio, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";

const { fontFamily } = loadFont("normal", { weights: ["800"], subsets: ["latin"] });

export const FPS = 30;
/** Silence after each line, in seconds, so the video breathes between sentences. */
const GAP = 0.3;

export type Line = { say: string; image?: string; voice?: string };
export type ShortProps = { lines: Line[]; durations: number[] };

export const frames = (seconds: number) => Math.ceil(seconds * FPS);
/** Length of each line on screen: its real WAV length plus the gap. */
export const lineFrames = ({ durations }: ShortProps) => durations.map((d) => frames(d + GAP));

/** Split a line into caption chunks of at most `max` words, breaking early at punctuation. */
function chunks(text: string, max = 4): string[] {
  const out: string[] = [];
  let cur: string[] = [];
  for (const w of text.split(/\s+/).filter(Boolean)) {
    cur.push(w);
    if (cur.length >= max || (/[.,:;!?]$/.test(w) && cur.length >= 2)) {
      out.push(cur.join(" "));
      cur = [];
    }
  }
  if (cur.length) out.push(cur.join(" "));
  return out;
}

/** Caption chunks spread evenly across the line's audio, so the words on screen follow the voice. */
function Captions({ text, audioFrames }: { text: string; audioFrames: number }) {
  const frame = useCurrentFrame();
  const parts = chunks(text);
  const per = audioFrames / parts.length;
  const i = Math.min(parts.length - 1, Math.floor(frame / per));
  const pop = interpolate(frame - i * per, [0, 5], [0.85, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 90 }}>
      <div style={{ fontFamily, fontSize: 92, fontWeight: 800, lineHeight: 1.1, color: "white", textAlign: "center", transform: `scale(${pop})`, textShadow: "0 6px 24px rgba(0,0,0,0.8)" }}>
        {parts[i]}
      </div>
    </AbsoluteFill>
  );
}

/** Background for one line: the image with a slow zoom, or a shifting gradient when there is no image. */
function Background({ image, index, length }: { image?: string; index: number; length: number }) {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, length], [0, 1], { extrapolateRight: "clamp" });
  if (image) {
    return (
      <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "black" }}>
        <Img src={staticFile(image)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1.05 + 0.1 * p})` }} />
        <AbsoluteFill style={{ backgroundColor: "rgba(0,0,0,0.35)" }} />
      </AbsoluteFill>
    );
  }
  const hue = (220 + index * 35 + p * 20) % 360;
  return <AbsoluteFill style={{ background: `linear-gradient(160deg, hsl(${hue} 45% 18%), hsl(${(hue + 40) % 360} 55% 8%))` }} />;
}

export function Short(props: ShortProps) {
  const lengths = lineFrames(props);
  let from = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {props.lines.map((line, i) => {
        const at = from;
        from += lengths[i];
        return (
          <Sequence key={i} from={at} durationInFrames={lengths[i]}>
            <Background image={line.image} index={i} length={lengths[i]} />
            <Captions text={line.say} audioFrames={frames(props.durations[i])} />
            <Html5Audio src={staticFile(`voice/${i}.wav`)} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}
