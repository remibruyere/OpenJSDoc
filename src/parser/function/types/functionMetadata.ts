import { type DecoratorMetadataList } from '../../../types/decoratorMetadataList';

export interface FunctionMetadata {
  name: string;
  comment: string;
  decorators: DecoratorMetadataList;
}
