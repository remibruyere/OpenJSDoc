import { ApiError } from 'errors/api-error';

export class ValidatorError extends ApiError {
  constructor(statusCode: number, message?: string) {
    super(statusCode, message);
    this.name = 'ValidatorError';
  }
}
