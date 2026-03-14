'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import type { ItemRowDto, ItemStatus } from '@/domain/types';
import { api } from '@/ui/api/client';
import { ItemList } from '@/ui/components/item-list';
import { useItemActions } from '@/ui/hooks/use-item-actions';
import { queryKeys } from '@/ui/query/keys';
import { useUiStore } from '@/ui/state/ui-store';

const statusOrder: ItemStatus[] = ['active', 'blocked', 'waiting', 'inbox', 'done', 'canceled'];

export default function ProjectPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.projectView(projectId),
    queryFn: () => api.getProjectView(projectId),
    enabled: Boolean(projectId)
  });

  const { complete, setStatus, schedule, defer } = useItemActions();
  const selectedItemId = useUiStore((state) => state.selectedItemId);
  const setSelectedItemId = useUiStore((state) => state.setSelectedItemId);
  const setListItemIds = useUiStore((state) => state.setListItemIds);

  useEffect(() => {
    if (!data) return;
    setListItemIds(data.items.map((item) => item.id));
  }, [data, setListItemIds]);

  const groups = useMemo(() => {
    const map = new Map<ItemStatus, ItemRowDto[]>();
    for (const status of statusOrder) map.set(status, []);
    for (const item of data?.items ?? []) {
      const list = map.get(item.status) ?? [];
      list.push(item);
      map.set(item.status, list);
    }
    return map;
  }, [data]);

  if (isLoading) return <div className="text-sm text-muted">Loading project…</div>;
  if (isError || !data) return <div className="text-sm text-danger">Failed to load project view.</div>;

  return (
    <div className="space-y-4">
      <header className="rounded-xl border border-stone-300 bg-panel p-3">
        <h1 className="text-2xl font-semibold text-ink">{data.project.title}</h1>
        <p className="text-sm text-muted">{data.project.descriptionMd || 'No project description.'}</p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted">
          {statusOrder.map((status) => (
            <span key={status} className="rounded bg-stone-200 px-2 py-1">
              {status}: {groups.get(status)?.length ?? 0}
            </span>
          ))}
        </div>
      </header>

      {statusOrder.map((status) => (
        <section key={status}>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">{status}</h2>
          <ItemList
            items={groups.get(status) ?? []}
            selectedItemId={selectedItemId}
            onSelect={setSelectedItemId}
            emptyLabel={`No ${status} items`}
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

      <section className="rounded-xl border border-stone-300 bg-panel p-3">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">Recent History</h2>
        <div className="space-y-2">
          {data.history.slice(0, 12).map((event) => (
            <div key={event.id} className="rounded border border-stone-200 bg-white p-2 text-xs text-muted">
              <div className="font-medium text-ink">{event.eventType}</div>
              <div>{new Date(event.occurredAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
