// SolutionScene.tsx - Showcases the AI chat interface in action
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
  dimmed: "#94a3b8",
  chatBg: "#1e293b",
  userBubble: "#3b82f6",
  aiBubble: "#334155",
};

// Simulated chat conversation demonstrating Bulma's capabilities
const CHAT_MESSAGES = [
  {
    type: "user",
    text: "Can a borrower with 6 months casual employment get approved with CBA for an 80% LVR owner-occupied purchase?",
    delay: 0.8,
    typeSpeed: 0.015,
  },
  {
    type: "ai",
    text: "Based on CBA's current policy:\n\n**Standard Policy:** CBA requires casual employees to have a minimum of 12 months continuous employment.\n\n**For your scenario (6 months casual):**\n• Does not meet standard requirements\n• However, with 24+ months industry experience, CBA may consider under their industry continuity exception\n\n**Documentation required:**\n• Current employment contract\n• 2 recent payslips with YTD earnings\n• Prior employment evidence",
    delay: 3.5,
    typeSpeed: 0.008,
  },
];

// Solution scene demonstrates the AI assistant in action
export const SolutionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Header entrance
  const headerProgress = spring({
    frame,
    fps,
    config: { damping: 200 },
  });

  const headerOpacity = interpolate(headerProgress, [0, 1], [0, 1]);

  // Chat window entrance
  const chatProgress = spring({
    frame: frame - fps * 0.3,
    fps,
    config: { damping: 200 },
  });

  const chatScale = interpolate(chatProgress, [0, 1], [0.95, 1]);
  const chatOpacity = interpolate(chatProgress, [0, 1], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${COLORS.gradientFrom} 0%, ${COLORS.gradientTo} 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 60,
      }}
    >
      {/* Section header */}
      <div
        style={{
          opacity: headerOpacity,
          textAlign: "center",
          marginBottom: 40,
        }}
      >
        <div
          style={{
            fontSize: 24,
            fontWeight: 500,
            color: COLORS.green,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            marginBottom: 12,
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          The Solution
        </div>
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: COLORS.white,
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          Ask Bulma anything about lender policies
        </div>
      </div>

      {/* Chat interface mockup */}
      <div
        style={{
          width: 1000,
          height: 600,
          background: COLORS.chatBg,
          borderRadius: 20,
          border: `1px solid ${COLORS.white}15`,
          boxShadow: `0 40px 80px rgba(0,0,0,0.4), 0 0 0 1px ${COLORS.accent}20`,
          overflow: "hidden",
          opacity: chatOpacity,
          transform: `scale(${chatScale})`,
        }}
      >
        {/* Chat header */}
        <div
          style={{
            height: 60,
            background: `${COLORS.white}05`,
            borderBottom: `1px solid ${COLORS.white}10`,
            display: "flex",
            alignItems: "center",
            padding: "0 24px",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: COLORS.green,
            }}
          />
          <span
            style={{
              color: COLORS.white,
              fontSize: 16,
              fontWeight: 500,
              fontFamily:
                'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            Bulma AI Assistant
          </span>
        </div>

        {/* Chat messages area */}
        <div
          style={{
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {CHAT_MESSAGES.map((message, index) => (
            <Sequence
              key={index}
              from={Math.floor(message.delay * fps)}
              layout="none"
            >
              <ChatMessage
                type={message.type as "user" | "ai"}
                text={message.text}
                typeSpeed={message.typeSpeed}
              />
            </Sequence>
          ))}
        </div>
      </div>

      {/* Source attribution indicator */}
      <Sequence from={Math.floor(8 * fps)} layout="none">
        <SourceIndicator />
      </Sequence>
    </AbsoluteFill>
  );
};

// Chat message bubble with typewriter effect
const ChatMessage: React.FC<{
  type: "user" | "ai";
  text: string;
  typeSpeed: number;
}> = ({ type, text, typeSpeed }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isUser = type === "user";

  // Bubble entrance
  const bubbleProgress = spring({
    frame,
    fps,
    config: { damping: 200 },
  });

  const bubbleOpacity = interpolate(bubbleProgress, [0, 1], [0, 1]);
  const bubbleY = interpolate(bubbleProgress, [0, 1], [20, 0]);

  // Typewriter effect - calculate visible characters based on frame
  const charsPerFrame = typeSpeed * fps;
  const visibleChars = Math.floor(frame * charsPerFrame);
  const displayText = text.slice(0, visibleChars);

  // Show cursor while typing
  const isTyping = visibleChars < text.length;
  const cursorBlink = Math.floor(frame / 15) % 2 === 0;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        opacity: bubbleOpacity,
        transform: `translateY(${bubbleY}px)`,
      }}
    >
      <div
        style={{
          maxWidth: 700,
          padding: "16px 20px",
          borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          background: isUser ? COLORS.userBubble : COLORS.aiBubble,
          color: COLORS.white,
          fontSize: 17,
          lineHeight: 1.6,
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          whiteSpace: "pre-wrap",
        }}
      >
        {/* Render text with basic markdown support */}
        <FormattedText text={displayText} />
        {isTyping && cursorBlink && (
          <span
            style={{
              display: "inline-block",
              width: 2,
              height: 18,
              background: COLORS.accent,
              marginLeft: 2,
              verticalAlign: "middle",
            }}
          />
        )}
      </div>
    </div>
  );
};

// Simple formatted text component for basic markdown
const FormattedText: React.FC<{ text: string }> = ({ text }) => {
  // Split by bold markers and render
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={index} style={{ color: COLORS.accent }}>
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
};

// Source attribution indicator
const SourceIndicator: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame,
    fps,
    config: { damping: 200 },
  });

  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const y = interpolate(progress, [0, 1], [10, 0]);

  return (
    <div
      style={{
        marginTop: 24,
        opacity,
        transform: `translateY(${y}px)`,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "12px 20px",
        background: `${COLORS.green}20`,
        borderRadius: 8,
        border: `1px solid ${COLORS.green}40`,
      }}
    >
      <svg
        width={20}
        height={20}
        viewBox="0 0 24 24"
        fill="none"
        stroke={COLORS.green}
        strokeWidth="2"
      >
        <path d="M9 12l2 2 4-4" />
        <circle cx="12" cy="12" r="10" />
      </svg>
      <span
        style={{
          color: COLORS.white,
          fontSize: 15,
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        Answer grounded in{" "}
        <strong style={{ color: COLORS.green }}>CBA Policy</strong> - Last
        updated: Jan 2026
      </span>
    </div>
  );
};
