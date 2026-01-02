# Content Editor's Guide - Bulma Website

## ⚠️ Information Needed Before Starting

Please provide the following information so I can complete all changes:

### 1. Branding
- [ ] **Product name:** (replacing "Oatmeal")
- [ ] **Tagline:** (for page title metadata)
- [ ] **Company legal name:** (for copyright, e.g., "Bulma Pty Ltd")

### 2. Logo Files (provide SVG files)
- [ ] **Light mode logo:** (replaces `oatmeal-mona-color-mist-950.svg`)
- [ ] **Dark mode logo:** (replaces `oatmeal-mona-color-white.svg`)
- [ ] **Favicon:** (ICO or PNG)

### 3. Company Details
- [ ] **Mission statement / company description**
- [ ] **Contact email:** (for privacy policy)
- [ ] **Physical address:** (for privacy policy)
- [ ] **Social media URLs:**
  - X/Twitter:
  - GitHub:
  - YouTube:
  - Other:

### 4. Product Copy
- [ ] **Hero headline:** (main value proposition)
- [ ] **Hero subheadline:** (supporting description)
- [ ] **Announcement badge text:** (or remove?)
- [ ] **CTA button labels:** (e.g., "Start free trial", "Book a demo")
- [ ] **CTA destinations/URLs:** (signup page, demo booking, etc.)

### 5. Features (need 2+ features)
For each feature provide:
- [ ] Feature name
- [ ] Feature description (1-2 sentences)
- [ ] Screenshot image (if available)

