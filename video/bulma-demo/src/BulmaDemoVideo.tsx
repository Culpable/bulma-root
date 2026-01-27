// BulmaDemoVideo.tsx - Main composition combining all scenes with transitions
import { useVideoConfig } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { IntroScene } from "./scenes/IntroScene";
import { ProblemScene } from "./scenes/ProblemScene";
import { SolutionScene } from "./scenes/SolutionScene";
import { FeaturesScene } from "./scenes/FeaturesScene";
import { OutroScene } from "./scenes/OutroScene";

// Props type for the main video composition
export type BulmaDemoVideoProps = {
  introDuration: number;
  problemDuration: number;
  solutionDuration: number;
  featuresDuration: number;
  outroDuration: number;
  transitionDuration: number;
};

// Main demo video component that sequences all scenes with transitions
export const BulmaDemoVideo: React.FC<BulmaDemoVideoProps> = ({
  introDuration,
  problemDuration,
  solutionDuration,
  featuresDuration,
  outroDuration,
  transitionDuration,
}) => {
  const { fps } = useVideoConfig();

  // Convert durations from seconds to frames
  const introFrames = Math.ceil(introDuration * fps);
  const problemFrames = Math.ceil(problemDuration * fps);
  const solutionFrames = Math.ceil(solutionDuration * fps);
  const featuresFrames = Math.ceil(featuresDuration * fps);
  const outroFrames = Math.ceil(outroDuration * fps);
  const transitionFrames = Math.ceil(transitionDuration * fps);

  return (
    <TransitionSeries>
      {/* Scene 1: Intro with Bulma branding */}
      <TransitionSeries.Sequence durationInFrames={introFrames}>
        <IntroScene />
      </TransitionSeries.Sequence>

      {/* Transition: Fade to problem scene */}
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: transitionFrames })}
      />

      {/* Scene 2: Problem/pain points */}
      <TransitionSeries.Sequence durationInFrames={problemFrames}>
        <ProblemScene />
      </TransitionSeries.Sequence>

      {/* Transition: Slide to solution */}
      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: transitionFrames })}
      />

      {/* Scene 3: Solution showcase with AI chat demo */}
      <TransitionSeries.Sequence durationInFrames={solutionFrames}>
        <SolutionScene />
      </TransitionSeries.Sequence>

      {/* Transition: Fade to features */}
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: transitionFrames })}
      />

      {/* Scene 4: Features highlight */}
      <TransitionSeries.Sequence durationInFrames={featuresFrames}>
        <FeaturesScene />
      </TransitionSeries.Sequence>

      {/* Transition: Fade to outro */}
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: transitionFrames })}
      />

      {/* Scene 5: Call-to-action outro */}
      <TransitionSeries.Sequence durationInFrames={outroFrames}>
        <OutroScene />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
