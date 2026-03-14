'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/ui/api/client';
import { ItemList } from '@/ui/components/item-list';
import { useItemActions } from '@/ui/hooks/use-item-actions';
import { queryKeys } from '@/ui/query/keys';
import { useUiStore } from '@/ui/state/ui-store';

const splitCsv = (value: string): string[] | undefined => {
  const list = value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  return list.length > 0 ? list : undefined;
};

type SearchPageClientProps = {
  initialQ: string;
  initialStatuses: string;
  initialProjectIds: string;
  initialTagAny: string;
};

export const SearchPageClient = ({ initialQ, initialStatuses, initialProjectIds, initialTagAny }: SearchPageClientProps) => {
  const router = useRouter();

  const [q, setQ] = useState(initialQ);
  const [statusTokens, setStatusTokens] = useState(initialStatuses);
  const [projectTokens, setProjectTokens] = useState(initialProjectIds);
  const [tagTokens, setTagTokens] = useState(initialTagAny);

  const filterJson = useMemo(
    () => JSON.stringify({ statuses: statusTokens, projectIds: projectTokens, tagAny: tagTokens }),
    [statusTokens, projectTokens, tagTokens]
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.search(q, filterJson),
    queryFn: () =>
      api.search({
        q,
        statuses: splitCsv(statusTokens),
        projectIds: splitCsv(projectTokens),
        tagAny: splitCsv(tagTokens),
        includeDone: true
      })
  });

  const { complete, setStatus, schedule, defer } = useItemActions();
  const selectedItemId = useUiStore((state) => state.selectedItemId);
  const setSelectedItemId = useUiStore((state) => state.setSelectedItemId);
  const setListItemIds = useUiStore((state) => state.setListItemIds);

  useEffect(() => {
    setListItemIds((data ?? []).map((result) => result.item.id));
  }, [data, setListItemIds]);

  const syncUrl = () => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (statusTokens.trim()) params.set('statuses', statusTokens.trim());
    if (projectTokens.trim()) params.set('projectIds', projectTokens.trim());
    if (tagTokens.trim()) params.set('tagAny', tagTokens.trim());
    router.replace(`/search?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Search</h1>
        <p className="text-sm text-muted">Query items with filter tokens for status, project, and tags.</p>
      </header>

      <section className="grid gap-2 rounded-xl border border-stone-300 bg-panel p-3 md:grid-cols-4">
        <label className="text-xs text-muted">
          Query
          <input
            className="mt-1 w-full rounded border border-stone-300 bg-white px-2 py-1 text-sm"
            value={q}
            onChange={(event) => setQ(event.target.value)}
            onBlur={syncUrl}
            placeholder="design doc"
          />
        </label>
        <label className="text-xs text-muted">
          Status tokens
          <input
            className="mt-1 w-full rounded border border-stone-300 bg-white px-2 py-1 text-sm"
            value={statusTokens}
            onChange={(event) => setStatusTokens(event.target.value)}
            onBlur={syncUrl}
            placeholder="active,blocked"
          />
        </label>
        <label className="text-xs text-muted">
          Project ids
          <input
            className="mt-1 w-full rounded border border-stone-300 bg-white px-2 py-1 text-sm"
            value={projectTokens}
            onChange={(event) => setProjectTokens(event.target.value)}
            onBlur={syncUrl}
            placeholder="01ABC...,01DEF..."
          />
        </label>
        <label className="text-xs text-muted">
          Tag tokens
          <input
            className="mt-1 w-full rounded border border-stone-300 bg-white px-2 py-1 text-sm"
            value={tagTokens}
            onChange={(event) => setTagTokens(event.target.value)}
            onBlur={syncUrl}
            placeholder="frontend,urgent"
          />
        </label>
      </section>

      {isLoading ? <div className="text-sm text-muted">Searching…</div> : null}
      {isError ? <div className="text-sm text-danger">Search failed.</div> : null}

      {(data ?? []).map((result) => (
        <article key={result.item.id} className="space-y-1 rounded-xl border border-stone-300 bg-panel p-3">
          <div className="text-xs text-muted">Score: {result.score.toFixed(2)}</div>
          <ItemList
            items={[result.item]}
            selectedItemId={selectedItemId}
            onSelect={setSelectedItemId}
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
          {result.snippet ? <div className="rounded bg-stone-100 p-2 text-xs text-muted">{result.snippet}</div> : null}
        </article>
      ))}
    </div>
  );
};
