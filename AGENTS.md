# IMPORTANT
- This file outlines guidelines and tips for working within this container.
- When locations are referenced within this file, they assume the same working directory as where this file is located. For example, `.gitignore` is in the same directory as this file.
- Ensure you ALWAYS read the appropriate system architecture documentation before working with any of the systems mentioned.

Your container guidelines MUST be followed in all circumstances:
<container_guidelines>
<code_standards>
- Give fully coded solutions to each problem without skipping lines.
- You must separate distinct functions and classes by two new lines.

Read the below when creating Git commit messages:
<git_commit_guidelines>
Git commit guidelines are documented in `.cursor/rules/git-commit-message-format.mdc`
</git_commit_guidelines>

<commenting_standards>
- Write **clear, thorough comments** to explain the purpose and function of all code sections.
- Provide context so that both humans and language models can understand the logic and rationale.
- Code must be well-commented using the imperative mood (e.g., "Return", "Compute", "Find", etc.).
- ALWAYS document critical logic, especially complex algorithms, business rules, and edge cases.
</commenting_standards>

<frontend_design>
- For pricing card grids, always enforce equal heights by pairing `items-stretch` on the grid with `h-full` on each plan card, and verify visually.
- When reusing a visual component from one page on another page, verify visual parity against the source page in every relevant colour scheme and interaction state. Do not stop at layout/background matching: compare computed text colour, opacity, hover, focus, active states, underline/accent colours, and wrapper/background integration. If a new variant class is added for the destination page, confirm it does not unintentionally override the source component’s dark-mode or hover behaviour.

<hash_navigation_rules>
- Preserve the homepage FAQ deep link `#lenders`. It intentionally targets the `Which lenders does Bulma cover?` FAQ item (`id="lenders"`) and `Faq` auto-opens the disclosure when the hash matches.
- Do not replace `#lenders` or `/#lenders` links with `#supported-lenders` unless the user explicitly asks to change the destination from the FAQ answer to the visual supported-lenders field.
- The supported-lenders field anchor is `#supported-lenders`; use it only when the intended destination is the lender-name field itself, not the FAQ that opens and explains lender coverage.
- When editing FAQ hash navigation, verify both direct `/#lenders` page loads and same-page `#lenders` link clicks because routed hash updates must still open the FAQ disclosure.
</hash_navigation_rules>

<contact_form_rules>
- Preserve the contact form field contract unless the user explicitly requests a field model change.
- The contact form fields are: hidden `form_source`, `name`, `email`, and `message`.
- Frontend improvements may change layout, styling, focus states, loading states, error states, success states, analytics loading, and fallback behaviour, but must not add, remove, rename, or repurpose contact form fields without explicit approval.
</contact_form_rules>

<pricing_module_parity_rules>
- Keep the homepage pricing module (`/`, `demo/src/app/page.tsx`) visually and verbally aligned with the pricing-page module (`/pricing`, `demo/src/app/pricing/page.tsx`); treat `/pricing` as the source of truth unless the user explicitly asks for a different homepage variant.
- The annual option callout must use the exact text `Get 2 months free on a yearly plan.` in both pricing modules.
- When changing plan-card pricing copy, savings notes, bonus wording, bonus panel presentation, plan feature wording, CTA labels, or pricing-card shared components, update and verify both modules together.
- Verify pricing-card parity at `1440x900` and `390x900` in light and dark modes, including Monthly and Yearly states, equal-height cards, bonus panel/prompt states, text wrapping, hover/focus styling where relevant, and horizontal overflow.
</pricing_module_parity_rules>

<animation_standards>
**NEVER add `prefers-reduced-motion`, `@media (prefers-reduced-motion: reduce)`, `matchMedia('(prefers-reduced-motion: reduce)')`, or similar accessibility media-query conditionals to animation code.** Animations must work consistently for all users, so do not gate, disable, pause, short-circuit, or skip animation setup based on reduced-motion preferences.
- Do not remove, simplify, or rewrite existing marketing-site animations unless the user explicitly asks for that exact animation change. Performance work must preserve the intended animation design, timing, and interaction model.
- When modifying animation code, read `documents/guides/_animations.md`, prefer the existing animation primitives documented there, and update the guide if implementation behaviour changes.
- Keep animation wrappers layout-neutral. In grids, animated wrappers must preserve `h-full` where equal-height cards are expected; transforms must not introduce horizontal overflow, text clipping, content overlap, or layout shift.
- Clean up every observer, timer, event listener, and animation frame created by animation code. High-frequency scroll or pointer handlers must avoid unnecessary React state updates and must not leave duplicate loops running after repeated mounts or route changes.
- Treat scroll-triggered, hover, focus, cursor-following, parallax, counter, blur-transition, gradient-border, and ambient-motion changes as user-facing behaviour that requires browser verification on desktop and mobile.
</animation_standards>
</frontend_design>
</code_standards>

