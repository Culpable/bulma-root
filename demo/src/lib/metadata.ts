/**
 * Site-wide metadata configuration for SEO
 *
 * Uses environment variables for flexible URL handling:
 * - Development: http://localhost:3000 (from .env.development)
 * - Production: https://bulma.com.au (default fallback)
 *
 * Pattern: Pages specify only title and description, inheriting OG/Twitter from layout.
 * Homepage uses absolute title to avoid suffix; all other pages get " | Bulma" appended.
 */

export const siteMetadata = {
  // Site identity
  name: 'Bulma',
  title: 'Bulma: AI Mortgage Broker Assistant',
  description:
    'Bulma is an AI mortgage broker assistant that helps you with scenario planning, credit assessment preparation, policy matching, and lender selection. Ask any policy question in plain English. Get instant, grounded answers with source attribution — so you spend less time searching and more time settling.',

  // URLs
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://bulma.com.au',

  // Open Graph image (absolute URL for social sharing)
  ogImage: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bulma.com.au'}/img/og/bulma-og-image.png`,

  // Twitter/X card settings
  twitter: {
    cardType: 'summary_large_image' as const,
  },

  // Locale
  locale: 'en-AU',
}

/**
 * Page-specific metadata definitions
 * Each page exports its own metadata, but these are centralized here for reference
 */
export const pageMetadata = {
  home: {
    title: siteMetadata.title, // Full title, no suffix (uses absolute)
    description: siteMetadata.description,
  },
  pricing: {
    title: 'Pricing',
    description:
      'Simple, transparent pricing for Bulma. Choose the plan that fits your brokerage. Start free, upgrade when you need more.',
  },
  about: {
    title: 'About',
    description:
      'Learn about Bulma and our mission to help Australian mortgage brokers work smarter with AI-powered policy assistance.',
  },
  contact: {
    title: 'Contact',
    description:
      'Get in touch with the Bulma team. We are here to help with questions, feedback, or partnership enquiries.',
  },
  privacyPolicy: {
    title: 'Privacy Policy',
    description:
      'Read the Bulma privacy policy to understand how we collect, use, and protect your personal information.',
  },
  notFound: {
    title: 'Page Not Found',
    description: 'The page you are looking for could not be found. Return to the Bulma homepage.',
  },
}
