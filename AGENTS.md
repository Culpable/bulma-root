# IMPORTANT
- This file outlines guidelines and tips for working within this container.
- When locations are referenced within this file, they assume the same working directory as where this file is located. For example, `.gitignore` is in the same directory as this file.
- Ensure you ALWAYS read the appropriate system architecture documentation before working with any of the systems mentioned.

Your container guidelines MUST be followed in all circumstances:
<container_guidelines>
Rules for creating implementation plans (plan mode):
<plan_mode_guidelines>
When creating implementation plans in `.cursor/plans/`, ALL plans MUST follow the guidelines outlined in `documents/reference/planning_new_feature.md`.

All `.cursor/plans/*.plan.md` must open with:
1. **Goal**: Summarise the desired outcome, business impact, and success criteria. Explain why the work matters so implementers can adapt tactics without losing intent.
2. **Current State Analysis**: Detail today’s behavior, affected components, root causes, and user impact. Treat this as the decision-making reference that enables autonomous pivots.
3. **Implementation Plan**: Outline the recommended approach at a high level (key modules, major steps, pivotal trade-offs). Focus on objectives; avoid line-by-line instructions. If any of the architecture docs require updating, include an explicit step to update them.

The plan must be comprehensive and information dense. It must include all the information necessary to implement the plan without being verbose. Assume the plan will serve as a STANDALONE DOCUMENT, and hence include ALL relevant context within the file itself.

When writing a plan for a complex feature, if you're unsure about anything, ask the user for clarification, presenting your questions and possible solutions clearly so they can understand and provide direction. For each unknown, ask a numbered clarification question and provide 2–4 concrete answer options (A, B, C…), including "Other: ____". ALWAYS format your questions as numbered lists with options (A/B/C etc.) so that it's easy for the user to respond.

AFTER you have built the plan, append an **Implemented Solution** section to the same plan file summarizing (a) the exact code/doc files touched, (b) the key logic or behavioral deltas (backend, cache/versioning, UI/methodology, docs), and (c) any other important notes. Keep it information-dense and bulletised; no narrative filler. The goal is to allow a reviewer to understand the implementation to facilitate reviewing the changes.
</plan_mode_guidelines>

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

<animation_standards>
**NEVER add `prefers-reduced-motion` checks or similar accessibility media query conditionals to animation code.** Animations must work consistently for all users, so do not gate/short-circuit IntersectionObserver setup with accessibility or timing conditionals (including `requestAnimationFrame` wrappers).
</animation_standards>
</frontend_design>
</code_standards>

<code_architecture>
Split distinct functionalities into separate modules and files, keeping code modular and focused
</code_architecture>

<quality_standards>
- You will be penalised for being lazy. If you are asked to provide a fully coded solution, you must give the code IN FULL without skipping any lines.
- Solutions must be complete and thoroughly tested.
- Documentation and code comments must be clear and comprehensive.
- Before reporting completion to the user, you must critically examine your work so far and ensure that you completely fulfilled the user's request and intent. Make sure you completed all verification steps that were expected of you.
- If you fail to follow instructions, you will die and the user will lose their job.
</quality_standards>

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
