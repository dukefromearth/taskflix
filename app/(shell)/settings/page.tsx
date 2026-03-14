'use client';

import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem('taskio.reduceMotion');
    if (stored === 'true') setReduceMotion(true);
  }, []);

  useEffect(() => {
    window.localStorage.setItem('taskio.reduceMotion', reduceMotion ? 'true' : 'false');
    document.documentElement.style.setProperty('--taskio-motion-scale', reduceMotion ? '0' : '1');
  }, [reduceMotion]);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Settings</h1>
        <p className="text-sm text-muted">Keyboard-first behavior and display preferences.</p>
      </header>

      <section className="rounded-xl border border-stone-300 bg-panel p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Accessibility</h2>
        <label className="mt-3 flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={reduceMotion} onChange={(event) => setReduceMotion(event.target.checked)} />
          Reduce motion
        </label>
      </section>

      <section className="rounded-xl border border-stone-300 bg-panel p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Shortcuts</h2>
        <ul className="mt-2 space-y-1 text-sm text-ink">
          <li><kbd>Cmd/Ctrl+K</kbd> Open command palette</li>
          <li><kbd>C</kbd> Complete selected item</li>
          <li><kbd>E</kbd> Focus selected item in detail pane</li>
          <li><kbd>S</kbd> Schedule selected item for tomorrow</li>
          <li><kbd>#</kbd> Add tags to selected item</li>
          <li><kbd>L</kbd> Add link to selected item</li>
          <li><kbd>X</kbd> Cancel selected item</li>
          <li><kbd>J</kbd>/<kbd>K</kbd> Move selection</li>
          <li><kbd>G T</kbd>, <kbd>G D</kbd>, <kbd>G U</kbd>, <kbd>G I</kbd>, <kbd>G H</kbd> Navigate main views</li>
        </ul>
      </section>

      <section className="rounded-xl border border-stone-300 bg-panel p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Core Feature List</h2>
        <ul className="mt-2 space-y-1 text-sm text-ink">
          <li>Timeline scrubber with playhead, zoom presets, and playback</li>
          <li>Today view with triage, overdue, today, and in-progress sections</li>
          <li>Upcoming buckets with drag-and-drop rescheduling</li>
          <li>Inbox triage controls for assign, tag, schedule, and activate</li>
          <li>Project grouped lists and recent history</li>
          <li>History timeline grouped by day</li>
          <li>Search with filters and attachment-text matching</li>
          <li>Detail pane editing, markdown preview, links, and attachments</li>
          <li>Command palette and keyboard-driven actions/navigation</li>
          <li>Desktop pane resizing for navigation rail and detail pane</li>
        </ul>
      </section>
    </div>
  );
}
