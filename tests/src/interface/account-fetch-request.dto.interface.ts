import { IApiRequest } from './api-request';

export interface IAccountFetchPathParamsRequestApiDto {
  readonly accountId: string;
}

export interface IAccountFetchApiRequestDto
  extends IApiRequest<void, IAccountFetchPathParamsRequestApiDto> {}
