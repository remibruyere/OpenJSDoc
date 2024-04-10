import { type DecoratorMetadata } from '../../../types/decoratorMetadata';

export interface ClassPropertyMetadata {
  name: string;
  comment: string;
  decorators: Record<string, DecoratorMetadata | undefined>;
}
