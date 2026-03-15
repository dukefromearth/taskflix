import {
  attachmentEndpoints,
  fileEndpoints,
  healthEndpoints,
  itemEndpoints,
  projectEndpoints,
  savedViewEndpoints,
  searchEndpoints,
  timelineEndpoints,
  viewEndpoints
} from '@/contracts/endpoints';
import type { EndpointContract } from '@/contracts/types';

export const ALL_ENDPOINTS = [
  ...attachmentEndpoints,
  ...fileEndpoints,
  ...healthEndpoints,
  ...itemEndpoints,
  ...projectEndpoints,
  ...savedViewEndpoints,
  ...searchEndpoints,
  ...timelineEndpoints,
  ...viewEndpoints
] as const;

const assertUniqueRegistry = (endpoints: readonly EndpointContract[]) => {
  const ids = new Set<string>();
  const methodPath = new Set<string>();

  for (const endpoint of endpoints) {
    if (ids.has(endpoint.id)) {
      throw new Error(`Duplicate endpoint id: ${endpoint.id}`);
    }
    ids.add(endpoint.id);

    const routeKey = `${endpoint.method} ${endpoint.path}`;
    if (methodPath.has(routeKey)) {
      throw new Error(`Duplicate endpoint route: ${routeKey}`);
    }
    methodPath.add(routeKey);
  }
};

assertUniqueRegistry(ALL_ENDPOINTS);

export type EndpointId = (typeof ALL_ENDPOINTS)[number]['id'];
export type AnyEndpoint = (typeof ALL_ENDPOINTS)[number];
export type EndpointById<TId extends EndpointId> = Extract<AnyEndpoint, { id: TId }>;
type EndpointMap = {
  [Endpoint in AnyEndpoint as Endpoint['id']]: Endpoint;
};

export const ENDPOINT_BY_ID = Object.freeze(
  Object.fromEntries(ALL_ENDPOINTS.map((endpoint) => [endpoint.id, endpoint])) as EndpointMap
);

export const getEndpoint = <TId extends keyof EndpointMap>(id: TId): EndpointMap[TId] => ENDPOINT_BY_ID[id];

export const ENDPOINTS_BY_METHOD = Object.freeze(
  ALL_ENDPOINTS.reduce<Record<AnyEndpoint['method'], AnyEndpoint[]>>((acc, endpoint) => {
    if (!acc[endpoint.method]) {
      acc[endpoint.method] = [];
    }
    acc[endpoint.method].push(endpoint);
    return acc;
  }, {} as Record<AnyEndpoint['method'], AnyEndpoint[]>)
);

export const ENDPOINTS_BY_TAG = Object.freeze(
  ALL_ENDPOINTS.reduce<Record<string, AnyEndpoint[]>>((acc, endpoint) => {
    for (const tag of endpoint.metadata?.tags ?? []) {
      if (!acc[tag]) acc[tag] = [];
      acc[tag].push(endpoint);
    }
    return acc;
  }, {})
);

export const REGISTRY_SUMMARY = Object.freeze({
  endpointCount: ALL_ENDPOINTS.length,
  routeCount: new Set(ALL_ENDPOINTS.map((endpoint) => `${endpoint.method} ${endpoint.path}`)).size
});
