import { Composition } from "remotion";
import video from "../video.json";
import durations from "./durations.json";
import { FPS, lineFrames, Short, type ShortProps } from "./Short";

/** `npm run tts` writes durations.json; until then each line is estimated at 2.6 words per second so Studio still opens. */
const props: ShortProps = {
  lines: video.lines,
  durations: durations.length === video.lines.length ? durations : video.lines.map((l) => l.say.split(/\s+/).length / 2.6),
};

export function RemotionRoot() {
  return (
    <Composition
      id="Short"
      component={Short}
      durationInFrames={lineFrames(props).reduce((a, b) => a + b, 0)}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={props}
    />
  );
}
