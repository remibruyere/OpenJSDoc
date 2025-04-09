import type { HttpRequest, HttpResponse } from 'uWebSockets.js';
import type { z } from 'zod';
import { IApiRequest, IApiRequestUnverified } from '../interface/api-request';
import {
  Controller,
  ControllerRawResponse,
  ControllerTypedResponse,
} from '../interface/controller';
import { readBody } from './body.helper';
import { safeValidateSchema } from './validator.helper';
import { convertToOutputError, handleResponse } from './handle-response.helper';
import { InternalError } from 'errors/internal-error';

export function controller<
  Req extends IApiRequest<unknown, unknown, unknown>,
  Res extends
    | ControllerRawResponse
    | ControllerTypedResponse<Record<string, unknown> | void>,
>(
  handler: Controller<Req, Res>,
  requestSchema: z.ZodType<Req>
): (
  basePath: `/${string}`
) => (res: HttpResponse, req: HttpRequest) => Promise<void> {
  return (basePath: `/${string}`) => {
    return async (res: HttpResponse, req: HttpRequest): Promise<void> => {
      /* Can't return or yield from here without responding or attaching an abort handler */
      res.onAborted(() => {
        res.aborted = true;
      });

      try {
        const requestUnverified: IApiRequestUnverified<
          Record<string, unknown>,
          Record<string, string>,
          Record<string, string>
        > = {
          headers: getHeaders(req),
          queryStringParameters: getQuery(req),
          pathParameters: getParameters(basePath, req),
          body: ['post', 'put', 'patch'].includes(req.getMethod())
            ? await readBody(
                res,
                (message) =>
                  new InternalError(500, `Error during body read: ${message}`)
              )
            : {},
        };

        const validatedData = safeValidateSchema({
          requestSchema: requestSchema,
          data: {
            headers: requestUnverified.headers,
            pathParameters: requestUnverified.pathParameters,
            queryStringParameters: requestUnverified.queryStringParameters,
            body: requestUnverified.body,
          },
        });

        if (validatedData.isErr()) {
          handleResponse(res, validatedData.error);
        } else {
          await handler(validatedData.value)
            .then((responseData) => handleResponse(res, responseData))
            .catch((e) => handleResponse(res, convertToOutputError(e)));
        }
      } catch (e) {
        handleResponse(res, convertToOutputError(e));
      }
    };
  };
}

function getParameters(
  basePath: `/${string}`,
  req: HttpRequest
): Record<string, string> {
  return basePath
    .split('/')
    .filter((str) => str.startsWith(':'))
    .reduce((params: Record<string, string>, param) => {
      const paramName = param.substring(1);
      const parameter = req.getParameter(paramName);
      if (parameter) {
        params[paramName] = parameter;
      }
      return params;
    }, {});
}

const getHeaders = (req: HttpRequest): Record<string, string> => {
  const headers: Record<string, string> = {};

  req.forEach((key, value) => {
    headers[key] = value;
  });

  return headers;
};

const getQuery = (req: HttpRequest): Record<string, string> => {
  return Object.fromEntries(new URLSearchParams(req.getQuery()));
};
