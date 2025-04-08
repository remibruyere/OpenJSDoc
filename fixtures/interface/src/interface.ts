/**
 * DTO for path params
 */
export interface IAccountFetchPathParamsRequestApiDto {
  /**
   * Uuid representing identifier of the account
   *
   * @type {uuid}
   * @required
   */
  readonly accountId: string;
}

export interface IAccountFetchApiRequestDto
  extends IApiRequest<void, IAccountFetchPathParamsRequestApiDto> {}

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
