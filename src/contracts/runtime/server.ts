import { NextResponse } from 'next/server';
import { ok } from '@/api/contracts';
import { handleRouteError, jsonOk, parseOrThrow, parseRequestJson, withIdempotency } from '@/api/next-helpers';
import type { EndpointContract, InferSchema } from '@/contracts/types';
import { decodeQuery } from './codecs';

export type BoundRouteContext<TParams extends Record<string, string> = Record<string, string>> = {
  params?: Promise<TParams>;
};

type BoundInput<E extends EndpointContract> = {
  request: Request;
  context: BoundRouteContext;
  params: InferSchema<E['request']['params']>;
  query: InferSchema<E['request']['query']>;
  body: InferSchema<E['request']['body']>;
};

type JsonResult<T = unknown> = {
  data: T;
  status?: number;
  headers?: HeadersInit;
};

type RouteImplementation<E extends EndpointContract> = (input: BoundInput<E>) => Promise<JsonResult | Response> | JsonResult | Response;

const defaultStatus = (endpoint: EndpointContract): number => {
  if (Array.isArray(endpoint.response.successStatus)) {
    const [first] = endpoint.response.successStatus;
    if (first === undefined) {
      throw new Error(`Endpoint '${endpoint.id}' must declare at least one success status code.`);
    }
    return first;
  }
  return endpoint.response.successStatus;
};

const parseInput = async <E extends EndpointContract>(endpoint: E, request: Request, context: BoundRouteContext): Promise<BoundInput<E>> => {
  const params = endpoint.request.params
    ? parseOrThrow(endpoint.request.params, context.params ? await context.params : {})
    : undefined;
  const query = endpoint.request.query
    ? parseOrThrow(endpoint.request.query, decodeQuery(new URL(request.url)))
    : undefined;
  const body = endpoint.request.body ? await parseRequestJson(request, endpoint.request.body) : undefined;

  return {
    request,
    context,
    params: params as InferSchema<E['request']['params']>,
    query: query as InferSchema<E['request']['query']>,
    body: body as InferSchema<E['request']['body']>
  };
};

export const bindRoute = <E extends EndpointContract>(endpoint: E, impl: RouteImplementation<E>) => {
  return async (request: Request, context: BoundRouteContext = {}): Promise<Response> => {
    try {
      const input = await parseInput(endpoint, request, context);
      const output = await impl(input);

      if (output instanceof Response) {
        return output;
      }

      if (endpoint.response.kind !== 'json') {
        throw new Error(`Endpoint '${endpoint.id}' expected non-json response implementation.`);
      }

      const status = output.status ?? defaultStatus(endpoint);
      const execute = async () => ({
        status,
        payload: ok(output.data)
      });

      if (endpoint.metadata?.idempotencyKey) {
        const cached = await withIdempotency(request, endpoint.metadata.idempotencyKey, execute);
        return NextResponse.json(cached.payload, { status: cached.status });
      }

      return jsonOk(output.data, { status, headers: output.headers });
    } catch (error) {
      return handleRouteError(error);
    }
  };
};
