/**
 * Address
 */
export interface IAccountAddressDto {
  readonly line1: string;
}

/**
 * DTO for request
 */
interface TestReqDTO {
  /**
   * Uuid representing identifier of the class
   *
   * @format uuid
   * @required
   */
  id: string;

  /**
   * Date of creation
   *
   * @format date
   * @optional
   */
  createdAt?: string;
}

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

  readonly testSubType: {
    test: number;
  };

  address: IAccountAddressDto;
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
