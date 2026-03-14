import { memo } from 'react';
import type { Project, TimelineMode, TimelineZoom } from '@/domain/types';

type TimelineControlsPanelProps = {
  mode: TimelineMode;
  zoom: TimelineZoom;
  playheadTs: number;
  windowStart: number;
  windowEnd: number;
  isNearNow: boolean;
  compactLayout: boolean;
  allProjects: Project[];
  visibleProjects: Project[];
  activeProjectSet: Set<string>;
  hasHiddenProjects: boolean;
  showAllProjects: boolean;
  playing: boolean;
  reduceMotion: boolean;
  playbackSpeed: 1 | 2 | 4;
  bucketStep: number;
  normalizedPlayhead: number;
  projectChipLabel: (project: { id: string; title: string }) => string;
  onModeChange: (mode: TimelineMode) => void;
  onZoomChange: (zoom: TimelineZoom) => void;
  onResetProjects: () => void;
  onToggleShowAllProjects: () => void;
  onToggleProject: (projectId: string) => void;
  onStepBack: () => void;
  onStepForward: () => void;
  onScrub: (next: number) => void;
  onTogglePlay: () => void;
  onPlaybackSpeedChange: (next: 1 | 2 | 4) => void;
  onJumpNow: () => void;
  formatPoint: (ts: number) => string;
  modeLabel: (mode: TimelineMode) => string;
};

const ZOOM_OPTIONS: TimelineZoom[] = ['day', 'week', 'month', 'quarter', 'year', 'all'];
const MODE_OPTIONS: TimelineMode[] = ['dual', 'plan', 'reality'];

