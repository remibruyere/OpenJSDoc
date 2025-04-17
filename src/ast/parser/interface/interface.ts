import type ts from 'typescript';
import { getTextOfJSDocComment } from 'typescript';
import { canHaveJsDoc, getJsDoc } from 'tsutils/util/util';
import { type InterfacePropertyMetadata } from './types/interfacePropertyMetadata';
import { type InterfaceMetadata } from './types/interfaceMetadata';
import type { DecoratorMetadata } from '../../types/decorator-metadata';
import { TypeParser } from '../../lib/type/type-parser';

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
    const comment = this.getInterfaceComment(interfaceDeclaration);
    const properties = this.parseInterfaceProperties(interfaceDeclaration);
    return {
      name,
      comment,
      properties,
    };
  }

  parseInterfaceProperties(
    interfaceDeclaration: ts.InterfaceDeclaration
  ): InterfacePropertyMetadata[] {
    const properties: InterfacePropertyMetadata[] = [];
    const typeAtLocation = this.checker.getTypeAtLocation(interfaceDeclaration);
    typeAtLocation.getProperties().forEach((property) => {
      const propertyMetadata = this.parseInterfaceProperty(property);
      if (propertyMetadata !== undefined) {
        properties.push(propertyMetadata);
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
    propertySymbol: ts.Symbol
  ): InterfacePropertyMetadata | undefined {
    const comment: string = '';
    const decorators: Record<string, DecoratorMetadata> = {};

    if (propertySymbol.valueDeclaration !== undefined) {
      const type = this.typeParser.getPropertyTypeMetadata(propertySymbol);

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

      if (type != null) {
        return {
          name: propertySymbol.getName(),
          comment,
          decorators,
          typeMetadata: type,
        };
      }
    }
  }

  flattenType(
    type: ts.Type,
    prefix: string = '',
    result: Record<string, string> = {},
    visited = new Set<ts.Type>()
  ): Record<string, string> {
    if (visited.has(type)) return result;
    visited.add(type);

    for (const prop of type.getProperties()) {
      const name = prop.getName();
      const fullName = prefix !== '' ? `${prefix}.${name}` : name;

      if (prop.valueDeclaration !== undefined) {
        const propType = this.checker.getTypeOfSymbolAtLocation(
          prop,
          prop.valueDeclaration
        );
        const typeStr = this.checker.typeToString(propType);

        if (
          propType.isClassOrInterface() ||
          (propType.getProperties().length > 0 &&
            propType.getCallSignatures().length === 0)
        ) {
          this.flattenType(propType, fullName, result, visited);
        } else {
          result[fullName] = typeStr;
        }
      }
    }

    return result;
  }
}
