import { z } from 'zod';
import {
  IAccountFetchApiRequestDto,
  IAccountFetchPathParamsRequestApiDto,
} from '../interface/account-fetch-request.dto.interface';
import { apiRequestBaseSchema } from './api-request-base.schema';

export const accountFetchPathParamsRequestApiDtoSchema = z
  .object({
    accountId: z.string().uuid(),
  })
  .strict() satisfies z.ZodType<IAccountFetchPathParamsRequestApiDto>;

export const accountFetchApiRequestDtoSchema: z.ZodType<IAccountFetchApiRequestDto> =
  apiRequestBaseSchema
    .extend({
      pathParameters:
        accountFetchPathParamsRequestApiDtoSchema satisfies z.ZodType<
          IAccountFetchApiRequestDto['pathParameters']
        >,
    })
    .strict() satisfies z.ZodType<IAccountFetchApiRequestDto>;
