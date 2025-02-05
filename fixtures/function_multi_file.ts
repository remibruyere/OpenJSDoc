import type { TestReqDTO } from './testReqDTO';

/**
 * Handler for test endpoint
 *
 * @content application/json
 *
 * @request {TestReqDTO} Request body test dto
 * @response 200 {TestResDTO} Response body test dto
 * @response 400 {ITestReqSubType} Response body error dto
 */
export function handler(
  req: TestReqDTO,
  res: TestResDTO
): { body: string; statusCode: 200 } {
  return {
    statusCode: 200,
    body: JSON.stringify(new TestResDTO()),
  };
}

export interface ITestReqSubType {
  errorCode: number;
  errorMessage: string;
}

/**
 * DTO for response
 */
interface TestResDTO {
  /**
   * @response {TestResDTO} Response body
   */
  statusCode: number;

  /**
   * Response body send to client
   *
   * @type {TestReqDTO} Json response stringified
   * @required
   */
  body: string;
}
