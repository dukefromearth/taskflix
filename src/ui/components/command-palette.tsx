'use client';

import { useQuery } from '@tanstack/react-query';
import { Command } from 'cmdk';
import { useMemo, useState } from 'react';
import { api } from '@/ui/api/client';
import { queryKeys } from '@/ui/query/keys';

type CommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItemId?: string;
  onNavigate: (href: string) => void;
  onComplete: () => void;
  onSetStatus: (status: 'active' | 'inbox' | 'canceled') => void;
  onScheduleTomorrow: () => void;
  onDeferDay: () => void;
  onAddTags: (tags: string[]) => void;
  onAddLink: (url: string, label?: string) => void;
};

export const CommandPalette = ({
  open,
  onOpenChange,
  selectedItemId,
  onNavigate,
  onComplete,
  onSetStatus,
  onScheduleTomorrow,
  onDeferDay,
  onAddTags,
  onAddLink
}: CommandPaletteProps) => {
  const [search, setSearch] = useState('');

  const itemsQuery = useQuery({ queryKey: queryKeys.items, queryFn: api.listItems });
  const projectsQuery = useQuery({ queryKey: queryKeys.projects, queryFn: () => api.listProjects(false) });
  const savedViewsQuery = useQuery({ queryKey: queryKeys.savedViews, queryFn: api.listSavedViews });

  const recentItems = useMemo(() => (itemsQuery.data ?? []).slice(0, 12), [itemsQuery.data]);

  if (!open) return null;

  const runAndClose = (fn: () => void) => {
    fn();
    onOpenChange(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[radial-gradient(circle_at_12%_12%,rgba(248,113,113,0.18),rgba(0,0,0,0.5))] p-4 backdrop-blur-sm" onClick={() => onOpenChange(false)}>
      <Command
        loop
        className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-stone-300 bg-[linear-gradient(180deg,rgba(255,252,247,0.98),rgba(249,243,235,0.98))] shadow-[0_28px_70px_-34px_rgba(20,13,9,0.9)]"
        onClick={(event) => event.stopPropagation()}
      >
        <Command.Input
          autoFocus
          value={search}
          onValueChange={setSearch}
          placeholder="Type a command or search..."
          className="w-full border-b border-stone-300 bg-transparent px-4 py-3 text-sm outline-none"
        />
        <Command.List className="max-h-[70vh] overflow-y-auto p-2">
          <Command.Empty className="p-3 text-sm text-muted">No results.</Command.Empty>

          <Command.Group heading="Go To" className="mb-3 px-2 text-xs text-muted">
            <PaletteItem onSelect={() => runAndClose(() => onNavigate('/timeline'))} label="Go: Timeline (G T)" />
            <PaletteItem onSelect={() => runAndClose(() => onNavigate('/today'))} label="Go: Today (G D)" />
            <PaletteItem onSelect={() => runAndClose(() => onNavigate('/upcoming'))} label="Go: Upcoming (G U)" />
            <PaletteItem onSelect={() => runAndClose(() => onNavigate('/inbox'))} label="Go: Inbox (G I)" />
            <PaletteItem onSelect={() => runAndClose(() => onNavigate('/history'))} label="Go: History (G H)" />
            <PaletteItem onSelect={() => runAndClose(() => onNavigate('/search'))} label="Go: Search" />
            <PaletteItem onSelect={() => runAndClose(() => onNavigate('/settings'))} label="Go: Settings" />
          </Command.Group>

          <Command.Group heading="Selected Item" className="mb-3 px-2 text-xs text-muted">
            <PaletteItem disabled={!selectedItemId} onSelect={() => runAndClose(onComplete)} label="Complete (C)" />
            <PaletteItem disabled={!selectedItemId} onSelect={() => runAndClose(() => onSetStatus('active'))} label="Set Active" />
            <PaletteItem disabled={!selectedItemId} onSelect={() => runAndClose(() => onSetStatus('inbox'))} label="Set Inbox" />
            <PaletteItem disabled={!selectedItemId} onSelect={() => runAndClose(() => onSetStatus('canceled'))} label="Cancel (X)" />
            <PaletteItem disabled={!selectedItemId} onSelect={() => runAndClose(onScheduleTomorrow)} label="Schedule Tomorrow (S)" />
            <PaletteItem disabled={!selectedItemId} onSelect={() => runAndClose(onDeferDay)} label="Defer +1 day" />
            <PaletteItem
              disabled={!selectedItemId}
              onSelect={() => {
                const raw = window.prompt('Tags (comma-separated)');
                if (!raw) return;
                const tags = raw
                  .split(',')
                  .map((value) => value.trim())
                  .filter(Boolean);
                if (tags.length > 0) runAndClose(() => onAddTags(tags));
              }}
              label="Add Tags (#)"
            />
            <PaletteItem
              disabled={!selectedItemId}
              onSelect={() => {
                const url = window.prompt('Link URL');
                if (!url) return;
                const label = window.prompt('Link label (optional)') ?? undefined;
                runAndClose(() => onAddLink(url, label));
              }}
              label="Add Link (L)"
            />
          </Command.Group>

          <Command.Group heading="Projects" className="mb-3 px-2 text-xs text-muted">
            {(projectsQuery.data ?? []).map((project) => (
              <PaletteItem key={project.id} onSelect={() => runAndClose(() => onNavigate(`/projects/${project.id}`))} label={`Project: ${project.title}`} />
            ))}
          </Command.Group>

          <Command.Group heading="Saved Views" className="mb-3 px-2 text-xs text-muted">
            {(savedViewsQuery.data ?? []).map((view) => (
              <PaletteItem key={view.id} onSelect={() => runAndClose(() => onNavigate(`/search?q=${encodeURIComponent(view.name)}`))} label={`View: ${view.name}`} />
            ))}
          </Command.Group>

          <Command.Group heading="Recent Items" className="px-2 text-xs text-muted">
            {recentItems.map((item) => (
              <PaletteItem
                key={item.id}
                onSelect={() => runAndClose(() => onNavigate(`/search?q=${encodeURIComponent(item.title)}`))}
                label={item.title}
              />
            ))}
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
};

const PaletteItem = ({
  label,
  onSelect,
  disabled
}: {
  label: string;
  onSelect: () => void;
  disabled?: boolean;
}) => (
  <Command.Item
    disabled={disabled}
    onSelect={() => {
      if (!disabled) onSelect();
    }}
    className="cursor-pointer rounded px-2 py-2 text-sm text-ink transition aria-disabled:cursor-not-allowed aria-disabled:opacity-40 data-[selected=true]:bg-accent/15 data-[selected=true]:text-accent"
  >
    {label}
  </Command.Item>
);
