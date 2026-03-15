import { z } from 'zod';
import { ProjectCreateSchema, ProjectPatchSchema } from '@/contracts/ontology/projects';
import { ProjectSchema } from '@/contracts/entities';
import { BooleanStringSchema, IdentifierSchema } from '@/contracts/primitives';
import { defineEndpoint } from '@/contracts/types';

const ProjectParamsSchema = z.object({ projectId: IdentifierSchema });

const ProjectListQuerySchema = z.object({
  includeArchived: BooleanStringSchema.optional()
});

const ReorderProjectsBodySchema = z.object({
  projectId: IdentifierSchema,
  leftProjectId: IdentifierSchema.optional(),
  rightProjectId: IdentifierSchema.optional()
});

export const projectEndpoints = [
  defineEndpoint({
    id: 'projects.list',
    method: 'GET',
    path: '/api/projects',
    description: 'List projects, optionally including archived.',
    request: {
      query: ProjectListQuerySchema
    },
    response: {
      kind: 'json',
      success: z.array(ProjectSchema),
      successStatus: 200
    },
    metadata: { tags: ['projects'] }
  }),
  defineEndpoint({
    id: 'projects.create',
    method: 'POST',
    path: '/api/projects',
    description: 'Create a new project.',
    request: {
      body: ProjectCreateSchema
    },
    response: {
      kind: 'json',
      success: ProjectSchema,
      successStatus: 201
    },
    metadata: { idempotencyKey: 'project.create', tags: ['projects'] }
  }),
  defineEndpoint({
    id: 'projects.reorder',
    method: 'POST',
    path: '/api/projects/reorder',
    description: 'Reorder a project in manual order.',
    request: {
      body: ReorderProjectsBodySchema
    },
    response: {
      kind: 'json',
      success: ProjectSchema,
      successStatus: 200
    },
    metadata: { tags: ['projects'] }
  }),
  defineEndpoint({
    id: 'projects.get',
    method: 'GET',
    path: '/api/projects/:projectId',
    description: 'Get a project by ID.',
    request: {
      params: ProjectParamsSchema
    },
    response: {
      kind: 'json',
      success: ProjectSchema,
      successStatus: 200
    },
    metadata: { tags: ['projects'] }
  }),
  defineEndpoint({
    id: 'projects.update',
    method: 'PATCH',
    path: '/api/projects/:projectId',
    description: 'Patch project fields by ID.',
    request: {
      params: ProjectParamsSchema,
      body: ProjectPatchSchema
    },
    response: {
      kind: 'json',
      success: ProjectSchema,
      successStatus: 200
    },
    metadata: { tags: ['projects'] }
  }),
  defineEndpoint({
    id: 'projects.delete',
    method: 'DELETE',
    path: '/api/projects/:projectId',
    description: 'Delete a project by ID.',
    request: {
      params: ProjectParamsSchema
    },
    response: {
      kind: 'json',
      success: ProjectSchema,
      successStatus: 200
    },
    metadata: { tags: ['projects'] }
  })
] as const;
