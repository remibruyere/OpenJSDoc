import type ts from 'typescript';
import { canHaveJsDoc, getJsDoc } from 'tsutils/util/util';
import { getPropertyGlobalComment, getTagInformation } from '../../lib/tag';
import { type DecoratorMetadata } from '../../types/decoratorMetadata';
import { type InterfacePropertyMetadata } from '../interface/types/interfacePropertyMetadata';
import { convertKindToType } from '../../lib/kind';

export function parseTypeAliasProperty(
  propertySignature: ts.PropertySignature
): InterfacePropertyMetadata {
  let comment: string = '';
  const decorators: Record<string, DecoratorMetadata> = {};

  if (propertySignature.type !== undefined) {
    decorators.type = {
      name: 'type',
      type: convertKindToType(propertySignature.type?.kind),
      comment: '',
    };
  }

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
    // TODO change
    type: {
      type: '',
      name: '',
      subType: {},
    },
  };
}
