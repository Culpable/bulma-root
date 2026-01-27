// FeaturesScene.tsx - Highlights key Bulma features with animated cards
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
  accent: "#60a5fa",
  green: "#22c55e",
  purple: "#a855f7",
  orange: "#f97316",
  dimmed: "#94a3b8",
};

// Key features of Bulma
const FEATURES = [
  {
    icon: "🎯",
    title: "Policy Matching",
    description: "Instant answers from current lender policies",
    color: COLORS.accent,
    delay: 0.3,
  },
  {
    icon: "⚖️",
    title: "Cross-Lender Comparison",
    description: "Compare policies across all major lenders",
    color: COLORS.green,
    delay: 0.6,
  },
  {
    icon: "🔍",
    title: "Exception Pathways",
    description: "Discover known workarounds and conditional approvals",
    color: COLORS.purple,
    delay: 0.9,
  },
  {
    icon: "📋",
    title: "Source Attribution",
    description: "Every answer cites its policy source",
    color: COLORS.orange,
    delay: 1.2,
  },
];

// Features scene displays the key capabilities of Bulma
export const FeaturesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Header entrance
  const headerProgress = spring({
    frame,
    fps,
    config: { damping: 200 },
  });

  const headerOpacity = interpolate(headerProgress, [0, 1], [0, 1]);
  const headerY = interpolate(headerProgress, [0, 1], [-20, 0]);

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
            color: COLORS.accent,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            marginBottom: 16,
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          Features
        </div>
        <div
          style={{
            fontSize: 52,
            fontWeight: 700,
            color: COLORS.white,
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          Everything you need in one place
        </div>
      </div>

      {/* Features grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 32,
          maxWidth: 1200,
        }}
      >
        {FEATURES.map((feature, index) => (
          <Sequence
            key={index}
            from={Math.floor(feature.delay * fps)}
            layout="none"
          >
            <FeatureCard
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              color={feature.color}
              index={index}
            />
          </Sequence>
        ))}
      </div>

      {/* Bottom highlight */}
      <Sequence from={Math.floor(2.5 * fps)} layout="none">
        <BottomHighlight />
      </Sequence>
    </AbsoluteFill>
  );
};

// Individual feature card component
const FeatureCard: React.FC<{
  icon: string;
  title: string;
  description: string;
  color: string;
  index: number;
}> = ({ icon, title, description, color, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Card entrance animation
  const cardProgress = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  const cardOpacity = interpolate(cardProgress, [0, 1], [0, 1]);
  const cardX = interpolate(cardProgress, [0, 1], [index % 2 === 0 ? -50 : 50, 0]);
  const cardScale = interpolate(cardProgress, [0, 1], [0.9, 1]);

  // Icon pulse effect
  const pulseFrame = frame - fps * 0.4;
  const iconScale =
    pulseFrame > 0 && pulseFrame < fps * 0.3
      ? 1 + Math.sin(pulseFrame * 0.5) * 0.1
      : 1;

  return (
    <div
      style={{
        padding: 36,
        background: `${COLORS.white}06`,
        borderRadius: 20,
        border: `1px solid ${color}30`,
        opacity: cardOpacity,
        transform: `translateX(${cardX}px) scale(${cardScale})`,
        display: "flex",
        gap: 24,
        alignItems: "flex-start",
      }}
    >
      {/* Icon container */}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          background: `${color}20`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 32,
          transform: `scale(${iconScale})`,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      {/* Content */}
      <div>
        <div
          style={{
            fontSize: 26,
            fontWeight: 600,
            color: COLORS.white,
            marginBottom: 8,
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 18,
            color: COLORS.dimmed,
            lineHeight: 1.5,
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          {description}
        </div>
      </div>
    </div>
  );
};

// Bottom highlight showing supported lenders
const BottomHighlight: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame,
    fps,
    config: { damping: 200 },
  });

  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const y = interpolate(progress, [0, 1], [20, 0]);

  return (
    <div
      style={{
        marginTop: 50,
        opacity,
        transform: `translateY(${y}px)`,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 18,
          color: COLORS.dimmed,
          marginBottom: 16,
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        Covering all major Australian lenders
      </div>
      <div
        style={{
          display: "flex",
          gap: 24,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {["CBA", "NAB", "Westpac", "ANZ", "Macquarie", "ING", "and more..."].map(
          (lender, index) => (
            <span
              key={index}
              style={{
                fontSize: 16,
                fontWeight: index < 6 ? 600 : 400,
                color: index < 6 ? COLORS.white : COLORS.dimmed,
                padding: "8px 16px",
                background: index < 6 ? `${COLORS.white}10` : "transparent",
                borderRadius: 8,
                fontFamily:
                  'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              {lender}
            </span>
          )
        )}
      </div>
    </div>
  );
};
