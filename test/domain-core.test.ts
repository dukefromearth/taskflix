import { afterEach, describe, expect, it } from 'vitest';
import { generateOrderKeyBetween } from '../src/domain/order-key';
import { canTransitionStatus } from '../src/domain/status';
import { normalizeTagName } from '../src/domain/tag';
import { buildTimelineBuckets } from '../src/domain/time';
import { TaskioService } from '../src/domain/taskio-service';
import { createTestDb, type TestDb } from './test-db';

let activeDb: TestDb | undefined;

afterEach(async () => {
  if (activeDb) {
    await activeDb.close();
    activeDb = undefined;
  }
});

const createService = (): TaskioService => {
  activeDb = createTestDb();
  return new TaskioService({ db: activeDb.runtime.db, timezone: 'UTC' });
};

describe('tag normalization', () => {
  it('normalizes path-like tags', () => {
    expect(normalizeTagName(' Work / API-Research ')).toBe('work/api-research');
  });

  it('rejects invalid segments', () => {
    expect(() => normalizeTagName('work/$bad')).toThrowError(/Invalid tag segment/);
  });
});

describe('status transitions', () => {
  it('allows documented transitions', () => {
    expect(canTransitionStatus('inbox', 'active')).toBe(true);
    expect(canTransitionStatus('done', 'active')).toBe(true);
  });

  it('rejects invalid transitions', () => {
    expect(canTransitionStatus('done', 'blocked')).toBe(false);
    expect(canTransitionStatus('canceled', 'done')).toBe(false);
  });
});

describe('order keys', () => {
  it('generates keys across bounded and open ranges', () => {
    const between = generateOrderKeyBetween('a', 'b');
    expect(between > 'a' && between < 'b').toBe(true);
    expect(generateOrderKeyBetween(undefined, 'b') < 'b').toBe(true);
    expect(generateOrderKeyBetween('b', undefined) > 'b').toBe(true);
  });
});

describe('service view/query behavior', () => {
  it('builds timeline buckets for each zoom level', () => {
    const start = Date.UTC(2026, 2, 1, 0, 0, 0, 0);
    const end = Date.UTC(2026, 2, 8, 0, 0, 0, 0);
    const zooms = ['day', 'week', 'month', 'quarter', 'year', 'all'] as const;

    for (const zoom of zooms) {
      const buckets = buildTimelineBuckets({
        zoom,
        windowStart: start,
        windowEnd: end,
        timezone: 'UTC'
      });
      expect(buckets.length).toBeGreaterThan(0);
      expect(buckets[0]!.start).toBe(start);
      expect(buckets[buckets.length - 1]!.end).toBe(end);
    }
  });

  it('builds Today sections and overdue signals', async () => {
    const service = createService();
    const now = Date.UTC(2026, 2, 14, 12, 0, 0, 0);

    const project = await service.createProject({ title: 'Core', slug: 'core' });
    await service.createItem({ title: 'Triage me', status: 'inbox', projectId: project.id });
    await service.createItem({ title: 'Overdue', status: 'active', projectId: project.id, dueAt: now - 3600_000 });
    await service.createItem({ title: 'Today scheduled', status: 'active', projectId: project.id, scheduledAt: now + 3600_000 });
    await service.createItem({ title: 'In progress no date', status: 'active', projectId: project.id });

    const today = await service.getTodayView(now);
    expect(today.sections.find((s) => s.key === 'triage')?.count).toBe(1);
    expect(today.sections.find((s) => s.key === 'overdue')?.count).toBe(1);
    expect(today.sections.find((s) => s.key === 'today')?.count).toBe(1);
    expect(today.sections.find((s) => s.key === 'inProgress')?.count).toBe(1);
  });

  it('enforces safe link schemes', async () => {
    const service = createService();
    const item = await service.createItem({ title: 'Link holder' });

    await expect(service.addLink(item.id, { url: 'javascript:alert(1)' })).rejects.toThrowError(/scheme/);
    expect((await service.addLink(item.id, { url: 'https://example.com/a' })).url).toContain('https://');
  });

  it('searches title, tags, and extracted attachment text', async () => {
    const service = createService();
    const itemA = await service.createItem({ title: 'Prepare API design notes', descriptionMd: 'Domain contracts' });
    await service.addTagToItem(itemA.id, 'theme/api');

    const itemB = await service.createItem({ title: 'Attach spec' });
    const attachment = await service.addAttachment({
      itemId: itemB.id,
      storageKey: 'x',
      originalName: 'spec.txt',
      mimeType: 'text/plain',
      sizeBytes: 3,
      sha256: 'abc'
    });
    await service.setAttachmentContent(attachment.id, 'contains roadmap milestone text');

    expect((await service.search('design'))[0]?.item.id).toBe(itemA.id);
    expect((await service.search('theme/api'))[0]?.item.id).toBe(itemA.id);
    expect((await service.search('roadmap'))[0]?.item.id).toBe(itemB.id);
  });

});
