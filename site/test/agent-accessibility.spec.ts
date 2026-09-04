import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { AGENT_ACCESSIBILITY_RULES } from "./agent-accessibility.rules";
import {
  MAX_CUMULATIVE_LAYOUT_SHIFT,
  blockExternalRequests,
  discoverBuiltHtmlRoutes,
  materialStatesForRoute,
  waitForStableDocument,
} from "./agent-accessibility.routes";

interface LayoutShiftEntry {
  startTime: number;
  value: number;
  sources: Array<{
    node: string | null;
    previousRect: DOMRectInit;
    currentRect: DOMRectInit;
  }>;
}

declare global {
  interface Window {
    __agentLayoutShifts?: LayoutShiftEntry[];
  }
}

async function installLayoutShiftObserver(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.__agentLayoutShifts = [];

    new PerformanceObserver((list) => {
      for (const performanceEntry of list.getEntries()) {
        const entry = performanceEntry as PerformanceEntry & {
          hadRecentInput: boolean;
          value: number;
          sources?: Array<{ node?: Element; previousRect: DOMRectReadOnly; currentRect: DOMRectReadOnly }>;
        };
        if (!entry.hadRecentInput) {
          window.__agentLayoutShifts?.push({
            startTime: entry.startTime,
            value: entry.value,
            sources: (entry.sources ?? []).map((source) => ({
              node: source.node
                ? `${source.node.tagName.toLowerCase()}#${source.node.id}.${[...source.node.classList].slice(0, 3).join('.')}`
                : null,
              previousRect: source.previousRect.toJSON(),
              currentRect: source.currentRect.toJSON(),
            })),
          });
        }
      }
    }).observe({ type: "layout-shift", buffered: true });
  });
}

async function readCumulativeLayoutShift(page: Page): Promise<{ value: number; entries: LayoutShiftEntry[] }> {
  return page.evaluate(() => {
    const entries = [...(window.__agentLayoutShifts ?? [])].sort(
      (left, right) => left.startTime - right.startTime,
    );
    let maximumSessionValue = 0;
    let currentSessionValue = 0;
    let firstEntryTime: number | undefined;
    let previousEntryTime: number | undefined;

    for (const entry of entries) {
      const startsNewSession =
        firstEntryTime === undefined ||
        previousEntryTime === undefined ||
        entry.startTime - previousEntryTime > 1_000 ||
        entry.startTime - firstEntryTime > 5_000;

      if (startsNewSession) {
        firstEntryTime = entry.startTime;
        currentSessionValue = entry.value;
      } else {
        currentSessionValue += entry.value;
      }

      previousEntryTime = entry.startTime;
      maximumSessionValue = Math.max(maximumSessionValue, currentSessionValue);
    }

    return { value: maximumSessionValue, entries };
  });
}

function formatViolations(
  violations: Awaited<ReturnType<AxeBuilder["analyze"]>>["violations"],
): string {
  return violations
    .flatMap((violation) =>
      violation.nodes.map((node) =>
        [
          `${violation.id}: ${violation.help}`,
          `target: ${node.target.join(", ")}`,
          `html: ${node.html}`,
          ...(node.failureSummary ?? "").split("\n"),
        ].join("\n"),
      ),
    )
    .join("\n\n");
}

async function scanCurrentState(page: Page, assertLayoutShift: boolean): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withRules([...AGENT_ACCESSIBILITY_RULES])
    .analyze();

  expect(results.violations, formatViolations(results.violations)).toEqual([]);
  if (assertLayoutShift) {
    const layoutShift = await readCumulativeLayoutShift(page);
    expect(
      layoutShift.value,
      `Layout shift evidence:\n${JSON.stringify(layoutShift.entries, null, 2)}`,
    ).toBeLessThanOrEqual(MAX_CUMULATIVE_LAYOUT_SHIFT);
  }
}

for (const route of discoverBuiltHtmlRoutes()) {
  const states = [
    { name: "initial", setup: async (_page: Page) => undefined },
    ...materialStatesForRoute(route),
  ];

  for (const state of states) {
    test(`${route} exposes an agent-operable ${state.name} state`, async ({ page }) => {
      await installLayoutShiftObserver(page);
      await blockExternalRequests(page);
      await page.goto(route, { waitUntil: "load" });
      await waitForStableDocument(page);
      await state.setup(page);
      // Measure navigation CLS once per route; interaction states intentionally change layout.
      await scanCurrentState(page, state.name === "initial");
    });
  }
}
