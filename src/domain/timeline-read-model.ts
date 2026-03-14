import type { TimelineBucket } from './time';
import {
  buildBucketsForTimeline,
  bucketFromPlayhead,
  bucketFromRange,
  normalizeTimelineInput,
  timelineBucketIdentity
} from './timeline-engine';
import { DomainError } from './errors';
import type {
  ItemEvent,
  ItemRowDto,
  TimelineMode,
  TimelineStructureDto,
  TimelineSummaryDto,
  TimelineZoom,
  UserPreference
} from './types';
import { EventRepository } from '../repositories/event-repository';
import { ItemRepository } from '../repositories/item-repository';
import { PreferenceRepository } from '../repositories/preference-repository';
import { ProjectRepository } from '../repositories/project-repository';
import type { DbExecutor } from '../repositories/repository-types';

export type TimelineStructureInput = {
  zoom?: TimelineZoom;
  mode?: TimelineMode;
  windowStart?: number;
  windowEnd?: number;
  projectIds?: string[];
  now?: number;
};

export type TimelineSummaryInput = Omit<TimelineStructureInput, 'mode'> & {
  playheadTs?: number;
  bucketStart?: number;
  bucketEnd?: number;
};

type TimelineScope = {
  now: number;
  timezone: string;
  zoom: TimelineZoom;
  mode: TimelineMode;
  windowStart: number;
  windowEnd: number;
  projectIds: string[];
  includeUnprojected: boolean;
  hasExplicitProjectScope: boolean;
};

type TimelineReadModelDeps = {
  db: DbExecutor;
  timezone: string;
  getUserPreference: () => Promise<UserPreference>;
  rowsForItemIds: (itemIds: string[], now: number) => Promise<ItemRowDto[]>;
  logTiming?: (operation: string, startedAt: number, extra?: Record<string, unknown>) => void;
};

const TIMELINE_REALITY_EVENT_TYPES: ItemEvent['eventType'][] = [
  'item.created',
  'item.updated',
  'item.statusChanged',
  'item.scheduled',
  'item.dueChanged',
  'item.completed',
  'item.reopened',
  'item.moved',
  'item.reordered'
];

export class TimelineReadModel {
  private readonly deps: TimelineReadModelDeps;

  constructor(deps: TimelineReadModelDeps) {
    this.deps = deps;
  }

  async getStructure(input: TimelineStructureInput = {}): Promise<TimelineStructureDto> {
    const startedAt = Date.now();
    const scope = await this.resolveScope(input);
    const buckets = buildBucketsForTimeline({
      zoom: scope.zoom,
      windowStart: scope.windowStart,
      windowEnd: scope.windowEnd,
      timezone: scope.timezone
    });
    const bucketCount = Math.max(1, buckets.length);
    const bucketSizeMs = this.bucketSizeMs(buckets, scope.windowStart, scope.windowEnd);
    const repos = this.createRepositories();

    const [planCounts, realityCounts, overdueCounts, interruptionItemCounts, interruptionEventCounts] = await Promise.all([
      repos.items.countTimelinePlanByBucket({
        windowStart: scope.windowStart,
        windowEnd: scope.windowEnd,
        bucketSizeMs,
        bucketCount,
        projectIds: scope.projectIds,
        includeUnprojected: scope.includeUnprojected
      }),
      repos.events.countTimelineByBucket({
        windowStart: scope.windowStart,
        windowEnd: scope.windowEnd,
        bucketSizeMs,
        bucketCount,
        eventTypes: TIMELINE_REALITY_EVENT_TYPES,
        projectIds: scope.projectIds,
        includeUnprojected: scope.includeUnprojected
      }),
      repos.items.countTimelineOpenDueByBucket({
        windowStart: scope.windowStart,
        windowEnd: scope.windowEnd,
        bucketSizeMs,
        bucketCount,
        projectIds: scope.projectIds,
        includeUnprojected: scope.includeUnprojected
      }),
      repos.items.countTimelineInterruptionsByBucket({
        windowStart: scope.windowStart,
        windowEnd: scope.windowEnd,
        bucketSizeMs,
        bucketCount,
        projectIds: scope.projectIds,
        includeUnprojected: scope.includeUnprojected
      }),
      repos.events.countTimelineByBucket({
        windowStart: scope.windowStart,
        windowEnd: scope.windowEnd,
        bucketSizeMs,
        bucketCount,
        eventTypes: ['item.created'],
        projectIds: scope.projectIds,
        includeUnprojected: scope.includeUnprojected
      })
    ]);

    const planLane = this.buildLane('plan', 'Plan', buckets, planCounts);
    const realityLane = this.buildLane('reality', 'Reality', buckets, realityCounts);
    const overdueLane = this.buildLane('overduePressure', 'Overdue Pressure', buckets, overdueCounts);
    const interruptionLane = this.buildLane('interruptions', 'Interruptions', buckets, interruptionItemCounts, interruptionEventCounts);

    const moments = [
      ...planLane.buckets.map((bucket) => ({ ts: bucket.start, label: `Plan · ${bucket.label}`, kind: 'plan' as const, count: bucket.count })),
      ...realityLane.buckets.map((bucket) => ({ ts: bucket.start, label: `Reality · ${bucket.label}`, kind: 'reality' as const, count: bucket.count })),
      ...overdueLane.buckets.map((bucket) => ({ ts: bucket.start, label: `Overdue · ${bucket.label}`, kind: 'overdue' as const, count: bucket.count })),
      ...interruptionLane.buckets.map((bucket) => ({
        ts: bucket.start,
        label: `Interruptions · ${bucket.label}`,
        kind: 'interruption' as const,
        count: bucket.count
      }))
    ]
      .filter((moment) => moment.count > 0)
      .sort((a, b) => b.count - a.count || a.ts - b.ts)
      .slice(0, 24);

    this.deps.logTiming?.('timeline.structure', startedAt, {
      bucketCount: buckets.length,
      projectScopeSize: scope.projectIds.length,
      includeUnprojected: scope.includeUnprojected
    });

    return {
      now: scope.now,
      timezone: scope.timezone,
      zoom: scope.zoom,
      mode: scope.mode,
      windowStart: scope.windowStart,
      windowEnd: scope.windowEnd,
      projectIds: scope.hasExplicitProjectScope ? scope.projectIds : undefined,
      lanes: [planLane, realityLane, overdueLane, interruptionLane],
      moments
    };
  }

