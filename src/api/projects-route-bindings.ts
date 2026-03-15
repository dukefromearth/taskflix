import { getService } from '@/api/service-context';
import { getEndpoint } from '@/contracts/registry';
import { bindRoute } from '@/contracts/runtime/server';

export const listProjectsRoute = bindRoute(getEndpoint('projects.list'), async ({ query }) => {
  const service = await getService();
  return {
    data: await service.listProjects({ includeArchived: query.includeArchived === 'true' })
  };
});

export const createProjectRoute = bindRoute(getEndpoint('projects.create'), async ({ body }) => {
  const service = await getService();
  return {
    data: await service.createProject(body),
    status: 201
  };
});

export const reorderProjectsRoute = bindRoute(getEndpoint('projects.reorder'), async ({ body }) => {
  const service = await getService();
  return {
    data: await service.reorderProjects(body)
  };
});

export const getProjectRoute = bindRoute(getEndpoint('projects.get'), async ({ params }) => {
  const service = await getService();
  return {
    data: await service.getProject(params.projectId)
  };
});

export const updateProjectRoute = bindRoute(getEndpoint('projects.update'), async ({ params, body }) => {
  const service = await getService();
  return {
    data: await service.updateProject(params.projectId, body)
  };
});

export const deleteProjectRoute = bindRoute(getEndpoint('projects.delete'), async ({ params }) => {
  const service = await getService();
  return {
    data: await service.deleteProject(params.projectId)
  };
});
