import { existsSync, readdirSync } from 'node:fs'
import { relative, resolve, sep } from 'node:path'
import type { Page } from '@playwright/test'

export interface AgentInteractionState {
  name: string
  setup: (page: Page) => Promise<void>
}

export const MAX_CUMULATIVE_LAYOUT_SHIFT = 0.005
export const ROUTE_BASE_PATH = '/'
export const EXTRA_AGENT_ROUTES: readonly string[] = []
export const WEBMCP_AUTOSUBMIT_TOOL_ALLOWLIST: readonly string[] = []

export const AGENT_INTERACTION_STATES: Readonly<Record<string, readonly AgentInteractionState[]>> = {
  '/': [
    {
      name: 'lenders FAQ open',
      setup: async (page) => {
        await page.evaluate(() => {
          window.location.hash = 'lenders'
        })
        await page.locator('#lenders button').waitFor({ state: 'visible' })
        await page.waitForFunction(() => document.querySelector('#lenders button')?.getAttribute('aria-expanded') === 'true')
      },
    },
    {
      name: 'mobile menu open when available',
      setup: async (page) => {
        const openButton = page.getByRole('button', { name: 'Open menu' })
        if (await openButton.isVisible()) {
          await openButton.click()
          await page.locator('#mobile-menu[open]').waitFor({ state: 'visible' })
        }
      },
    },
  ],
  '/pricing/': [
    {
      name: 'yearly pricing selected',
      setup: async (page) => {
        const yearlyTab = page.getByRole('tab', { name: 'Yearly' }).first()
        await page.waitForFunction(() => {
          const tab = [...document.querySelectorAll<HTMLElement>('[role="tab"]')]
            .find((element) => element.textContent?.trim() === 'Yearly')
          return tab?.closest('astro-island')?.hasAttribute('ssr') === false
        })
        await yearlyTab.click()
        await page.waitForFunction(() => document.querySelector('[role="tab"][aria-selected="true"]')?.textContent?.trim() === 'Yearly')
      },
    },
  ],
}

function normaliseBasePath(basePath: string): string {
  const withLeadingSlash = basePath.startsWith('/') ? basePath : `/${basePath}`
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`
}

function applyBasePath(route: string): string {
  const basePath = normaliseBasePath(ROUTE_BASE_PATH)
  return basePath === '/' ? route : `${basePath.slice(0, -1)}${route}`
}

function htmlFileToRoute(filePath: string, outputDirectory: string): string {
  const relativePath = relative(outputDirectory, filePath).split(sep).join('/')
  if (relativePath === 'index.html') return applyBasePath('/')
  if (relativePath.endsWith('/index.html')) return applyBasePath(`/${relativePath.slice(0, -'index.html'.length)}`)
  return applyBasePath(`/${relativePath}`)
}

function walkHtmlFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = resolve(directory, entry.name)
    if (entry.isDirectory()) return walkHtmlFiles(entryPath)
    return entry.isFile() && entry.name.endsWith('.html') ? [entryPath] : []
  })
}

export function discoverBuiltHtmlRoutes(outputDirectory = resolve(process.cwd(), 'dist')): string[] {
  if (!existsSync(outputDirectory)) throw new Error(`Built output is missing at ${outputDirectory}. Run the production build first.`)
  const routes = walkHtmlFiles(outputDirectory).map((filePath) => htmlFileToRoute(filePath, outputDirectory))
  return [...new Set([...routes, ...EXTRA_AGENT_ROUTES])].sort()
}

export function materialStatesForRoute(route: string): readonly AgentInteractionState[] {
  return AGENT_INTERACTION_STATES[route] ?? []
}

function isLoopbackUrl(rawUrl: string): boolean {
  const url = new URL(rawUrl)
  if (['about:', 'blob:', 'data:'].includes(url.protocol)) return true
  return ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
}

export async function blockExternalRequests(page: Page): Promise<void> {
  const hostedOrigin = process.env.PLAYWRIGHT_BASE_URL
    ? new URL(process.env.PLAYWRIGHT_BASE_URL).origin
    : null

  await page.route('**/*', async (route) => {
    const requestUrl = route.request().url()
    if (isLoopbackUrl(requestUrl) || (hostedOrigin && new URL(requestUrl).origin === hostedOrigin)) await route.continue()
    else await route.abort('blockedbyclient')
  })
}

export async function waitForStableDocument(page: Page): Promise<void> {
  await page.waitForLoadState('domcontentloaded')
  await page.evaluate(async () => {
    if (document.fonts) await document.fonts.ready
  })
}
