import { type DecoratorMetadata } from '../../../types/decoratorMetadata';

export interface FunctionMetadata {
  name: string;
  comment: string;
  decorators: Record<string, DecoratorMetadata>;
}