<testing_rules>

<validation_commands>
Required validation before reporting completion:
- `cd demo && npm run lint` - ESLint checks for the runnable Next.js app. Must pass with zero errors.
- `cd demo && npm run build` - Production static export build plus sitemap generation. Must complete without errors.
- Run targeted tests when a task adds a test file or when a relevant test command exists. This project currently has no `npm test` script and no configured Playwright suite.
- If a required command cannot run because of missing dependencies, environment issues, or unrelated pre-existing failures, report the command, the exact failure summary, and the residual risk.
</validation_commands>

<dev_server_policy>
LOCAL DEV SERVER POLICY (CRITICAL):
- The only runnable app is `demo/`; do not run Next.js commands from the repo root.
- Default dev URL for browser verification is `http://localhost:3001`.
- The matching start command is `cd demo && npm run dev -- -p 3001`, which aligns with `.vscode/launch.json`.
- Before any `dev-browser`, `agent-browser`, or manual browser testing, check whether `http://localhost:3001` is already serving the Bulma demo app.
- If port `3001` is already serving the Bulma demo app, reuse it.
- If port `3001` is not running, start it with `cd demo && npm run dev -- -p 3001`, wait for the URL to respond, then proceed.
- If port `3001` is occupied by another service, start the demo on the next available port and state the URL used in the final validation summary.
- If you started the dev server for manual testing, stop it when finished unless the user asked you to leave it running. If it was already running when you arrived, leave it running.
- For frontend UI verification, use `dev-browser` by default. Use `agent-browser` when the task needs more complex browser automation. Use Playwright only when browser automation is explicitly requested or when a Playwright suite is added.
- Follow `.cursor/rules/dev-browser.mdc` whenever browser verification, screenshots, visual analysis, or UI interaction checks are required.
</dev_server_policy>

<ui_verification>
VALIDATION GATE (CRITICAL):
- Frontend behaviour changes require browser verification via `dev-browser` or `agent-browser`, unless the user explicitly says they will test the UI themselves.
- Frontend behaviour includes rendering, layout, animation, scrolling, hover/focus/active states, loading/error/empty states, conditional visibility, navigation, forms, CTAs, pricing cards, screenshots, and page-level interactions.
- A UI-affecting task is not complete until required automated checks and required browser checks pass.
- If a required browser check is skipped, the final response must state the skipped check, the reason, and the residual risk.
- The final response for UI-affecting tasks must include a validation summary covering automated checks, browser scenarios, viewport coverage, and outcomes.

Responsive verification viewports:
- Desktop: `1440x900`.
- Mobile: `390x900`.

Browser verification requirements:
- Open every changed route or relevant page state.
- Verify changed interactions directly instead of relying only on code inspection.
- Check for horizontal overflow, console errors, page errors, clipped text, overlapping elements, and offscreen changed elements.
- Capture screenshots using absolute filesystem paths when visual evidence is useful or when investigating a visual issue.
- Analyse screenshots with specific evidence about the target elements. Do not use generic confirmations such as "looks good" or "appears correct" without explaining what was checked.

IMPORTANT:
- This project currently has no configured Playwright suite or Playwright npm script.
- Keep browser verification focused on the active local demo URL and document which pages and interactions were checked.
</ui_verification>

</testing_rules>

<code_architecture>
Split distinct functionalities into separate modules and files, keeping code modular and focused
</code_architecture>

Before answering, you always think through the problem deeply using ultrathink mode. You think long and hard to ensure the solution perfectly aligns with the user's question and requirements before responding.
</container_guidelines>


Details of the container (also called "project"):
<container_information>

<description>
This is a GitHub Pages project for the Bulma root domain at https://bulma.com.au

It is a marketing website for the Bulma product, which is a web application that aims to assist Australian mortgage brokers with AI to automate scenario planning, credit assessment preparation, policy matching, and lender selection. Web app url: https://app.bulma.com.au
</description>

