// IntroScene.tsx - Opening scene with Bulma branding and tagline
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
} from "remotion";

// Bulma brand colors from the design system
const COLORS = {
  gradientFrom: "#243a42",
  gradientTo: "#232f40",
  white: "#ffffff",
  accent: "#60a5fa", // Blue accent for highlights
};

// Intro scene displays the Bulma logo and tagline with animated entrance
export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Logo entrance animation - scales and fades in from center
  const logoScale = spring({
    frame,
    fps,
    config: { damping: 200 },
  });

  const logoOpacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Tagline entrance - slides up and fades in with delay
  const taglineProgress = spring({
    frame: frame - fps * 0.8,
    fps,
    config: { damping: 200 },
  });

  const taglineY = interpolate(taglineProgress, [0, 1], [40, 0]);
  const taglineOpacity = interpolate(taglineProgress, [0, 1], [0, 1]);

  // Subtitle entrance - appears after tagline
  const subtitleProgress = spring({
    frame: frame - fps * 1.2,
    fps,
    config: { damping: 200 },
  });

  const subtitleOpacity = interpolate(subtitleProgress, [0, 1], [0, 1]);

  // Animated glow effect behind logo
  const glowPulse = interpolate(
    frame,
    [0, fps * 2, fps * 4],
    [0.3, 0.6, 0.3],
    { extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${COLORS.gradientFrom} 0%, ${COLORS.gradientTo} 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Animated background glow */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.accent}40 0%, transparent 70%)`,
          opacity: glowPulse,
          filter: "blur(60px)",
        }}
      />

      {/* Logo container */}
      <div
        style={{
          transform: `scale(${logoScale})`,
          opacity: logoOpacity,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Bulma text logo */}
        <div
          style={{
            fontSize: 140,
            fontWeight: 700,
            color: COLORS.white,
            letterSpacing: "-0.02em",
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            textShadow: `0 0 60px ${COLORS.accent}60`,
          }}
        >
          Bulma
        </div>

        {/* AI sparkle indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: -10,
          }}
        >
          <SparkleIcon size={24} color={COLORS.accent} />
          <span
            style={{
              fontSize: 28,
              fontWeight: 500,
              color: COLORS.accent,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontFamily:
                'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            AI-Powered
          </span>
          <SparkleIcon size={24} color={COLORS.accent} />
        </div>
      </div>

      {/* Main tagline */}
      <div
        style={{
          marginTop: 60,
          transform: `translateY(${taglineY}px)`,
          opacity: taglineOpacity,
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: 600,
            color: COLORS.white,
            textAlign: "center",
            maxWidth: 900,
            lineHeight: 1.3,
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          Your AI Mortgage Broker Assistant
        </div>
      </div>

      {/* Subtitle */}
      <div
        style={{
          marginTop: 24,
          opacity: subtitleOpacity,
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 400,
            color: `${COLORS.white}99`,
            textAlign: "center",
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          Policy matching. Lender selection. Exception handling.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Sparkle icon component for AI branding
const SparkleIcon: React.FC<{ size: number; color: string }> = ({
  size,
  color,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
  </svg>
);
