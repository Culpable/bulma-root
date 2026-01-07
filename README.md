# Bulma Root

Bulma Root is a [Tailwind Plus](https://tailwindcss.com/plus) marketing site built using [Tailwind CSS](https://tailwindcss.com) and [Elements](https://tailwindcss.com/plus/ui-blocks/documentation/elements).

## Repo layout and running the site

- The only runnable Next.js app in this repo lives in `demo/`.
- The repo root has no `package.json`, so all dev and build commands must be run from `demo/`.
- `components/` and `pages/` are source templates and variations, not routed pages.
- Dev: `cd demo && npm run dev` (example `npm run dev -- -p 3001` for `http://localhost:3001`).
- Production: GitHub Pages builds from the default branch `main` using the workflow in `/.github/workflows/deploy.yml`, and serves the static export from `demo/out`.
- If GitHub Pages shows the README instead of the app, Pages is pointing at the repo root. Fix by setting Pages to use workflow builds:
  - `gh api repos/Culpable/bulma-root/pages -X PUT -f build_type=workflow && gh workflow run deploy.yml`

## Quickstart using your coding agent

If you are using a coding agent like Claude Code, Cursor, Codex, etc., the quickest way to get started is by using the following prompt and pointing its to this file:

```
Please install the Bulma Root Tailwind Plus template into my project following the documentation from @path-to-bulma-template/README.md.
```

## Installation

### 1. Install required dependencies

Bulma Root requires Tailwind CSS v4 to be set up in your project. If this is not set up already, check out the [official installation guide for your setup](https://tailwindcss.com/docs/installation) or the [Tailwind CSS v4 upgrade guide](https://tailwindcss.com/docs/upgrade-guide).

In addition to Tailwind CSS, add the following dependencies to your project:

```bash
npm install clsx @tailwindplus/elements@latest
```

### 2. Set up CSS file

Add the following CSS to your global stylesheet:

```css
@import 'tailwindcss';

@theme {
  --font-display: 'Mona Sans', sans-serif;
  --font-display--font-variation-settings: 'wdth' 112.5;
  --font-sans: 'Inter', system-ui, sans-serif;

  --color-mist-50: oklch(98.7% 0.002 197.1);
  --color-mist-100: oklch(96.3% 0.002 197.1);
  --color-mist-200: oklch(92.5% 0.005 214.3);
  --color-mist-300: oklch(87.2% 0.007 219.6);
  --color-mist-400: oklch(72.3% 0.014 214.4);
  --color-mist-500: oklch(56% 0.021 213.5);
  --color-mist-600: oklch(45% 0.017 213.2);
  --color-mist-700: oklch(37.8% 0.015 216);
  --color-mist-800: oklch(27.5% 0.011 216.9);
  --color-mist-900: oklch(21.8% 0.008 223.9);
  --color-mist-950: oklch(14.8% 0.004 228.8);
}

@layer base {
  html {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: var(--color-mist-100);
    --scroll-padding-top: 0;
    scroll-padding-top: var(--scroll-padding-top);

    @variant dark {
      background-color: var(--color-mist-950);
    }
  }
}
```

### 3. Set up fonts

Add the following meta tags to the `<head>` tag in your project:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Mona+Sans:ital,wdth,wght@0,112.5,200..900;1,112.5,200..900&display=swap"
  rel="stylesheet"
/>
<link
  href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
  rel="stylesheet"
/>
```

### 4. Copy the components to your project

Add the components from the Bulma Root ZIP download to your project:

```bash
cp ~/Downloads/bulma-root/components /your-project/src/components
```

### 5. Set up the `@` alias

All the components in Bulma Root use an `@` alias that's expected to resolve to the
components directory in your project. If you don't already have this in place,
update your `tsconfig.json`:

```json
{
  "compilerOptions": {
    // ... your existing TypeScript config
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 6. Replace anchor links with SPA-link equivalent (Optional)

If your framework provides an SPA-link component, you'll want to replace all `<a>` instances in the Bulma Root components with your link component.

Here's an example of how you'd do this in Next.js using their `Link` component:

```diff
diff --git a/components/elements/link.tsx b/components/elements/link.tsx
index 722b00e..f341d85 100644
--- a/components/elements/link.tsx
+++ b/components/elements/link.tsx
@@ -1,5 +1,6 @@
 import { clsx } from 'clsx/lite'
+import NextLink from 'next/link'
 import type { ComponentProps } from 'react'

@@ -9,7 +10,7 @@ export function Link({
   href: string
 } & Omit<ComponentProps<'a'>, 'href'>) {
   return (
-    <a
+    <NextLink
       href={href}
       className={clsx(
         'inline-flex items-center gap-2 text-sm/7 font-medium',

```

## License

This site template is a commercial product and is licensed under the [Tailwind Plus license](https://tailwindcss.com/plus/license).

## Learn more

To learn more about the technologies used in this site template, see the following resources:

- [Tailwind CSS](https://tailwindcss.com/docs) - the official Tailwind CSS documentation
- [Elements](https://tailwindcss.com/plus/ui-blocks/documentation/elements) - the official Elements documentation
