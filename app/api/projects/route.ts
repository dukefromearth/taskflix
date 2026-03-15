import { createProjectRoute, listProjectsRoute } from '@/api/projects-route-bindings';

export const GET = listProjectsRoute;
export const POST = createProjectRoute;
