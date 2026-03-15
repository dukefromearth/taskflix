import { z } from 'zod';
import { apiEnvelopeSchema } from '@/contracts/envelope';
import { buildPathWithQuery } from '@/contracts/runtime/codecs';
import type { EndpointContract, EndpointSuccess, InferSchema } from '@/contracts/types';

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

type RequestOptions = {
  signal?: AbortSignal;
  headers?: HeadersInit;
  baseUrl?: string;
};

type ClientInput<E extends EndpointContract> = {
  params?: InferSchema<E['request']['params']>;
  query?: InferSchema<E['request']['query']>;
  body?: InferSchema<E['request']['body']>;
};

type ApiErrorPayload = {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export class ContractClientError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ContractClientError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

const readErrorText = async (response: Response): Promise<string> => {
  try {
    const text = await response.text();
    return text || `HTTP ${response.status}`;
  } catch {
    return `HTTP ${response.status}`;
  }
};

const asRecord = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
};

const tryParseApiError = (value: unknown): ApiErrorPayload | undefined => {
  const parsed = z
    .object({
      ok: z.literal(false),
      error: z.object({
        code: z.string(),
        message: z.string(),
        details: z.unknown().optional()
      })
    })
    .safeParse(value);
  return parsed.success ? parsed.data : undefined;
};

export const createContractClient = <TRegistry extends Record<string, EndpointContract>>(
  registry: TRegistry,
  transport: FetchLike = fetch
) => {
  const call = async <TEndpointId extends keyof TRegistry & string>(
    endpointId: TEndpointId,
    input?: ClientInput<TRegistry[TEndpointId]>,
    options?: RequestOptions
  ): Promise<EndpointSuccess<TRegistry[TEndpointId]>> => {
    const endpoint = registry[endpointId];
    if (!endpoint) {
      throw new Error(`Unknown endpoint id: ${endpointId}`);
    }

    const params = endpoint.request.params
      ? endpoint.request.params.parse(asRecord(input?.params))
      : undefined;
    const query = endpoint.request.query
      ? endpoint.request.query.parse(asRecord(input?.query))
      : undefined;
    const body = endpoint.request.body
      ? endpoint.request.body.parse(input?.body)
      : undefined;

    const relativePath = buildPathWithQuery(
      endpoint.path,
      params ? (params as Record<string, unknown>) : undefined,
      query ? (query as Record<string, unknown>) : undefined
    );

    const url = `${options?.baseUrl ?? ''}${relativePath}`;
    const response = await transport(url, {
      method: endpoint.method,
      signal: options?.signal,
      headers: {
        ...(options?.headers ?? {}),
        ...(body === undefined ? {} : { 'content-type': 'application/json' })
      },
      body: body === undefined ? undefined : JSON.stringify(body)
    });

    if (!response.ok) {
      let payload: unknown;
      try {
        payload = await response.json();
      } catch {
        payload = undefined;
      }

      const apiError = tryParseApiError(payload);
      if (apiError) {
        throw new ContractClientError(response.status, apiError.error.code, apiError.error.message, apiError.error.details);
      }

      throw new ContractClientError(response.status, 'HTTP_ERROR', await readErrorText(response));
    }

    if (endpoint.response.kind === 'empty') {
      return undefined as EndpointSuccess<TRegistry[TEndpointId]>;
    }

    if (endpoint.response.kind === 'json') {
      const payload = await response.json();
      const dataSchema = endpoint.response.success ?? z.unknown();
      const envelope = apiEnvelopeSchema(dataSchema).parse(payload);
      if (!envelope.ok) {
        throw new ContractClientError(response.status, envelope.error.code, envelope.error.message, envelope.error.details);
      }
      return envelope.data as EndpointSuccess<TRegistry[TEndpointId]>;
    }

    return response as EndpointSuccess<TRegistry[TEndpointId]>;
  };

  return { call };
};
