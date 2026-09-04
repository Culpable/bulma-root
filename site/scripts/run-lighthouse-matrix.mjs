import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const hosts = [
  { id: 'production', origin: 'https://bulma.com.au' },
  { id: 'staging', origin: 'https://staging.bulma.com.au' },
];
const routes = [
  { id: 'home', path: '/' },
  { id: 'about', path: '/about/' },
  { id: 'pricing', path: '/pricing/' },
  { id: 'contact', path: '/contact/' },
  { id: 'privacy-policy', path: '/privacy-policy/' },
];
const modes = [
  { id: 'mobile', runs: 10, arguments: [] },
  { id: 'desktop', runs: 5, arguments: ['--preset=desktop'] },
];

const outputDirectory = resolve(process.argv[2] ?? 'test-results/lighthouse-step8');
mkdirSync(outputDirectory, { recursive: true });

/** Return the middle value from a sorted numeric sample. */
function median(values) {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

/** Read a completed Lighthouse report so an interrupted matrix can resume safely. */
function readCompletedReport(reportPath) {
  try {
    const report = JSON.parse(readFileSync(reportPath, 'utf8'));
    return report.lighthouseVersion === '13.4.1' ? report : null;
  } catch {
    return null;
  }
}

/** Run Lighthouse in a unique Chrome profile and keep the raw JSON result. */
function runLighthouse({ url, reportPath, extraArguments, categories }) {
  const existingReport = readCompletedReport(reportPath);
  if (existingReport) return existingReport;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const profileDirectory = mkdtempSync(join(tmpdir(), 'bulma-lighthouse-profile-'));
    const result = spawnSync(
      'npx',
      [
        '--yes',
        'lighthouse@13.4.1',
        url,
        `--only-categories=${categories.join(',')}`,
        '--output=json',
        `--output-path=${reportPath}`,
        '--quiet',
        '--chrome-flags',
        `--headless=new --no-sandbox --user-data-dir=${profileDirectory}`,
        ...extraArguments,
      ],
      { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 },
    );

    // Move the disposable browser profile to Trash so failed runs remain recoverable.
    const trashResult = spawnSync('trash', [profileDirectory], { encoding: 'utf8' });
    if (trashResult.status !== 0) {
      throw new Error(`Could not move Lighthouse profile to Trash: ${trashResult.stderr}`);
    }
    if (result.status === 0) return readCompletedReport(reportPath);

    const failureOutput = result.stderr || result.stdout;
    writeFileSync(`${reportPath}.attempt-${attempt}.stderr.txt`, failureOutput, 'utf8');
    if (attempt === 3) {
      throw new Error(`Lighthouse failed three times for ${url}; see ${reportPath}.attempt-3.stderr.txt`);
    }
  }
}

/** Extract the stable performance values used in the release comparison. */
function extractPerformance(report) {
  const auditValue = (id) => report.audits[id].numericValue;
  return {
    score: report.categories.performance.score * 100,
    fcpMs: auditValue('first-contentful-paint'),
    lcpMs: auditValue('largest-contentful-paint'),
    speedIndexMs: auditValue('speed-index'),
    tbtMs: auditValue('total-blocking-time'),
    cls: auditValue('cumulative-layout-shift'),
  };
}

const measurements = [];
let completedRuns = 0;
const totalPerformanceRuns = modes.reduce(
  (total, mode) => total + mode.runs * routes.length * hosts.length,
  0,
);

for (const mode of modes) {
  for (const route of routes) {
    for (let run = 1; run <= mode.runs; run += 1) {
      // Alternate host order on every pair to distribute machine and network drift.
      const orderedHosts = run % 2 === 1 ? hosts : [...hosts].reverse();
      for (const host of orderedHosts) {
        const reportPath = join(
          outputDirectory,
          `${mode.id}-${route.id}-${host.id}-${String(run).padStart(2, '0')}.json`,
        );
        const report = runLighthouse({
          url: new URL(route.path, host.origin).href,
          reportPath,
          extraArguments: mode.arguments,
          categories: ['performance'],
        });
        measurements.push({
          mode: mode.id,
          route: route.path,
          host: host.id,
          run,
          ...extractPerformance(report),
        });
        completedRuns += 1;
        process.stdout.write(`Completed ${completedRuns}/${totalPerformanceRuns} performance reports\n`);
      }
    }
  }
}

const performanceSummary = [];
for (const mode of modes) {
  for (const route of routes) {
    const hostSummaries = {};
    for (const host of hosts) {
      const values = measurements.filter(
        (measurement) =>
          measurement.mode === mode.id &&
          measurement.route === route.path &&
          measurement.host === host.id,
      );
      hostSummaries[host.id] = {};
      for (const metric of ['score', 'fcpMs', 'lcpMs', 'speedIndexMs', 'tbtMs', 'cls']) {
        const sample = values.map((value) => value[metric]);
        hostSummaries[host.id][metric] = {
          median: median(sample),
          min: Math.min(...sample),
          max: Math.max(...sample),
        };
      }
    }

    const deltas = {};
    for (const metric of ['score', 'fcpMs', 'lcpMs', 'speedIndexMs', 'tbtMs', 'cls']) {
      const productionMedian = hostSummaries.production[metric].median;
      const stagingMedian = hostSummaries.staging[metric].median;
      deltas[metric] = {
        absolute: stagingMedian - productionMedian,
        percent: productionMedian === 0
          ? null
          : ((stagingMedian - productionMedian) / productionMedian) * 100,
      };
    }
    performanceSummary.push({ mode: mode.id, route: route.path, ...hostSummaries, deltas });
  }
}

const stagingCategorySummary = [];
for (const route of routes) {
  const reportPath = join(outputDirectory, `staging-categories-${route.id}.json`);
  const report = runLighthouse({
    url: new URL(route.path, hosts[1].origin).href,
    reportPath,
    extraArguments: [],
    categories: ['accessibility', 'best-practices', 'seo', 'agentic-browsing'],
  });
  stagingCategorySummary.push({
    route: route.path,
    accessibility: report.categories.accessibility.score * 100,
    bestPractices: report.categories['best-practices'].score * 100,
    seo: report.categories.seo.score * 100,
    agenticBrowsing: report.categories['agentic-browsing'].score * 100,
  });
  process.stdout.write(`Completed staging category report for ${route.path}\n`);
}

const summary = {
  lighthouseVersion: '13.4.1',
  generatedAt: new Date().toISOString(),
  performanceReportCount: measurements.length,
  stagingCategoryReportCount: stagingCategorySummary.length,
  performanceSummary,
  stagingCategorySummary,
};
writeFileSync(join(outputDirectory, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
process.stdout.write(`Wrote ${join(outputDirectory, 'summary.json')}\n`);
