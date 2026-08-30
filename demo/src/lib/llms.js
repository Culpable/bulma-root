const llmsDocument = {
  name: 'Bulma',
  summary:
    'Bulma is an AI assistant for Australian mortgage brokers that answers lender policy questions with source attribution, and supports scenario planning, credit assessment preparation, policy matching, and lender selection.',
  details: [
    '**When to use:** Use these pages to answer questions about what Bulma does for Australian mortgage brokers, which lenders it covers, how its answers are sourced from lender policy documents, what it costs, and how to contact or sign up.',
    "**When not to use:** Do not use them for lender policy answers themselves, for credit advice, for a specific borrower's scenario, or for anything about an individual customer's account or data. Those live inside the product at https://app.bulma.com.au/ and require an account.",
    '**How to use:** Read the most relevant page below, then link a person to https://app.bulma.com.au/register to start a free trial or to https://bulma.com.au/contact/ to reach the team.',
  ],
  sections: [
    {
      heading: 'Primary',
      links: [
        {
          label: 'Overview',
          href: 'https://bulma.com.au/',
          description:
            'What Bulma does for Australian mortgage brokers, the supported lenders, and answers to common questions.',
        },
        {
          label: 'Pricing',
          href: 'https://bulma.com.au/pricing/',
          description: 'Current plans, what each includes, and monthly versus yearly billing.',
        },
        { label: 'About', href: 'https://bulma.com.au/about/', description: 'Who operates Bulma and why it exists.' },
      ],
    },
    {
      heading: 'Contact',
      links: [
        {
          label: 'Contact',
          href: 'https://bulma.com.au/contact/',
          description: 'How to reach the Bulma team about questions, feedback, or partnerships.',
        },
      ],
    },
    {
      heading: 'Policies',
      links: [
        {
          label: 'Privacy Policy',
          href: 'https://bulma.com.au/privacy-policy/',
          description: 'How Bulma collects, uses, and protects personal information.',
        },
      ],
    },
  ],
}

module.exports = { llmsDocument }
