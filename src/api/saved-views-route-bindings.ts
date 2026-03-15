import { getService } from '@/api/service-context';
import { getEndpoint } from '@/contracts/registry';
import { bindRoute } from '@/contracts/runtime/server';

export const listSavedViewsRoute = bindRoute(getEndpoint('savedViews.list'), async () => {
  const service = await getService();
  return { data: await service.listSavedViews() };
});

export const createSavedViewRoute = bindRoute(getEndpoint('savedViews.create'), async ({ body }) => {
  const service = await getService();
  return {
    data: await service.createSavedView(body),
    status: 201
  };
});

export const updateSavedViewRoute = bindRoute(getEndpoint('savedViews.update'), async ({ params, body }) => {
  const service = await getService();
  return {
    data: await service.updateSavedView(params.savedViewId, body)
  };
});

export const deleteSavedViewRoute = bindRoute(getEndpoint('savedViews.delete'), async ({ params }) => {
  const service = await getService();
  await service.deleteSavedView(params.savedViewId);
  return {
    data: { deleted: true as const }
  };
});
