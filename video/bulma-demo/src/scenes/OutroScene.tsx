// OutroScene.tsx - Call-to-action closing scene
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
} from "remotion";

// Bulma brand colors
const COLORS = {
  gradientFrom: "#243a42",
  gradientTo: "#232f40",
  white: "#ffffff",
  accent: "#60a5fa",
  green: "#22c55e",
};

// Outro scene with call-to-action
export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo entrance
  const logoProgress = spring({
    frame,
    fps,
    config: { damping: 200 },
  });

  const logoScale = interpolate(logoProgress, [0, 1], [0.8, 1]);
  const logoOpacity = interpolate(logoProgress, [0, 1], [0, 1]);

  // CTA button entrance
  const ctaProgress = spring({
    frame: frame - fps * 0.5,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  const ctaOpacity = interpolate(ctaProgress, [0, 1], [0, 1]);
  const ctaY = interpolate(ctaProgress, [0, 1], [30, 0]);

  // URL entrance
  const urlProgress = spring({
    frame: frame - fps * 0.8,
    fps,
    config: { damping: 200 },
  });

  const urlOpacity = interpolate(urlProgress, [0, 1], [0, 1]);

  // Animated gradient border for CTA
  const gradientRotation = interpolate(frame, [0, fps * 4], [0, 360]);

  // Pulsing glow effect
  const glowIntensity = interpolate(
    frame,
    [0, fps * 1.5, fps * 3],
    [0.4, 0.7, 0.4],
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
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.accent}30 0%, transparent 60%)`,
          opacity: glowIntensity,
          filter: "blur(80px)",
        }}
      />

      {/* Logo */}
      <div
        style={{
          transform: `scale(${logoScale})`,
          opacity: logoOpacity,
          marginBottom: 40,
        }}
      >
        <div
          style={{
            fontSize: 100,
            fontWeight: 700,
            color: COLORS.white,
            letterSpacing: "-0.02em",
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            textShadow: `0 0 60px ${COLORS.accent}50`,
          }}
        >
          Bulma
        </div>
      </div>

      {/* Tagline */}
      <div
        style={{
          opacity: logoOpacity,
          fontSize: 32,
          fontWeight: 500,
          color: COLORS.white,
          textAlign: "center",
          marginBottom: 50,
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        Stop searching. Start asking.
      </div>

      {/* CTA Button with animated gradient border */}
      <div
        style={{
          position: "relative",
          opacity: ctaOpacity,
          transform: `translateY(${ctaY}px)`,
        }}
      >
        {/* Gradient border container */}
        <div
          style={{
            position: "absolute",
            inset: -3,
            borderRadius: 18,
            background: `conic-gradient(from ${gradientRotation}deg, ${COLORS.accent}, ${COLORS.green}, ${COLORS.accent})`,
            filter: "blur(1px)",
          }}
        />

        {/* Button content */}
        <div
          style={{
            position: "relative",
            padding: "20px 48px",
            background: COLORS.gradientFrom,
            borderRadius: 15,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: COLORS.white,
              fontFamily:
                'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            Get Started Free
          </span>
          <svg
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke={COLORS.white}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* URL */}
      <div
        style={{
          marginTop: 40,
          opacity: urlOpacity,
        }}
      >
        <div
          style={{
            fontSize: 22,
            fontWeight: 500,
            color: COLORS.accent,
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          bulma.com.au
        </div>
      </div>
    </AbsoluteFill>
  );
};
