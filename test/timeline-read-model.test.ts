import { afterEach, describe, expect, it } from 'vitest';
import { ulid } from 'ulid';
import { TimelineReadModel } from '../src/domain/timeline-read-model';
import type { Item, ItemRowDto, Project } from '../src/domain/types';
import { EventRepository } from '../src/repositories/event-repository';
import { ItemRepository } from '../src/repositories/item-repository';
import { PreferenceRepository } from '../src/repositories/preference-repository';
import { ProjectRepository } from '../src/repositories/project-repository';
import { createTestDb, type TestDb } from './test-db';

let activeDb: TestDb | undefined;

afterEach(async () => {
  if (activeDb) {
    await activeDb.close();
    activeDb = undefined;
  }
});

const HOUR_MS = 60 * 60 * 1000;

const makeProject = (createdAt: number): Project => ({
  id: ulid(),
  slug: `timeline-read-model-${createdAt}`,
  title: 'Timeline Read Model',
  descriptionMd: '',
  status: 'active',
  colorToken: undefined,
  icon: undefined,
  orderKey: ulid(),
  createdAt,
  updatedAt: createdAt,
  archivedAt: undefined,
  deletedAt: undefined
});

const makeItem = (input: {
  id?: string;
  projectId?: string;
  title: string;
  status: Item['status'];
  createdAt: number;
  scheduledAt?: number;
  dueAt?: number;
  priority?: Item['priority'];
  isInterruption?: boolean;
}): Item => ({
  id: input.id ?? ulid(),
  projectId: input.projectId,
  parentItemId: undefined,
  kind: 'task',
  title: input.title,
  descriptionMd: '',
  status: input.status,
  priority: input.priority ?? 2,
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

const toRow = (item: Item, now: number): ItemRowDto => ({
  id: item.id,
  title: item.title,
  kind: item.kind,
  status: item.status,
  priority: item.priority,
  project: item.projectId
    ? {
        id: item.projectId,
        title: 'Timeline Read Model',
        slug: 'timeline-read-model'
      }
    : undefined,
  tags: [],
  dueAt: item.dueAt,
  scheduledAt: item.scheduledAt,
  requestedBy: item.requestedBy,
  isInterruption: item.isInterruption,
  hasLinks: false,
  attachmentCount: 0,
  childCount: 0,
  isOverdue: Boolean(item.dueAt && item.dueAt < now && !['done', 'canceled'].includes(item.status))
});

const setup = async () => {
  activeDb = createTestDb();
  const db = activeDb.runtime.db;
  const now = Date.UTC(2026, 2, 16, 12, 0, 0, 0);
  const projectRepo = new ProjectRepository(db);
  const itemRepo = new ItemRepository(db);
  const eventRepo = new EventRepository(db);
  const prefRepo = new PreferenceRepository(db);

  const project = makeProject(now - 24 * HOUR_MS);
  await projectRepo.insert(project);

  const plannedItem = makeItem({
    projectId: project.id,
    title: 'Planned Item',
    status: 'active',
    priority: 4,
    createdAt: now - 3 * HOUR_MS,
    scheduledAt: now + HOUR_MS
  });
  const interruptionItem = makeItem({
    projectId: project.id,
    title: 'Interruption Item',
    status: 'active',
    createdAt: now - 2 * HOUR_MS,
    isInterruption: true
  });
  const realityItem = makeItem({
    projectId: project.id,
    title: 'Reality Item',
    status: 'active',
    createdAt: now - HOUR_MS
  });

  for (const item of [plannedItem, interruptionItem, realityItem]) {
    await itemRepo.insert(item);
  }

  await eventRepo.insert({
    id: ulid(),
    itemId: interruptionItem.id,
    commandId: ulid(),
    eventType: 'item.created',
    payloadJson: {},
    occurredAt: now - 30 * 60 * 1000
  });
  await eventRepo.insert({
    id: ulid(),
    itemId: realityItem.id,
    commandId: ulid(),
    eventType: 'item.updated',
    payloadJson: {},
    occurredAt: now + 20 * 60 * 1000
  });

  const itemById = new Map([plannedItem, interruptionItem, realityItem].map((item) => [item.id, item]));

  const readModel = new TimelineReadModel({
    db,
    timezone: 'UTC',
    getUserPreference: () => prefRepo.getOrCreateDefault('UTC'),
    rowsForItemIds: async (itemIds, rowNow) =>
      itemIds
        .map((id) => itemById.get(id))
        .filter((item): item is Item => Boolean(item))
        .map((item) => toRow(item, rowNow))
  });

  return { readModel, now };
};

describe('timeline read model parity', () => {
  it('returns deterministic structure for the same scope inputs', async () => {
    const { readModel, now } = await setup();
    const input = {
      zoom: 'day' as const,
      mode: 'dual' as const,
      now,
      windowStart: now - 6 * HOUR_MS,
      windowEnd: now + 6 * HOUR_MS
    };

    const [a, b] = await Promise.all([readModel.getStructure(input), readModel.getStructure(input)]);

    expect(a.windowStart).toBe(b.windowStart);
    expect(a.windowEnd).toBe(b.windowEnd);
    expect(a.lanes).toEqual(b.lanes);
    expect(a.moments).toEqual(b.moments);
  });

  it('keeps summary deterministic within a bucket and transitions across boundaries', async () => {
    const { readModel, now } = await setup();
    const structure = await readModel.getStructure({
      zoom: 'day',
      mode: 'dual',
      now,
      windowStart: now - 6 * HOUR_MS,
      windowEnd: now + 6 * HOUR_MS
    });
    const activePlanBucket = structure.lanes
      .find((lane) => lane.key === 'plan')
      ?.buckets.find((bucket) => bucket.count > 0);

    expect(activePlanBucket).toBeDefined();
    if (!activePlanBucket) return;

    const [summaryA, summaryB] = await Promise.all([
      readModel.getSummary({
        zoom: 'day',
        now,
        windowStart: structure.windowStart,
        windowEnd: structure.windowEnd,
        bucketStart: activePlanBucket.start,
        bucketEnd: activePlanBucket.end,
        playheadTs: activePlanBucket.start + 1_000
      }),
      readModel.getSummary({
        zoom: 'day',
        now,
        windowStart: structure.windowStart,
        windowEnd: structure.windowEnd,
        bucketStart: activePlanBucket.start,
        bucketEnd: activePlanBucket.end,
        playheadTs: activePlanBucket.end - 1_000
      })
    ]);

    expect(summaryA.bucketIdentity).toBe(summaryB.bucketIdentity);
    expect(summaryA.counts).toEqual(summaryB.counts);

    const boundarySummary = await readModel.getSummary({
      zoom: 'day',
      now,
      windowStart: structure.windowStart,
      windowEnd: structure.windowEnd,
      playheadTs: structure.windowEnd
    });

    expect(boundarySummary.bucketStart).toBeGreaterThanOrEqual(structure.windowStart);
    expect(boundarySummary.bucketEnd).toBeLessThanOrEqual(structure.windowEnd);
  });

  it('rejects invalid bucket selections with validation error', async () => {
    const { readModel, now } = await setup();
    const structure = await readModel.getStructure({
      zoom: 'day',
      mode: 'dual',
      now,
      windowStart: now - 6 * HOUR_MS,
      windowEnd: now + 6 * HOUR_MS
    });
    const bucket = structure.lanes[0]?.buckets[0];
    expect(bucket).toBeDefined();
    if (!bucket) return;

    await expect(
      readModel.getSummary({
        zoom: 'day',
        now,
        windowStart: structure.windowStart,
        windowEnd: structure.windowEnd,
        bucketStart: bucket.start + 1,
        bucketEnd: bucket.end + 1
      })
    ).rejects.toThrowError(/Invalid timeline bucket selection/);
  });
});
