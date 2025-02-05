import { type DecoratorMetadataList } from '../../../types/decoratorMetadataList';

export interface ClassPropertyMetadata {
  name: string;
  comment: string;
  decorators: DecoratorMetadataList;
}
