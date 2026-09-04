export interface AgentReadinessRoute {
  route: string
  contentMarkers: readonly string[]
  maxMainTextCharacters?: number
}

export const DEFAULT_MAX_MAIN_TEXT_CHARACTERS = 100_000

export const AGENT_READINESS_ROUTES: readonly AgentReadinessRoute[] = [
  { route: '/', contentMarkers: ['Your AI assistant for policy questions.'] },
  { route: '/about/', contentMarkers: ['Built by brokers, for brokers'] },
  { route: '/pricing/', contentMarkers: ['Simple pricing for every brokerage'] },
  { route: '/contact/', contentMarkers: ['Talk to the Bulma team.'] },
  { route: '/privacy-policy/', contentMarkers: ['Privacy Policy'] },
]

export const TRUST_ROUTES = ['/about/', '/contact/', '/privacy-policy/'] as const
export const USER_TRIGGERED_AGENT_USER_AGENTS = ['ChatGPT-User', 'Claude-User', 'Perplexity-User'] as const
export const UNKNOWN_ROUTE = '/agent-readiness/missing-route-7f48d4/'
export const AUTHORISED_HOSTED_MODE_ENV = 'AGENT_READINESS_PREVIEW_URL'
