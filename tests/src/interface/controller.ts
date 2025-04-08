export type ControllerRawResponse = {
  body: string;
  statusCode: number;
};

export type ControllerTypedResponse<
  Res extends Record<string, unknown> | void,
> = {
  body: Res;
  statusCode: number;
};

export type Controller<
  Req,
  Res extends
    | ControllerRawResponse
    | ControllerTypedResponse<Record<string, unknown> | void>,
> = (event: Req) => Promise<Res>;
