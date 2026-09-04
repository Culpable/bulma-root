export interface RobotsRule {
  directive: 'allow' | 'disallow';
  pattern: string;
}

export interface RobotsGroup {
  agents: string[];
  rules: RobotsRule[];
}

export interface RobotsResolution {
  allowed: boolean;
  matchedAgent: string | null;
  matchedRule: RobotsRule | null;
}

const UNRESERVED = /^[A-Za-z0-9\-._~]$/;

/** Apply the URI comparison normalization required by RFC 9309 section 2.2.2. */
function normaliseUriOctets(value: string): string {
  const encodedUnicode = encodeURI(value);
  return encodedUnicode.replace(/%([0-9a-fA-F]{2})/g, (sequence, hex: string) => {
    const character = String.fromCharCode(Number.parseInt(hex, 16));
    return UNRESERVED.test(character) ? character : sequence.toUpperCase();
  });
}

export function parseRobotsTxt(source: string): RobotsGroup[] {
  const groups: RobotsGroup[] = [];
  let agents: string[] = [];
  let rules: RobotsRule[] = [];

  const flush = () => {
    if (agents.length > 0) groups.push({ agents, rules });
    agents = [];
    rules = [];
  };

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, '').trim();
    if (!line) continue;
    const separator = line.indexOf(':');
    if (separator < 0) continue;
    const field = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();

    if (field === 'user-agent') {
      if (rules.length > 0) flush();
      if (value) agents.push(value);
      continue;
    }

    if ((field === 'allow' || field === 'disallow') && agents.length > 0) {
      // An empty Disallow value means no restriction and contributes no rule.
      if (field === 'disallow' && value === '') continue;
      rules.push({ directive: field, pattern: value });
    }
  }

  flush();
  return groups;
}

function ruleMatchLength(pattern: string, target: string): number | null {
  const normalisedPattern = normaliseUriOctets(pattern);
  const endAnchored = normalisedPattern.endsWith('$');
  const body = endAnchored ? normalisedPattern.slice(0, -1) : normalisedPattern;
  const escaped = body
    .split('*')
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('.*');
  const expression = new RegExp(`^${escaped}${endAnchored ? '$' : ''}`);
  if (!expression.test(normaliseUriOctets(target))) return null;
  return Buffer.byteLength(body.replace(/\*/g, ''), 'utf8');
}

function matchingGroups(groups: RobotsGroup[], userAgent: string): {
  groups: RobotsGroup[];
  matchedAgent: string | null;
} {
  const lowerUserAgent = userAgent.toLowerCase();
  const namedMatches = groups.flatMap((group) =>
    group.agents
      .filter((agent) => agent !== '*' && lowerUserAgent.includes(agent.toLowerCase()))
      .map((agent) => ({ group, agent })),
  );

  if (namedMatches.length > 0) {
    const maximumTokenLength = Math.max(...namedMatches.map(({ agent }) => agent.length));
    const selected = namedMatches.filter(({ agent }) => agent.length === maximumTokenLength);
    return {
      groups: [...new Set(selected.map(({ group }) => group))],
      matchedAgent: selected[0]?.agent ?? null,
    };
  }

  return {
    groups: groups.filter((group) => group.agents.includes('*')),
    matchedAgent: groups.some((group) => group.agents.includes('*')) ? '*' : null,
  };
}

export function resolveRobotsAccess(
  source: string,
  userAgent: string,
  pathAndQuery: string,
): RobotsResolution {
  if (pathAndQuery === '/robots.txt') {
    return { allowed: true, matchedAgent: null, matchedRule: null };
  }

  const selection = matchingGroups(parseRobotsTxt(source), userAgent);
  let winner: { rule: RobotsRule; length: number } | null = null;

  for (const rule of selection.groups.flatMap((group) => group.rules)) {
    const length = ruleMatchLength(rule.pattern, pathAndQuery);
    if (length === null) continue;
    if (
      winner === null ||
      length > winner.length ||
      (length === winner.length && rule.directive === 'allow')
    ) {
      winner = { rule, length };
    }
  }

  return {
    allowed: winner?.rule.directive !== 'disallow',
    matchedAgent: selection.matchedAgent,
    matchedRule: winner?.rule ?? null,
  };
}
