import { afterEach, describe, expect, it } from 'vitest';
import { ulid } from 'ulid';
import { TaskioService } from '../src/domain/taskio-service';
import type { Item } from '../src/domain/types';
import { EventRepository } from '../src/repositories/event-repository';
import { ItemRepository } from '../src/repositories/item-repository';
import { createTestDb, type TestDb } from './test-db';

const HOUR_MS = 60 * 60 * 1000;

let activeDb: TestDb | undefined;

afterEach(async () => {
  if (activeDb) {
    await activeDb.close();
    activeDb = undefined;
  }
});

const setup = async () => {
  activeDb = createTestDb();
  const service = new TaskioService({ db: activeDb.runtime.db, timezone: 'UTC' });
  const project = await service.createProject({ title: 'Timeline Repo', slug: 'timeline-repo' });
  const itemRepo = new ItemRepository(activeDb.runtime.db);
  const eventRepo = new EventRepository(activeDb.runtime.db);
  return { service, project, itemRepo, eventRepo };
};

const makeItem = (input: {
  id?: string;
  projectId?: string;
  title: string;
  status: Item['status'];
  createdAt: number;
  scheduledAt?: number;
  dueAt?: number;
  isInterruption?: boolean;
}): Item => ({
  id: input.id ?? ulid(),
  projectId: input.projectId,
  parentItemId: undefined,
  kind: 'task',
  title: input.title,
  descriptionMd: '',
  status: input.status,
  priority: 2,
  orderKey: ulid(),
  scheduledAt: input.scheduledAt,
  dueAt: input.dueAt,
  completedAt: undefined,
  snoozedUntil: undefined,
  requestedBy: undefined,
  isInterruption: input.isInterruption ?? false,
  sourceKind: 'manual',
  sourceRef: undefined,
  createdAt: input.createdAt,
  updatedAt: input.createdAt,
  deletedAt: undefined
});