  async getSummary(input: TimelineSummaryInput = {}): Promise<TimelineSummaryDto> {
    const startedAt = Date.now();
    const hasBucketStart = input.bucketStart !== undefined;
    const hasBucketEnd = input.bucketEnd !== undefined;
    if (hasBucketStart !== hasBucketEnd) {
      throw new DomainError('validation', 'bucketStart and bucketEnd must both be provided together', {
        bucketStart: input.bucketStart,
        bucketEnd: input.bucketEnd
      });
    }

    const scope = await this.resolveScope(input);
    const buckets = buildBucketsForTimeline({
      zoom: scope.zoom,
      windowStart: scope.windowStart,
      windowEnd: scope.windowEnd,
      timezone: scope.timezone
    });

    const selectedBucket =
      hasBucketStart && hasBucketEnd
        ? bucketFromRange({
            buckets,
            bucketStart: input.bucketStart as number,
            bucketEnd: input.bucketEnd as number,
            zoom: scope.zoom,
            windowStart: scope.windowStart,
            windowEnd: scope.windowEnd,
            playheadTs: input.playheadTs
          })
        : bucketFromPlayhead({
            buckets,
            playheadTs: input.playheadTs ?? scope.now,
            zoom: scope.zoom,
            windowStart: scope.windowStart,
            windowEnd: scope.windowEnd
          });

    if (!selectedBucket) {
      throw new DomainError('validation', 'Invalid timeline bucket selection', {
        bucketStart: input.bucketStart,
        bucketEnd: input.bucketEnd,
        windowStart: scope.windowStart,
        windowEnd: scope.windowEnd,
        zoom: scope.zoom,
        bucketCount: buckets.length
      });
    }

    const repos = this.createRepositories();
    const [plannedItemIds, bucketRealityEvents, overdueCount, interruptionItems] = await Promise.all([
      repos.items.listTimelinePlannedIdsInWindow({
        windowStart: selectedBucket.bucketStart,
        windowEnd: selectedBucket.bucketEnd,
        projectIds: scope.projectIds,
        includeUnprojected: scope.includeUnprojected
      }),
      repos.events.listTimelineInWindow({
        windowStart: selectedBucket.bucketStart,
        windowEnd: selectedBucket.bucketEnd,
        eventTypes: TIMELINE_REALITY_EVENT_TYPES,
        projectIds: scope.projectIds,
        includeUnprojected: scope.includeUnprojected
      }),
      repos.items.countTimelineOpenDueBefore({
        dueBefore: selectedBucket.bucketEnd,
        projectIds: scope.projectIds,
        includeUnprojected: scope.includeUnprojected
      }),
      repos.items.listTimelineInterruptionsInWindow({
        windowStart: selectedBucket.bucketStart,
        windowEnd: selectedBucket.bucketEnd,
        projectIds: scope.projectIds,
        includeUnprojected: scope.includeUnprojected
      })
    ]);

    const interruptionItemSet = new Set(interruptionItems.map((item) => item.id));
    const interruptionFromEvents = bucketRealityEvents.filter(
      (event) => event.eventType === 'item.created' && interruptionItemSet.has(event.itemId)
    );

    const topItemIds = [...new Set([...plannedItemIds, ...bucketRealityEvents.map((event) => event.itemId)])];
    const topItems = (await this.deps.rowsForItemIds(topItemIds, scope.now))
      .sort((a, b) => {
        if (a.priority !== b.priority) return b.priority - a.priority;
        if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
        return a.title.localeCompare(b.title);
      })
      .slice(0, 12);

    const recentEvents = bucketRealityEvents.sort((a, b) => b.occurredAt - a.occurredAt).slice(0, 12);
    const bucketIdentity = timelineBucketIdentity({
      bucketStart: selectedBucket.bucketStart,
      bucketEnd: selectedBucket.bucketEnd,
      zoom: scope.zoom,
      windowStart: scope.windowStart,
      windowEnd: scope.windowEnd
    });

    this.deps.logTiming?.('timeline.summary', startedAt, {
      bucketIdentity,
      projectScopeSize: scope.projectIds.length,
      includeUnprojected: scope.includeUnprojected
    });

    return {
      bucketStart: selectedBucket.bucketStart,
      bucketEnd: selectedBucket.bucketEnd,
      bucketIdentity,
      playheadTs: selectedBucket.playheadTs,
      playheadLabel: selectedBucket.bucketLabel,
      counts: {
        plan: plannedItemIds.length,
        reality: bucketRealityEvents.length,
        overdue: overdueCount,
        interruptions: interruptionItems.length + interruptionFromEvents.length
      },
      topItems,
      recentEvents
    };
  }

