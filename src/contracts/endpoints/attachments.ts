import { z } from 'zod';
import { AttachmentWithReadUrlSchema, DeletedResultSchema } from '@/contracts/entities';
import { defineEndpoint } from '@/contracts/types';
import { IdentifierSchema } from '@/contracts/primitives';

const AttachmentParamsSchema = z.object({ attachmentId: IdentifierSchema });

export const attachmentEndpoints = [
  defineEndpoint({
    id: 'attachments.get',
    method: 'GET',
    path: '/api/attachments/:attachmentId',
    description: 'Get an attachment and signed read URL.',
    request: {
      params: AttachmentParamsSchema
    },
    response: {
      kind: 'json',
      success: AttachmentWithReadUrlSchema,
      successStatus: 200
    },
    metadata: { tags: ['attachments'] }
  }),
  defineEndpoint({
    id: 'attachments.delete',
    method: 'DELETE',
    path: '/api/attachments/:attachmentId',
    description: 'Delete an attachment and storage object.',
    request: {
      params: AttachmentParamsSchema
    },
    response: {
      kind: 'json',
      success: DeletedResultSchema,
      successStatus: 200
    },
    metadata: { tags: ['attachments'] }
  }),
  defineEndpoint({
    id: 'attachments.download',
    method: 'GET',
    path: '/api/attachments/:attachmentId/download',
    description: 'Redirect to a signed attachment download URL.',
    request: {
      params: AttachmentParamsSchema
    },
    response: {
      kind: 'redirect',
      successStatus: 307
    },
    metadata: { tags: ['attachments'] }
  })
] as const;
