import type ts from 'typescript';
import { getTextOfJSDocComment } from 'typescript';
import { canHaveJsDoc, getJsDoc } from 'tsutils/util/util';
import { type InterfacePropertyMetadata } from './types/interfacePropertyMetadata';
import { type InterfaceMetadata } from './types/interfaceMetadata';
import { TypeParser } from '../../lib/type/type-parser';
import { type ObjectType } from '../../types/node-types';

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
    const name = interfaceDeclaration.name?.getText() ?? '';
    const description = this.getInterfaceDescription(interfaceDeclaration);
    const properties = this.parseInterfaceProperties(interfaceDeclaration);
    return {
      name,
      type: 'object',
      description,
      properties,
      additionalProperties: false,
    } satisfies ObjectType;
  }

  parseInterfaceProperties(
    interfaceDeclaration: ts.InterfaceDeclaration
  ): InterfacePropertyMetadata {
    const properties: InterfacePropertyMetadata = {};
    const typeAtLocation = this.checker.getTypeAtLocation(interfaceDeclaration);
    typeAtLocation.getProperties().forEach((property) => {
      const propertyMetadata = this.parseInterfaceProperty(property);
      if (propertyMetadata !== undefined) {
        Object.assign(properties, propertyMetadata);
      }
    });
    return properties;
  }

  getInterfaceDescription(
    interfaceDeclaration: ts.InterfaceDeclaration
  ): string {
    if (canHaveJsDoc(interfaceDeclaration)) {
      const jsDocs: ts.JSDoc[] = getJsDoc(interfaceDeclaration);
      if (jsDocs[0] !== undefined) {
        return getTextOfJSDocComment(jsDocs[0].comment) ?? '';
      }
    }
    return '';
  }

  parseInterfaceProperty(
    propertySymbol: ts.Symbol
  ): InterfacePropertyMetadata | undefined {
    if (propertySymbol.valueDeclaration === undefined) {
      return undefined;
    }
    const nodeObject = this.typeParser.getObjectProperty(propertySymbol);

    /* if (canHaveJsDoc(propertySymbol.getJsDocTags(this.checker))) {
        const jsDocs: ts.JSDoc[] = getJsDoc(propertySymbol);
        for (const jsDoc of jsDocs) {
          comment = getPropertyGlobalComment(jsDoc);
          if (jsDoc.tags != null) {
            for (const tag of jsDoc.tags) {
              const tagInformation = getTagInformation(tag);
              decorators[tagInformation.name] = tagInformation;
            }
          }
        }
      } */

    if (nodeObject === undefined) {
      return undefined;
    }

    return {
      [propertySymbol.getName()]: nodeObject,
    };
  }
}
