import { type DecoratorMetadata } from './decoratorMetadata';

export interface ClassPropertyMetadata {
  name: string;
  comment: string;
  decorators: DecoratorMetadata[];
}
