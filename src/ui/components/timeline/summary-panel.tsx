import { memo } from 'react';
import type { ItemRowDto, TimelineSummaryDto } from '@/domain/types';
import { ItemList } from '@/ui/components/item-list';

type TimelineSummaryPanelProps = {
  timelineSummary: TimelineSummaryDto;
  visibleTopItems: ItemRowDto[];
  hasHiddenTopItems: boolean;
  showAllTopItems: boolean;
  selectedItemId?: string;
  isFetching: boolean;
  onSelectItem: (itemId: string) => void;
  onToggleShowAllTopItems: () => void;
  onComplete: (itemId: string) => void;
  onActivate: (itemId: string) => void;
  onInbox: (itemId: string) => void;
  onSchedule: (itemId: string) => void;
  onDefer: (itemId: string) => void;
  onCancelSelected: () => void;
  onAddTags: () => void;
  onAddLink: () => void;
};

export const TimelineSummaryPanel = memo((props: TimelineSummaryPanelProps) => {
  const {
    timelineSummary,
    visibleTopItems,
    hasHiddenTopItems,
    showAllTopItems,
    selectedItemId,
    isFetching,
    onSelectItem,
    onToggleShowAllTopItems,
    onComplete,
    onActivate,
    onInbox,
    onSchedule,
    onDefer,
    onCancelSelected,
    onAddTags,
    onAddLink
  } = props;

  return (
    <div className="space-y-3 rounded-2xl border border-stone-300 bg-panel p-3 shadow-card">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">What Matters</h2>

      <div className="grid grid-cols-2 gap-2 text-xs md:grid-cols-5">
        <MetricChip label="Plan" value={timelineSummary.counts.plan} tone="emerald" />
        <MetricChip label="Reality" value={timelineSummary.counts.reality} tone="red" />
        <MetricChip label="Overdue" value={timelineSummary.counts.overdue} tone="amber" />
        <MetricChip label="Interruptions" value={timelineSummary.counts.interruptions} tone="violet" />
        <div className="rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-xs md:col-span-1">
          <div className="text-muted">Slice</div>
          <div className="font-medium text-ink">{timelineSummary.playheadLabel}</div>
        </div>
      </div>

      {isFetching ? <div className="text-xs text-muted">Updating slice summary…</div> : null}

      <ItemList
        items={visibleTopItems}
        selectedItemId={selectedItemId}
        onSelect={onSelectItem}
        emptyLabel="No top items at this playhead."
        actions={{
          onComplete,
          onActivate,
          onInbox,
          onScheduleTomorrow: onSchedule,
          onDeferDay: onDefer
        }}
      />

      {hasHiddenTopItems ? (
        <button
          type="button"
          className="rounded border border-stone-300 bg-white px-2 py-1 text-xs text-muted hover:border-stone-500 hover:text-ink"
          onClick={onToggleShowAllTopItems}
        >
          {showAllTopItems ? 'Show Fewer Items' : `Show All ${timelineSummary.topItems.length} Items`}
        </button>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded border border-stone-300 px-2 py-1 text-xs hover:border-red-600 hover:text-red-700"
          disabled={!selectedItemId}
          onClick={onCancelSelected}
        >
          Cancel Selected
        </button>
        <button
          type="button"
          className="rounded border border-stone-300 px-2 py-1 text-xs hover:border-stone-500 hover:text-ink"
          disabled={!selectedItemId}
          onClick={onAddTags}
        >
          Add Tags
        </button>
        <button
          type="button"
          className="rounded border border-stone-300 px-2 py-1 text-xs hover:border-stone-500 hover:text-ink"
          disabled={!selectedItemId}
          onClick={onAddLink}
        >
          Add Link
        </button>
      </div>
    </div>
  );
});

TimelineSummaryPanel.displayName = 'TimelineSummaryPanel';

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
