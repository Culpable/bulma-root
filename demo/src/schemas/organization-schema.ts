/**
 * Organization Schema.org JSON-LD markup
 * This file contains structured data that helps search engines understand the organisation
 */

export const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Bulma",
    "alternateName": ["Bulma: AI Mortgage Broker Assistant", "Bulma AI Policy Advisor"],
    "url": "https://bulma.com.au/",
    "logo": "https://bulma.com.au/img/logos/bulma-logo-dark.svg",
    "image": "https://bulma.com.au/img/screenshots/1.webp",
    "description": "Bulma is an AI assistant for Australian mortgage brokers that answers lender policy questions with source attribution, helping with scenario planning, policy matching, and lender selection.",
    "address": {
        "@type": "PostalAddress",
        "streetAddress": "PO Box 155",
        "addressLocality": "Northlands",
        "postOfficeBoxNumber": "155",
        "postalCode": "6905",
        "addressRegion": "WA",
        "addressCountry": "AU"
    }
};
