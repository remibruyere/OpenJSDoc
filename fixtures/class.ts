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
