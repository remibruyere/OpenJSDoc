import { type DecoratorMetadata } from '../../../types/decorator-metadata';

export interface FunctionMetadata {
  name: string;
  comment: string;
  decorators: Record<string, DecoratorMetadata>;
}
