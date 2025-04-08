import { type DecoratorMetadata } from '../../../types/decoratorMetadata';
import { type ITypeMetadata } from '../../type/types/type-metadata.interface';

export interface InterfacePropertyMetadata {
  name: string;
  comment: string;
  decorators: Record<string, DecoratorMetadata | undefined>;
  type: ITypeMetadata;
}
