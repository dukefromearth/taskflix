import { z } from 'zod';
import type { QueryFilter } from '../domain/types';

export const ProjectStatusSchema = z.enum(['active', 'paused', 'done', 'archived']);
export const ItemKindSchema = z.enum(['task', 'note', 'milestone']);
export const ItemStatusSchema = z.enum(['inbox', 'active', 'blocked', 'waiting', 'done', 'canceled']);
export const LinkKindSchema = z.enum(['github', 'doc', 'ticket', 'chat', 'calendar', 'generic']);
export const SourceKindSchema = z.enum(['manual', 'api', 'import', 'share', 'email', 'link', 'upload']);
export const TimelineZoomSchema = z.enum(['day', 'week', 'month', 'quarter', 'year', 'all']);
export const TimelineModeSchema = z.enum(['dual', 'plan', 'reality']);
export const PrioritySchema = z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4)]);
export const TimestampSchema = z.number().int().nonnegative();
export const MimeTypeSchema = z.string().regex(/^[a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+$/i, 'Invalid MIME type');
export const Base64Schema = z.string().min(1).regex(/^[A-Za-z0-9+/]+={0,2}$/, 'Invalid base64 payload');

export const ProjectCreateSchema = z.object({
  title: z.string().trim().min(1).max(240),
  slug: z.string().trim().min(1).max(240).regex(/^[a-z0-9-]+$/, 'Slug must use [a-z0-9-]+'),
  descriptionMd: z.string().max(100_000).optional(),
  status: ProjectStatusSchema.optional(),
  colorToken: z.string().max(64).optional(),
  icon: z.string().max(64).optional()
});

export const ProjectPatchSchema = ProjectCreateSchema.partial();

export const ItemCreateSchema = z.object({
  title: z.string().trim().min(1).max(240),
  projectId: z.string().min(1).optional(),
  parentItemId: z.string().min(1).optional(),
  kind: ItemKindSchema.optional(),
  descriptionMd: z.string().max(200_000).optional(),
  status: ItemStatusSchema.optional(),
  priority: PrioritySchema.optional(),
  scheduledAt: TimestampSchema.optional(),
  dueAt: TimestampSchema.optional(),
  snoozedUntil: TimestampSchema.optional(),
  requestedBy: z.string().trim().min(1).max(120).optional(),
  isInterruption: z.boolean().optional(),
  sourceKind: SourceKindSchema.optional(),
  sourceRef: z.string().max(500).optional(),
  tags: z.array(z.string().min(1).max(120)).max(200).optional()
});

export const ItemPatchSchema = ItemCreateSchema.omit({ tags: true }).partial();

export const SearchQuerySchema = z.object({
  q: z.string().optional(),
  search: z.string().optional(),
  statuses: z.string().optional(),
  kinds: z.string().optional(),
  projectIds: z.string().optional(),
  tagAny: z.string().optional(),
  tagAll: z.string().optional(),
  includeDone: z.enum(['true', 'false']).optional()
});

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

export const splitCsv = (value?: string): string[] | undefined => {
  if (!value) return undefined;
  const parts = value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

  return parts.length > 0 ? parts : undefined;
};

export const parseSearchFilter = (query: z.infer<typeof SearchQuerySchema>): QueryFilter => ({
  statuses: query.statuses ? z.array(ItemStatusSchema).parse(splitCsv(query.statuses)) : undefined,
  kinds: query.kinds ? z.array(ItemKindSchema).parse(splitCsv(query.kinds)) : undefined,
  projectIds: splitCsv(query.projectIds),
  tagAny: splitCsv(query.tagAny),
  tagAll: splitCsv(query.tagAll),
  includeDone: query.includeDone === undefined ? undefined : query.includeDone === 'true',
  search: query.search
});

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
