'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useMemo } from 'react';
import type { ItemEvent } from '@/domain/types';
import { api } from '@/ui/api/client';
import { queryKeys } from '@/ui/query/keys';

export default function HistoryPage() {
  const { data, isLoading, isError } = useQuery({ queryKey: queryKeys.history, queryFn: api.getHistoryView });

  const grouped = useMemo(() => {
    const map = new Map<string, ItemEvent[]>();
    for (const event of data?.events ?? []) {
      const day = new Date(event.occurredAt).toLocaleDateString();
      const list = map.get(day) ?? [];
      list.push(event);
      map.set(day, list);
    }
    return [...map.entries()];
  }, [data]);

  if (isLoading) return <div className="text-sm text-muted">Loading history…</div>;
  if (isError || !data) return <div className="text-sm text-danger">Failed to load history.</div>;
  const now = Date.now();

  return (
    <div className="space-y-4">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-ink">History</h1>
        <p className="text-sm text-muted">Timeline of item events, grouped by day.</p>
        <Link
          href={`/timeline?zoom=week&mode=reality&playheadTs=${now}&windowStart=${now - 3 * 24 * 60 * 60 * 1000}&windowEnd=${now + 3 * 24 * 60 * 60 * 1000}`}
          className="inline-flex rounded border border-stone-300 bg-white px-2 py-1 text-xs text-muted hover:border-accent hover:text-accent"
        >
          Open in Timeline
        </Link>
      </header>

      {grouped.map(([day, events]) => (
        <section key={day} className="rounded-xl border border-stone-300 bg-panel p-3">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{day}</h2>
            <Link
              href={`/timeline?zoom=week&mode=reality&playheadTs=${events[0]?.occurredAt ?? now}&windowStart=${
                (events[0]?.occurredAt ?? now) - 3 * 24 * 60 * 60 * 1000
              }&windowEnd=${(events[0]?.occurredAt ?? now) + 3 * 24 * 60 * 60 * 1000}`}
              className="rounded border border-stone-300 bg-white px-2 py-1 text-xs text-muted hover:border-accent hover:text-accent"
            >
              Open Day in Timeline
            </Link>
          </div>
          <div className="space-y-2">
            {events.map((event) => (
              <article key={event.id} className="rounded-lg border border-stone-200 bg-white p-2">
                <div className="text-sm font-medium text-ink">{event.eventType}</div>
                <div className="text-xs text-muted">Item: {event.itemId}</div>
                <div className="text-xs text-muted">{new Date(event.occurredAt).toLocaleTimeString()}</div>
                <pre className="mt-1 overflow-x-auto rounded bg-stone-100 p-2 text-xs text-muted">
                  {JSON.stringify(event.payloadJson, null, 2)}
                </pre>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
