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

export function controller<
  Req extends IApiRequest<unknown, unknown, unknown>,
  Res extends
    | ControllerRawResponse
    | ControllerTypedResponse<Record<string, unknown> | void>,
>(handler: Controller<Req, Res>, requestSchema: z.ZodType<Req>) {
  return async (res: HttpResponse, req: HttpRequest) => {
    const requestUnverified: IApiRequestUnverified<
      Record<string, unknown> | null,
      Record<string, string>,
      Record<string, string>
    > = {
      headers: getHeaders(req),
      queryStringParameters: getQuery(req),
      pathParameters: getParameters(req),
      body: ['post', 'put', 'patch'].includes(req.getMethod())
        ? await readBody(res, new Error())
        : null,
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
      return handleResponse(res, validatedData.error);
    } else {
      try {
        return handleResponse(res, await handler(validatedData.value));
      } catch (e) {
        return handleResponse(res, convertToOutputError(e));
      }
    }
  };
}

function getParameters(req: HttpRequest): Record<string, string> {
  return req
    .getUrl()
    .split('/')
    .filter((str) => str.startsWith(':'))
    .reduce((params: Record<string, string>, param) => {
      const parameter = req.getParameter(param.substring(1));
      if (parameter) {
        params[param] = parameter;
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
