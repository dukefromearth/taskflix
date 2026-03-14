'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useEffect } from 'react';
import { api } from '@/ui/api/client';
import { ItemList } from '@/ui/components/item-list';
import { useItemActions } from '@/ui/hooks/use-item-actions';
import { queryKeys } from '@/ui/query/keys';
import { useUiStore } from '@/ui/state/ui-store';

export default function TodayPage() {
  const { data, isLoading, isError } = useQuery({ queryKey: queryKeys.today, queryFn: api.getTodayView });
  const { complete, setStatus, schedule, defer } = useItemActions();

  const selectedItemId = useUiStore((state) => state.selectedItemId);
  const setSelectedItemId = useUiStore((state) => state.setSelectedItemId);
  const setListItemIds = useUiStore((state) => state.setListItemIds);

  useEffect(() => {
    if (!data) return;
    const ids = data.sections.flatMap((section) => section.items.map((item) => item.id));
    setListItemIds(ids);
  }, [data, setListItemIds]);

  if (isLoading) return <div className="text-sm text-muted">Loading Today view…</div>;
  if (isError || !data) return <div className="text-sm text-danger">Failed to load Today view.</div>;
  const now = Date.now();

  return (
    <div className="space-y-4">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-ink">Today</h1>
        <p className="text-sm text-muted">Triage, overdue, due today, and in-progress work.</p>
        <Link
          href={`/timeline?zoom=week&mode=dual&playheadTs=${now}&windowStart=${now - 3 * 24 * 60 * 60 * 1000}&windowEnd=${now + 3 * 24 * 60 * 60 * 1000}`}
          className="inline-flex rounded border border-stone-300 bg-white px-2 py-1 text-xs text-muted hover:border-accent hover:text-accent"
        >
          Open in Timeline
        </Link>
      </header>

      {data.sections.map((section) => (
        <section key={section.key}>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
            {section.label} <span className="rounded bg-stone-200 px-1.5 py-0.5 text-xs">{section.count}</span>
          </h2>
          <ItemList
            items={section.items}
            selectedItemId={selectedItemId}
            onSelect={setSelectedItemId}
            emptyLabel={`No items in ${section.label.toLowerCase()}.`}
            actions={{
              onComplete: (itemId) => complete(itemId),
              onActivate: (itemId) => setStatus(itemId, 'active'),
              onInbox: (itemId) => setStatus(itemId, 'inbox'),
              onScheduleTomorrow: (itemId) => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                tomorrow.setHours(10, 0, 0, 0);
                schedule(itemId, tomorrow.getTime());
              },
              onDeferDay: (itemId) => defer(itemId, Date.now() + 24 * 60 * 60 * 1000)
            }}
          />
        </section>
      ))}
    </div>
  );
}
