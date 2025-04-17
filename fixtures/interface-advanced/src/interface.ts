export interface IIbanCreateRequestBodyApiDto {
  test4: { test5: Array<Test> | TypeTest[] | Test };
}

export interface Test {
  test: number;
}

export type TypeTest = { test2: number };
