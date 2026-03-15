import type { z } from 'zod';

export type AnySchema = z.ZodTypeAny;

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export type ResponseKind = 'json' | 'redirect' | 'binary' | 'empty';

export type EndpointContract<
  Id extends string = string,
  Method extends HttpMethod = HttpMethod,
  Path extends string = string,
  ParamsSchema extends AnySchema | undefined = AnySchema | undefined,
  QuerySchema extends AnySchema | undefined = AnySchema | undefined,
  BodySchema extends AnySchema | undefined = AnySchema | undefined,
  SuccessSchema extends AnySchema | undefined = AnySchema | undefined
> = {
  id: Id;
  method: Method;
  path: Path;
  description: string;
  request: {
    params?: ParamsSchema;
    query?: QuerySchema;
    body?: BodySchema;
  };
  response: {
    kind: ResponseKind;
    success?: SuccessSchema;
    successStatus: number | number[];
  };
  metadata?: {
    idempotencyKey?: string;
    tags?: string[];
  };
};

export const defineEndpoint = <
  Id extends string,
  Method extends HttpMethod,
  Path extends string,
  ParamsSchema extends AnySchema | undefined,
  QuerySchema extends AnySchema | undefined,
  BodySchema extends AnySchema | undefined,
  SuccessSchema extends AnySchema | undefined
>(
  endpoint: EndpointContract<Id, Method, Path, ParamsSchema, QuerySchema, BodySchema, SuccessSchema>
): EndpointContract<Id, Method, Path, ParamsSchema, QuerySchema, BodySchema, SuccessSchema> => endpoint;

export type InferSchema<T extends AnySchema | undefined> = [Exclude<T, undefined>] extends [never]
  ? undefined
  : Exclude<T, undefined> extends AnySchema
    ? z.infer<Exclude<T, undefined>>
    : undefined;

export type EndpointInput<E extends EndpointContract> = {
  params: InferSchema<E['request']['params']>;
  query: InferSchema<E['request']['query']>;
  body: InferSchema<E['request']['body']>;
};

export type EndpointSuccess<E extends EndpointContract> = InferSchema<E['response']['success']>;
