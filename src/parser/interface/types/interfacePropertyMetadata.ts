import { type DecoratorMetadata } from '../../../types/decoratorMetadata';

export interface InterfacePropertyMetadata {
  name: string;
  comment: string;
  decorators: DecoratorMetadata[];
}
