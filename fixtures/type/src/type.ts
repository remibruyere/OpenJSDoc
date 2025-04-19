type AbstractType = {
  abs: boolean;
};

type PrettyNestedType = {
  value1: string;
  value2: number;
  value3: string;
} & AbstractType;
