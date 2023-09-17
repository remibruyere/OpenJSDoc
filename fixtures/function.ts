/**
 * Handler for test endpoint
 *
 * @request {TestReqDTO} Request body
 * @response {TestResDTO} Response body
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
