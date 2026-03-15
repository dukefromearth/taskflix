import { deleteProjectRoute, getProjectRoute, updateProjectRoute } from '@/api/projects-route-bindings';

export const GET = getProjectRoute;
export const PATCH = updateProjectRoute;
export const DELETE = deleteProjectRoute;
