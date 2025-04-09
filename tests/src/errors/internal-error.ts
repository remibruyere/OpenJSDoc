import { ApiError } from 'errors/api-error';

export class InternalError extends ApiError {
  constructor(statusCode: number, message?: string) {
    super(statusCode, message);
    this.name = 'InternalError';
  }
}
