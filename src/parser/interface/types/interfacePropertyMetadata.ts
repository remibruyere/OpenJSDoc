import { type DecoratorMetadataList } from '../../../types/decoratorMetadataList';

export interface InterfacePropertyMetadata {
  name: string;
  comment: string;
  decorators: DecoratorMetadataList;
}