System architecture documentation (IMPORTANT):
<system_architecture_documentation>

📝 **System Architecture Documentation**: This section establishes canonical terms for core system components. When any task involves these workflows, subsystems, or capabilities, the corresponding documentation MUST be read to understand implementation details.

| Component | Path (documents/guides) | Purpose |
|-----------|-------------------------|---------|
| **Animations** | [`_animations.md`](documents/guides/_animations.md) | Animation system conventions, motion principles, and implementation rules for the marketing site |
| **Demo Video** | [`_demo-video.md`](documents/guides/_demo-video.md) | Remotion video project for marketing demo (`video/bulma-demo/`) |

IMPORTANT: You MUST read the appropriate documentation above when working with any of the systems mentioned.

When you edit, modify, or refactor code related to ANY system architecture component listed above, you MUST follow this workflow:
<documentation_synchronisation>

**After Making Code Changes:**
1. Identify which system architecture component(s) your changes affect
2. Locate and read the corresponding documentation file from the table above
3. Compare the guide against your updated implementation
4. If discrepancies exist, update the documentation to reflect the current state
5. Ensure documentation remains comprehensive and information-dense, focusing on technical functionality and observed behavior

**Documentation Standards:** 
- The GOAL of the documentation is to provide a high-level overview of how the overall system works, that way a person can understand the system without having to read every single file, and prevents them from introducing bugs or errors. Given this, the documentation must be comprehensive, but IMPORTANTLY: **information-dense**. 
- Focus on technical functionality and observed behavior, not presentation or aesthetics. It should not be verbose or include anything other than the most essential details.

REMEMBER: You don't always need to update docs, but you always need to check whether updates are required. This applies to ALL components in the system architecture table.

</documentation_synchronisation>

</system_architecture_documentation>

<design_documentation>
Visual implementation contract: [`DESIGN.md`](DESIGN.md) (project root). Read it before changing any user-facing surface in `demo/src`. It documents the mist palette roles, typography and layout primitives, the action hierarchy (Glass Press primary via `demo/src/components/elements/glass-press-button-link.tsx` for the `Try Bulma free` and `Get started` CTAs), component contracts, approved exceptions/drift, and the design verification matrix. Token values remain owned by `demo/src/app/globals.css`; motion implementation detail remains owned by `documents/guides/_animations.md`.
</design_documentation>

<brand_colors>
Primary gradient (dark mode, blue):
- From: #243a42
- To: #232f40

Base colors:
- white: #ffffff
- black: #000000
</brand_colors>

