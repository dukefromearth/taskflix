'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { type ReactNode, useEffect, useRef } from 'react';
import { getDefaultTimelineWindow } from '@/domain/time';
import { api } from '@/ui/api/client';
import { CommandPalette } from '@/ui/components/command-palette';
import { DetailPane } from '@/ui/components/detail-pane';
import { LeftRail } from '@/ui/components/left-rail';
import { invalidateTimelineCaches } from '@/ui/query/invalidate-timeline';
import { queryKeys } from '@/ui/query/keys';
import { timelineNowSummaryQueryOptions } from '@/ui/query/timeline-query-options';
import { useUiStore } from '@/ui/state/ui-store';

type AppShellProps = {
  children: ReactNode;
};

const isEditableTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable;
};

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

export const AppShell = ({ children }: AppShellProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const gSequenceAt = useRef<number | undefined>(undefined);
  const timelineNowRef = useRef(Date.now());
  const timelineWindow = getDefaultTimelineWindow(timelineNowRef.current);

  const selectedItemId = useUiStore((state) => state.selectedItemId);
  const setSelectedItemId = useUiStore((state) => state.setSelectedItemId);
  const moveSelection = useUiStore((state) => state.moveSelection);
  const paletteOpen = useUiStore((state) => state.paletteOpen);
  const setPaletteOpen = useUiStore((state) => state.setPaletteOpen);
  const railOpen = useUiStore((state) => state.railOpen);
  const setRailOpen = useUiStore((state) => state.setRailOpen);
  const railWidth = useUiStore((state) => state.railWidth);
  const setRailWidth = useUiStore((state) => state.setRailWidth);
  const detailWidth = useUiStore((state) => state.detailWidth);
  const setDetailWidth = useUiStore((state) => state.setDetailWidth);

  const todayQuery = useQuery({ queryKey: queryKeys.today, queryFn: api.getTodayView });
  const upcomingQuery = useQuery({ queryKey: queryKeys.upcoming, queryFn: api.getUpcomingView });
  const inboxQuery = useQuery({ queryKey: queryKeys.inbox, queryFn: api.getInboxView });
  const historyQuery = useQuery({ queryKey: queryKeys.history, queryFn: api.getHistoryView });
  const timelineQuery = useQuery({
    queryKey: queryKeys.timelineNowSummary({
      zoom: 'week',
      projectIds: ''
    }),
    queryFn: ({ signal }) =>
      api.getTimelineSummary({
        zoom: 'week',
        windowStart: timelineWindow.windowStart,
        windowEnd: timelineWindow.windowEnd,
        playheadTs: timelineNowRef.current
      }, { signal }),
    ...timelineNowSummaryQueryOptions
  });
  const projectsQuery = useQuery({ queryKey: queryKeys.projects, queryFn: () => api.listProjects(false) });
  const savedViewsQuery = useQuery({ queryKey: queryKeys.savedViews, queryFn: api.listSavedViews });

  const invalidateAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.today }),
      queryClient.invalidateQueries({ queryKey: queryKeys.upcoming }),
      queryClient.invalidateQueries({ queryKey: queryKeys.inbox }),
      queryClient.invalidateQueries({ queryKey: queryKeys.history }),
      queryClient.invalidateQueries({ queryKey: queryKeys.items })
    ]);
    await invalidateTimelineCaches(queryClient);
    if (selectedItemId) {
      await queryClient.invalidateQueries({ queryKey: queryKeys.itemDetail(selectedItemId) });
    }
  };

  const completeMutation = useMutation({
    mutationFn: async (itemId: string) => api.completeItem(itemId),
    onSuccess: invalidateAll
  });

  const statusMutation = useMutation({
    mutationFn: async (input: { itemId: string; to: 'active' | 'inbox' | 'canceled' }) => api.changeItemStatus(input.itemId, input.to),
    onSuccess: invalidateAll
  });

  const scheduleMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      return api.scheduleItem(itemId, tomorrow.getTime());
    },
    onSuccess: invalidateAll
  });

  const deferMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const date = Date.now() + 24 * 60 * 60 * 1000;
      return api.deferItem(itemId, date);
    },
    onSuccess: invalidateAll
  });

  const tagMutation = useMutation({
    mutationFn: async (input: { itemId: string; tags: string[] }) => api.updateTags(input.itemId, input.tags),
    onSuccess: invalidateAll
  });

  const linkMutation = useMutation({
    mutationFn: async (input: { itemId: string; url: string; label?: string }) =>
      api.addLink(input.itemId, { url: input.url, label: input.label, kind: 'generic' }),
    onSuccess: invalidateAll
  });

  const withSelected = (fn: (itemId: string) => void) => {
    if (!selectedItemId) return;
    fn(selectedItemId);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setPaletteOpen(true);
        return;
      }

      if (paletteOpen) return;
      if (isEditableTarget(event.target)) return;

      if (event.key.toLowerCase() === 'j') {
        event.preventDefault();
        moveSelection(1);
        return;
      }

      if (event.key.toLowerCase() === 'k') {
        event.preventDefault();
        moveSelection(-1);
        return;
      }

      if (event.key.toLowerCase() === 'c') {
        event.preventDefault();
        withSelected((itemId) => completeMutation.mutate(itemId));
        return;
      }

      if (event.key.toLowerCase() === 's') {
        event.preventDefault();
        withSelected((itemId) => scheduleMutation.mutate(itemId));
        return;
      }

      if (event.key.toLowerCase() === 'x') {
        event.preventDefault();
        withSelected((itemId) => statusMutation.mutate({ itemId, to: 'canceled' }));
        return;
      }

      if (event.key.toLowerCase() === '#') {
        event.preventDefault();
        withSelected((itemId) => {
          const raw = window.prompt('Add tags (comma-separated)');
          if (!raw) return;
          const tags = raw.split(',').map((value) => value.trim()).filter(Boolean);
          if (tags.length > 0) tagMutation.mutate({ itemId, tags });
        });
        return;
      }

      if (event.key.toLowerCase() === 'l') {
        event.preventDefault();
        withSelected((itemId) => {
          const url = window.prompt('Link URL');
          if (!url) return;
          const label = window.prompt('Link label (optional)') ?? undefined;
          linkMutation.mutate({ itemId, url, label });
        });
        return;
      }

      if (event.key.toLowerCase() === 'e') {
        event.preventDefault();
        withSelected((itemId) => setSelectedItemId(itemId));
        return;
      }

      if (event.key.toLowerCase() === 'g') {
        gSequenceAt.current = Date.now();
        return;
      }

      if (gSequenceAt.current && Date.now() - gSequenceAt.current < 1000) {
        const key = event.key.toLowerCase();
        if (key === 't') router.push('/timeline');
        if (key === 'd') router.push('/today');
        if (key === 'u') router.push('/upcoming');
        if (key === 'i') router.push('/inbox');
        if (key === 'h') router.push('/history');
        gSequenceAt.current = undefined;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    completeMutation,
    deferMutation,
    linkMutation,
    moveSelection,
    paletteOpen,
    router,
    scheduleMutation,
    selectedItemId,
    setPaletteOpen,
    setSelectedItemId,
    statusMutation,
    tagMutation
  ]);

  useEffect(() => {
    const storedRailWidth = window.localStorage.getItem('taskio.railWidth');
    const storedDetailWidth = window.localStorage.getItem('taskio.detailWidth');
    if (storedRailWidth) {
      const parsed = Number(storedRailWidth);
      if (!Number.isNaN(parsed)) setRailWidth(parsed);
    }
    if (storedDetailWidth) {
      const parsed = Number(storedDetailWidth);
      if (!Number.isNaN(parsed)) setDetailWidth(parsed);
    }
  }, [setDetailWidth, setRailWidth]);

  useEffect(() => {
    window.localStorage.setItem('taskio.railWidth', String(railWidth));
  }, [railWidth]);

  useEffect(() => {
    window.localStorage.setItem('taskio.detailWidth', String(detailWidth));
  }, [detailWidth]);

  useEffect(() => {
    if (window.innerWidth >= 1024) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = railOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [railOpen]);

  const todayCount = todayQuery.data?.sections.reduce((sum, section) => sum + section.count, 0) ?? 0;
  const upcomingCount = upcomingQuery.data?.buckets.reduce((sum, bucket) => sum + bucket.items.length, 0) ?? 0;
  const inboxCount = inboxQuery.data?.items.length ?? 0;
  const historyCount = historyQuery.data?.events.length ?? 0;
  const timelineCount = (timelineQuery.data?.counts.plan ?? 0) + (timelineQuery.data?.counts.reality ?? 0);
  const hasSelection = Boolean(selectedItemId);
  const effectiveDetailWidth = hasSelection ? detailWidth : clamp(Math.round(detailWidth * 0.62), 260, 380);

  const startRailResize = (startClientX: number) => {
    const startWidth = railWidth;
    const onMouseMove = (event: MouseEvent) => {
      const next = clamp(startWidth + (event.clientX - startClientX), 240, 420);
      setRailWidth(next);
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

    const startDetailResize = (startClientX: number) => {
    const startWidth = detailWidth;
    const onMouseMove = (event: MouseEvent) => {
      const next = clamp(startWidth + (startClientX - event.clientX), 280, 760);
      setDetailWidth(next);
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div className="relative flex min-h-screen bg-bg text-ink">
      <LeftRail
        open={railOpen}
        onClose={() => setRailOpen(false)}
        desktopWidth={railWidth}
        timelineCount={timelineCount}
        todayCount={todayCount}
        upcomingCount={upcomingCount}
        inboxCount={inboxCount}
        historyCount={historyCount}
        projects={projectsQuery.data ?? []}
        savedViews={savedViewsQuery.data ?? []}
      />
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize navigation width"
        onMouseDown={(event) => {
          if (window.innerWidth < 1024) return;
          event.preventDefault();
          startRailResize(event.clientX);
        }}
        className="group relative z-20 hidden w-1 shrink-0 cursor-col-resize bg-transparent lg:block"
      >
        <div className="absolute inset-y-0 left-0.5 w-px bg-stone-300 group-hover:bg-accent" />
      </div>

      {railOpen ? <button type="button" className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setRailOpen(false)} /> : null}

      <main className="relative z-10 flex min-h-screen w-full flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-stone-300 bg-[linear-gradient(180deg,rgba(255,252,247,0.95),rgba(252,246,238,0.88))] px-3 py-2 backdrop-blur md:px-4">
          <button
            type="button"
            className="rounded border border-stone-300 bg-white/70 px-2 py-1 text-xs shadow-[0_8px_20px_-14px_rgba(36,20,8,0.55)] lg:hidden"
            onClick={() => setRailOpen(true)}
          >
            Menu
          </button>
          <div className="flex max-w-full items-center gap-2 overflow-x-auto whitespace-nowrap text-xs text-muted [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <span className="font-medium">Cmd/Ctrl+K</span>
            <span className="rounded-full bg-red-50 px-2 py-0.5 text-red-900 ring-1 ring-red-200">Timeline {timelineCount}</span>
            <span className="hidden rounded-full bg-stone-200 px-2 py-0.5 sm:inline-flex">Today {todayCount}</span>
            <span className="hidden rounded-full bg-stone-200 px-2 py-0.5 md:inline-flex">Inbox {inboxCount}</span>
            <span className="hidden rounded-full bg-stone-200 px-2 py-0.5 md:inline-flex">Upcoming {upcomingCount}</span>
            <span className="rounded-full bg-stone-200 px-2 py-0.5">Selection {hasSelection ? 'on' : 'off'}</span>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          <div className="min-w-0 flex-1 overflow-y-auto p-3 pb-20 md:p-4 lg:pb-4">{children}</div>
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize detail pane width"
            onMouseDown={(event) => {
              if (window.innerWidth < 1024) return;
              if (!hasSelection) return;
              event.preventDefault();
              startDetailResize(event.clientX);
            }}
            className={`group relative hidden w-1 shrink-0 bg-transparent lg:block ${
              hasSelection ? 'cursor-col-resize' : 'cursor-default opacity-55'
            }`}
          >
            <div className="absolute inset-y-0 left-0.5 w-px bg-stone-300 group-hover:bg-accent" />
          </div>
          <div className="hidden shrink-0 transition-[width] duration-300 lg:block" style={{ width: `${effectiveDetailWidth}px` }}>
            <DetailPane itemId={selectedItemId} onClose={() => setSelectedItemId(undefined)} />
          </div>
        </div>
      </main>

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        selectedItemId={selectedItemId}
        onNavigate={(href) => {
          router.push(href);
          setPaletteOpen(false);
        }}
        onComplete={() => withSelected((itemId) => completeMutation.mutate(itemId))}
        onSetStatus={(status) => withSelected((itemId) => statusMutation.mutate({ itemId, to: status }))}
        onScheduleTomorrow={() => withSelected((itemId) => scheduleMutation.mutate(itemId))}
        onDeferDay={() => withSelected((itemId) => deferMutation.mutate(itemId))}
        onAddTags={(tags) => withSelected((itemId) => tagMutation.mutate({ itemId, tags }))}
        onAddLink={(url, label) => withSelected((itemId) => linkMutation.mutate({ itemId, url, label }))}
      />

      {selectedItemId ? (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden">
          <button type="button" aria-label="Close detail pane" className="absolute inset-0" onClick={() => setSelectedItemId(undefined)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-md bg-panel">
            <DetailPane itemId={selectedItemId} onClose={() => setSelectedItemId(undefined)} />
          </div>
        </div>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-stone-300 bg-panel/95 p-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          className="w-full rounded border border-red-300 bg-gradient-to-r from-red-700 to-red-600 px-3 py-2 text-sm font-semibold text-white shadow-[0_18px_32px_-20px_rgba(185,28,28,0.95)]"
        >
          Open Command Palette
        </button>
      </div>
    </div>
  );
};
