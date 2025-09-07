import type { ApiError } from 'errors/api-error';
import { ValidationError } from 'errors/validation-error';
import type { Result } from 'neverthrow';
import { err, ok } from 'neverthrow';
import type { z } from 'zod';
import { IApiRequest, IApiRequestUnverified } from '../interface/api-request';

export function safeValidateSchema<
  TRequest extends IApiRequest<unknown, unknown, unknown>,
>({
  requestSchema,
  data,
}: {
  requestSchema: z.ZodType<TRequest>;
  data: IApiRequestUnverified<
    Record<string, unknown> | null,
    Record<string, string>,
    Record<string, string>
  >;
}): Result<TRequest, ApiError> {
  const parseResult = requestSchema.safeParse(data);
  if (!parseResult.success) {
    return err(new ValidationError(400, parseResult.error.message));
  }
  return ok(parseResult.data);
}
