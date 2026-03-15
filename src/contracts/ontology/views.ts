import { z } from 'zod';
import { TimestampStringSchema } from '@/contracts/primitives';

export const ViewNameSchema = z.enum(['today', 'upcoming', 'inbox', 'history', 'project']);

export const ViewParamsSchema = z.object({
  name: ViewNameSchema
});

export const ViewQuerySchema = z.object({
  now: TimestampStringSchema.optional(),
  projectId: z.string().min(1).optional()
});

export const parseViewNow = (value?: string): number => {
  if (!value) return Date.now();
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Date.now();
};
