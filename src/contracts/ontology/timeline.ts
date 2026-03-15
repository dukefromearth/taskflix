import { z } from 'zod';

export const TimelineZoomSchema = z.enum(['day', 'week', 'month', 'quarter', 'year', 'all']);
export const TimelineModeSchema = z.enum(['dual', 'plan', 'reality']);

export const TimelineStructureQuerySchema = z.object({
  zoom: TimelineZoomSchema.optional(),
  mode: TimelineModeSchema.optional(),
  windowStart: z.string().regex(/^\d+$/).optional(),
  windowEnd: z.string().regex(/^\d+$/).optional(),
  projectIds: z.string().optional()
});

export const TimelineSummaryQuerySchema = TimelineStructureQuerySchema.extend({
  mode: z.never().optional(),
  playheadTs: z.string().regex(/^\d+$/).optional(),
  bucketStart: z.string().regex(/^\d+$/).optional(),
  bucketEnd: z.string().regex(/^\d+$/).optional()
});

const splitCsv = (value?: string): string[] | undefined => {
  if (!value) return undefined;

  const parts = value
    .split(',')
    .map((token) => token.trim())
    .filter(Boolean);

  return parts.length > 0 ? parts : undefined;
};

const parseOptionalTimestamp = (value?: string): number | undefined => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const parseTimelineStructureQuery = (query: z.infer<typeof TimelineStructureQuerySchema>) => ({
  zoom: query.zoom,
  mode: query.mode,
  windowStart: parseOptionalTimestamp(query.windowStart),
  windowEnd: parseOptionalTimestamp(query.windowEnd),
  projectIds: splitCsv(query.projectIds)
});

export const parseTimelineSummaryQuery = (query: z.infer<typeof TimelineSummaryQuerySchema>) => ({
  zoom: query.zoom,
  windowStart: parseOptionalTimestamp(query.windowStart),
  windowEnd: parseOptionalTimestamp(query.windowEnd),
  playheadTs: parseOptionalTimestamp(query.playheadTs),
  bucketStart: parseOptionalTimestamp(query.bucketStart),
  bucketEnd: parseOptionalTimestamp(query.bucketEnd),
  projectIds: splitCsv(query.projectIds)
});
