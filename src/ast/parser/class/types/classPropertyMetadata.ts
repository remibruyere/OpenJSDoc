import { type DecoratorMetadata } from '../../../types/decorator-metadata';
import type { ITypeMetadata } from '../../../types/type-metadata.interface';

export interface ClassPropertyMetadata {
  name: string;
  comment: string;
  decorators: Record<string, DecoratorMetadata | undefined>;
  typeMetadata: ITypeMetadata;
}
