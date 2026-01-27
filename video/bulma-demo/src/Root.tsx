// Root.tsx - Remotion composition definitions for Bulma demo video
import { Composition, Folder } from "remotion";
import { BulmaDemoVideo } from "./BulmaDemoVideo";
import { IntroScene } from "./scenes/IntroScene";
import { ProblemScene } from "./scenes/ProblemScene";
import { SolutionScene } from "./scenes/SolutionScene";
import { FeaturesScene } from "./scenes/FeaturesScene";
import { OutroScene } from "./scenes/OutroScene";

// Video configuration constants
const FPS = 30;
const WIDTH = 1920;
const HEIGHT = 1080;

// Scene durations in seconds
const INTRO_DURATION = 4;
const PROBLEM_DURATION = 6;
const SOLUTION_DURATION = 10;
const FEATURES_DURATION = 8;
const OUTRO_DURATION = 4;

// Calculate total duration accounting for transition overlaps (0.5s per transition)
const TRANSITION_DURATION = 0.5;
const TOTAL_DURATION =
  INTRO_DURATION +
  PROBLEM_DURATION +
  SOLUTION_DURATION +
  FEATURES_DURATION +
  OUTRO_DURATION -
  4 * TRANSITION_DURATION; // 4 transitions between 5 scenes

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Main demo video composition */}
      <Composition
        id="BulmaDemoVideo"
        component={BulmaDemoVideo}
        durationInFrames={Math.ceil(TOTAL_DURATION * FPS)}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{
          introDuration: INTRO_DURATION,
          problemDuration: PROBLEM_DURATION,
          solutionDuration: SOLUTION_DURATION,
          featuresDuration: FEATURES_DURATION,
          outroDuration: OUTRO_DURATION,
          transitionDuration: TRANSITION_DURATION,
        }}
      />

      {/* Individual scene previews for development */}
      <Folder name="Scenes">
        <Composition
          id="IntroScene"
          component={IntroScene}
          durationInFrames={INTRO_DURATION * FPS}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
        <Composition
          id="ProblemScene"
          component={ProblemScene}
          durationInFrames={PROBLEM_DURATION * FPS}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
        <Composition
          id="SolutionScene"
          component={SolutionScene}
          durationInFrames={SOLUTION_DURATION * FPS}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
        <Composition
          id="FeaturesScene"
          component={FeaturesScene}
          durationInFrames={FEATURES_DURATION * FPS}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
        <Composition
          id="OutroScene"
          component={OutroScene}
          durationInFrames={OUTRO_DURATION * FPS}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
      </Folder>
    </>
  );
};
