import { type ITestReqSubType } from './function_multi_file';

/**
 * DTO for request
 */
export class TestReqDTO {
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
