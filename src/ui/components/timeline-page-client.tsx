'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { TimelineMode, TimelineZoom } from '@/domain/types';
import { getDefaultTimelineWindow } from '@/domain/time';
import { api } from '@/ui/api/client';
import { ItemList } from '@/ui/components/item-list';
import { useItemActions } from '@/ui/hooks/use-item-actions';
import { queryKeys } from '@/ui/query/keys';
import { useUiStore } from '@/ui/state/ui-store';

type TimelinePageClientProps = {
  initialZoom?: TimelineZoom;
  initialMode?: TimelineMode;
  initialWindowStart?: number;
  initialWindowEnd?: number;
  initialPlayheadTs?: number;
  initialProjectIds?: string[];
};

const ZOOM_OPTIONS: TimelineZoom[] = ['day', 'week', 'month', 'quarter', 'year', 'all'];
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
  const viewportRef = useRef<HTMLDivElement | null>(null);
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
  const [viewportWidth, setViewportWidth] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);
  const [showAllTopItems, setShowAllTopItems] = useState(false);
  const [showAllMoments, setShowAllMoments] = useState(false);
  const [showAllProjects, setShowAllProjects] = useState(false);

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

  const timelineQuery = useQuery({
    queryKey: queryKeys.timelineView({ windowStart, windowEnd, zoom, mode, projectIds: projectIdsKey, playheadTs }),
    queryFn: () => api.getTimelineView({ windowStart, windowEnd, zoom, mode, projectIds, playheadTs })
  });

  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;

    const update = () => setViewportWidth(node.clientWidth);
    update();

    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
    // TODO(gotcha): This ref can mount after async data loads, so rerun when timeline payload changes.
  }, [timelineQuery.data]);

  useEffect(() => {
    if (!timelineQuery.data) return;
    const itemIds = timelineQuery.data.summary.topItems.map((item) => item.id);
    setListItemIds(itemIds);
  }, [timelineQuery.data, setListItemIds]);

  useEffect(() => {
    if (!playing || reduceMotion) return;
    const span = Math.max(1, windowEnd - windowStart);
    const step = Math.max(60_000, Math.floor((span / 100) * playbackSpeed));
    const timer = window.setInterval(() => {
      setPlayheadTs((current) => {
        const next = current + step;
        if (next > windowEnd) return windowStart;
        return next;
      });
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
        queryClient.invalidateQueries({ queryKey: queryKeys.timeline }),
        queryClient.invalidateQueries({ queryKey: queryKeys.today }),
        queryClient.invalidateQueries({ queryKey: queryKeys.upcoming }),
        queryClient.invalidateQueries({ queryKey: queryKeys.inbox }),
        queryClient.invalidateQueries({ queryKey: queryKeys.history }),
        queryClient.invalidateQueries({ queryKey: queryKeys.items })
      ]);
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
    timelineQuery.data?.lanes?.[0]?.buckets?.[0]
      ? timelineQuery.data.lanes[0].buckets[0].end - timelineQuery.data.lanes[0].buckets[0].start
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
        setPlayheadTs((value) => clamp(value - hotkeyBucketStep, windowStart, windowEnd));
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        setPlayheadTs((value) => clamp(value + hotkeyBucketStep, windowStart, windowEnd));
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

  if (timelineQuery.isLoading) {
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

  if (timelineQuery.isError || !timelineQuery.data) {
    return (
      <div className="timeline-reveal rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 shadow-card">
        <div className="font-semibold">Failed to load timeline.</div>
        <div className="mt-1 text-xs text-red-800">Check your connection and retry.</div>
        <button
          type="button"
          className="mt-3 rounded border border-red-300 bg-white px-2 py-1 text-xs hover:border-red-500"
          onClick={() => timelineQuery.refetch()}
        >
          Retry
        </button>
      </div>
    );
  }

  const timeline = timelineQuery.data;
  const visibleLanes = timeline.lanes.filter((lane) => visibleLaneKeys.has(lane.key));
  const laneBuckets = visibleLanes[0]?.buckets ?? timeline.lanes[0]?.buckets ?? [];
  const compactLayout = (viewportWidth || windowWidth) > 0 && (viewportWidth || windowWidth) < 760;
  const allProjects = projectsQuery.data ?? [];
  const visibleProjects = compactLayout && !showAllProjects ? allProjects.slice(0, 6) : allProjects;
  const hasHiddenProjects = compactLayout && allProjects.length > 6;
  const visibleTopItems = compactLayout && !showAllTopItems ? timeline.summary.topItems.slice(0, 6) : timeline.summary.topItems;
  const hasHiddenTopItems = compactLayout && timeline.summary.topItems.length > 6;
  const visibleMoments = compactLayout && !showAllMoments ? timeline.moments.slice(0, 8) : timeline.moments.slice(0, 18);
  const hasHiddenMoments = compactLayout && timeline.moments.length > 8;
  const bucketCount = Math.max(1, laneBuckets.length);
  const axisStride = axisStrideForBucketCount(bucketCount);
  const maxBucketCount = Math.max(1, ...visibleLanes.flatMap((lane) => lane.buckets.map((bucket) => bucket.count)));
  const minBucketWidth = zoomMinBucketWidth(zoom);
  const gridTemplateColumns = `repeat(${bucketCount}, minmax(${minBucketWidth}px, 1fr))`;
  const timelineWidth = Math.max(viewportWidth || 0, bucketCount * minBucketWidth);
  const normalizedPlayhead = clamp(playheadTs, windowStart, windowEnd);
  const playheadRatio = (normalizedPlayhead - windowStart) / Math.max(1, windowEnd - windowStart);
  const playheadPercent = clamp(playheadRatio * 100, 0, 100);
  const playheadBucketIndex = laneBuckets.findIndex((bucket) => normalizedPlayhead >= bucket.start && normalizedPlayhead < bucket.end);
  const bucketStep = laneBuckets.length > 0 ? Math.max(1, laneBuckets[0]!.end - laneBuckets[0]!.start) : DAY_MS;
  const isNearNow = Math.abs(playheadTs - Date.now()) < Math.max(90_000, bucketStep);

  return (
    <div className="space-y-5">
      <header className="timeline-reveal relative overflow-hidden rounded-3xl border border-stone-300 bg-panel shadow-[0_30px_70px_-45px_rgba(120,20,20,0.65)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(255,120,90,0.22),transparent_40%),radial-gradient(circle_at_85%_0%,rgba(76,111,255,0.18),transparent_36%)]" />
        <div className="relative space-y-4 p-4 md:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-ink md:text-3xl">Timeline</h1>
              <p className="mt-1 max-w-2xl text-sm text-muted">
                Scrub time like a film reel. Track commitments, real execution, overdue pressure, and interruption spikes from one playhead.
              </p>
            </div>
            <div className="rounded-xl border border-stone-300/80 bg-white/70 px-3 py-2 text-right backdrop-blur">
              <div className="text-[11px] uppercase tracking-wide text-muted">Lens</div>
              <div className="text-sm font-medium text-ink">{modeLabel(mode)}</div>
              <div className="text-[11px] text-muted">{new Date(playheadTs).toLocaleString()}</div>
              <div className={`mt-1 inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${isNearNow ? 'bg-red-100 text-red-900' : 'bg-stone-200 text-stone-700'}`}>
                {isNearNow ? 'LIVE' : 'ARCHIVE'}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Timeline mode">
            {(['dual', 'plan', 'reality'] as TimelineMode[]).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={mode === option}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  mode === option
                    ? 'border-red-600 bg-red-600 text-white shadow-[0_10px_30px_-16px_rgba(185,28,28,0.8)]'
                    : 'border-stone-300 bg-white/85 text-ink hover:border-stone-400'
                }`}
                onClick={() => setMode(option)}
              >
                {option === 'dual' ? 'Dual' : option === 'plan' ? 'Plan' : 'Reality'}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-1" role="group" aria-label="Timeline zoom presets">
            {ZOOM_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={zoom === option}
                className={`rounded-lg border px-2.5 py-1 text-xs transition ${
                  zoom === option
                    ? 'border-ink bg-ink text-white'
                    : 'border-stone-300 bg-white/80 text-muted hover:border-stone-500 hover:text-ink'
                }`}
                onClick={() => setZoom(option)}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-medium uppercase tracking-wide text-muted">Project Scope</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded border border-stone-300 bg-white/80 px-2 py-1 text-xs text-muted hover:border-stone-500 hover:text-ink"
                  onClick={() => setProjectIds([])}
                >
                  All Active
                </button>
                {hasHiddenProjects ? (
                  <button
                    type="button"
                    className="rounded border border-stone-300 bg-white/80 px-2 py-1 text-xs text-muted hover:border-stone-500 hover:text-ink"
                    onClick={() => setShowAllProjects((value) => !value)}
                  >
                    {showAllProjects ? 'Show Less' : `+${allProjects.length - 6} More`}
                  </button>
                ) : null}
              </div>
            </div>
            <div className={`flex gap-2 ${compactLayout ? 'timeline-scroll overflow-x-auto pb-1' : 'flex-wrap'}`}>
              {visibleProjects.map((project) => {
                const active = activeProjectSet.has(project.id);
                return (
                  <button
                    key={project.id}
                    type="button"
                    aria-pressed={active}
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-xs transition ${
                      active
                        ? 'border-amber-500 bg-amber-100 text-amber-950'
                        : 'border-stone-300 bg-white/75 text-muted hover:border-stone-500 hover:text-ink'
                    }`}
                    onClick={() => toggleProject(project.id)}
                  >
                    {projectChipLabel(project)}
                  </button>
                );
              })}
              {allProjects.length === 0 ? <span className="text-xs text-muted">No projects yet.</span> : null}
            </div>
          </div>

          <div className="rounded-2xl border border-stone-300 bg-white/75 p-3 backdrop-blur">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
              <div>
                Window {formatPoint(windowStart)} - {formatPoint(windowEnd)}
              </div>
              <div className="font-medium text-ink">Playhead {formatPoint(playheadTs)}</div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded border border-stone-300 px-2 py-1 text-xs text-muted hover:border-stone-500 hover:text-ink"
                onClick={() => setPlayheadTs((value) => clamp(value - bucketStep, windowStart, windowEnd))}
              >
                - Step
              </button>
              <input
                type="range"
                min={windowStart}
                max={windowEnd}
                step={Math.max(1, bucketStep)}
                value={normalizedPlayhead}
                onChange={(event) => setPlayheadTs(Number(event.target.value))}
                className="timeline-slider h-2 w-full cursor-pointer accent-red-600"
                aria-label="Timeline playhead scrubber"
              />
              <button
                type="button"
                className="rounded border border-stone-300 px-2 py-1 text-xs text-muted hover:border-stone-500 hover:text-ink"
                onClick={() => setPlayheadTs((value) => clamp(value + bucketStep, windowStart, windowEnd))}
              >
                Step +
              </button>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <button
                type="button"
                className="rounded border border-stone-300 bg-white px-2 py-1 text-muted hover:border-stone-500 hover:text-ink"
                onClick={() => setPlaying((value) => !value)}
                disabled={reduceMotion}
              >
                {playing ? 'Pause' : 'Play'}
              </button>
              <label className="text-muted">
                Speed
                <select
                  className="ml-1 rounded border border-stone-300 bg-white px-2 py-1 text-xs text-ink"
                  value={String(playbackSpeed)}
                  onChange={(event) => setPlaybackSpeed(Number(event.target.value) as 1 | 2 | 4)}
                >
                  <option value="1">1x</option>
                  <option value="2">2x</option>
                  <option value="4">4x</option>
                </select>
              </label>
              <button
                type="button"
                className="rounded border border-stone-300 bg-white px-2 py-1 text-muted hover:border-stone-500 hover:text-ink"
                onClick={() => {
                  const ts = Date.now();
                  setPlayheadTs(ts);
                  const reset = getDefaultTimelineWindow(ts);
                  setWindowStart(reset.windowStart);
                  setWindowEnd(reset.windowEnd);
                }}
              >
                Now
              </button>
              <div className="ml-auto hidden text-muted md:block">Shortcuts: Left/Right scrub, Space play, +/- zoom</div>
            </div>
            {compactLayout ? <div className="mt-2 text-[11px] text-muted">Shortcuts: Left/Right scrub, Space play, +/- zoom.</div> : null}
            {reduceMotion ? <div className="mt-2 text-xs text-muted">Playback disabled by reduced-motion preference.</div> : null}
          </div>
        </div>
      </header>

      <section className="timeline-reveal rounded-2xl border border-stone-300 bg-panel p-3 shadow-card md:p-4">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-30 w-5 bg-gradient-to-r from-panel to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-30 w-5 bg-gradient-to-l from-panel to-transparent" />
          <div ref={viewportRef} className="timeline-scroll overflow-x-auto pb-2">
          <div className="relative" style={{ width: `${timelineWidth}px`, minWidth: '100%' }}>
            <div
              className="pointer-events-none absolute inset-y-0 z-20 w-px bg-red-600/80"
              style={{ left: `${playheadPercent}%` }}
              aria-hidden="true"
            />
            <div className="pointer-events-none absolute inset-y-0 z-10 w-8 -translate-x-1/2 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0" style={{ left: `${playheadPercent}%` }} aria-hidden="true" />

            <div className="space-y-3">
              {visibleLanes.map((lane) => {
                const laneStyle = laneTone(lane.key);
                return (
                  <div key={lane.key} className="film-lane rounded-xl border border-stone-300 bg-white/88 p-2.5">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${laneStyle.text}`}>{lane.label}</div>
                      <div className="text-[11px] text-muted">
                        {lane.buckets.reduce((sum, bucket) => sum + bucket.count, 0)} total · peak {Math.max(0, ...lane.buckets.map((bucket) => bucket.count))}
                      </div>
                    </div>

                    <div className={`rounded-lg bg-gradient-to-r ${laneStyle.glow} p-1.5`}>
                      <div className="grid items-end gap-1" style={{ gridTemplateColumns }}>
                        {lane.buckets.map((bucket, index) => {
                          const isPlayhead = index === playheadBucketIndex;
                          const heightRatio = bucket.count === 0 ? 0.08 : bucket.count / maxBucketCount;
                          const bucketHeight = 18 + Math.round(heightRatio * 72);

                          return (
                            <button
                              key={`${lane.key}-${index}`}
                              type="button"
                              className={`group relative flex items-end justify-center rounded-md border transition-transform duration-150 ${
                                isPlayhead
                                  ? 'border-red-500 bg-red-50 shadow-[0_0_0_1px_rgba(239,68,68,0.26)]'
                                  : 'border-stone-200 bg-white/85 hover:-translate-y-0.5 hover:border-stone-400'
                              }`}
                              style={{ height: `${bucketHeight}px` }}
                              onClick={() => setPlayheadTs(Math.floor((bucket.start + bucket.end) / 2))}
                              title={`${lane.label}: ${bucket.count} in ${bucket.label}`}
                            >
                              <div
                                className={`absolute inset-x-0 bottom-0 rounded-b-md ${laneStyle.fill}`}
                                style={{ height: `${Math.max(3, Math.round((bucket.count / maxBucketCount) * 100))}%` }}
                                aria-hidden="true"
                              />
                              <span className={`relative z-10 mb-0.5 text-[10px] font-medium ${isPlayhead ? 'text-red-700' : 'text-stone-600 group-hover:text-ink'}`}>
                                {bucket.count > 0 ? bucket.count : ''}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="grid gap-1 text-[10px] text-muted" style={{ gridTemplateColumns }}>
                {laneBuckets.map((bucket, index) => (
                  <div key={`axis-${index}`} className="truncate text-center" title={bucket.label}>
                    {index % axisStride === 0 || index === laneBuckets.length - 1 ? bucket.label : ''}
                  </div>
                ))}
              </div>
            </div>
          </div>
          </div>
        </div>
      </section>

      <section className="timeline-reveal grid gap-4 xl:grid-cols-[1.85fr_1fr]">
        <div className="space-y-3 rounded-2xl border border-stone-300 bg-panel p-3 shadow-card">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">What Matters</h2>

          <div className="grid grid-cols-2 gap-2 text-xs md:grid-cols-5">
            <MetricChip label="Plan" value={timeline.summary.counts.plan} tone="emerald" />
            <MetricChip label="Reality" value={timeline.summary.counts.reality} tone="red" />
            <MetricChip label="Overdue" value={timeline.summary.counts.overdue} tone="amber" />
            <MetricChip label="Interruptions" value={timeline.summary.counts.interruptions} tone="violet" />
            <div className="rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-xs md:col-span-1">
              <div className="text-muted">Slice</div>
              <div className="font-medium text-ink">{timeline.summary.playheadLabel}</div>
            </div>
          </div>

          <ItemList
            items={visibleTopItems}
            selectedItemId={selectedItemId}
            onSelect={setSelectedItemId}
            emptyLabel="No top items at this playhead."
            actions={{
              onComplete: (itemId) => complete(itemId),
              onActivate: (itemId) => setStatus(itemId, 'active'),
              onInbox: (itemId) => setStatus(itemId, 'inbox'),
              onScheduleTomorrow: (itemId) => schedule(itemId, playheadTs),
              onDeferDay: (itemId) => defer(itemId, playheadTs + DAY_MS)
            }}
          />
          {hasHiddenTopItems ? (
            <button
              type="button"
              className="rounded border border-stone-300 bg-white px-2 py-1 text-xs text-muted hover:border-stone-500 hover:text-ink"
              onClick={() => setShowAllTopItems((value) => !value)}
            >
              {showAllTopItems ? 'Show Fewer Items' : `Show All ${timeline.summary.topItems.length} Items`}
            </button>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded border border-stone-300 px-2 py-1 text-xs hover:border-red-600 hover:text-red-700"
              disabled={!selectedItemId}
              onClick={() => {
                if (!selectedItemId) return;
                setStatus(selectedItemId, 'canceled');
              }}
            >
              Cancel Selected
            </button>
            <button
              type="button"
              className="rounded border border-stone-300 px-2 py-1 text-xs hover:border-stone-500 hover:text-ink"
              disabled={!selectedItemId}
              onClick={() => {
                if (!selectedItemId) return;
                const raw = window.prompt('Add tags (comma-separated)');
                if (!raw) return;
                const tags = raw
                  .split(',')
                  .map((value) => value.trim())
                  .filter(Boolean);
                if (tags.length > 0) selectedItemActionsMutation.mutate({ tags });
              }}
            >
              Add Tags
            </button>
            <button
              type="button"
              className="rounded border border-stone-300 px-2 py-1 text-xs hover:border-stone-500 hover:text-ink"
              disabled={!selectedItemId}
              onClick={() => {
                if (!selectedItemId) return;
                const url = window.prompt('Link URL');
                if (!url) return;
                const label = window.prompt('Label (optional)') ?? undefined;
                selectedItemActionsMutation.mutate({ link: { url, label } });
              }}
            >
              Add Link
            </button>
          </div>
        </div>

        <aside className="space-y-3 rounded-2xl border border-stone-300 bg-panel p-3 shadow-card">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Timeline Moments</h2>
          <div className="max-h-[22rem] space-y-2 overflow-y-auto pr-1 text-xs">
            {visibleMoments.map((moment, index) => (
              <button
                key={`${moment.kind}-${moment.ts}-${index}`}
                type="button"
                className="w-full rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-left transition hover:border-red-500"
                onClick={() => setPlayheadTs(moment.ts)}
              >
                <div className="font-medium text-ink">{moment.label}</div>
                <div className="text-muted">
                  {moment.kind} · count {moment.count}
                </div>
              </button>
            ))}
          </div>
          {hasHiddenMoments ? (
            <button
              type="button"
              className="rounded border border-stone-300 bg-white px-2 py-1 text-xs text-muted hover:border-stone-500 hover:text-ink"
              onClick={() => setShowAllMoments((value) => !value)}
            >
              {showAllMoments ? 'Show Fewer Moments' : `Show All ${timeline.moments.length} Moments`}
            </button>
          ) : null}

          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Recent Events @ Playhead</h3>
          <div className="space-y-1 text-xs text-muted">
            {timeline.summary.recentEvents.length === 0 ? <div>No events in this slice.</div> : null}
            {timeline.summary.recentEvents.map((event) => (
              <div key={event.id} className="rounded-lg border border-stone-200 bg-white p-2">
                <div className="font-medium text-ink">{event.eventType}</div>
                <div>{new Date(event.occurredAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </aside>
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
              setPlayheadTs(resetNow);
            }}
          >
            Reset Default
          </button>
        </div>
      </section>
    </div>
  );
};

const MetricChip = ({
  label,
  value,
  tone
}: {
  label: string;
  value: number;
  tone: 'emerald' | 'red' | 'amber' | 'violet';
}) => {
  const toneClasses =
    tone === 'emerald'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
      : tone === 'red'
        ? 'border-red-200 bg-red-50 text-red-900'
        : tone === 'amber'
          ? 'border-amber-200 bg-amber-50 text-amber-900'
          : 'border-violet-200 bg-violet-50 text-violet-900';

  return (
    <div className={`rounded-lg border px-2 py-1.5 ${toneClasses}`}>
      <div className="text-[11px] uppercase tracking-wide">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
};
