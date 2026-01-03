# Bulma Website - Content Status

## What's Been Done

All copy and text content has been updated for the AI Mortgage Broker Assistant positioning. The site now reflects Bulma's value proposition for Australian mortgage brokers.

### Branding & SEO
- [x] Product name changed from "Oatmeal" to "Bulma" throughout
- [x] Page title: "Bulma - AI Policy Assistant for Mortgage Brokers"
- [x] Meta description: "Ask any lender policy question in plain English. Get instant, grounded answers with source attribution. Built for Australian mortgage brokers."
- [x] Footer copyright: "© 2026 Bulma Pty Ltd"
- [x] Package.json name updated to "bulma"

### Home Page Copy
- [x] Hero headline: "Your AI assistant for lender policy questions."
- [x] Hero subheadline: Focus on grounded answers and source attribution
- [x] Announcement badge: "Now covering all major Australian lenders"
- [x] CTA buttons: "Try Bulma free" / "See it in action"
- [x] Features: "Policy Q&A" and "Lender Comparison"
- [x] Stats: "30+ lenders" and "Seconds to answer"
- [x] 6 broker testimonials with Australian cities
- [x] 4 broker-relevant FAQs
- [x] Pricing: Solo ($49), Team ($99), Enterprise (Custom)
- [x] Final CTA updated

### About Page Copy
- [x] Hero: "Built by brokers, for brokers"
- [x] Mission statement updated
- [x] Stats section aligned with home page
- [x] Testimonial updated
- [x] Team section intro updated
- [x] CTA updated

### Pricing Page Copy
- [x] Plans: Solo/Team/Enterprise with broker-specific features
- [x] Comparison table with Policy Q&A, Team Features, Support
- [x] 4 pricing-specific FAQs
- [x] Testimonial and CTA updated

### Privacy Policy
- [x] Company name: "Bulma Pty Ltd"
- [x] Date updated to January 1, 2026
- [x] Email placeholder: privacy@bulma.com.au

---

## What You Need to Provide

### 1. Logo Files (REQUIRED)
The site references these files which need to be created:
- [x] `demo/public/img/logos/bulma-logo-dark.svg` - Logo for light backgrounds
- [x] `demo/public/img/logos/bulma-logo-light.svg` - Logo for dark backgrounds
- [x] Favicon (add to `demo/public/`)

### 2. Company Details (REQUIRED)
- [x] **Company legal name** - "Bulma Pty Ltd"
- [x] **Contact email** - `solutions@bulma.com.au`
- [x] **Physical address** - PO Box 155, Northlands PO 6905

### 3. Product Screenshots (REQUIRED)
Current placeholder screenshots need replacing with actual Bulma UI:

| File Pattern | Dimensions | Usage |
|-------------|------------|-------|
| `1.webp` | 3440x1990 | Hero full screenshot |
| `1-left-2000-top-1408.webp` | 2000x1408 | Hero responsive |
| `1-left-1800-top-1250.webp` | 1800x1250 | Feature section |
| `1-left-1670-top-1408.webp` | 1670x1408 | Hero mobile |
| `1-left-1300-top-1300.webp` | 1300x1300 | Feature section |
| `1-left-1000-top-800.webp` | 1000x800 | Feature mobile |

Also need dark mode versions with `color-mist` prefix (e.g., `1-color-mist.webp`)

Location: `demo/public/img/screenshots/`

### 4. Navigation & CTA Links (REQUIRED)
Where should these buttons/links go?
- [x] "Try Bulma free" / "Start free trial" → `https://app.bulma.com.au/register`
- [x] "Book a demo" → `https://app.bulma.com.au/contact`
- [x] "Contact sales" → `https://app.bulma.com.au/contact`
- [x] "Log in" → `https://app.bulma.com.au/login`
- [x] "Docs" navbar link → `https://app.bulma.com.au`
- [x] Newsletter form action → `https://app.bulma.com.au/contact`

### 5. Social Media Links (OPTIONAL - or remove?)
Currently placeholder URLs:
- [x] Social links removed from footer (no confirmed URLs yet)

### 6. Pricing Confirmation (REVIEW)
Please confirm these are correct:
- [ ] **Solo**: $49/month, $490/year
- [ ] **Team**: $99/month, $990/year (marked "Most popular")
- [ ] **Enterprise**: Custom pricing

Current features per plan - review in `demo/src/app/pricing/page.tsx`

### 7. Team Members (OPTIONAL)
The About page has 8 placeholder team members. Options:
- [ ] Provide real team member details (name, role, photo)
- [ ] Remove the team section entirely
- [ ] Keep placeholders for now

Team photos should be ~800x1000px, located at `demo/public/img/avatars/`

### 8. Testimonials (OPTIONAL)
Currently using placeholder broker testimonials. Options:
- [ ] Provide real testimonials (quote, name, title, city, photo)
- [ ] Keep current placeholders
- [ ] Remove testimonials section

### 9. Customer/Partner Logos (OPTIONAL)
Logo grid currently shows placeholder logos. Options:
- [ ] Provide real customer/aggregator logos (SVG preferred)
- [ ] Remove logo grid sections

### 10. About Page Hero Photo (OPTIONAL)
- [ ] Provide team/office photo for `demo/public/img/photos/1.webp`
- [ ] Or keep current placeholder

### 11. Brand Colors (OPTIONAL)
To customize the color scheme, edit `demo/src/app/globals.css`:
- [ ] Provide primary brand color (hex or oklch)
- [ ] Or keep current "mist" palette

---

## Files Modified

| File | Status |
|------|--------|
| `demo/src/app/layout.tsx` | Updated |
| `demo/src/app/page.tsx` | Updated |
| `demo/src/app/about/page.tsx` | Updated |
| `demo/src/app/pricing/page.tsx` | Updated |
| `demo/src/app/privacy-policy/page.tsx` | Updated |
| `demo/package.json` | Updated |

---

## Quick Actions Checklist

### Before Going Live
- [ ] Add logo SVG files
- [ ] Add product screenshots
- [ ] Confirm company details
- [ ] Set CTA link destinations
- [ ] Review pricing tiers
- [ ] Add favicon
- [ ] Test build: `cd demo && npm run build`

### Optional Enhancements
- [ ] Add real testimonials
- [ ] Add team photos
- [ ] Add customer logos
- [ ] Customize brand colors
- [ ] Add Terms of Service page
