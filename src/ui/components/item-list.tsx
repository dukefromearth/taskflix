'use client';

import type { ItemRowDto } from '@/domain/types';
import { cn } from '@/ui/components/utils';

type ActionHandlers = {
  onComplete?: (itemId: string) => void;
  onActivate?: (itemId: string) => void;
  onInbox?: (itemId: string) => void;
  onScheduleTomorrow?: (itemId: string) => void;
  onDeferDay?: (itemId: string) => void;
};

type ItemListProps = {
  items: ItemRowDto[];
  selectedItemId?: string;
  onSelect: (itemId: string) => void;
  actions?: ActionHandlers;
  emptyLabel?: string;
};

export const ItemList = ({ items, selectedItemId, onSelect, actions, emptyLabel = 'No items' }: ItemListProps) => {
  if (items.length === 0) {
    return <div className="rounded-xl border border-stone-300 bg-panel p-4 text-sm text-muted">{emptyLabel}</div>;
  }

  const actionList = [
    { key: 'complete', label: 'Done', onClick: actions?.onComplete },
    { key: 'activate', label: 'Active', onClick: actions?.onActivate },
    { key: 'inbox', label: 'Inbox', onClick: actions?.onInbox },
    { key: 'scheduleTomorrow', label: 'Tomorrow', onClick: actions?.onScheduleTomorrow },
    { key: 'deferDay', label: 'Defer +1d', onClick: actions?.onDeferDay }
  ] as const;

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id}>
          <article
            className={cn(
              'rounded-xl border bg-gradient-to-b from-white via-white to-stone-50 p-3 shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-accent/60',
              selectedItemId === item.id ? 'border-accent ring-2 ring-accent/25 shadow-[0_20px_38px_-24px_rgba(185,28,28,0.65)]' : 'border-stone-300'
            )}
          >
            <button type="button" onClick={() => onSelect(item.id)} className="w-full text-left">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-medium text-ink">{item.title}</div>
                <div className="mt-1 text-xs leading-5 text-muted">
                  {item.project ? item.project.title : 'No project'}
                  {item.isOverdue ? ' · overdue' : ''}
                  {item.scheduledAt ? ` · scheduled ${new Date(item.scheduledAt).toLocaleDateString()}` : ''}
                  {item.dueAt ? ` · due ${new Date(item.dueAt).toLocaleDateString()}` : ''}
                </div>
                {item.tags.length > 0 ? <div className="mt-2 text-xs text-muted">#{item.tags.join(' #')}</div> : null}
              </div>
              <div className="flex items-center gap-1">
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase',
                    item.status === 'done'
                      ? 'bg-emerald-100 text-emerald-900'
                      : item.status === 'canceled'
                        ? 'bg-stone-200 text-stone-700'
                        : item.status === 'blocked'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-blue-100 text-blue-900'
                  )}
                >
                  {item.status}
                </span>
                <span className="rounded-full bg-stone-100 px-1.5 py-0.5 text-[10px] font-medium text-muted">P{item.priority}</span>
              </div>
            </div>
            </button>

            <div className="mt-3 flex flex-wrap gap-1" aria-label="Inline item actions">
              {actionList.map((action) => (
                <ActionButton
                  key={action.key}
                  label={action.label}
                  disabled={!action.onClick}
                  onClick={() => action.onClick?.(item.id)}
                />
              ))}
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
};

const ActionButton = ({ label, onClick, disabled }: { label: string; onClick?: () => void; disabled?: boolean }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={(event) => {
      event.preventDefault();
      event.stopPropagation();
      onClick?.();
    }}
    className="rounded border border-stone-300 bg-white px-2 py-0.5 text-xs text-muted transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
  >
    {label}
  </button>
);
