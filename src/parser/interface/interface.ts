import ts, { getTextOfJSDocComment, type TypeElement } from 'typescript';
import { canHaveJsDoc, getJsDoc } from 'tsutils/util/util';
import { type InterfacePropertyMetadata } from './types/interfacePropertyMetadata';
import { type InterfaceMetadata } from './types/interfaceMetadata';
import type { DecoratorMetadata } from '../../types/decoratorMetadata';
import { convertKindToType } from '../../lib/kind';
import { getPropertyGlobalComment, getTagInformation } from '../../lib/tag';
import { TypeParser } from '../type/type-parser';

export class InterfaceParser {
  typeParser: TypeParser;

  constructor(
    private readonly program: ts.Program,
    private readonly checker: ts.TypeChecker
  ) {
    this.typeParser = new TypeParser(program, checker);
  }

  parseInterface(
    interfaceDeclaration: ts.InterfaceDeclaration
  ): InterfaceMetadata {
    return {
      name: interfaceDeclaration.name?.getText() ?? '',
      comment: this.getInterfaceComment(interfaceDeclaration),
      properties: this.parseInterfaceMembers(interfaceDeclaration.members),
    };
  }

  parseInterfaceMembers(
    members: ts.NodeArray<TypeElement>
  ): InterfacePropertyMetadata[] {
    const properties: InterfacePropertyMetadata[] = [];
    members.forEach((member) => {
      if (ts.isPropertySignature(member)) {
        properties.push(this.parseInterfaceProperty(member));
      }
    });
    return properties;
  }

  getInterfaceComment(interfaceDeclaration: ts.InterfaceDeclaration): string {
    if (canHaveJsDoc(interfaceDeclaration)) {
      const jsDocs: ts.JSDoc[] = getJsDoc(interfaceDeclaration);
      if (jsDocs[0] !== undefined) {
        return getTextOfJSDocComment(jsDocs[0].comment) ?? '';
      }
    }
    return '';
  }

  parseInterfaceProperty(
    propertySignature: ts.PropertySignature
  ): InterfacePropertyMetadata {
    let comment: string = '';
    const decorators: Record<string, DecoratorMetadata> = {};

    const type = this.typeParser.getInterfaceType(propertySignature);

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
      type,
    };
  }
}
