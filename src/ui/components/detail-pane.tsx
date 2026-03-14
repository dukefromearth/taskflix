'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Markdown from 'react-markdown';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import type { ItemStatus } from '@/domain/types';
import { api } from '@/ui/api/client';
import { invalidateTimelineCaches } from '@/ui/query/invalidate-timeline';
import { queryKeys } from '@/ui/query/keys';
import { useUiStore } from '@/ui/state/ui-store';
import { cn } from '@/ui/components/utils';

type DetailPaneProps = {
  itemId?: string;
  onClose: () => void;
};

type Draft = {
  title: string;
  descriptionMd: string;
  status: ItemStatus;
  projectId?: string;
  parentItemId?: string;
  priority: number;
  dueAt?: string;
  scheduledAt?: string;
  requestedBy?: string;
  isInterruption: boolean;
};

const STATUSES: ItemStatus[] = ['inbox', 'active', 'blocked', 'waiting', 'done', 'canceled'];

export const DetailPane = ({ itemId, onClose }: DetailPaneProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setPaletteOpen = useUiStore((state) => state.setPaletteOpen);
  const [showPreview, setShowPreview] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkLabel, setLinkLabel] = useState('');
  const [draft, setDraft] = useState<Draft | undefined>();

  const detailQuery = useQuery({
    queryKey: itemId ? queryKeys.itemDetail(itemId) : ['item', 'none'],
    queryFn: () => api.getItemDetail(itemId ?? ''),
    enabled: Boolean(itemId)
  });

  const projectsQuery = useQuery({ queryKey: queryKeys.projects, queryFn: () => api.listProjects(false) });
  const todayQuery = useQuery({ queryKey: queryKeys.today, queryFn: api.getTodayView });
  const upcomingQuery = useQuery({ queryKey: queryKeys.upcoming, queryFn: api.getUpcomingView });

  useEffect(() => {
    if (!detailQuery.data) return;
    setDraft({
      title: detailQuery.data.item.title,
      descriptionMd: detailQuery.data.item.descriptionMd,
      status: detailQuery.data.item.status,
      projectId: detailQuery.data.item.projectId,
      parentItemId: detailQuery.data.item.parentItemId,
      priority: detailQuery.data.item.priority,
      dueAt: toInputDateTime(detailQuery.data.item.dueAt),
      scheduledAt: toInputDateTime(detailQuery.data.item.scheduledAt),
      requestedBy: detailQuery.data.item.requestedBy,
      isInterruption: detailQuery.data.item.isInterruption
    });
  }, [detailQuery.data]);

  const invalidateAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.today }),
      queryClient.invalidateQueries({ queryKey: queryKeys.upcoming }),
      queryClient.invalidateQueries({ queryKey: queryKeys.inbox }),
      queryClient.invalidateQueries({ queryKey: queryKeys.history }),
      queryClient.invalidateQueries({ queryKey: queryKeys.items }),
      queryClient.invalidateQueries({ queryKey: queryKeys.projects })
    ]);
    await invalidateTimelineCaches(queryClient);
    if (itemId) {
      await queryClient.invalidateQueries({ queryKey: queryKeys.itemDetail(itemId) });
    }
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!itemId || !draft) return;
      await api.updateItem(itemId, {
        title: draft.title,
        descriptionMd: draft.descriptionMd,
        status: draft.status,
        projectId: draft.projectId || undefined,
        parentItemId: draft.parentItemId || undefined,
        priority: draft.priority as 0 | 1 | 2 | 3 | 4,
        dueAt: fromInputDateTime(draft.dueAt),
        scheduledAt: fromInputDateTime(draft.scheduledAt),
        requestedBy: draft.requestedBy || undefined,
        isInterruption: draft.isInterruption
      });
    },
    onSuccess: invalidateAll
  });

  const tagMutation = useMutation({
    mutationFn: async (input: { add?: string[]; remove?: string[] }) => {
      if (!itemId) return;
      await api.updateTags(itemId, input.add, input.remove);
    },
    onSuccess: async () => {
      setTagInput('');
      await invalidateAll();
    }
  });

  const linkMutation = useMutation({
    mutationFn: async () => {
      if (!itemId || !linkUrl.trim()) return;
      await api.addLink(itemId, {
        url: linkUrl.trim(),
        label: linkLabel.trim() || undefined,
        kind: 'generic'
      });
    },
    onSuccess: async () => {
      setLinkUrl('');
      setLinkLabel('');
      await invalidateAll();
    }
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!itemId) return;
      await api.uploadAttachment(itemId, file);
    },
    onSuccess: invalidateAll
  });

  const safeSchema = useMemo(
    () => ({
      ...defaultSchema,
      tagNames: [...(defaultSchema.tagNames ?? []), 'kbd']
    }),
    []
  );

  if (!itemId) {
    const todayCount = todayQuery.data?.sections.reduce((sum, section) => sum + section.count, 0) ?? 0;
    const inProgressCount = todayQuery.data?.sections.find((section) => section.key === 'inProgress')?.count ?? 0;
    const upcomingCount = upcomingQuery.data?.buckets.reduce((sum, bucket) => sum + bucket.items.length, 0) ?? 0;

    return (
      <aside className="hidden h-full w-full overflow-y-auto border-l border-stone-300 bg-panel p-4 lg:block">
        <section className="rounded-2xl border border-stone-300 bg-gradient-to-b from-white to-stone-50 p-4 shadow-card">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Detail Pane</h2>
          <p className="mt-2 text-sm text-ink">Select an item to inspect history, edit fields, and manage links or attachments.</p>

          <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-lg border border-stone-200 bg-white px-2 py-1.5">
              <div className="text-muted">Today</div>
              <div className="text-sm font-semibold text-ink">{todayCount}</div>
            </div>
            <div className="rounded-lg border border-stone-200 bg-white px-2 py-1.5">
              <div className="text-muted">In Progress</div>
              <div className="text-sm font-semibold text-ink">{inProgressCount}</div>
            </div>
            <div className="rounded-lg border border-stone-200 bg-white px-2 py-1.5">
              <div className="text-muted">Upcoming</div>
              <div className="text-sm font-semibold text-ink">{upcomingCount}</div>
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            <button
              type="button"
              className="rounded border border-stone-300 bg-white px-3 py-2 text-left text-sm hover:border-accent hover:text-accent"
              onClick={() => setPaletteOpen(true)}
            >
              Open Command Palette
            </button>
            <button
              type="button"
              className="rounded border border-stone-300 bg-white px-3 py-2 text-left text-sm hover:border-accent hover:text-accent"
              onClick={() => router.push('/timeline')}
            >
              Go to Timeline
            </button>
            <button
              type="button"
              className="rounded border border-stone-300 bg-white px-3 py-2 text-left text-sm hover:border-accent hover:text-accent"
              onClick={() => router.push('/today')}
            >
              Open Today View
            </button>
            <button
              type="button"
              className="rounded border border-stone-300 bg-white px-3 py-2 text-left text-sm hover:border-accent hover:text-accent"
              onClick={() => router.push('/search')}
            >
              Search Everything
            </button>
          </div>

          <div className="mt-4 rounded-xl border border-stone-200 bg-white p-3 text-xs text-muted">
            <div className="font-semibold uppercase tracking-wide">Shortcuts</div>
            <div className="mt-2 space-y-1">
              <div>
                <kbd>Cmd/Ctrl</kbd> + <kbd>K</kbd> Command palette
              </div>
              <div>
                <kbd>J</kbd> / <kbd>K</kbd> Move selection
              </div>
              <div>
                <kbd>C</kbd> Complete selected item
              </div>
              <div>
                <kbd>G</kbd> then <kbd>T</kbd> Jump to timeline
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-red-100 bg-red-50/70 p-3 text-xs text-red-900">
            <div className="font-semibold uppercase tracking-wide">Focus Prompt</div>
            <p className="mt-1">Pick one item, make one state change, and re-scrub to verify impact over time.</p>
          </div>
        </section>
      </aside>
    );
  }

  if (detailQuery.isLoading || !draft) {
    return (
      <aside className="h-full w-full overflow-y-auto border-l border-stone-300 bg-panel p-4">
        <div className="text-sm text-muted">Loading…</div>
      </aside>
    );
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <aside className="h-full w-full overflow-y-auto border-l border-stone-300 bg-panel p-4">
        <div className="text-sm text-danger">Failed to load item details.</div>
      </aside>
    );
  }

  return (
    <aside className="h-full w-full overflow-y-auto border-l border-stone-300 bg-panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Details</h2>
        <button type="button" onClick={onClose} className="rounded border border-stone-300 px-2 py-1 text-xs hover:border-accent">
          Close
        </button>
      </div>

      <div className="space-y-3">
        <label className="block text-xs text-muted">
          Title
          <input
            className="mt-1 w-full rounded border border-stone-300 bg-white px-2 py-1 text-sm"
            value={draft.title}
            onChange={(event) => setDraft({ ...draft, title: event.target.value })}
          />
        </label>

        <div className="grid grid-cols-2 gap-2">
          <label className="block text-xs text-muted">
            Status
            <select
              className="mt-1 w-full rounded border border-stone-300 bg-white px-2 py-1 text-sm"
              value={draft.status}
              onChange={(event) => setDraft({ ...draft, status: event.target.value as ItemStatus })}
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs text-muted">
            Priority
            <select
              className="mt-1 w-full rounded border border-stone-300 bg-white px-2 py-1 text-sm"
              value={draft.priority}
              onChange={(event) => setDraft({ ...draft, priority: Number(event.target.value) })}
            >
              {[0, 1, 2, 3, 4].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block text-xs text-muted">
          Project
          <select
            className="mt-1 w-full rounded border border-stone-300 bg-white px-2 py-1 text-sm"
            value={draft.projectId ?? ''}
            onChange={(event) => setDraft({ ...draft, projectId: event.target.value || undefined })}
          >
            <option value="">No project</option>
            {(projectsQuery.data ?? []).map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs text-muted">
          Parent Item Id
          <input
            className="mt-1 w-full rounded border border-stone-300 bg-white px-2 py-1 text-sm"
            value={draft.parentItemId ?? ''}
            onChange={(event) => setDraft({ ...draft, parentItemId: event.target.value || undefined })}
          />
        </label>

        <div className="grid grid-cols-2 gap-2">
          <label className="block text-xs text-muted">
            Scheduled
            <input
              type="datetime-local"
              className="mt-1 w-full rounded border border-stone-300 bg-white px-2 py-1 text-sm"
              value={draft.scheduledAt ?? ''}
              onChange={(event) => setDraft({ ...draft, scheduledAt: event.target.value || undefined })}
            />
          </label>
          <label className="block text-xs text-muted">
            Due
            <input
              type="datetime-local"
              className="mt-1 w-full rounded border border-stone-300 bg-white px-2 py-1 text-sm"
              value={draft.dueAt ?? ''}
              onChange={(event) => setDraft({ ...draft, dueAt: event.target.value || undefined })}
            />
          </label>
        </div>

        <label className="block text-xs text-muted">
          Requester
          <input
            className="mt-1 w-full rounded border border-stone-300 bg-white px-2 py-1 text-sm"
            value={draft.requestedBy ?? ''}
            onChange={(event) => setDraft({ ...draft, requestedBy: event.target.value || undefined })}
          />
        </label>

        <label className="flex items-center gap-2 text-xs text-muted">
          <input
            type="checkbox"
            checked={draft.isInterruption}
            onChange={(event) => setDraft({ ...draft, isInterruption: event.target.checked })}
          />
          Interruption
        </label>

        <div>
          <div className="mb-1 flex items-center gap-1 text-xs text-muted">
            <button
              type="button"
              className={cn('rounded px-2 py-1', !showPreview ? 'bg-accent/20 text-accent' : 'hover:bg-stone-100')}
              onClick={() => setShowPreview(false)}
            >
              Markdown
            </button>
            <button
              type="button"
              className={cn('rounded px-2 py-1', showPreview ? 'bg-accent/20 text-accent' : 'hover:bg-stone-100')}
              onClick={() => setShowPreview(true)}
            >
              Preview
            </button>
          </div>

          {!showPreview ? (
            <textarea
              aria-label="Item description markdown"
              className="h-36 w-full rounded border border-stone-300 bg-white px-2 py-1 text-sm"
              value={draft.descriptionMd}
              onChange={(event) => setDraft({ ...draft, descriptionMd: event.target.value })}
            />
          ) : (
            <div className="prose prose-sm max-w-none rounded border border-stone-300 bg-white p-2">
              <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[[rehypeSanitize, safeSchema]]}>
                {draft.descriptionMd || '_No description_'}
              </Markdown>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => saveMutation.mutate()}
          className="w-full rounded bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-cyan-700"
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? 'Saving…' : 'Save Changes'}
        </button>

        <section className="rounded border border-stone-300 bg-white p-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Tags</h3>
          <div className="mt-2 flex flex-wrap gap-1">
            {detailQuery.data.tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => tagMutation.mutate({ remove: [tag.name] })}
                className="rounded border border-stone-300 px-2 py-0.5 text-xs hover:border-danger hover:text-danger"
              >
                #{tag.displayName} ×
              </button>
            ))}
          </div>
          <div className="mt-2 flex gap-1">
            <input
              className="w-full rounded border border-stone-300 px-2 py-1 text-xs"
              placeholder="comma-separated tags"
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
            />
            <button
              type="button"
              className="rounded border border-stone-300 px-2 py-1 text-xs hover:border-accent"
              onClick={() => tagMutation.mutate({ add: tagInput.split(',').map((value) => value.trim()).filter(Boolean) })}
            >
              Add
            </button>
          </div>
        </section>

        <section className="rounded border border-stone-300 bg-white p-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Links</h3>
          <div className="mt-2 space-y-1 text-xs">
            {detailQuery.data.links.map((link) => (
              <a key={link.id} className="block text-accent underline" href={link.url} target="_blank" rel="noreferrer">
                {link.label || link.url}
              </a>
            ))}
          </div>
          <div className="mt-2 space-y-1">
            <input
              className="w-full rounded border border-stone-300 px-2 py-1 text-xs"
              placeholder="https://..."
              value={linkUrl}
              onChange={(event) => setLinkUrl(event.target.value)}
            />
            <input
              className="w-full rounded border border-stone-300 px-2 py-1 text-xs"
              placeholder="Label (optional)"
              value={linkLabel}
              onChange={(event) => setLinkLabel(event.target.value)}
            />
            <button
              type="button"
              className="rounded border border-stone-300 px-2 py-1 text-xs hover:border-accent"
              onClick={() => linkMutation.mutate()}
            >
              Add Link
            </button>
          </div>
        </section>

        <section className="rounded border border-stone-300 bg-white p-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Attachments</h3>
          <div className="mt-2 space-y-1 text-xs">
            {detailQuery.data.attachments.map((attachment) => (
              <a
                key={attachment.id}
                className="block text-accent underline"
                href={`/api/attachments/${encodeURIComponent(attachment.id)}/download`}
                target="_blank"
                rel="noreferrer"
              >
                {attachment.originalName}
              </a>
            ))}
          </div>
          <label className="mt-2 block text-xs text-muted">
            Upload
            <input
              type="file"
              className="mt-1 block w-full text-xs"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) uploadMutation.mutate(file);
              }}
            />
          </label>
        </section>

        <section className="rounded border border-stone-300 bg-white p-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Recent Events</h3>
          <div className="mt-2 space-y-1 text-xs text-muted">
            {detailQuery.data.events.slice(0, 10).map((event) => (
              <div key={event.id} className="rounded border border-stone-200 p-2">
                <div className="font-medium text-ink">{event.eventType}</div>
                <div>{new Date(event.occurredAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
};

const toInputDateTime = (value?: number): string | undefined => {
  if (!value) return undefined;
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const fromInputDateTime = (value?: string): number | undefined => {
  if (!value) return undefined;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? undefined : timestamp;
};
