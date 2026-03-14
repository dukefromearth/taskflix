'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { startTransition, useEffect, useMemo, useRef, useState } from 'react';
import type { TimelineMode, TimelineZoom } from '@/domain/types';
import { getDefaultTimelineWindow } from '@/domain/time';
import { bucketFromPlayhead } from '@/domain/timeline-engine';
import { api } from '@/ui/api/client';
import { TimelineControlsPanel } from '@/ui/components/timeline/controls-panel';
import { TimelineLanesGrid } from '@/ui/components/timeline/lanes-grid';
import { TimelineMomentsPanel } from '@/ui/components/timeline/moments-panel';
import { TimelineSummaryPanel } from '@/ui/components/timeline/summary-panel';
import { useItemActions } from '@/ui/hooks/use-item-actions';
import { invalidateTimelineCaches } from '@/ui/query/invalidate-timeline';
import { queryKeys } from '@/ui/query/keys';
import { timelineStructureQueryOptions, timelineSummaryQueryOptions } from '@/ui/query/timeline-query-options';
import { useUiStore } from '@/ui/state/ui-store';

type TimelinePageClientProps = {
  initialZoom?: TimelineZoom;
  initialMode?: TimelineMode;
  initialWindowStart?: number;
  initialWindowEnd?: number;
  initialPlayheadTs?: number;
  initialProjectIds?: string[];
};

const ZOOM_ORDER: TimelineZoom[] = ['day', 'week', 'month', 'quarter', 'year', 'all'];
const DAY_MS = 24 * 60 * 60 * 1000;

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const formatPoint = (ts: number): string =>
  new Date(ts).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

const zoomMinBucketWidth = (zoom: TimelineZoom): number => {
  if (zoom === 'day') return 22;
  if (zoom === 'week') return 28;
  if (zoom === 'month' || zoom === 'quarter') return 34;
  return 40;
};

const axisStrideForBucketCount = (bucketCount: number): number => {
  if (bucketCount > 144) return 24;
  if (bucketCount > 84) return 12;
  if (bucketCount > 48) return 6;
  if (bucketCount > 30) return 4;
  if (bucketCount > 16) return 2;
  return 1;
};

const modeLabel = (mode: TimelineMode): string => {
  if (mode === 'plan') return 'Plan Lens';
  if (mode === 'reality') return 'Reality Lens';
  return 'Dual Lens';
};

const laneTone = (key: string): { glow: string; fill: string; text: string } => {
  if (key === 'plan') {
    return {
      glow: 'from-emerald-300/20 to-teal-400/10',
      fill: 'bg-gradient-to-t from-emerald-500/70 to-emerald-300/70',
      text: 'text-emerald-900'
    };
  }
  if (key === 'reality') {
    return {
      glow: 'from-rose-300/25 to-red-400/10',
      fill: 'bg-gradient-to-t from-red-500/75 to-rose-300/70',
      text: 'text-red-900'
    };
  }
  if (key === 'overduePressure') {
    return {
      glow: 'from-amber-300/25 to-orange-400/10',
      fill: 'bg-gradient-to-t from-amber-500/75 to-yellow-300/75',
      text: 'text-amber-900'
    };
  }

  return {
    glow: 'from-violet-300/25 to-fuchsia-300/10',
    fill: 'bg-gradient-to-t from-violet-500/75 to-fuchsia-300/75',
    text: 'text-violet-900'
  };
};

