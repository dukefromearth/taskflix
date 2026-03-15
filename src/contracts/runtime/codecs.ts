export type QueryPrimitive = string | number | boolean;

export type QueryInput = Record<string, unknown>;

const encodeSegment = (value: unknown): string => encodeURIComponent(String(value));

export const interpolatePath = (template: string, params?: Record<string, unknown>): string => {
  if (!params) return template;

  return template.replace(/:([A-Za-z0-9_]+)/g, (_, key: string) => {
    const value = params[key];
    if (value === undefined || value === null) {
      throw new Error(`Missing path parameter: ${key}`);
    }
    return encodeSegment(value);
  });
};

const normalizeQueryValue = (value: unknown): string | undefined => {
  if (value === undefined || value === null) return undefined;
  if (Array.isArray(value)) {
    if (value.length === 0) return undefined;
    for (const entry of value) {
      if (typeof entry !== 'string' && typeof entry !== 'number' && typeof entry !== 'boolean') {
        throw new Error('Query arrays must contain only string/number/boolean values.');
      }
    }
    return value.map((entry) => String(entry)).join(',');
  }
  if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') {
    throw new Error('Query values must be string/number/boolean or arrays of those primitives.');
  }
  return String(value);
};

export const encodeQuery = (query?: QueryInput): string => {
  if (!query) return '';

  const entries = Object.entries(query)
    .map(([key, value]) => [key, normalizeQueryValue(value)] as const)
    .filter((entry): entry is readonly [string, string] => entry[1] !== undefined)
    .sort(([a], [b]) => a.localeCompare(b));

  const searchParams = new URLSearchParams();
  for (const [key, value] of entries) {
    searchParams.set(key, value);
  }

  return searchParams.toString();
};

export const buildPathWithQuery = (pathTemplate: string, params?: Record<string, unknown>, query?: QueryInput): string => {
  const path = interpolatePath(pathTemplate, params);
  const queryString = encodeQuery(query);
  return queryString ? `${path}?${queryString}` : path;
};

export const decodeQuery = (url: URL): Record<string, string> => Object.fromEntries(url.searchParams.entries());
