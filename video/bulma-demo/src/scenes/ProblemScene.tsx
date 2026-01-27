// ProblemScene.tsx - Highlights the pain points that Bulma solves
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
  Sequence,
} from "remotion";

// Bulma brand colors
const COLORS = {
  gradientFrom: "#243a42",
  gradientTo: "#232f40",
  white: "#ffffff",
  red: "#ef4444",
  accent: "#60a5fa",
  dimmed: "#94a3b8",
};

// Pain points that mortgage brokers face
const PAIN_POINTS = [
  {
    icon: "📄",
    title: "Policy documents scattered across portals",
    delay: 0,
  },
  {
    icon: "⏱️",
    title: "Hours spent on manual policy lookups",
    delay: 0.6,
  },
  {
    icon: "❓",
    title: "Inconsistent policy interpretations",
    delay: 1.2,
  },
  {
    icon: "🔄",
    title: "Frequent policy updates without notification",
    delay: 1.8,
  },
];

// Problem scene showcases the challenges brokers face before Bulma
export const ProblemScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Header entrance animation
  const headerProgress = spring({
    frame,
    fps,
    config: { damping: 200 },
  });

  const headerOpacity = interpolate(headerProgress, [0, 1], [0, 1]);
  const headerY = interpolate(headerProgress, [0, 1], [-30, 0]);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${COLORS.gradientFrom} 0%, ${COLORS.gradientTo} 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 80,
      }}
    >
      {/* Section header */}
      <div
        style={{
          opacity: headerOpacity,
          transform: `translateY(${headerY}px)`,
          textAlign: "center",
          marginBottom: 60,
        }}
      >
        <div
          style={{
            fontSize: 24,
            fontWeight: 500,
            color: COLORS.red,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            marginBottom: 16,
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          The Problem
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: COLORS.white,
            lineHeight: 1.2,
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          Mortgage brokers lose hours
          <br />
          navigating lender policies
        </div>
      </div>

      {/* Pain points grid */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 32,
          justifyContent: "center",
          maxWidth: 1400,
        }}
      >
        {PAIN_POINTS.map((point, index) => (
          <Sequence
            key={index}
            from={Math.floor(point.delay * fps)}
            layout="none"
          >
            <PainPointCard
              icon={point.icon}
              title={point.title}
              index={index}
            />
          </Sequence>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// Individual pain point card component
const PainPointCard: React.FC<{
  icon: string;
  title: string;
  index: number;
}> = ({ icon, title, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Card entrance animation
  const cardProgress = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  const cardScale = interpolate(cardProgress, [0, 1], [0.8, 1]);
  const cardOpacity = interpolate(cardProgress, [0, 1], [0, 1]);
  const cardY = interpolate(cardProgress, [0, 1], [40, 0]);

  // Icon shake animation after entrance
  const shakeFrame = frame - fps * 0.5;
  const shake =
    shakeFrame > 0 && shakeFrame < fps * 0.3
      ? Math.sin(shakeFrame * 0.8) * 3
      : 0;

  return (
    <div
      style={{
        width: 320,
        padding: 32,
        background: `${COLORS.white}08`,
        borderRadius: 16,
        border: `1px solid ${COLORS.red}40`,
        opacity: cardOpacity,
        transform: `translateY(${cardY}px) scale(${cardScale})`,
      }}
    >
      {/* Icon */}
      <div
        style={{
          fontSize: 48,
          marginBottom: 20,
          transform: `translateX(${shake}px)`,
        }}
      >
        {icon}
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: 22,
          fontWeight: 500,
          color: COLORS.white,
          lineHeight: 1.4,
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {title}
      </div>
    </div>
  );
};
