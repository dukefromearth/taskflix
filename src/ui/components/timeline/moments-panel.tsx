import { memo } from 'react';
import { startTransition } from 'react';
import type { TimelineMomentDto, TimelineSummaryDto } from '@/domain/types';

type TimelineMomentsPanelProps = {
  moments: TimelineMomentDto[];
  allMomentsCount: number;
  hasHiddenMoments: boolean;
  showAllMoments: boolean;
  recentEvents: TimelineSummaryDto['recentEvents'];
  onToggleShowAllMoments: () => void;
  onJumpToMoment: (ts: number) => void;
};

export const TimelineMomentsPanel = memo((props: TimelineMomentsPanelProps) => {
  const { moments, allMomentsCount, hasHiddenMoments, showAllMoments, recentEvents, onToggleShowAllMoments, onJumpToMoment } = props;

  return (
    <aside className="space-y-3 rounded-2xl border border-stone-300 bg-panel p-3 shadow-card">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Timeline Moments</h2>
      <div className="max-h-[22rem] space-y-2 overflow-y-auto pr-1 text-xs">
        {moments.map((moment, index) => (
          <button
            key={`${moment.kind}-${moment.ts}-${index}`}
            type="button"
            className="w-full rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-left transition hover:border-red-500"
            onClick={() => startTransition(() => onJumpToMoment(moment.ts))}
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
          onClick={onToggleShowAllMoments}
        >
          {showAllMoments ? 'Show Fewer Moments' : `Show All ${allMomentsCount} Moments`}
        </button>
      ) : null}

      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Recent Events @ Playhead</h3>
      <div className="space-y-1 text-xs text-muted">
        {recentEvents.length === 0 ? <div>No events in this slice.</div> : null}
        {recentEvents.map((event) => (
          <div key={event.id} className="rounded-lg border border-stone-200 bg-white p-2">
            <div className="font-medium text-ink">{event.eventType}</div>
            <div>{new Date(event.occurredAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </aside>
  );
});

TimelineMomentsPanel.displayName = 'TimelineMomentsPanel';
