export interface IApiRequestUnverified<
  BodyType extends Record<string, unknown> | null = null,
  PathParamsType extends Record<string, string> = Record<string, never>,
  QueryParamsType extends Record<string, string> = Record<string, never>,
> {
  headers: Record<string, string>;
  body: BodyType extends null ? null : BodyType;
  pathParameters: PathParamsType extends undefined
    ? Record<string, never>
    : PathParamsType;
  queryStringParameters: QueryParamsType extends undefined
    ? Record<string, never>
    : QueryParamsType;
}

export interface IApiRequest<
  BodyType = void,
  PathParamsType = void,
  QueryParamsType = void,
> {
  headers: Record<string, string>;
  body: BodyType extends void
    ? Record<string, never>
    : IApiRequestBody<BodyType>;
  pathParameters: PathParamsType extends void
    ? Record<string, never>
    : PathParamsType;
  queryStringParameters: QueryParamsType extends void
    ? Record<string, never>
    : QueryParamsType;
}

export interface IApiRequestBody<BodyType> {
  readonly data: BodyType;
  readonly schemaVersion: number;
  readonly spanId: string;
  readonly metadata: Readonly<Record<string, string>>;
}

export interface IApiQueryStringParamsRequest {
  readonly schemaVersion: string;
  readonly spanId: string;
}

export interface IApiQueryStringParamsListRequest {
  readonly count?: number;
  readonly pageToken?: string;
}
