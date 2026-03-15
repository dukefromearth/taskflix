import { z } from 'zod';
import { QueryRecordSchema } from '@/contracts/primitives';

export const SavedViewCreateBodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  icon: z.string().trim().min(1).max(64).optional(),
  queryJson: QueryRecordSchema
});

export const SavedViewPatchBodySchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  icon: z.string().trim().min(1).max(64).optional(),
  queryJson: QueryRecordSchema.optional()
});
