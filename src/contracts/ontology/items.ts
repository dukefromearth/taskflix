import { z } from 'zod';

export const ItemKindSchema = z.enum(['task', 'note', 'milestone']);
export const ItemStatusSchema = z.enum(['inbox', 'active', 'blocked', 'waiting', 'done', 'canceled']);
export const LinkKindSchema = z.enum(['github', 'doc', 'ticket', 'chat', 'calendar', 'generic']);
export const SourceKindSchema = z.enum(['manual', 'api', 'import', 'share', 'email', 'link', 'upload']);

export const PrioritySchema = z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4)]);
export const TimestampSchema = z.number().int().nonnegative();

export const MimeTypeSchema = z.string().regex(/^[a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+$/i, 'Invalid MIME type');
export const Base64Schema = z.string().min(1).regex(/^[A-Za-z0-9+/]+={0,2}$/, 'Invalid base64 payload');

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
