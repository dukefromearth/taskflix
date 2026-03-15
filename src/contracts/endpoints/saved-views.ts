import { z } from 'zod';
import { DeletedResultSchema, SavedViewSchema } from '@/contracts/entities';
import { SavedViewCreateBodySchema, SavedViewPatchBodySchema } from '@/contracts/ontology/saved-views';
import { IdentifierSchema } from '@/contracts/primitives';
import { defineEndpoint } from '@/contracts/types';

const SavedViewParamsSchema = z.object({ savedViewId: IdentifierSchema });

export const savedViewEndpoints = [
  defineEndpoint({
    id: 'savedViews.list',
    method: 'GET',
    path: '/api/saved-views',
    description: 'List all saved views.',
    request: {},
    response: {
      kind: 'json',
      success: z.array(SavedViewSchema),
      successStatus: 200
    },
    metadata: { tags: ['saved-views'] }
  }),
  defineEndpoint({
    id: 'savedViews.create',
    method: 'POST',
    path: '/api/saved-views',
    description: 'Create a saved view.',
    request: {
      body: SavedViewCreateBodySchema
    },
    response: {
      kind: 'json',
      success: SavedViewSchema,
      successStatus: 201
    },
    metadata: { tags: ['saved-views'] }
  }),
  defineEndpoint({
    id: 'savedViews.update',
    method: 'PATCH',
    path: '/api/saved-views/:savedViewId',
    description: 'Patch a saved view.',
    request: {
      params: SavedViewParamsSchema,
      body: SavedViewPatchBodySchema
    },
    response: {
      kind: 'json',
      success: SavedViewSchema,
      successStatus: 200
    },
    metadata: { tags: ['saved-views'] }
  }),
  defineEndpoint({
    id: 'savedViews.delete',
    method: 'DELETE',
    path: '/api/saved-views/:savedViewId',
    description: 'Delete a saved view.',
    request: {
      params: SavedViewParamsSchema
    },
    response: {
      kind: 'json',
      success: DeletedResultSchema,
      successStatus: 200
    },
    metadata: { tags: ['saved-views'] }
  })
] as const;
