import type ts from 'typescript';
import { canHaveJsDoc, getJsDoc } from 'tsutils/util/util';
import { getPropertyGlobalComment, getTagInformation } from '../../lib/tag';
import { type InterfacePropertyMetadata } from './types/interfacePropertyMetadata';
import { type DecoratorMetadata } from '../../types/decoratorMetadata';

export function parseInterfaceProperty(
  propertySignature: ts.PropertySignature
): InterfacePropertyMetadata {
  let comment: string = '';
  const decorators: Record<string, DecoratorMetadata> = {};

  if (canHaveJsDoc(propertySignature)) {
    const jsDocs: ts.JSDoc[] = getJsDoc(propertySignature);
    for (const jsDoc of jsDocs) {
      comment = getPropertyGlobalComment(jsDoc);
      if (jsDoc.tags != null) {
        for (const tag of jsDoc.tags) {
          const tagInformation = getTagInformation(tag);
          decorators[tagInformation.name] = tagInformation;
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
