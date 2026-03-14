import { memo } from 'react';
import { startTransition } from 'react';
import type { TimelineLaneDto } from '@/domain/types';

type LaneTone = { glow: string; fill: string; text: string };

type TimelineLanesGridProps = {
  visibleLanes: TimelineLaneDto[];
  laneBuckets: TimelineLaneDto['buckets'];
  axisStride: number;
  gridTemplateColumns: string;
  timelineWidth: number;
  playheadPercent: number;
  playheadBucketIndex: number;
  maxBucketCount: number;
  laneTone: (key: string) => LaneTone;
  onJumpToBucket: (ts: number) => void;
};

export const TimelineLanesGrid = memo((props: TimelineLanesGridProps) => {
  const {
    visibleLanes,
    laneBuckets,
    axisStride,
    gridTemplateColumns,
    timelineWidth,
    playheadPercent,
    playheadBucketIndex,
    maxBucketCount,
    laneTone,
    onJumpToBucket
  } = props;

  return (
    <section className="timeline-reveal rounded-2xl border border-stone-300 bg-panel p-3 shadow-card md:p-4">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-30 w-5 bg-gradient-to-r from-panel to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-30 w-5 bg-gradient-to-l from-panel to-transparent" />
        <div className="timeline-scroll overflow-x-auto pb-2">
          <div className="relative" style={{ width: `${timelineWidth}px`, minWidth: '100%' }}>
            <div
              className="pointer-events-none absolute inset-y-0 z-20 w-px bg-red-600/80"
              style={{ left: `${playheadPercent}%` }}
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-y-0 z-10 w-8 -translate-x-1/2 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0"
              style={{ left: `${playheadPercent}%` }}
              aria-hidden="true"
            />

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
                              onClick={() => startTransition(() => onJumpToBucket(Math.floor((bucket.start + bucket.end) / 2)))}
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
  );
});

TimelineLanesGrid.displayName = 'TimelineLanesGrid';
