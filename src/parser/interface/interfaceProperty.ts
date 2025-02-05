import type ts from 'typescript';
import { canHaveJsDoc, getJsDoc } from 'tsutils/util/util';
import { getPropertyGlobalComment, getTagInformation } from '../../lib/tag';
import { type InterfacePropertyMetadata } from './types/interfacePropertyMetadata';
import { getTypeFromPropertySignature } from '../../lib/propertySignature';
import { type DecoratorMetadataList } from '../../types/decoratorMetadataList';

export function parseInterfaceProperty(
  propertySignature: ts.PropertySignature
): InterfacePropertyMetadata {
  let comment: string = '';
  const decorators: DecoratorMetadataList = [];

  if (canHaveJsDoc(propertySignature)) {
    const jsDocs: ts.JSDoc[] = getJsDoc(propertySignature);
    if (jsDocs.length === 0) {
      const typeDecoratorMetadata =
        getTypeFromPropertySignature(propertySignature);
      if (typeDecoratorMetadata !== undefined) {
        decorators.push(typeDecoratorMetadata);
      }
    } else {
      for (const jsDoc of jsDocs) {
        comment = getPropertyGlobalComment(jsDoc);
        if (jsDoc.tags != null) {
          for (const tag of jsDoc.tags) {
            const tagInformation = getTagInformation(tag);
            decorators.push(tagInformation);
          }
        }
      }
      if (!decorators.some((decorator) => decorator.name === 'type')) {
        const typeDecoratorMetadata =
          getTypeFromPropertySignature(propertySignature);
        if (typeDecoratorMetadata !== undefined) {
          decorators.push(typeDecoratorMetadata);
        }
      }
    }
  }

  return {
    name: propertySignature.name.getText(),
    comment,
    decorators,
  };
}
