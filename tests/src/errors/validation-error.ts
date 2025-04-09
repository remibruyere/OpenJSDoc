import { ApiError } from 'errors/api-error';

export class ValidationError extends ApiError {
  constructor(statusCode: number, message?: string) {
    super(statusCode, message);
    this.name = 'ValidationError';
  }
}
