import { deleteItemRoute, getItemRoute, updateItemRoute } from '@/api/items-route-bindings';

export const GET = getItemRoute;
export const PATCH = updateItemRoute;
export const DELETE = deleteItemRoute;
