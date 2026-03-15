import { z } from 'zod';

export const ProjectStatusSchema = z.enum(['active', 'paused', 'done', 'archived']);

export const ProjectCreateSchema = z.object({
  title: z.string().trim().min(1).max(240),
  slug: z.string().trim().min(1).max(240).regex(/^[a-z0-9-]+$/, 'Slug must use [a-z0-9-]+'),
  descriptionMd: z.string().max(100_000).optional(),
  status: ProjectStatusSchema.optional(),
  colorToken: z.string().max(64).optional(),
  icon: z.string().max(64).optional()
});

export const ProjectPatchSchema = ProjectCreateSchema.partial();
