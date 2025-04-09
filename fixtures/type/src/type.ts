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

type NestedObjectType = {
  value1: string;
  value2: number;
  value3: Date;
  value4: SomethingElse;
};

type SomethingElse = {
  value2: PrettyNestedType;
};

type PrettyNestedType = {
  value1: string;
  value2: number;
  value3: Date;
};

type MainObjectType = {
  value1: string;
  value2: number;
  value3: Date;
  propertyWithTypeAlias: NestedObjectType;
};
