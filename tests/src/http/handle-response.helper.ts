import type { HttpResponse } from 'uWebSockets.js';
import {
  ControllerRawResponse,
  ControllerTypedResponse,
} from '../interface/controller';

export function convertToOutputError(
  responseError: Error,
): ControllerRawResponse {
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

export function handleResponse(
  res: HttpResponse,
  data:
    | ControllerRawResponse
    | ControllerTypedResponse<Record<string, unknown> | void>
    | Error,
) {
  if (data instanceof Error) {
    const error = convertToOutputError(data);
    res.cork(() => {
      res.writeStatus(error.statusCode.toString());
      res.end(error.body);
    });
  } else {
    if (data.body !== undefined) {
      res.cork(() => {
        res.writeStatus(data.statusCode.toString());
        res.end(
          typeof data.body === 'string' ? data.body : JSON.stringify(data.body),
        );
      });
    } else {
      res.cork(() => {
        res.writeStatus(data.statusCode.toString());
        res.endWithoutBody();
      });
    }
  }
}
