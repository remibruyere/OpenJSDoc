/**
 * Handler for test endpoint 2
 *
 * @content application/json
 *
 * @request {TestReqDTO} Request body test dto
 * @response 200 {TestResDTO} Response body test dto
 * @response 400 {ITestResError} Response body error dto
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

export interface ITestResError {
  errorCode: number;
  errorMessage: string;
}

export interface IUser {
  name: string;
}

/**
 * DTO for request
 */
export interface TestReqDTO {
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

  /**
   * Subtype of the request
   */
  user: IUser;
}

/**
 * DTO for response
 */
interface TestResDTO {
  /**
   * @required
   * @example 200
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
