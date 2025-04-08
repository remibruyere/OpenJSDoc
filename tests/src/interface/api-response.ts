export type IApiResponse<DataType> = {
  readonly data: DataType;
  readonly version: number;
  readonly metadata?: Record<string, unknown> & {
    readonly idempotency?: boolean;
  };
};
