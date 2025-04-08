import { err, ok } from 'neverthrow';
import { ValidationError } from 'errors/validation-error';
import type { Result } from 'neverthrow';
import type { IApiRequest, IApiRequestUnverified } from 'types/api/api-request';
import type { ApiError } from 'errors/api-error';
import type { z } from 'zod';

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
