import { z } from 'zod';
import {
  ItemKindSchema,
  ItemStatusSchema,
  LinkKindSchema,
  PrioritySchema,
  SourceKindSchema,
  TimestampSchema
} from '@/contracts/ontology/items';
import { TimelineModeSchema, TimelineZoomSchema } from '@/contracts/ontology/timeline';
import { IdentifierSchema, QueryRecordSchema } from './primitives';

export const EntityProjectStatusSchema = z.enum(['active', 'paused', 'done', 'archived']);
export const PreviewStatusSchema = z.enum(['none', 'pending', 'ready', 'failed']);
export const TextExtractionStatusSchema = z.enum(['none', 'pending', 'ready', 'failed']);

export const ProjectSchema = z.object({
  id: IdentifierSchema,
  slug: z.string().min(1),
  title: z.string().min(1),
  descriptionMd: z.string(),
  status: EntityProjectStatusSchema,
  colorToken: z.string().optional(),
  icon: z.string().optional(),
  orderKey: z.string().min(1),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
  archivedAt: TimestampSchema.optional(),
  deletedAt: TimestampSchema.optional()
});

export const ItemSchema = z.object({
  id: IdentifierSchema,
  projectId: IdentifierSchema.optional(),
  parentItemId: IdentifierSchema.optional(),
  kind: ItemKindSchema,
  title: z.string().min(1),
  descriptionMd: z.string(),
  status: ItemStatusSchema,
  priority: PrioritySchema,
  orderKey: z.string().min(1),
  scheduledAt: TimestampSchema.optional(),
  dueAt: TimestampSchema.optional(),
  completedAt: TimestampSchema.optional(),
  snoozedUntil: TimestampSchema.optional(),
  requestedBy: z.string().optional(),
  isInterruption: z.boolean(),
  sourceKind: SourceKindSchema,
  sourceRef: z.string().optional(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
  deletedAt: TimestampSchema.optional()
});

export const TagSchema = z.object({
  id: IdentifierSchema,
  name: z.string().min(1),
  displayName: z.string().min(1),
  createdAt: TimestampSchema
});

export const LinkSchema = z.object({
  id: IdentifierSchema,
  itemId: IdentifierSchema,
  url: z.string().url(),
  label: z.string().optional(),
  kind: LinkKindSchema.optional(),
  createdAt: TimestampSchema
});

export const AttachmentSchema = z.object({
  id: IdentifierSchema,
  itemId: IdentifierSchema,
  storageKey: z.string().min(1),
  originalName: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().nonnegative(),
  sha256: z.string().min(1),
  previewStatus: PreviewStatusSchema,
  textExtractionStatus: TextExtractionStatusSchema,
  createdAt: TimestampSchema,
  deletedAt: TimestampSchema.optional()
});

export const ItemEventTypeSchema = z.enum([
  'item.created',
  'item.updated',
  'item.statusChanged',
  'item.scheduled',
  'item.dueChanged',
  'item.completed',
  'item.reopened',
  'item.tagAdded',
  'item.tagRemoved',
  'item.linkAdded',
  'item.attachmentAdded',
  'item.moved',
  'item.reordered'
]);

export const ItemEventSchema = z.object({
  id: IdentifierSchema,
  itemId: IdentifierSchema,
  commandId: IdentifierSchema,
  eventType: ItemEventTypeSchema,
  payloadJson: QueryRecordSchema,
  occurredAt: TimestampSchema
});

export const ItemRowSchema = z.object({
  id: IdentifierSchema,
  title: z.string().min(1),
  kind: ItemKindSchema,
  status: ItemStatusSchema,
  priority: z.number().int().min(0).max(4),
  project: z.object({ id: IdentifierSchema, title: z.string().min(1), slug: z.string().min(1) }).optional(),
  tags: z.array(z.string()),
  dueAt: TimestampSchema.optional(),
  scheduledAt: TimestampSchema.optional(),
  requestedBy: z.string().optional(),
  isInterruption: z.boolean(),
  hasLinks: z.boolean(),
  attachmentCount: z.number().int().nonnegative(),
  childCount: z.number().int().nonnegative(),
  isOverdue: z.boolean()
});

export const SavedViewSchema = z.object({
  id: IdentifierSchema,
  name: z.string().min(1),
  icon: z.string().optional(),
  queryJson: QueryRecordSchema,
  orderKey: z.string().min(1),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
  deletedAt: TimestampSchema.optional()
});

export const ItemDetailSchema = z.object({
  item: ItemSchema,
  project: ProjectSchema.optional(),
  tags: z.array(TagSchema),
  links: z.array(LinkSchema),
  attachments: z.array(AttachmentSchema),
  events: z.array(ItemEventSchema)
});

export const SearchResultSchema = z.object({
  item: ItemRowSchema,
  snippet: z.string().optional(),
  score: z.number()
});

const TimelineBucketSchema = z.object({
  start: TimestampSchema,
  end: TimestampSchema,
  label: z.string().min(1),
  count: z.number().int().nonnegative()
});

const TimelineLaneSchema = z.object({
  key: z.enum(['plan', 'reality', 'overduePressure', 'interruptions']),
  label: z.string().min(1),
  buckets: z.array(TimelineBucketSchema)
});

const TimelineMomentSchema = z.object({
  ts: TimestampSchema,
  label: z.string().min(1),
  kind: z.enum(['plan', 'reality', 'overdue', 'interruption']),
  count: z.number().int().nonnegative()
});

export const TimelineStructureSchema = z.object({
  now: TimestampSchema,
  timezone: z.string().min(1),
  zoom: TimelineZoomSchema,
  mode: TimelineModeSchema,
  windowStart: TimestampSchema,
  windowEnd: TimestampSchema,
  projectIds: z.array(IdentifierSchema).optional(),
  lanes: z.array(TimelineLaneSchema),
  moments: z.array(TimelineMomentSchema)
});

export const TimelineSummarySchema = z.object({
  bucketStart: TimestampSchema,
  bucketEnd: TimestampSchema,
  bucketIdentity: z.string().min(1),
  playheadTs: TimestampSchema,
  playheadLabel: z.string().min(1),
  counts: z.object({
    plan: z.number().int().nonnegative(),
    reality: z.number().int().nonnegative(),
    overdue: z.number().int().nonnegative(),
    interruptions: z.number().int().nonnegative()
  }),
  topItems: z.array(ItemRowSchema),
  recentEvents: z.array(ItemEventSchema)
});

const TodaySectionSchema = z.object({
  key: z.enum(['triage', 'overdue', 'today', 'inProgress']),
  label: z.string().min(1),
  count: z.number().int().nonnegative(),
  items: z.array(ItemRowSchema)
});

export const TodayViewSchema = z.object({
  now: TimestampSchema,
  timezone: z.string().min(1),
  sections: z.array(TodaySectionSchema)
});

const UpcomingBucketSchema = z.object({
  key: z.enum(['tomorrow', 'thisWeek', 'nextWeek', 'later']),
  label: z.string().min(1),
  items: z.array(ItemRowSchema)
});

export const UpcomingViewSchema = z.object({
  now: TimestampSchema,
  timezone: z.string().min(1),
  buckets: z.array(UpcomingBucketSchema)
});

export const InboxViewSchema = z.object({
  now: TimestampSchema,
  timezone: z.string().min(1),
  items: z.array(ItemRowSchema)
});

export const HistoryViewSchema = z.object({
  now: TimestampSchema,
  timezone: z.string().min(1),
  events: z.array(ItemEventSchema)
});

export const ProjectViewSchema = z.object({
  now: TimestampSchema,
  timezone: z.string().min(1),
  project: ProjectSchema,
  items: z.array(ItemRowSchema),
  history: z.array(ItemEventSchema)
});

export const AttachmentWithReadUrlSchema = AttachmentSchema.extend({ readUrl: z.string().min(1) });

export const DeletedResultSchema = z.object({ deleted: z.literal(true) });
export const UpdatedResultSchema = z.object({ updated: z.literal(true) });
export const HealthResultSchema = z.object({ ok: z.literal(true) });