Here is a high level overview of the folder structure:
<folder_structure>
/                                               # Project root directory
├── components/                                 # Reusable UI component library (source of truth, not a running app)
│   ├── elements/                               # Base UI primitives
│   │   ├── announcement-badge.tsx              # Announcement/notification badge component
│   │   ├── button.tsx                          # Primary button component with variants
│   │   ├── container.tsx                       # Page container with max-width constraints
│   │   ├── document.tsx                        # Document/article wrapper component
│   │   ├── email-signup-form.tsx               # Email capture form for newsletter/waitlist
│   │   ├── eyebrow.tsx                         # Small label text above headings
│   │   ├── heading.tsx                         # Page/section heading component (h1-h6)
│   │   ├── link.tsx                            # Styled anchor component
│   │   ├── logo-grid.tsx                       # Grid layout for partner/client logos
│   │   ├── screenshot.tsx                      # App screenshot display with styling
│   │   ├── section.tsx                         # Page section wrapper with spacing
│   │   ├── subheading.tsx                      # Secondary heading component
│   │   ├── text.tsx                            # Body text component with variants
│   │   └── wallpaper.tsx                       # Background pattern/gradient component
│   ├── icons/                                  # SVG icon components (100+ icons)
│   │   ├── sparkles-icon.tsx                   # AI/magic sparkles icon
│   │   ├── building-library-icon.tsx           # Lender/institution icon
│   │   ├── chart-line-icon.tsx                 # Analytics/trends icon
│   │   └── social/                             # Social media icons
│   │       ├── facebook-icon.tsx
│   │       ├── instagram-icon.tsx
│   │       └── x-icon.tsx
│   └── sections/                               # Pre-built page sections
│       ├── hero-centered-with-demo.tsx         # Hero section with centered demo screenshot
│       ├── hero-left-aligned-with-demo.tsx     # Hero section with left-aligned content
│       ├── hero-left-aligned-with-photo.tsx    # Hero section with photo layout
│       ├── team-four-column-grid.tsx           # Team grid layout (four columns)
│       ├── features-three-column.tsx           # 3-column feature grid layout
│       ├── features-two-column-with-demos.tsx  # Two-column feature layout with demos
│       ├── features-with-large-demo.tsx        # Features section with large app screenshot
│       ├── stats-animated-graph.tsx            # Stats section with animated graph
│       ├── pricing-hero-multi-tier.tsx         # Pricing hero with multi-tier emphasis
│       ├── pricing-multi-tier.tsx              # Multi-tier pricing cards
│       ├── pricing-single-tier-two-column.tsx  # Single plan with feature comparison
│       ├── plan-comparison-table.tsx           # Detailed plan feature comparison table
│       ├── faqs-accordion.tsx                  # Expandable FAQ section
│       ├── faqs-two-column-accordion.tsx       # Two-column FAQ layout with accordion
│       ├── testimonial-with-large-quote.tsx    # Customer testimonial display
│       ├── testimonial-two-column-with-large-photo.tsx  # Testimonial with large photo
│       ├── testimonials-glassmorphism.tsx      # Glassmorphism testimonial grid
│       ├── call-to-action-simple.tsx           # Simple CTA section
│       ├── call-to-action-simple-centered.tsx  # CTA section with centered content
│       ├── navbar-with-logo-actions-and-left-aligned-links.tsx  # Main navigation bar
│       └── footer-with-links-and-social-icons.tsx               # Site footer with links
├── pages/                                      # Template page variations (reference and copy source, not routed pages)
│   ├── home-01.tsx                             # Homepage variation 1 (hero + features + CTA)
│   ├── home-02.tsx                             # Homepage variation 2 (different layout)
│   ├── home-03.tsx                             # Homepage variation 3 (alternative design)
│   ├── pricing-01.tsx                          # Pricing page with multi-tier cards
│   ├── pricing-02.tsx                          # Pricing page with comparison table
│   ├── pricing-03.tsx                          # Pricing page alternative layout
│   ├── about-01.tsx                            # About page with team/mission
│   ├── about-02.tsx                            # About page variation
│   ├── about-03.tsx                            # About page variation
│   ├── privacy-policy-01.tsx                   # Privacy policy template
│   ├── privacy-policy-02.tsx                   # Privacy policy variation
│   ├── 404-01.tsx                              # 404 error page template
│   └── 404-02.tsx                              # 404 error page variation
├── demo/                                       # The only runnable Next.js app in this repo (serves localhost and deploys to Pages)
│   ├── src/
│   │   ├── app/                                # Next.js App Router pages
│   │   │   ├── layout.tsx                      # Root layout with fonts, metadata, global styles
│   │   │   ├── page.tsx                        # Homepage (/) - imports from pages/home-01.tsx pattern
│   │   │   ├── globals.css                     # Tailwind v4 global styles and theme config
│   │   │   ├── about/page.tsx                  # About page (/about)
│   │   │   ├── contact/page.tsx                # Contact page (/contact)
│   │   │   ├── pricing/page.tsx                # Pricing page (/pricing)
│   │   │   ├── privacy-policy/page.tsx         # Privacy policy (/privacy-policy)
│   │   │   └── 404/page.tsx                    # Custom 404 page
│   │   ├── hooks/                              # Shared React hooks
│   │   │   └── use-scroll-animation.ts         # Reusable IntersectionObserver hook
│   │   ├── components/                         # Copied components for demo (mirrors ../components/)
│   │   │   ├── elements/                       # Base UI elements (copied from components/elements/)
│   │   │   │   ├── animated-counter.tsx        # Scroll-triggered number counting
│   │   │   │   ├── cursor-spotlight.tsx        # Cursor-following ambient glow
│   │   │   │   ├── floating-orbs.tsx           # Ambient drifting background orbs
│   │   │   │   ├── gradient-border-wrapper.tsx # Rotating gradient CTA border
│   │   │   │   ├── magnetic-wrapper.tsx        # Magnetic cursor-attraction effect
│   │   │   │   ├── blur-transition-text.tsx    # Blur in/out text cycling animation
│   │   │   │   └── screenshot.tsx              # Parallax tilt implementation
│   │   │   ├── icons/                          # Icon components (copied from components/icons/)
│   │   │   ├── sections/                       # Page sections (copied from components/sections/)
│   │   │   └── MixpanelProvider.jsx            # Mixpanel analytics provider component (disabled in development)
│   │   ├── lib/                                # Shared utilities and configuration
│   │   │   ├── analytics.js                    # Analytics event tracking utilities
│   │   │   ├── metadata.ts                     # SEO metadata config (sitewide + per-page)
│   │   │   ├── mixpanelClient.js               # Mixpanel client initialization (disabled in development)
│   │   │   └── sitemap.js                      # Sitemap route configuration
│   │   ├── schemas/                            # JSON-LD structured data schemas
│   │   │   └── organization-schema.ts          # Organization schema for SEO
│   │   └── scripts/                            # Build-time scripts
│   │       └── generate-sitemap.js             # Sitemap XML generator (runs on build)
│   ├── public/                                 # Static assets
│   │   ├── CNAME                               # GitHub Pages CNAME for demo export
│   │   ├── favicon.ico                         # Demo site favicon
│   │   ├── sitemap.xml                         # Generated sitemap (auto-generated on build)
│   │   ├── img/                                # Marketing images
│   │   │   ├── avatars/                        # Team/testimonial avatars
│   │   │   ├── logos/                          # Brand and partner logos
│   │   │   ├── og/                             # Open Graph social sharing images
│   │   │   ├── photos/                         # Marketing photos
│   │   │   └── screenshots/                    # App screenshots for marketing
│   │   └── scripts/                            # Client-side tracking scripts
│   │       └── referral-tracking.js            # UTM and referral parameter tracking
│   ├── package.json                            # Dependencies: Next.js 16, React 19, Tailwind v4 (root has no package.json)
│   ├── next.config.ts                          # Next.js config with static export for GitHub Pages
│   ├── tsconfig.json                           # TypeScript configuration
│   └── postcss.config.mjs                      # PostCSS config for Tailwind
├── documents/                                  # Project documentation
│   ├── _app_description.md                     # Detailed Bulma product description
│   ├── reference/
│   │   └── planning_new_feature.md             # Feature planning template guidelinesA
│   └── templates/                              # Document templates
│       ├── bug_template.md                     # Bug report template
│       ├── error_template.md                   # Error documentation template
│       └── plan_template.md                    # Implementation plan template
├── .cursor/                                    # Cursor IDE configuration
│   ├── plans/                                  # Implementation plan documents
│   └── rules/                                  # Cursor rules for code assistance
│       ├── dev-browser.mdc                     # Browser verification and screenshot analysis rules
│       ├── git-commit-message-format.mdc       # Git commit message conventions
│       └── documentation-guidelines.mdc        # Documentation standards
├── .github/
│   └── workflows/
│       └── deploy.yml                          # GitHub Actions workflow for Pages deployment
├── Configuration Files (root)
│   ├── AGENTS.md                               # This file - AI agent guidelines and project structure
│   ├── README.md                               # Project readme with setup instructions
│   ├── tailwind.css                            # Root Tailwind CSS configuration
│   ├── .gitignore                              # Git ignore patterns
│   ├── CHANGELOG.md                            # Version history and changes
│   ├── CNAME                                   # Root domain configuration for GitHub Pages
│   ├── files-to-change.md                      # Content/editing checklist
│   └── github-pages-setup.md                   # GitHub Pages deployment notes
└── .vscode/
    └── launch.json                             # VS Code debug configuration
</folder_structure>

</container_information>

<environments>
- Development: Only the `demo/` app runs a dev server
  - Start: `cd demo && npm run dev` (default port 3000)
  - Example: `npm run dev -- -p 3001` serves `http://localhost:3001`
  - Build output: `npm run build` generates the static export in `demo/out`
  - Data/API: None (static marketing site; no server/database)
- Production: GitHub Pages deployment for `bulma.com.au`, built from `demo/` on pushes to the default branch (`main`)
  - Hosting: GitHub Actions workflow `/.github/workflows/deploy.yml` publishes `demo/out`
  - Pages source: GitHub Actions (workflow build), not repo root
  - Domain: `bulma.com.au` via `demo/public/CNAME`
  - Runtime: Static export only (no server-side execution)
  - **Critical config**: Pages must use `build_type: workflow` (not `legacy`). If the site shows the README instead of the app, Pages is pointing at the repo root. Fix: `gh api repos/Culpable/bulma-root/pages -X PUT -f build_type=workflow && gh workflow run deploy.yml`
</environments>