### 6. Pricing Plans
For each plan (Starter/Growth/Pro or your naming):
- [ ] Plan name
- [ ] Monthly price
- [ ] Yearly price
- [ ] Short description
- [ ] Feature list (what's included)
- [ ] Which plan is "most popular"?

### 7. Stats/Metrics
- [ ] Stat 1: number + description (e.g., "2M+ emails processed")
- [ ] Stat 2: number + description (e.g., "99.98% uptime")
- [ ] Additional stats?

### 8. FAQs (need 4)
- [ ] Question 1 + Answer
- [ ] Question 2 + Answer
- [ ] Question 3 + Answer
- [ ] Question 4 + Answer

### 9. Team Members (need up to 8)
For each team member:
- [ ] Name
- [ ] Role/title
- [ ] Photo (headshot, ~800x1000px)

### 10. Testimonials (need 3-6)
For each testimonial:
- [ ] Quote text
- [ ] Person's name
- [ ] Title + company
- [ ] Avatar/headshot image

### 11. Images to Provide
- [ ] **Product screenshots:** (ideally light + dark mode versions)
  - Recommended sizes: 3440x1990, 2000x1408, 1300x1300
- [ ] **Customer/partner logos:** (5-6 logos, SVG preferred)
- [ ] **About page hero photo:** (team/office photo)

### 12. Navigation Links
Where should these link to?
- [ ] Docs link:
- [ ] Log in link:
- [ ] Get started / Sign up link:
- [ ] Help Center link:
- [ ] API Docs link:
- [ ] Status page link:

### 13. Legal Content
- [ ] **Privacy policy:** (provide full text or URL to copy from)
- [ ] **Terms of service:** (provide full text or should I add a page?)
- [ ] **Last updated date:** for legal pages

### 14. Brand Colors (optional)
- [ ] Primary brand color: (hex or oklch value)
- [ ] If you want to customize the "mist" color palette

---

All content files are located in `/demo/src/`.

## Quick Reference: Template Naming

Current template name: **Oatmeal**
Replace all instances of "Oatmeal" with your product name (e.g., "Bulma").

---

## Main Pages

### Layout (`/demo/src/app/layout.tsx`)

**Global site settings that appear on every page:**

```tsx
// Line 22-24: Page metadata
export const metadata: Metadata = {
  title: 'Oatmeal Kit Demo',  // Change to: 'Bulma - Your Tagline'
}
```

**Navbar links (Lines 50-57):**
```tsx
<NavbarLink href="/pricing">Pricing</NavbarLink>
<NavbarLink href="/about">About</NavbarLink>
<NavbarLink href="#">Docs</NavbarLink>      // Update href and label
<NavbarLink href="#">Log in</NavbarLink>    // Update href
```

**Navbar logo (Lines 60-75):**
```tsx
// Replace these logo images:
src="/img/logos/oatmeal-mona-color-mist-950.svg"  // Light mode logo
src="/img/logos/oatmeal-mona-color-white.svg"     // Dark mode logo
alt="Oatmeal"  // Update alt text
```

**Navbar action buttons (Lines 77-84):**
```tsx
<PlainButtonLink href="#">Log in</PlainButtonLink>    // Update href
<ButtonLink href="#">Get started</ButtonLink>         // Update href and label
```

**Footer newsletter (Lines 92-99):**
```tsx
headline="Stay in the loop"
subheadline="Get customer support tips, product updates..."
action="#"  // Update to your newsletter signup endpoint
```

**Footer link categories (Lines 103-127):**
```tsx
Product:
- Features, Pricing, Integrations

Company:
- About, Careers, Blog, Press Kit

Resources:
- Help Center, API Docs, Status, Contact

Legal:
- Privacy Policy, Terms of Service, Security
```

**Footer fineprint (Line 129):**
```tsx
fineprint="© 2025 Oatmeal, Inc."  // Change to: "© 2025 Bulma Pty Ltd"
```

**Footer social links (Lines 131-141):**
```tsx
href="https://x.com"           // Update to your X/Twitter
href="https://github.com"      // Update to your GitHub
href="https://www.youtube.com" // Update to your YouTube
```

---

### Home Page (`/demo/src/app/page.tsx`)

**Hero section (Lines 21-42):**
```tsx
// Announcement badge (Line 23)
text="Oatmeal raises 80M Series A funding"  // Update or remove

// Headline (Line 24)
headline="Customer support that feels like a conversation."

// Subheadline (Lines 25-30)
"Simplify your shared inbox, collaborate effortlessly..."

// CTA buttons (Lines 33-39)
"Start free trial"
"See how it works"
```

**Logo grid (Lines 93-191):**
- Replace `/img/logos/9-*.svg` through `/img/logos/13-*.svg`
- These are customer/partner logos displayed below the hero

**Features section (Lines 194-353):**
```tsx
// Section headers (Lines 196-203)
eyebrow="Powerful features"
headline="Everything you need to deliver personal..."
subheadline="Work smarter, reply faster..."

// Feature 1 (Lines 267-278)
headline="Shared Inbox"
subheadline="Keep every customer conversation in one clean..."

// Feature 2 (Lines 341-349)
headline="Inbox Agent"
subheadline="Get valuable context without having to read..."
```

**Stats section (Lines 355-369):**
```tsx
eyebrow="Built for scale"
headline="The inbox powering customer conversations everywhere."
subheadline="Oatmeal helps teams deliver personal..."

// Stats
stat="2M+"     text="Emails manually processed..."
stat="99.98%"  text="Uptime — because your customers..."
```

**Testimonials section (Lines 371-490):**
```tsx
// Section headers (Lines 373-374)
headline="What our customers are saying"
subheadline="We've given these customers a significant discount..."

// Individual testimonials (update each):
- quote text
- name
- byline (title/company)
- avatar image
```

**FAQs section (Lines 492-513):**
```tsx
// Each FAQ:
question="..."
answer="..."

// Template has 4 FAQs - update all questions and answers
```

**Pricing section (Lines 515-580):**
```tsx
headline="Pricing to fit your business needs."

// Three plans: Starter, Growth, Pro
// For each plan update:
- name
- price
- period
- subheadline
- features array
- CTA button text and href
```

**CTA section (Lines 582-603):**
```tsx
headline="Ready to make customer support feel simple again?"
subheadline="Join hundreds of teams using Oatmeal..."

// CTA buttons
"Start free trial"
"Book a demo"
```

---

### About Page (`/demo/src/app/about/page.tsx`)

**Hero section (Lines 14-32):**
```tsx
headline="Your customer success is our mission."
subheadline="We're on a mission to take the human element..."

// Photo
src="/img/photos/1.webp"  // Replace with company photo
```

**Stats section (Lines 34-48):**
```tsx
// Same structure as home page stats
eyebrow="Built for scale"
headline="The inbox powering customer conversations..."
```

**Testimonial section (Lines 50-69):**
```tsx
quote="Ever since we started using Oatmeal..."
name="Lynn Marshall"
byline="Founder at Pine Labs"
img="/img/avatars/16-h-1000-w-1400.webp"
```

**Team section (Lines 71-185):**
```tsx
// Section headers (Lines 73-78)
headline="Our leadership team"
subheadline="Oatmeal's leadership team combines decades..."

// Team members - for each update:
- img src
- name
- byline (role)

// 8 team members currently defined
```

**CTA section (Lines 187-204):**
```tsx
headline="Have anymore questions?"
subheadline="Chat to someone on our sales team..."
```

---

### Pricing Page (`/demo/src/app/pricing/page.tsx`)

**Plans function (Lines 11-75):**
```tsx
// Three plans with monthly/yearly pricing:
// Starter: $12/mo or $120/yr
// Growth: $49/mo or $490/yr  (marked "Most popular")
// Pro: $299/mo or $2990/yr

// For each plan update:
- price values
- subheadline
- features array
```

**Hero section (Lines 81-92):**
```tsx
headline="Pricing"
subheadline="Simplify your shared inbox..."
```

**Plan comparison table (Lines 194-283):**
```tsx
// Feature categories:
- Collaboration
- Automation
- Team Management
- Support

// Update all feature names and values per plan
```

**FAQs section (Lines 306-327):**
- Same 4 FAQs as home page
- Update questions and answers

---

### Privacy Policy Page (`/demo/src/app/privacy-policy/page.tsx`)

**Header (Line 7):**
```tsx
headline="Privacy Policy"
subheadline="Last updated on December 19, 2025."  // Update date
```

**Company references throughout (update all):**
```tsx
Company Inc. ("Company," "we," "us," or "our")

// Contact info (Lines 61-67):
Company Inc.
Email: privacy@company.example
Address: 123 Demo Street, Example City, Country
```

---

### 404 Page (`/demo/src/app/404/page.tsx`)

Update any placeholder text or CTAs.

---

## Images to Replace

All images in `/demo/public/img/`:

### Logos (`/img/logos/`)
| File | Usage |
|------|-------|
| `oatmeal-mona-color-mist-950.svg` | Main logo (light mode) |
| `oatmeal-mona-color-white.svg` | Main logo (dark mode) |
| `8-13-*.svg` | Customer/partner logos in logo grids |

### Screenshots (`/img/screenshots/`)
| Pattern | Usage |
|---------|-------|
| `1*.webp` | Product screenshots (multiple sizes for responsive) |

Create replacement screenshots at these dimensions:
- Full: 3440x1990
- Large: 2000x1408, 1800x1250
- Medium: 1670x1408, 1300x1300
- Small: 1000x800

Both light mode and dark mode (prefix: `1-color-mist-`)

### Avatars (`/img/avatars/`)
| Pattern | Usage |
|---------|-------|
| `1-8-h-1000-w-800.webp` | Team member photos |
| `10-16-size-160.webp` | Testimonial avatars |
| `16-h-1000-w-1400.webp` | Large testimonial photo |

### Photos (`/img/photos/`)
| File | Usage |
|------|-------|
| `1.webp` | About page hero photo |

---

## Package Files

### `demo/package.json`
```json
"name": "oatmeal-demo"  // Change to: "bulma"
```

---

## CSS Customization

### `demo/src/app/globals.css`

**Color scheme (Lines 8-18):**
```css
--color-mist-50: oklch(98.7% 0.002 197.1);
--color-mist-100: oklch(96.3% 0.002 197.1);
/* ... through mist-950 */
```

Update the `mist` color palette values to match your brand colors.

---

## Component Reference

Components in `/demo/src/components/sections/` are pre-built sections.
Elements in `/demo/src/components/elements/` are reusable UI components.
Icons in `/demo/src/components/icons/` are SVG icon components.

Generally, you won't need to edit these - just change the props passed to them in the page files.

---

## Template Variants

The `/pages/` and `/components/` directories in the root contain alternative page layouts and components from the Oatmeal template kit:

- `home-01.tsx`, `home-02.tsx`, `home-03.tsx` - Alternative home page layouts
- `about-01.tsx`, `about-02.tsx`, `about-03.tsx` - Alternative about page layouts
- `pricing-01.tsx`, `pricing-02.tsx`, `pricing-03.tsx` - Alternative pricing layouts
- `privacy-policy-01.tsx`, `privacy-policy-02.tsx` - Alternative privacy layouts
- `404-01.tsx`, `404-02.tsx` - Alternative 404 layouts

To use an alternative layout:
1. Compare with current implementation in `/demo/src/app/`
2. Copy desired sections/structure
3. Update content accordingly

---

## Checklist

### Branding
- [ ] Replace "Oatmeal" with "Bulma" throughout
- [ ] Update logo files (light + dark mode)
- [ ] Update favicon (add to `/demo/public/`)
- [ ] Update meta description in layout.tsx
- [ ] Update footer copyright

### Content
- [ ] Update all hero headlines and subheadlines
- [ ] Update feature descriptions
- [ ] Update pricing plans and features
- [ ] Update FAQs (both home and pricing pages)
- [ ] Update team members (names, roles, photos)
- [ ] Update testimonials (quotes, names, companies, avatars)
- [ ] Update stats numbers and descriptions

### Images
- [ ] Replace product screenshots (all responsive sizes)
- [ ] Replace customer/partner logos
- [ ] Replace team member photos
- [ ] Replace testimonial avatars
- [ ] Replace about page hero photo

### Links
- [ ] Update all CTA button hrefs
- [ ] Update navbar links
- [ ] Update footer links
- [ ] Update social media links

### Legal
- [ ] Update privacy policy content
- [ ] Add terms of service page
- [ ] Update company contact information

### Technical
- [ ] Update package.json name
- [ ] Add CNAME file for custom domain
- [ ] Update next.config.ts for static export
- [ ] Test build locally before deploying
