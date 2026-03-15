import { z } from 'zod';
import { defineEndpoint } from '@/contracts/types';
import { IdentifierSchema } from '@/contracts/primitives';

const FileParamsSchema = z.object({ key: IdentifierSchema });

export const fileEndpoints = [
  defineEndpoint({
    id: 'files.get',
    method: 'GET',
    path: '/api/files/:key',
    description: 'Read a file payload from local storage.',
    request: {
      params: FileParamsSchema
    },
    response: {
      kind: 'binary',
      successStatus: 200
    },
    metadata: { tags: ['files'] }
  })
] as const;
