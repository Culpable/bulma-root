# Demo Video (Remotion)

Marketing demo video for Bulma, built with [Remotion](https://remotion.dev) (React-based video framework).

**Location:** `video/bulma-demo/`

---

## Quick Start

```bash
cd video/bulma-demo
npm install          # First time only
npm start            # Opens Remotion Studio at http://localhost:3000
```

---

## Commands

| Command | Description |
|---------|-------------|
| `npm start` | Launch Remotion Studio (browser preview) |
| `npm run build` | Render to `out/bulma-demo.mp4` |
| `npm run upgrade` | Upgrade Remotion to latest version |

---

## Compositions

| ID | Duration | Description |
|----|----------|-------------|
| `BulmaDemoVideo` | 30s | Full video with all scenes + transitions |
| `IntroScene` | 4s | Logo + tagline entrance |
| `ProblemScene` | 6s | Pain points cards |
| `SolutionScene` | 10s | AI chat demo with typewriter |
| `FeaturesScene` | 8s | Feature cards grid |
| `OutroScene` | 4s | CTA with animated border |

Individual scenes are available in the "Scenes" folder in Remotion Studio for isolated preview/editing.

---

## Project Structure

```
video/bulma-demo/
├── src/
│   ├── index.ts              # Entry point (registerRoot)
│   ├── Root.tsx              # Composition definitions
│   ├── BulmaDemoVideo.tsx    # Main composition (TransitionSeries)
│   └── scenes/
│       ├── IntroScene.tsx
│       ├── ProblemScene.tsx
│       ├── SolutionScene.tsx
│       ├── FeaturesScene.tsx
│       └── OutroScene.tsx
├── public/                   # Static assets (images, fonts)
├── remotion.config.ts        # Remotion CLI config
├── tsconfig.json
└── package.json
```

---

## Rendering Options

### Default (MP4)
```bash
npm run build
# Output: out/bulma-demo.mp4
```

### Custom Output
```bash
# Different format
npx remotion render BulmaDemoVideo out/video.webm --codec=vp8

# Specific scene only
npx remotion render IntroScene out/intro.mp4

# Lower quality (faster render)
npx remotion render BulmaDemoVideo out/draft.mp4 --quality=50
```

### Still Frame
```bash
npx remotion still BulmaDemoVideo out/thumbnail.png --frame=0
```

---

## Animation Patterns

All animations use Remotion's frame-based system:

```tsx
const frame = useCurrentFrame();
const { fps } = useVideoConfig();

// Spring animation (0 to 1)
const progress = spring({ frame, fps, config: { damping: 200 } });

// Map to custom range
const opacity = interpolate(progress, [0, 1], [0, 1]);
const translateY = interpolate(progress, [0, 1], [20, 0]);
```

**Rules:**
- Always use `useCurrentFrame()` for animations
- Never use CSS transitions or Tailwind `animate-*` classes
- Use `<Sequence>` for timed element entrances
- Use `<TransitionSeries>` for scene transitions

---

## Adding Assets

Place images/fonts in `public/` and reference with `staticFile()`:

```tsx
import { Img, staticFile } from "remotion";

<Img src={staticFile("logo.png")} />
```

---

## Video Specs

| Setting | Value |
|---------|-------|
| Resolution | 1920x1080 |
| FPS | 30 |
| Codec | H.264 (MP4) |
| Duration | ~30 seconds |
