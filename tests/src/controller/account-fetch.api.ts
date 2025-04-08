import { Controller, ControllerTypedResponse } from '../interface/controller';
import { IAccountFetchApiRequestDto } from '../interface/account-fetch-request.dto.interface';
import { IAccountFetchApiResponseDto } from '../interface/account-fetch-response.dto.interface';

/**
 * Handler for test endpoint
 *
 * @content application/json
 *
 * @request {IAccountFetchApiRequestDto} Request body test dto
 * @response 200 {IAccountFetchApiResponseDto} Response body test dto
 */
export const accountFetchHandler: Controller<
  IAccountFetchApiRequestDto,
  ControllerTypedResponse<IAccountFetchApiResponseDto>
> = async (
  event: IAccountFetchApiRequestDto
): Promise<ControllerTypedResponse<IAccountFetchApiResponseDto>> => {
  return {
    statusCode: 200,
    body: {
      data: {
        accountId: 'test',
      },
      version: 1,
    } as unknown as IAccountFetchApiResponseDto,
  };
};
