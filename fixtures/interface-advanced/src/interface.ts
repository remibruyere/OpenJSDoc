export interface IAccountApiDto {
  readonly schemeSupported: Array<
    'CARD' | 'INTERNAL' | 'SEPA_SCT_INST' | 'SEPA_SCT' | 'SEPA_SDD'
  >;

  readonly tree: {
    leef: number;
    leefString: string;
  };
}
