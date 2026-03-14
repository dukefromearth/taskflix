import type { TimelineMode, TimelineZoom } from '@/domain/types';
import { TimelinePageClient } from '@/ui/components/timeline-page-client';

const parseNumber = (value?: string): number | undefined => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parseCsv = (value?: string): string[] | undefined => {
  if (!value) return undefined;
  const parts = value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : undefined;
};

const isTimelineZoom = (value?: string): value is TimelineZoom =>
  Boolean(value && ['day', 'week', 'month', 'quarter', 'year', 'all'].includes(value));

const isTimelineMode = (value?: string): value is TimelineMode => Boolean(value && ['dual', 'plan', 'reality'].includes(value));

export default async function TimelinePage({
  searchParams
}: {
  searchParams: Promise<{
    zoom?: string;
    mode?: string;
    windowStart?: string;
    windowEnd?: string;
    playheadTs?: string;
    projectIds?: string;
  }>;
}) {
  const params = await searchParams;

  return (
    <TimelinePageClient
      initialZoom={isTimelineZoom(params.zoom) ? params.zoom : undefined}
      initialMode={isTimelineMode(params.mode) ? params.mode : undefined}
      initialWindowStart={parseNumber(params.windowStart)}
      initialWindowEnd={parseNumber(params.windowEnd)}
      initialPlayheadTs={parseNumber(params.playheadTs)}
      initialProjectIds={parseCsv(params.projectIds)}
    />
  );
}
