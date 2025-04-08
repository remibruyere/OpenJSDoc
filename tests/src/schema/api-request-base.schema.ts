import { string, unknown, z } from 'zod';
import { IApiRequest, IApiRequestBody } from '../interface/api-request';

export const apiRequestBaseBodySchema = z
  .object({
    data: z.record(string(), unknown()),
    schemaVersion: z.number(),
    spanId: z.string(),
    metadata: z.record(z.string(), z.string()),
  })
  .strict() satisfies z.ZodType<IApiRequestBody<Record<string, unknown>>>;

export const apiRequestBaseQueryStringParamsSchema = z
  .object({
    schemaVersion: z.number(),
    spanId: z.string(),
  })
  .strict() satisfies z.ZodType<Record<string, unknown>>;

export const apiRequestBaseSchema = z
  .object({
    headers: z.record(z.string(), z.string()),
    body: z.record(z.string(), z.never()),
    pathParameters: z.record(z.string(), z.never()),
    queryStringParameters: z.record(z.string(), z.never()),
  })
  .strict() satisfies z.ZodType<IApiRequest>;
