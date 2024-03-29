import type ts from 'typescript';
import { canHaveJsDoc, getJsDoc } from 'tsutils/util/util';
import { getPropertyGlobalComment, getTagInformation } from '../../lib/tag';
import { type ClassPropertyMetadata } from './types/classPropertyMetadata';
import { type DecoratorMetadata } from '../../types/decoratorMetadata';

export function parseClassProperty(
  propertyDeclaration: ts.PropertyDeclaration
): ClassPropertyMetadata {
  let comment: string = '';
  const decorators: DecoratorMetadata[] = [];

  if (canHaveJsDoc(propertyDeclaration)) {
    const jsDocs: ts.JSDoc[] = getJsDoc(propertyDeclaration);
    for (const jsDoc of jsDocs) {
      comment = getPropertyGlobalComment(jsDoc);
      if (jsDoc.tags != null) {
        for (const tag of jsDoc.tags) {
          decorators.push(getTagInformation(tag));
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