export const TimelinePageClient = ({
  initialZoom,
  initialMode,
  initialWindowStart,
  initialWindowEnd,
  initialPlayheadTs,
  initialProjectIds
}: TimelinePageClientProps) => {
  const queryClient = useQueryClient();
  const { complete, setStatus, schedule, defer } = useItemActions();

  const now = Date.now();
  const defaultWindow = getDefaultTimelineWindow(now);
  const [zoom, setZoom] = useState<TimelineZoom>(initialZoom ?? 'week');
  const [mode, setMode] = useState<TimelineMode>(initialMode ?? 'dual');
  const [windowStart, setWindowStart] = useState<number>(initialWindowStart ?? defaultWindow.windowStart);
  const [windowEnd, setWindowEnd] = useState<number>(initialWindowEnd ?? defaultWindow.windowEnd);
  const [playheadTs, setPlayheadTs] = useState<number>(initialPlayheadTs ?? now);
  const [projectIds, setProjectIds] = useState<string[]>(initialProjectIds ?? []);
  const [playing, setPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2 | 4>(1);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const [showAllTopItems, setShowAllTopItems] = useState(false);
  const [showAllMoments, setShowAllMoments] = useState(false);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const playbackCursorRef = useRef<number>(playheadTs);
  const structureFetchCountRef = useRef(0);
  const summaryFetchCountRef = useRef(0);

  const selectedItemId = useUiStore((state) => state.selectedItemId);
  const setSelectedItemId = useUiStore((state) => state.setSelectedItemId);
  const setListItemIds = useUiStore((state) => state.setListItemIds);

  useEffect(() => {
    const localSetting = window.localStorage.getItem('taskio.reduceMotion') === 'true';
    setReduceMotion(localSetting || window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    setWindowWidth(window.innerWidth);

    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const projectsQuery = useQuery({ queryKey: queryKeys.projects, queryFn: () => api.listProjects(false) });
  const projectIdsKey = projectIds.slice().sort().join(',');

  const structureQuery = useQuery({
    queryKey: queryKeys.timelineStructure({ windowStart, windowEnd, zoom, mode, projectIds: projectIdsKey }),
    queryFn: ({ signal }) => api.getTimelineStructure({ windowStart, windowEnd, zoom, mode, projectIds }, { signal }),
    ...timelineStructureQueryOptions
  });

  const structureBuckets = useMemo(() => {
    if (!structureQuery.data) return [];
    const visibleLanes =
      mode === 'plan'
        ? structureQuery.data.lanes.filter((lane) => lane.key === 'plan' || lane.key === 'overduePressure' || lane.key === 'interruptions')
        : mode === 'reality'
          ? structureQuery.data.lanes.filter((lane) => lane.key === 'reality' || lane.key === 'overduePressure' || lane.key === 'interruptions')
          : structureQuery.data.lanes;
    return visibleLanes[0]?.buckets ?? structureQuery.data.lanes[0]?.buckets ?? [];
  }, [mode, structureQuery.data]);

  const activeBucket = useMemo(() => {
    if (!structureQuery.data || structureBuckets.length === 0) return undefined;
    return bucketFromPlayhead({
      buckets: structureBuckets,
      playheadTs,
      zoom: structureQuery.data.zoom,
      windowStart: structureQuery.data.windowStart,
      windowEnd: structureQuery.data.windowEnd
    });
  }, [playheadTs, structureBuckets, structureQuery.data]);

  const summaryQuery = useQuery({
    queryKey: queryKeys.timelineSummary({
      windowStart,
      windowEnd,
      zoom,
      projectIds: projectIdsKey,
      bucketStart: activeBucket?.bucketStart ?? windowStart,
      bucketEnd: activeBucket?.bucketEnd ?? windowEnd
    }),
    queryFn: ({ signal }) =>
      api.getTimelineSummary({
        windowStart,
        windowEnd,
        zoom,
        projectIds,
        playheadTs,
        bucketStart: activeBucket?.bucketStart,
        bucketEnd: activeBucket?.bucketEnd
      }, { signal }),
    enabled: Boolean(activeBucket),
    placeholderData: (previous) => previous,
    ...timelineSummaryQueryOptions
  });

  useEffect(() => {
    playbackCursorRef.current = playheadTs;
  }, [playheadTs]);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development' || structureQuery.dataUpdatedAt === 0) return;
    structureFetchCountRef.current += 1;
    console.debug('[timeline][debug]', { kind: 'structure', fetches: structureFetchCountRef.current });
  }, [structureQuery.dataUpdatedAt]);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development' || summaryQuery.dataUpdatedAt === 0) return;
    summaryFetchCountRef.current += 1;
    console.debug('[timeline][debug]', { kind: 'summary', fetches: summaryFetchCountRef.current });
  }, [summaryQuery.dataUpdatedAt]);

  useEffect(() => {
    if (!summaryQuery.data) return;
    const itemIds = summaryQuery.data.topItems.map((item) => item.id);
    setListItemIds(itemIds);
  }, [summaryQuery.data, setListItemIds]);

  useEffect(() => {
    if (!playing || reduceMotion) return;
    const span = Math.max(1, windowEnd - windowStart);
    const step = Math.max(60_000, Math.floor((span / 100) * playbackSpeed));
    const timer = window.setInterval(() => {
      const current = playbackCursorRef.current;
      const next = current + step > windowEnd ? windowStart : current + step;
      playbackCursorRef.current = next;
      startTransition(() => setPlayheadTs(next));
    }, 260);
    return () => window.clearInterval(timer);
  }, [playing, playbackSpeed, reduceMotion, windowStart, windowEnd]);

  useEffect(() => {
    setPlayheadTs((value) => clamp(value, windowStart, windowEnd));
  }, [windowStart, windowEnd]);

  const selectedItemActionsMutation = useMutation({
    mutationFn: async (input: { tags?: string[]; link?: { url: string; label?: string } }) => {
      if (!selectedItemId) return;
      if (input.tags && input.tags.length > 0) {
        await api.updateTags(selectedItemId, input.tags);
      }
      if (input.link) {
        await api.addLink(selectedItemId, { url: input.link.url, label: input.link.label, kind: 'generic' });
      }
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.today }),
        queryClient.invalidateQueries({ queryKey: queryKeys.upcoming }),
        queryClient.invalidateQueries({ queryKey: queryKeys.inbox }),
        queryClient.invalidateQueries({ queryKey: queryKeys.history }),
        queryClient.invalidateQueries({ queryKey: queryKeys.items })
      ]);
      await invalidateTimelineCaches(queryClient);
      if (selectedItemId) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.itemDetail(selectedItemId) });
      }
    }
  });

  const visibleLaneKeys = useMemo(() => {
    if (mode === 'plan') return new Set(['plan', 'overduePressure', 'interruptions']);
    if (mode === 'reality') return new Set(['reality', 'overduePressure', 'interruptions']);
    return new Set(['plan', 'reality', 'overduePressure', 'interruptions']);
  }, [mode]);

  const activeProjectSet = useMemo(() => new Set(projectIds), [projectIds]);
  const projectTitleCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const project of projectsQuery.data ?? []) {
      counts.set(project.title, (counts.get(project.title) ?? 0) + 1);
    }
    return counts;
  }, [projectsQuery.data]);

  const projectChipLabel = (project: { id: string; title: string }): string => {
    const count = projectTitleCounts.get(project.title) ?? 0;
    if (count < 2) return project.title;
    return `${project.title} · ${project.id.slice(-4)}`;
  };

  const toggleProject = (projectId: string) => {
    setProjectIds((current) => {
      if (current.includes(projectId)) {
        return current.filter((id) => id !== projectId);
      }
      return [...current, projectId];
    });
  };

  const setWindowAround = (spanDays: number) => {
    const halfSpan = Math.floor((spanDays * DAY_MS) / 2);
    setWindowStart(playheadTs - halfSpan);
    setWindowEnd(playheadTs + halfSpan);
  };

  const shiftZoom = (delta: -1 | 1) => {
    const index = ZOOM_ORDER.indexOf(zoom);
    const next = ZOOM_ORDER[clamp(index + delta, 0, ZOOM_ORDER.length - 1)];
    if (next) setZoom(next);
  };

  const hotkeyBucketStep = Math.max(
    DAY_MS / 24,
    structureQuery.data?.lanes?.[0]?.buckets?.[0]
      ? structureQuery.data.lanes[0].buckets[0].end - structureQuery.data.lanes[0].buckets[0].start
      : Math.floor((windowEnd - windowStart) / 64)
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.target instanceof HTMLElement) {
        const editable = ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName) || event.target.isContentEditable;
        if (editable) return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        startTransition(() => setPlayheadTs((value) => clamp(value - hotkeyBucketStep, windowStart, windowEnd)));
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        startTransition(() => setPlayheadTs((value) => clamp(value + hotkeyBucketStep, windowStart, windowEnd)));
      }

      if (event.key === ' ') {
        if (reduceMotion) return;
        event.preventDefault();
        setPlaying((value) => !value);
      }

      if (event.key === '=') {
        event.preventDefault();
        shiftZoom(-1);
      }

      if (event.key === '-') {
        event.preventDefault();
        shiftZoom(1);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [hotkeyBucketStep, reduceMotion, windowEnd, windowStart, zoom]);

  if (structureQuery.isLoading) {
    return (
      <div className="space-y-4">
        <div className="timeline-reveal h-52 rounded-3xl border border-stone-300 bg-panel p-4 shadow-card">
          <div className="h-6 w-36 animate-pulse rounded bg-stone-200" />
          <div className="mt-3 h-4 w-4/5 animate-pulse rounded bg-stone-200" />
          <div className="mt-2 h-4 w-3/5 animate-pulse rounded bg-stone-200" />
          <div className="mt-6 h-10 w-full animate-pulse rounded-xl bg-stone-200" />
        </div>
        <div className="timeline-reveal h-64 rounded-2xl border border-stone-300 bg-panel p-4 shadow-card">
          <div className="h-full w-full animate-pulse rounded-xl bg-stone-200" />
        </div>
      </div>
    );
  }

  if (structureQuery.isError || !structureQuery.data) {
    return (
      <div className="timeline-reveal rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 shadow-card">
        <div className="font-semibold">Failed to load timeline.</div>
        <div className="mt-1 text-xs text-red-800">Check your connection and retry.</div>
        <button
          type="button"
          className="mt-3 rounded border border-red-300 bg-white px-2 py-1 text-xs hover:border-red-500"
          onClick={() => structureQuery.refetch()}
        >
          Retry
        </button>
      </div>
    );
  }

  const timeline = structureQuery.data;
  const timelineSummary = summaryQuery.data ?? {
    bucketStart: activeBucket?.bucketStart ?? windowStart,
    bucketEnd: activeBucket?.bucketEnd ?? windowEnd,
    bucketIdentity: activeBucket?.bucketIdentity ?? '',
    playheadTs,
    playheadLabel: activeBucket?.bucketLabel ?? '',
    counts: { plan: 0, reality: 0, overdue: 0, interruptions: 0 },
    topItems: [],
    recentEvents: []
  };
  const visibleLanes = timeline.lanes.filter((lane) => visibleLaneKeys.has(lane.key));
  const laneBuckets = visibleLanes[0]?.buckets ?? timeline.lanes[0]?.buckets ?? [];
  const compactLayout = windowWidth > 0 && windowWidth < 760;
  const allProjects = projectsQuery.data ?? [];
  const visibleProjects = compactLayout && !showAllProjects ? allProjects.slice(0, 6) : allProjects;
  const hasHiddenProjects = compactLayout && allProjects.length > 6;
  const visibleTopItems = compactLayout && !showAllTopItems ? timelineSummary.topItems.slice(0, 6) : timelineSummary.topItems;
  const hasHiddenTopItems = compactLayout && timelineSummary.topItems.length > 6;
  const visibleMoments = compactLayout && !showAllMoments ? timeline.moments.slice(0, 8) : timeline.moments.slice(0, 18);
  const hasHiddenMoments = compactLayout && timeline.moments.length > 8;
  const bucketCount = Math.max(1, laneBuckets.length);
  const axisStride = axisStrideForBucketCount(bucketCount);
  const maxBucketCount = Math.max(1, ...visibleLanes.flatMap((lane) => lane.buckets.map((bucket) => bucket.count)));
  const minBucketWidth = zoomMinBucketWidth(zoom);
  const gridTemplateColumns = `repeat(${bucketCount}, minmax(${minBucketWidth}px, 1fr))`;
  const timelineWidth = Math.max(windowWidth || 0, bucketCount * minBucketWidth);
  const normalizedPlayhead = clamp(playheadTs, windowStart, windowEnd);
  const playheadRatio = (normalizedPlayhead - windowStart) / Math.max(1, windowEnd - windowStart);
  const playheadPercent = clamp(playheadRatio * 100, 0, 100);
  const playheadBucketIndex = laneBuckets.findIndex((bucket) => normalizedPlayhead >= bucket.start && normalizedPlayhead < bucket.end);
  const bucketStep = laneBuckets.length > 0 ? Math.max(1, laneBuckets[0]!.end - laneBuckets[0]!.start) : DAY_MS;
  const isNearNow = Math.abs(playheadTs - Date.now()) < Math.max(90_000, bucketStep);

  const jumpNow = () => {
    const ts = Date.now();
    startTransition(() => setPlayheadTs(ts));
    const reset = getDefaultTimelineWindow(ts);
    setWindowStart(reset.windowStart);
    setWindowEnd(reset.windowEnd);
  };

  return (
    <div className="space-y-5">
      <TimelineControlsPanel
        mode={mode}
        zoom={zoom}
        playheadTs={playheadTs}
        windowStart={windowStart}
        windowEnd={windowEnd}
        isNearNow={isNearNow}
        compactLayout={compactLayout}
        allProjects={allProjects}
        visibleProjects={visibleProjects}
        activeProjectSet={activeProjectSet}
        hasHiddenProjects={hasHiddenProjects}
        showAllProjects={showAllProjects}
        playing={playing}
        reduceMotion={reduceMotion}
        playbackSpeed={playbackSpeed}
        bucketStep={bucketStep}
        normalizedPlayhead={normalizedPlayhead}
        projectChipLabel={projectChipLabel}
        onModeChange={setMode}
        onZoomChange={setZoom}
        onResetProjects={() => setProjectIds([])}
        onToggleShowAllProjects={() => setShowAllProjects((value) => !value)}
        onToggleProject={toggleProject}
        onStepBack={() => startTransition(() => setPlayheadTs((value) => clamp(value - bucketStep, windowStart, windowEnd)))}
        onStepForward={() => startTransition(() => setPlayheadTs((value) => clamp(value + bucketStep, windowStart, windowEnd)))}
        onScrub={(next) => startTransition(() => setPlayheadTs(next))}
        onTogglePlay={() => setPlaying((value) => !value)}
        onPlaybackSpeedChange={setPlaybackSpeed}
        onJumpNow={jumpNow}
        formatPoint={formatPoint}
        modeLabel={modeLabel}
      />

      <TimelineLanesGrid
        visibleLanes={visibleLanes}
        laneBuckets={laneBuckets}
        axisStride={axisStride}
        gridTemplateColumns={gridTemplateColumns}
        timelineWidth={timelineWidth}
        playheadPercent={playheadPercent}
        playheadBucketIndex={playheadBucketIndex}
        maxBucketCount={maxBucketCount}
        laneTone={laneTone}
        onJumpToBucket={setPlayheadTs}
      />

      <section className="timeline-reveal grid gap-4 xl:grid-cols-[1.85fr_1fr]">
        <TimelineSummaryPanel
          timelineSummary={timelineSummary}
          visibleTopItems={visibleTopItems}
          hasHiddenTopItems={hasHiddenTopItems}
          showAllTopItems={showAllTopItems}
          selectedItemId={selectedItemId}
          isFetching={summaryQuery.isFetching}
          onSelectItem={setSelectedItemId}
          onToggleShowAllTopItems={() => setShowAllTopItems((value) => !value)}
          onComplete={(itemId) => complete(itemId)}
          onActivate={(itemId) => setStatus(itemId, 'active')}
          onInbox={(itemId) => setStatus(itemId, 'inbox')}
          onSchedule={(itemId) => schedule(itemId, playheadTs)}
          onDefer={(itemId) => defer(itemId, playheadTs + DAY_MS)}
          onCancelSelected={() => {
            if (!selectedItemId) return;
            setStatus(selectedItemId, 'canceled');
          }}
          onAddTags={() => {
            if (!selectedItemId) return;
            const raw = window.prompt('Add tags (comma-separated)');
            if (!raw) return;
            const tags = raw
              .split(',')
              .map((value) => value.trim())
              .filter(Boolean);
            if (tags.length > 0) selectedItemActionsMutation.mutate({ tags });
          }}
          onAddLink={() => {
            if (!selectedItemId) return;
            const url = window.prompt('Link URL');
            if (!url) return;
            const label = window.prompt('Label (optional)') ?? undefined;
            selectedItemActionsMutation.mutate({ link: { url, label } });
          }}
        />

        <TimelineMomentsPanel
          moments={visibleMoments}
          allMomentsCount={timeline.moments.length}
          hasHiddenMoments={hasHiddenMoments}
          showAllMoments={showAllMoments}
          recentEvents={timelineSummary.recentEvents}
          onToggleShowAllMoments={() => setShowAllMoments((value) => !value)}
          onJumpToMoment={setPlayheadTs}
        />
      </section>

      <section className="timeline-reveal rounded-2xl border border-stone-300 bg-panel p-3 text-xs text-muted shadow-card">
        <div className="mb-2 font-semibold uppercase tracking-wide">Timeline Window</div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="rounded border border-stone-300 bg-white px-2 py-1 hover:border-stone-500 hover:text-ink" onClick={() => setWindowAround(7)}>
            Center 1 Week
          </button>
          <button type="button" className="rounded border border-stone-300 bg-white px-2 py-1 hover:border-stone-500 hover:text-ink" onClick={() => setWindowAround(30)}>
            Center 1 Month
          </button>
          <button type="button" className="rounded border border-stone-300 bg-white px-2 py-1 hover:border-stone-500 hover:text-ink" onClick={() => setWindowAround(90)}>
            Center 1 Quarter
          </button>
          <button
            type="button"
            className="rounded border border-stone-300 bg-white px-2 py-1 hover:border-stone-500 hover:text-ink"
            onClick={() => {
              const resetNow = Date.now();
              const resetWindow = getDefaultTimelineWindow(resetNow);
              setWindowStart(resetWindow.windowStart);
              setWindowEnd(resetWindow.windowEnd);
              startTransition(() => setPlayheadTs(resetNow));
            }}
          >
            Reset Default
          </button>
        </div>
      </section>
    </div>
  );
};
