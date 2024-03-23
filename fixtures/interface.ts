/**
 * DTO for request
 */
interface ITestReqDTO {
  /**
   * Uuid representing identifier of the interface
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
interface ITestResDTO {
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
