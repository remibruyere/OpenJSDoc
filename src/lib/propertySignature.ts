import type ts from 'typescript';
import type { DecoratorMetadata } from '../types/decoratorMetadata';
import { convertKindToType } from './kind';

export function getTypeFromPropertySignature(
  propertySignature: ts.PropertySignature
): DecoratorMetadata | undefined {
  if (propertySignature.type !== undefined) {
    return {
      name: 'type',
      comment: '',
      type: convertKindToType(propertySignature.type.kind),
    };
  }
  return undefined;
}
