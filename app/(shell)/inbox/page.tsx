'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { api } from '@/ui/api/client';
import { ItemList } from '@/ui/components/item-list';
import { useItemActions } from '@/ui/hooks/use-item-actions';
import { invalidateTimelineCaches } from '@/ui/query/invalidate-timeline';
import { queryKeys } from '@/ui/query/keys';
import { useUiStore } from '@/ui/state/ui-store';

export default function InboxPage() {
  const queryClient = useQueryClient();
  const inboxQuery = useQuery({ queryKey: queryKeys.inbox, queryFn: api.getInboxView });
  const projectsQuery = useQuery({ queryKey: queryKeys.projects, queryFn: () => api.listProjects(false) });

  const { complete, setStatus, schedule, defer } = useItemActions();

  const selectedItemId = useUiStore((state) => state.selectedItemId);
  const setSelectedItemId = useUiStore((state) => state.setSelectedItemId);
  const setListItemIds = useUiStore((state) => state.setListItemIds);

  useEffect(() => {
    if (!inboxQuery.data) return;
    setListItemIds(inboxQuery.data.items.map((item) => item.id));
  }, [inboxQuery.data, setListItemIds]);

  const invalidate = async (itemId?: string) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.inbox }),
      queryClient.invalidateQueries({ queryKey: queryKeys.today }),
      queryClient.invalidateQueries({ queryKey: queryKeys.upcoming }),
      queryClient.invalidateQueries({ queryKey: queryKeys.items })
    ]);
    await invalidateTimelineCaches(queryClient);
    if (itemId) {
      await queryClient.invalidateQueries({ queryKey: queryKeys.itemDetail(itemId) });
    }
  };

  const projectAssignMutation = useMutation({
    mutationFn: (input: { itemId: string; projectId?: string }) => api.updateItem(input.itemId, { projectId: input.projectId }),
    onSuccess: (_, input) => invalidate(input.itemId)
  });

  const tagsMutation = useMutation({
    mutationFn: (input: { itemId: string; tags: string[] }) => api.updateTags(input.itemId, input.tags),
    onSuccess: (_, input) => invalidate(input.itemId)
  });

  if (inboxQuery.isLoading) return <div className="text-sm text-muted">Loading Inbox…</div>;
  if (inboxQuery.isError || !inboxQuery.data) return <div className="text-sm text-danger">Failed to load Inbox.</div>;

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Inbox</h1>
        <p className="text-sm text-muted">Capture and triage quickly: assign project, tags, schedule, and activate.</p>
      </header>

      <ItemList
        items={inboxQuery.data.items}
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

      <section className="space-y-2 rounded-xl border border-stone-300 bg-panel p-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Triage Controls</h2>
        {inboxQuery.data.items.map((item) => (
          <div key={item.id} className="grid gap-2 rounded border border-stone-200 bg-white p-2 md:grid-cols-[1fr_auto_auto_auto]">
            <div className="text-sm text-ink">{item.title}</div>

            <select
              aria-label={`Assign project for ${item.title}`}
              className="rounded border border-stone-300 px-2 py-1 text-xs"
              defaultValue={item.project?.id ?? ''}
              onChange={(event) =>
                projectAssignMutation.mutate({
                  itemId: item.id,
                  projectId: event.target.value || undefined
                })
              }
            >
              <option value="">No project</option>
              {(projectsQuery.data ?? []).map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="rounded border border-stone-300 px-2 py-1 text-xs hover:border-accent"
              onClick={() => {
                const raw = window.prompt(`Tags for ${item.title} (comma-separated)`);
                if (!raw) return;
                const tags = raw.split(',').map((value) => value.trim()).filter(Boolean);
                if (tags.length > 0) tagsMutation.mutate({ itemId: item.id, tags });
              }}
            >
              Add Tags
            </button>

            <button
              type="button"
              className="rounded bg-accent px-2 py-1 text-xs text-white hover:bg-cyan-700"
              onClick={() => setStatus(item.id, 'active')}
            >
              Activate
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}