describe('timeline repository aggregation', () => {
  it('returns per-bucket counts for plan/reality/overdue/interruptions', async () => {
    const { project, itemRepo, eventRepo } = await setup();
    const windowStart = Date.UTC(2026, 2, 14, 0, 0, 0, 0);
    const windowEnd = windowStart + 4 * HOUR_MS;
    const bucketSizeMs = HOUR_MS;
    const bucketCount = 4;

    const plannedA = makeItem({
      projectId: project.id,
      title: 'Planned A',
      status: 'active',
      createdAt: windowStart - 2 * HOUR_MS,
      scheduledAt: windowStart + 10 * 60 * 1000
    });
    const plannedB = makeItem({
      projectId: project.id,
      title: 'Planned B',
      status: 'active',
      createdAt: windowStart - 2 * HOUR_MS,
      dueAt: windowStart + 2 * HOUR_MS + 5 * 60 * 1000
    });
    const overdueA = makeItem({
      projectId: project.id,
      title: 'Overdue A',
      status: 'active',
      createdAt: windowStart - 2 * HOUR_MS,
      dueAt: windowStart - 30 * 60 * 1000
    });
    const overdueB = makeItem({
      projectId: project.id,
      title: 'Overdue B',
      status: 'active',
      createdAt: windowStart - 2 * HOUR_MS,
      dueAt: windowStart + 90 * 60 * 1000
    });
    const interruption = makeItem({
      projectId: project.id,
      title: 'Interruption',
      status: 'active',
      createdAt: windowStart + 2 * HOUR_MS + 10 * 60 * 1000,
      isInterruption: true
    });
    const realityOnly = makeItem({
      projectId: project.id,
      title: 'Reality Only',
      status: 'active',
      createdAt: windowStart - HOUR_MS
    });

    for (const item of [plannedA, plannedB, overdueA, overdueB, interruption, realityOnly]) {
      await itemRepo.insert(item);
    }

    await eventRepo.insert({
      id: ulid(),
      itemId: plannedA.id,
      commandId: ulid(),
      eventType: 'item.updated',
      payloadJson: {},
      occurredAt: windowStart + 20 * 60 * 1000
    });
    await eventRepo.insert({
      id: ulid(),
      itemId: plannedB.id,
      commandId: ulid(),
      eventType: 'item.completed',
      payloadJson: {},
      occurredAt: windowStart + 2 * HOUR_MS + 10 * 60 * 1000
    });
    await eventRepo.insert({
      id: ulid(),
      itemId: realityOnly.id,
      commandId: ulid(),
      eventType: 'item.created',
      payloadJson: {},
      occurredAt: windowStart + 2 * HOUR_MS + 30 * 60 * 1000
    });

    const scope = {
      projectIds: [project.id],
      includeUnprojected: false
    };

    const [planCounts, realityCounts, overdueCounts, interruptionItemCounts, createdEventCounts] = await Promise.all([
      itemRepo.countTimelinePlanByBucket({ ...scope, windowStart, windowEnd, bucketSizeMs, bucketCount }),
      eventRepo.countTimelineByBucket({
        ...scope,
        windowStart,
        windowEnd,
        bucketSizeMs,
        bucketCount,
        eventTypes: ['item.updated', 'item.completed', 'item.created']
      }),
      itemRepo.countTimelineOpenDueByBucket({ ...scope, windowStart, windowEnd, bucketSizeMs, bucketCount }),
      itemRepo.countTimelineInterruptionsByBucket({ ...scope, windowStart, windowEnd, bucketSizeMs, bucketCount }),
      eventRepo.countTimelineByBucket({
        ...scope,
        windowStart,
        windowEnd,
        bucketSizeMs,
        bucketCount,
        eventTypes: ['item.created']
      })
    ]);

    expect(planCounts.get(0)).toBe(1);
    expect(planCounts.get(2)).toBe(1);
    expect(realityCounts.get(0)).toBe(1);
    expect(realityCounts.get(2)).toBe(2);
    expect(overdueCounts.get(0)).toBe(1);
    expect(overdueCounts.get(1)).toBe(2);
    expect(overdueCounts.get(2)).toBe(3);
    expect(overdueCounts.get(3)).toBe(3);
    expect(interruptionItemCounts.get(2)).toBe(1);
    expect(createdEventCounts.get(2)).toBe(1);
  });

  it('uses timeline indexes for critical query shapes', async () => {
    const { project } = await setup();
    const sqlite = activeDb!.runtime.sqlite;
    const windowStart = Date.UTC(2026, 2, 14, 0, 0, 0, 0);
    const windowEnd = windowStart + 4 * HOUR_MS;

    const plan = sqlite
      .prepare(
        `
          EXPLAIN QUERY PLAN
          SELECT id
          FROM items
          WHERE deleted_at IS NULL
            AND project_id = ?
            AND scheduled_at >= ?
            AND scheduled_at < ?
        `
      )
      .all(project.id, windowStart, windowEnd) as Array<{ detail: string }>;

    const due = sqlite
      .prepare(
        `
          EXPLAIN QUERY PLAN
          SELECT id
          FROM items
          WHERE deleted_at IS NULL
            AND project_id = ?
            AND status IN ('inbox', 'active', 'blocked', 'waiting')
            AND due_at IS NOT NULL
            AND due_at < ?
        `
      )
      .all(project.id, windowEnd) as Array<{ detail: string }>;

    const events = sqlite
      .prepare(
        `
          EXPLAIN QUERY PLAN
          SELECT item_events.id
          FROM item_events
          JOIN items ON items.id = item_events.item_id
          WHERE item_events.event_type IN ('item.created', 'item.updated')
            AND item_events.occurred_at >= ?
            AND item_events.occurred_at < ?
            AND items.project_id = ?
        `
      )
      .all(windowStart, windowEnd, project.id) as Array<{ detail: string }>;

    expect(plan.some((row) => row.detail.includes('idx_items_timeline_plan_scheduled'))).toBe(true);
    expect(due.some((row) => row.detail.includes('idx_items_timeline_due_open'))).toBe(true);
    expect(events.some((row) => row.detail.includes('idx_item_events_timeline_type_window_item'))).toBe(true);
  });
});
