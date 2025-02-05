import type ts from 'typescript';
import { canHaveJsDoc, getJsDoc } from 'tsutils/util/util';
import { getPropertyGlobalComment, getTagInformation } from '../../lib/tag';
import { type ClassPropertyMetadata } from './types/classPropertyMetadata';
import { convertKindToType } from '../../lib/kind';
import { type DecoratorMetadataList } from '../../types/decoratorMetadataList';

export function parseClassProperty(
  propertyDeclaration: ts.PropertyDeclaration
): ClassPropertyMetadata {
  let comment: string = '';
  const decorators: DecoratorMetadataList = [];

  if (propertyDeclaration.type !== undefined) {
    decorators.push({
      name: 'type',
      type: convertKindToType(propertyDeclaration.type.kind),
      comment: '',
    });
  }

  if (canHaveJsDoc(propertyDeclaration)) {
    const jsDocs: ts.JSDoc[] = getJsDoc(propertyDeclaration);
    for (const jsDoc of jsDocs) {
      comment = getPropertyGlobalComment(jsDoc);
      if (jsDoc.tags !== undefined) {
        for (const tag of jsDoc.tags) {
          const tagInformation = getTagInformation(tag);
          decorators.push(tagInformation);
        }
      }
    }
  }

  return {
    name: propertyDeclaration.name.getText(),
    comment,
    decorators,
  };
}