export const TimelineControlsPanel = memo((props: TimelineControlsPanelProps) => {
  const {
    mode,
    zoom,
    playheadTs,
    windowStart,
    windowEnd,
    isNearNow,
    compactLayout,
    allProjects,
    visibleProjects,
    activeProjectSet,
    hasHiddenProjects,
    showAllProjects,
    playing,
    reduceMotion,
    playbackSpeed,
    bucketStep,
    normalizedPlayhead,
    projectChipLabel,
    onModeChange,
    onZoomChange,
    onResetProjects,
    onToggleShowAllProjects,
    onToggleProject,
    onStepBack,
    onStepForward,
    onScrub,
    onTogglePlay,
    onPlaybackSpeedChange,
    onJumpNow,
    formatPoint,
    modeLabel
  } = props;

  return (
    <header className="timeline-reveal relative overflow-hidden rounded-3xl border border-stone-300 bg-panel shadow-[0_30px_70px_-45px_rgba(120,20,20,0.65)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(255,120,90,0.22),transparent_40%),radial-gradient(circle_at_85%_0%,rgba(76,111,255,0.18),transparent_36%)]" />
      <div className="relative space-y-4 p-4 md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-ink md:text-3xl">Timeline</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted">
              Scrub time like a film reel. Track commitments, real execution, overdue pressure, and interruption spikes from one playhead.
            </p>
          </div>
          <div className="rounded-xl border border-stone-300/80 bg-white/70 px-3 py-2 text-right backdrop-blur">
            <div className="text-[11px] uppercase tracking-wide text-muted">Lens</div>
            <div className="text-sm font-medium text-ink">{modeLabel(mode)}</div>
            <div className="text-[11px] text-muted">{new Date(playheadTs).toLocaleString()}</div>
            <div className={`mt-1 inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${isNearNow ? 'bg-red-100 text-red-900' : 'bg-stone-200 text-stone-700'}`}>
              {isNearNow ? 'LIVE' : 'ARCHIVE'}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Timeline mode">
          {MODE_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={mode === option}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                mode === option
                  ? 'border-red-600 bg-red-600 text-white shadow-[0_10px_30px_-16px_rgba(185,28,28,0.8)]'
                  : 'border-stone-300 bg-white/85 text-ink hover:border-stone-400'
              }`}
              onClick={() => onModeChange(option)}
            >
              {option === 'dual' ? 'Dual' : option === 'plan' ? 'Plan' : 'Reality'}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-1" role="group" aria-label="Timeline zoom presets">
          {ZOOM_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={zoom === option}
              className={`rounded-lg border px-2.5 py-1 text-xs transition ${
                zoom === option
                  ? 'border-ink bg-ink text-white'
                  : 'border-stone-300 bg-white/80 text-muted hover:border-stone-500 hover:text-ink'
              }`}
              onClick={() => onZoomChange(option)}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-medium uppercase tracking-wide text-muted">Project Scope</div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded border border-stone-300 bg-white/80 px-2 py-1 text-xs text-muted hover:border-stone-500 hover:text-ink"
                onClick={onResetProjects}
              >
                All Active
              </button>
              {hasHiddenProjects ? (
                <button
                  type="button"
                  className="rounded border border-stone-300 bg-white/80 px-2 py-1 text-xs text-muted hover:border-stone-500 hover:text-ink"
                  onClick={onToggleShowAllProjects}
                >
                  {showAllProjects ? 'Show Less' : `+${allProjects.length - 6} More`}
                </button>
              ) : null}
            </div>
          </div>
          <div className={`flex gap-2 ${compactLayout ? 'timeline-scroll overflow-x-auto pb-1' : 'flex-wrap'}`}>
            {visibleProjects.map((project) => {
              const active = activeProjectSet.has(project.id);
              return (
                <button
                  key={project.id}
                  type="button"
                  aria-pressed={active}
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-xs transition ${
                    active
                      ? 'border-amber-500 bg-amber-100 text-amber-950'
                      : 'border-stone-300 bg-white/75 text-muted hover:border-stone-500 hover:text-ink'
                  }`}
                  onClick={() => onToggleProject(project.id)}
                >
                  {projectChipLabel(project)}
                </button>
              );
            })}
            {allProjects.length === 0 ? <span className="text-xs text-muted">No projects yet.</span> : null}
          </div>
        </div>

        <div className="rounded-2xl border border-stone-300 bg-white/75 p-3 backdrop-blur">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
            <div>
              Window {formatPoint(windowStart)} - {formatPoint(windowEnd)}
            </div>
            <div className="font-medium text-ink">Playhead {formatPoint(playheadTs)}</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded border border-stone-300 px-2 py-1 text-xs text-muted hover:border-stone-500 hover:text-ink"
              onClick={onStepBack}
            >
              - Step
            </button>
            <input
              type="range"
              min={windowStart}
              max={windowEnd}
              step={Math.max(1, bucketStep)}
              value={normalizedPlayhead}
              onChange={(event) => onScrub(Number(event.target.value))}
              className="timeline-slider h-2 w-full cursor-pointer accent-red-600"
              aria-label="Timeline playhead scrubber"
            />
            <button
              type="button"
              className="rounded border border-stone-300 px-2 py-1 text-xs text-muted hover:border-stone-500 hover:text-ink"
              onClick={onStepForward}
            >
              Step +
            </button>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              className="rounded border border-stone-300 bg-white px-2 py-1 text-muted hover:border-stone-500 hover:text-ink"
              onClick={onTogglePlay}
              disabled={reduceMotion}
            >
              {playing ? 'Pause' : 'Play'}
            </button>
            <label className="text-muted">
              Speed
              <select
                className="ml-1 rounded border border-stone-300 bg-white px-2 py-1 text-xs text-ink"
                value={String(playbackSpeed)}
                onChange={(event) => onPlaybackSpeedChange(Number(event.target.value) as 1 | 2 | 4)}
              >
                <option value="1">1x</option>
                <option value="2">2x</option>
                <option value="4">4x</option>
              </select>
            </label>
            <button
              type="button"
              className="rounded border border-stone-300 bg-white px-2 py-1 text-muted hover:border-stone-500 hover:text-ink"
              onClick={onJumpNow}
            >
              Now
            </button>
            <div className="ml-auto hidden text-muted md:block">Shortcuts: Left/Right scrub, Space play, +/- zoom</div>
          </div>
          {compactLayout ? <div className="mt-2 text-[11px] text-muted">Shortcuts: Left/Right scrub, Space play, +/- zoom.</div> : null}
          {reduceMotion ? <div className="mt-2 text-xs text-muted">Playback disabled by reduced-motion preference.</div> : null}
        </div>
      </div>
    </header>
  );
});

TimelineControlsPanel.displayName = 'TimelineControlsPanel';
