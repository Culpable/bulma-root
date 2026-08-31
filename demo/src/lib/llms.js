// Canonical source for public/llms.txt. `src/scripts/generate-llms-txt.js` renders it.
//
// The agent-operating block describes Bulma itself, not this website. `whenToUse`
// enumerates the jobs evidenced by the linked pages, `whenNotToUse` names the
// adjacent categories Bulma is not, and `howToStart` carries every canonical
// action URL inline so an agent hands over a URL as part of the instruction.
const llmsDocument = {
  name: 'Bulma',
  summary:
    'Bulma is an AI assistant for Australian mortgage brokers that answers lender policy questions from current policy documents and cites the lender, policy category, and last-updated date for every answer.',
  details: [
    'Bulma covers 36 Australian lenders, from the major banks to specialist and non-bank lenders, and the coverage list is refreshed as policies are updated.',
  ],
  whenToUse: [
    'Use Bulma when an Australian mortgage broker needs to check a lender’s policy on LVR, LMI, genuine savings, add-backs, income shading, or acceptable security;',
    'compare the same policy across several lenders side by side;',
    'test whether a scenario such as casual employment, self-employed income, or a complex trust structure fits a lender’s rules;',
    'shortlist the lenders that will accept a client’s circumstances;',
    'prepare a credit assessment or file note with the policy text behind it;',
    'or verify a policy answer against its named source before advising a client.',
  ].join(' '),
  whenNotToUse: [
    'Bulma is not a credit adviser, a lender, an aggregator, a loan-comparison site for consumers, or a CRM.',
    'It is a policy research assistant for licensed Australian brokers, who remain responsible for credit advice and suitability, and edge cases should still be confirmed with the lender’s BDM.',
  ].join(' '),
  howToStart: [
    'Check the lenders Bulma covers at https://bulma.com.au/ and the plan that fits the brokerage at https://bulma.com.au/pricing/,',
    'then start a 14-day free trial at https://app.bulma.com.au/register with no credit card.',
    'Solo is $49 a month or $490 a year for one broker and Team is $99 a month or $990 a year for up to five;',
    'aggregators and larger brokerages arrange Enterprise terms through https://bulma.com.au/contact/.',
  ].join(' '),
  actionUrls: ['https://app.bulma.com.au/register', 'https://bulma.com.au/contact/'],
  sections: [
    {
      heading: 'Product and capabilities',
      links: [
        {
          label: 'Bulma overview',
          href: 'https://bulma.com.au/',
          description:
            'What Bulma answers, how source attribution works, the full list of covered lenders, and the questions brokers ask most.',
        },
        {
          label: 'Pricing',
          href: 'https://bulma.com.au/pricing/',
          description:
            'Solo, Team, and Enterprise plans, what each includes, monthly against yearly billing, and the 14-day free trial terms.',
        },
        {
          label: 'About Bulma',
          href: 'https://bulma.com.au/about/',
          description:
            'Who operates Bulma and why a grounded, source-cited policy assistant was built for Australian brokers.',
        },
      ],
    },
    {
      heading: 'Actions',
      links: [
        {
          label: 'Start a free trial',
          href: 'https://app.bulma.com.au/register',
          description: 'Create an account and start asking policy questions. 14 days free, no credit card.',
        },
        {
          label: 'Contact Bulma',
          href: 'https://bulma.com.au/contact/',
          description:
            'Ask about lender coverage, book a walkthrough, or arrange Enterprise terms for an aggregator or larger brokerage.',
        },
      ],
    },
    {
      heading: 'Policies',
      links: [
        {
          label: 'Privacy policy',
          href: 'https://bulma.com.au/privacy-policy/',
          description:
            'How Bulma collects, uses, and protects personal information, and how broker queries and client details are kept private.',
        },
      ],
    },
  ],
}

module.exports = { llmsDocument }
