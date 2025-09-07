import type { HttpResponse } from 'uWebSockets.js';
import { ApiError } from 'errors/api-error';
import { InternalError } from 'errors/internal-error';
import {
  ControllerRawResponse,
  ControllerTypedResponse,
} from '../interface/controller';

export function convertToOutputError(
  responseError: Error | unknown,
): ControllerRawResponse {
  if (responseError instanceof ApiError) {
    return {
      body: JSON.stringify({
        error: responseError.toResponse(),
      }),
      statusCode: responseError.statusCode,
    } satisfies ControllerRawResponse;
  }
  if (responseError instanceof Error) {
    return {
      body: JSON.stringify({
        error: {
          statusCode: 500,
          name: responseError.name,
          message: responseError.message,
          errorLevel: 'ALERT',
        },
      }),
      statusCode: 500,
    } satisfies ControllerRawResponse;
  }
  const error = new InternalError(500, 'An undefined error has been thrown');
  return {
    body: JSON.stringify({
      error: {
        statusCode: 500,
        name: error.name,
        message: error.message,
        errorLevel: 'ALERT',
      },
    }),
    statusCode: 500,
  } satisfies ControllerRawResponse;
}

export function handleResponse(
  res: HttpResponse,
  data:
    | ControllerRawResponse
    | ControllerTypedResponse<Record<string, unknown> | void>
    | Error,
) {
  if (data instanceof Error) {
    const error = convertToOutputError(data);
    if (!res.aborted) {
      res.cork(() => {
        res.writeStatus(error.statusCode.toString());
        res.end(error.body);
      });
    }
  } else {
    if (data.body !== undefined) {
      if (!res.aborted) {
        const body =
          typeof data.body === 'string' ? data.body : JSON.stringify(data.body);
        res.cork(() => {
          res.writeStatus(data.statusCode.toString());
          res.end(body);
        });
      }
    } else {
      if (!res.aborted) {
        res.cork(() => {
          res.writeStatus(data.statusCode.toString());
          res.endWithoutBody();
        });
      }
    }
  }
}
