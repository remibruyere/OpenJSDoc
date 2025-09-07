import { canHaveJsDoc, getJsDoc } from 'tsutils/util/util';
import ts from 'typescript';
import { TypeParser } from '../../lib/type/type-parser';
import { type InterfaceMetadata } from '../interface/types/interfaceMetadata';
import { type InterfacePropertyMetadata } from '../interface/types/interfacePropertyMetadata';

export class TypeAliasParser {
  typeParser: TypeParser;

  constructor(
    readonly program: ts.Program,
    readonly checker: ts.TypeChecker,
  ) {
    this.typeParser = new TypeParser(program, checker);
  }

  parseTypeAlias(
    typeAliasDeclaration: ts.TypeAliasDeclaration,
  ): InterfaceMetadata {
    return {
      name: typeAliasDeclaration.name?.getText() ?? '',
      type: 'object',
      description: this.getDescription(typeAliasDeclaration),
      properties:
        typeAliasDeclaration.type !== undefined
          ? this.parseMembers(
              this.checker.getTypeAtLocation(typeAliasDeclaration),
            )
          : {},
      additionalProperties: false,
    };
  }

  parseMembers(node: ts.Type): InterfacePropertyMetadata {
    const properties: InterfacePropertyMetadata = {};
    node.getProperties().forEach((prop) => {
      const memberMetadata = this.parseTypeAliasProperty(prop);
      if (memberMetadata !== undefined) {
        Object.assign(properties, memberMetadata);
      }
    });
    return properties;
  }

  getDescription(typeAliasDeclaration: ts.TypeAliasDeclaration): string {
    if (canHaveJsDoc(typeAliasDeclaration)) {
      const jsDocs: ts.JSDoc[] = getJsDoc(typeAliasDeclaration);
      if (jsDocs[0] !== undefined) {
        return ts.getTextOfJSDocComment(jsDocs[0].comment) ?? '';
      }
    }
    return '';
  }

  parseTypeAliasProperty(
    propertySymbol: ts.Symbol,
  ): InterfacePropertyMetadata | undefined {
    const nodeObject = this.typeParser.getObjectProperty(propertySymbol);

    // if (canHaveJsDoc(propertySignature)) {
    //   const jsDocs: ts.JSDoc[] = getJsDoc(propertySignature);
    //   for (const jsDoc of jsDocs) {
    //     comment = getPropertyGlobalComment(jsDoc);
    //     if (jsDoc.tags != null) {
    //       for (const tag of jsDoc.tags) {
    //         const tagInformation = getTagInformation(tag);
    //         decorators[tagInformation.name] = tagInformation;
    //       }
    //     }
    //   }
    // }

    if (nodeObject === undefined) {
      return undefined;
    }

    return {
      [propertySymbol.getName()]: nodeObject,
    };
  }
}
