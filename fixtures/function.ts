/**
 * Handler for test endpoint
 *
 * @request {TestReqDTO} Request body
 * @response {TestResDTO} Response body
 *
 * @type {TestReqDTO} Request - Json request stringified
 * @type {TestResDTO} Response - Json response stringified
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

/**
 * DTO for request
 */
class TestReqDTO {
  /**
   * Uuid representing identifier of the class
   *
   * @type {uuid}
   * @required
   */
  id: string;

  /**
   * Date of creation
   *
   * @type {Date}
   * @optional
   */
  createdAt?: Date;
}

/**
 * DTO for response
 */
class TestResDTO {
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