  private createRepositories() {
    return {
      projects: new ProjectRepository(this.deps.db),
      items: new ItemRepository(this.deps.db),
      events: new EventRepository(this.deps.db),
      preferences: new PreferenceRepository(this.deps.db)
    };
  }

  private async resolveScope(input: TimelineStructureInput): Promise<TimelineScope> {
    const normalized = normalizeTimelineInput(input);
    const repos = this.createRepositories();
    const [preference, allProjects] = await Promise.all([this.deps.getUserPreference(), repos.projects.list({ includeArchived: true })]);
    const hasExplicitProjectScope = Boolean(input.projectIds && input.projectIds.length > 0);
    const defaultProjectIds = allProjects.filter((project) => project.status !== 'archived').map((project) => project.id);

    // TODO(GOTCHA): Default scope intentionally includes unprojected items to preserve legacy timeline semantics.
    const projectIds = hasExplicitProjectScope ? input.projectIds ?? [] : defaultProjectIds;
    const includeUnprojected = !hasExplicitProjectScope;

    return {
      now: normalized.now,
      timezone: preference.timezone || this.deps.timezone,
      zoom: normalized.zoom,
      mode: normalized.mode,
      windowStart: normalized.windowStart,
      windowEnd: normalized.windowEnd,
      projectIds,
      includeUnprojected,
      hasExplicitProjectScope
    };
  }

  private buildLane(
    key: 'plan' | 'reality' | 'overduePressure' | 'interruptions',
    label: string,
    buckets: TimelineBucket[],
    primaryCounts: Map<number, number>,
    secondaryCounts?: Map<number, number>
  ) {
    return {
      key,
      label,
      buckets: buckets.map((bucket, index) => ({
        start: bucket.start,
        end: bucket.end,
        label: bucket.label,
        count: (primaryCounts.get(index) ?? 0) + (secondaryCounts?.get(index) ?? 0)
      }))
    };
  }

  private bucketSizeMs(buckets: TimelineBucket[], windowStart: number, windowEnd: number): number {
    const first = buckets[0];
    if (first && first.end > first.start) return first.end - first.start;
    return Math.max(1, windowEnd - windowStart);
  }
}
