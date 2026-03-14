import { expect, test } from '@playwright/test';

const FIXED_NOW = Date.UTC(2026, 2, 14, 12, 0, 0, 0);
const WINDOW_START = FIXED_NOW - 6 * 60 * 60 * 1000;
const WINDOW_END = FIXED_NOW + 6 * 60 * 60 * 1000;

const freezeClockScript = `
(() => {
  const fixedNow = ${FIXED_NOW};
  const RealDate = Date;
  class MockDate extends RealDate {
    constructor(...args) {
      if (args.length === 0) {
        super(fixedNow);
      } else {
        super(...args);
      }
    }
    static now() {
      return fixedNow;
    }
  }
  Date = MockDate;
})();
`;

test('golden path: timeline playback/scrub/mutation uses split endpoints and stays interactive', async ({ page, request }) => {
  const suffix = String(Date.now());
  const projectSlug = `golden-path-${suffix}`;

  const projectRes = await request.post('/api/projects', {
    data: {
      title: 'Golden Path Project',
      slug: projectSlug
    }
  });
  expect(projectRes.ok()).toBe(true);
  const projectPayload = (await projectRes.json()) as { ok: true; data: { id: string } };
  const projectId = projectPayload.data.id;

  const createItem = async (input: Record<string, unknown>) => {
    const response = await request.post('/api/items', { data: input });
    expect(response.ok()).toBe(true);
    return (await response.json()) as { ok: true; data: { id: string } };
  };

  await createItem({
    title: 'Golden Planned A',
    projectId,
    status: 'active',
    scheduledAt: FIXED_NOW + 30 * 60 * 1000,
    dueAt: FIXED_NOW + 60 * 60 * 1000
  });
  await createItem({
    title: 'Golden Planned B',
    projectId,
    status: 'active',
    dueAt: FIXED_NOW + 2 * 60 * 60 * 1000
  });
  await createItem({
    title: 'Golden Interruption',
    projectId,
    status: 'active',
    isInterruption: true
  });

  const counters = {
    structure: 0,
    summary: 0,
    monolith: 0
  };
  const summaryBucketKeys = new Set<string>();
  let summaryAbortCount = 0;

  await page.route('**/api/timeline/summary**', async (route) => {
    await page.waitForTimeout(300);
    await route.continue();
  });

  page.on('request', (requestEvent) => {
    const url = new URL(requestEvent.url());
    if (url.pathname === '/api/timeline') {
      counters.monolith += 1;
    }
  });

  page.on('requestfailed', (requestEvent) => {
    const url = new URL(requestEvent.url());
    if (url.pathname !== '/api/timeline/summary') return;
    const failure = requestEvent.failure();
    if (!failure?.errorText) return;
    if (failure.errorText.toLowerCase().includes('abort')) {
      summaryAbortCount += 1;
    }
  });

  page.on('response', (response) => {
    if (!response.ok()) return;

    const url = new URL(response.url());
    if (url.pathname === '/api/timeline/structure') {
      counters.structure += 1;
      return;
    }

    if (url.pathname === '/api/timeline/summary') {
      counters.summary += 1;
      const bucketStart = url.searchParams.get('bucketStart');
      const bucketEnd = url.searchParams.get('bucketEnd');
      if (bucketStart && bucketEnd) {
        summaryBucketKeys.add(`${bucketStart}:${bucketEnd}`);
      }
    }
  });

  await page.addInitScript(freezeClockScript);

  await page.goto(
    `/timeline?zoom=day&mode=dual&windowStart=${WINDOW_START}&windowEnd=${WINDOW_END}&playheadTs=${FIXED_NOW}`
  );

  await expect(page.getByRole('heading', { level: 1, name: 'Timeline' })).toBeVisible();

  await expect.poll(() => counters.structure).toBe(1);
  await expect.poll(() => counters.summary).toBeGreaterThanOrEqual(1);

  const playheadLabelBefore = await page.getByText(/^Playhead /).first().textContent();

  await page.getByRole('button', { name: 'Play' }).click();
  await page.waitForTimeout(2200);
  await page.getByRole('button', { name: 'Pause' }).click();
  await page.getByRole('button', { name: /Step \+/ }).click();

  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('Space');
  await page.waitForTimeout(400);
  await page.keyboard.press('Space');

  await expect.poll(() => counters.summary).toBeGreaterThan(2);
  await expect.poll(() => summaryBucketKeys.size).toBeGreaterThan(1);

  const playheadLabelAfter = await page.getByText(/^Playhead /).first().textContent();
  expect(playheadLabelAfter).not.toBe(playheadLabelBefore);

  await page.evaluate(() => {
    const scrubber = document.querySelector<HTMLInputElement>('input[aria-label="Timeline playhead scrubber"]');
    if (!scrubber) return;
    const min = Number(scrubber.min);
    const max = Number(scrubber.max);
    const step = Number(scrubber.step || '1');

    for (let index = 0; index < 24; index += 1) {
      const next = Math.min(max, min + step * (index + 1));
      scrubber.value = String(next);
      scrubber.dispatchEvent(new Event('input', { bubbles: true }));
      scrubber.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });

  await expect.poll(() => summaryAbortCount).toBeGreaterThan(0);

  expect(counters.monolith).toBe(0);
  expect(counters.structure).toBe(1);

  const summaryCountBeforeMutation = counters.summary;
  const structureCountBeforeMutation = counters.structure;

  const doneActionButton = page.getByRole('button', { name: 'Done' }).first();
  await expect(doneActionButton).toBeVisible();
  await doneActionButton.click();

  await expect.poll(() => counters.summary).toBeGreaterThan(summaryCountBeforeMutation);
  await expect.poll(() => counters.structure).toBeLessThanOrEqual(structureCountBeforeMutation + 2);

  expect(counters.structure).toBeLessThanOrEqual(3);
  expect(counters.summary).toBeLessThanOrEqual(30);

  await expect(page.getByRole('heading', { level: 1, name: 'Timeline' })).toBeVisible();
  await expect(page.getByText('Failed to load timeline.')).toHaveCount(0);
  await expect(page.locator('.animate-pulse')).toHaveCount(0);
});
