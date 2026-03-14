'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { CSSProperties } from 'react';
import type { Project, SavedView } from '@/domain/types';
import { cn } from '@/ui/components/utils';

type LeftRailProps = {
  open: boolean;
  onClose: () => void;
  desktopWidth: number;
  timelineCount: number;
  todayCount: number;
  upcomingCount: number;
  inboxCount: number;
  historyCount: number;
  projects: Project[];
  savedViews: SavedView[];
};

export const LeftRail = ({
  open,
  onClose,
  desktopWidth,
  timelineCount,
  todayCount,
  upcomingCount,
  inboxCount,
  historyCount,
  projects,
  savedViews
}: LeftRailProps) => {
  const pathname = usePathname();
  const railStyle = { '--rail-width': `${desktopWidth}px` } as CSSProperties;

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 w-[88vw] max-w-[22rem] overflow-y-auto border-r border-stone-300 bg-[linear-gradient(170deg,rgba(255,252,247,0.96),rgba(248,241,232,0.96))] p-3 backdrop-blur-md transition-transform sm:w-[20rem] lg:static lg:w-[var(--rail-width)] lg:max-w-none lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full'
      )}
      style={railStyle}
      aria-label="Primary navigation"
    >
      <div className="sticky top-0 z-10 mb-4 flex items-center justify-between bg-[linear-gradient(170deg,rgba(255,252,247,0.96),rgba(248,241,232,0.96))] pb-2 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-red-300 bg-gradient-to-br from-red-600 to-red-800 text-xs font-semibold tracking-[0.2em] text-white shadow-[0_10px_26px_-14px_rgba(185,28,28,0.9)]">
            T
          </div>
          <div>
            <h1 className="text-xl font-semibold text-ink">Taskio</h1>
            <p className="text-xs text-muted">Priority-first planning</p>
          </div>
        </div>
        <button type="button" className="rounded border border-stone-300 px-2 py-1 text-xs lg:hidden" onClick={onClose}>
          Close
        </button>
      </div>

      <nav className="space-y-1 rounded-2xl border border-stone-200 bg-white/55 p-1.5 shadow-[0_14px_36px_-30px_rgba(120,20,20,0.45)]">
        <NavLink href="/timeline" label="Timeline" count={timelineCount} active={pathname === '/timeline'} />
        <NavLink href="/today" label="Today" count={todayCount} active={pathname === '/today'} />
        <NavLink href="/upcoming" label="Upcoming" count={upcomingCount} active={pathname === '/upcoming'} />
        <NavLink href="/inbox" label="Inbox" count={inboxCount} active={pathname === '/inbox'} />
        <NavLink href="/history" label="History" count={historyCount} active={pathname === '/history'} />
        <NavLink href="/search" label="Search" active={pathname === '/search'} />
        <NavLink href="/settings" label="Settings" active={pathname === '/settings'} />
      </nav>

      <section className="mt-6 rounded-xl border border-stone-200 bg-white/60 p-2 shadow-[0_16px_28px_-24px_rgba(36,20,8,0.45)]">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Projects</h2>
        <div className="max-h-[32vh] space-y-1 overflow-y-auto pr-1">
          {projects.length === 0 ? <div className="text-xs text-muted">No projects yet.</div> : null}
          {projects.map((project) => (
            <NavLink
              key={project.id}
              href={`/projects/${project.id}`}
              label={project.title}
              active={pathname === `/projects/${project.id}`}
            />
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-stone-200 bg-white/60 p-2 shadow-[0_16px_28px_-24px_rgba(36,20,8,0.45)]">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Saved Views</h2>
        <div className="space-y-1">
          {savedViews.length === 0 ? <div className="text-xs text-muted">No saved views.</div> : null}
          {savedViews.map((view) => (
            <NavLink key={view.id} href={`/search?q=${encodeURIComponent(view.name)}`} label={view.name} active={false} />
          ))}
        </div>
      </section>
    </aside>
  );
};

const NavLink = ({
  href,
  label,
  count,
  active
}: {
  href: string;
  label: string;
  count?: number;
  active: boolean;
}) => (
  <Link
    href={href}
    className={cn(
      'flex items-center justify-between rounded-lg px-2 py-1.5 text-sm text-ink transition duration-200',
      active
        ? 'bg-gradient-to-r from-red-700 via-red-600 to-orange-500 text-white shadow-[0_16px_34px_-18px_rgba(185,28,28,0.92)]'
        : 'hover:bg-stone-100/90'
    )}
  >
    <span>{label}</span>
    {count !== undefined ? (
      <span className={cn('rounded px-1.5 py-0.5 text-xs', active ? 'bg-white/20 text-white' : 'bg-stone-200 text-muted')}>{count}</span>
    ) : null}
  </Link>
);
