/**
 * Handler for test endpoint
 *
 * @content application/json
 *
 * @request {TestReqDTO} Request body test dto
 * @response 200 {TestResDTO} Response body test dto
 */
export const handler: (req: TestReqDTO) => TestResDTO = (
  req: TestReqDTO
): TestResDTO => {
  return {
    statusCode: 200,
    body: {
      test: 'test1',
      subObject: {
        test2: 123,
        createdAt: 'fzefz',
      },
    },
  };
};

interface ITestReqSubType {
  test: number;
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

  /**
   * Subtype of the request
   */
  subType: ITestReqSubType;
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
  body: {
    test: string;
    subObject: {
      test2: number;
      createdAt: string;
    };
  };
}
