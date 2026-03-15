import { z } from 'zod';
import {
  Base64Schema,
  LinkKindSchema,
  MimeTypeSchema,
  ItemCreateSchema,
  ItemPatchSchema,
  ItemStatusSchema,
  TimestampSchema
} from '@/contracts/ontology/items';
import {
  AttachmentSchema,
  DeletedResultSchema,
  ItemDetailSchema,
  ItemSchema,
  LinkSchema,
  UpdatedResultSchema
} from '@/contracts/entities';
import { IdentifierSchema } from '@/contracts/primitives';
import { defineEndpoint } from '@/contracts/types';

const ItemParamsSchema = z.object({ itemId: IdentifierSchema });

const ReorderItemsBodySchema = z.object({
  itemId: IdentifierSchema,
  leftItemId: IdentifierSchema.optional(),
  rightItemId: IdentifierSchema.optional()
});

const ScheduleItemBodySchema = z.object({
  scheduledAt: TimestampSchema.optional(),
  dueAt: TimestampSchema.optional()
});

const DeferItemBodySchema = z.object({
  snoozedUntil: TimestampSchema
});

const ChangeItemStatusBodySchema = z.object({
  to: ItemStatusSchema,
  reason: z.string().max(500).optional()
});

const ItemTagsBodySchema = z.object({
  add: z.array(z.string().min(1).max(120)).max(200).optional(),
  remove: z.array(z.string().min(1).max(120)).max(200).optional()
});

const ItemLinkBodySchema = z.object({
  url: z.string().url().max(2048),
  label: z.string().trim().min(1).max(200).optional(),
  kind: LinkKindSchema.optional()
});

const ItemAttachmentUploadBodySchema = z.object({
  originalName: z.string().trim().min(1).max(255),
  mimeType: MimeTypeSchema,
  contentBase64: Base64Schema
});

export const itemEndpoints = [
  defineEndpoint({
    id: 'items.list',
    method: 'GET',
    path: '/api/items',
    description: 'List all items.',
    request: {},
    response: {
      kind: 'json',
      success: z.array(ItemSchema),
      successStatus: 200
    },
    metadata: { tags: ['items'] }
  }),
  defineEndpoint({
    id: 'items.create',
    method: 'POST',
    path: '/api/items',
    description: 'Create a new item.',
    request: {
      body: ItemCreateSchema
    },
    response: {
      kind: 'json',
      success: ItemSchema,
      successStatus: 201
    },
    metadata: { idempotencyKey: 'item.create', tags: ['items'] }
  }),
  defineEndpoint({
    id: 'items.reorder',
    method: 'POST',
    path: '/api/items/reorder',
    description: 'Reorder an item within its peer set.',
    request: {
      body: ReorderItemsBodySchema
    },
    response: {
      kind: 'json',
      success: ItemSchema,
      successStatus: 200
    },
    metadata: { tags: ['items'] }
  }),
  defineEndpoint({
    id: 'items.get',
    method: 'GET',
    path: '/api/items/:itemId',
    description: 'Get one item by ID.',
    request: {
      params: ItemParamsSchema
    },
    response: {
      kind: 'json',
      success: ItemSchema,
      successStatus: 200
    },
    metadata: { tags: ['items'] }
  }),
  defineEndpoint({
    id: 'items.update',
    method: 'PATCH',
    path: '/api/items/:itemId',
    description: 'Patch an item by ID.',
    request: {
      params: ItemParamsSchema,
      body: ItemPatchSchema
    },
    response: {
      kind: 'json',
      success: ItemSchema,
      successStatus: 200
    },
    metadata: { tags: ['items'] }
  }),
  defineEndpoint({
    id: 'items.delete',
    method: 'DELETE',
    path: '/api/items/:itemId',
    description: 'Soft-delete an item.',
    request: {
      params: ItemParamsSchema
    },
    response: {
      kind: 'json',
      success: DeletedResultSchema,
      successStatus: 200
    },
    metadata: { tags: ['items'] }
  }),
  defineEndpoint({
    id: 'items.detail',
    method: 'GET',
    path: '/api/items/:itemId/detail',
    description: 'Get expanded item detail DTO.',
    request: {
      params: ItemParamsSchema
    },
    response: {
      kind: 'json',
      success: ItemDetailSchema,
      successStatus: 200
    },
    metadata: { tags: ['items'] }
  }),
  defineEndpoint({
    id: 'items.complete',
    method: 'POST',
    path: '/api/items/:itemId/complete',
    description: 'Mark an item as done.',
    request: {
      params: ItemParamsSchema
    },
    response: {
      kind: 'json',
      success: ItemSchema,
      successStatus: 200
    },
    metadata: { idempotencyKey: 'item.complete', tags: ['items'] }
  }),
  defineEndpoint({
    id: 'items.defer',
    method: 'POST',
    path: '/api/items/:itemId/defer',
    description: 'Set snoozed-until timestamp on an item.',
    request: {
      params: ItemParamsSchema,
      body: DeferItemBodySchema
    },
    response: {
      kind: 'json',
      success: ItemSchema,
      successStatus: 200
    },
    metadata: { tags: ['items'] }
  }),
  defineEndpoint({
    id: 'items.schedule',
    method: 'POST',
    path: '/api/items/:itemId/schedule',
    description: 'Set scheduled/due timestamps on an item.',
    request: {
      params: ItemParamsSchema,
      body: ScheduleItemBodySchema
    },
    response: {
      kind: 'json',
      success: ItemSchema,
      successStatus: 200
    },
    metadata: { tags: ['items'] }
  }),
  defineEndpoint({
    id: 'items.status',
    method: 'POST',
    path: '/api/items/:itemId/status',
    description: 'Change item status.',
    request: {
      params: ItemParamsSchema,
      body: ChangeItemStatusBodySchema
    },
    response: {
      kind: 'json',
      success: ItemSchema,
      successStatus: 200
    },
    metadata: { tags: ['items'] }
  }),
  defineEndpoint({
    id: 'items.tags',
    method: 'POST',
    path: '/api/items/:itemId/tags',
    description: 'Add/remove tags for an item.',
    request: {
      params: ItemParamsSchema,
      body: ItemTagsBodySchema
    },
    response: {
      kind: 'json',
      success: UpdatedResultSchema,
      successStatus: 200
    },
    metadata: { tags: ['items'] }
  }),
  defineEndpoint({
    id: 'items.links',
    method: 'POST',
    path: '/api/items/:itemId/links',
    description: 'Add a link to an item.',
    request: {
      params: ItemParamsSchema,
      body: ItemLinkBodySchema
    },
    response: {
      kind: 'json',
      success: LinkSchema,
      successStatus: 201
    },
    metadata: { tags: ['items', 'links'] }
  }),
  defineEndpoint({
    id: 'items.attachments.upload',
    method: 'POST',
    path: '/api/items/:itemId/attachments',
    description: 'Upload and attach a file to an item.',
    request: {
      params: ItemParamsSchema,
      body: ItemAttachmentUploadBodySchema
    },
    response: {
      kind: 'json',
      success: AttachmentSchema,
      successStatus: 201
    },
    metadata: { idempotencyKey: 'attachment.upload', tags: ['items', 'attachments'] }
  })
] as const;
