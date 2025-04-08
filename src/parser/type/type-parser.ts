import type ts from 'typescript';
import { type ITypeMetadata } from './types/type-metadata.interface';

/**
 * https://www.satellytes.com/blog/post/typescript-ast-type-checker/
 * https://ts-ast-viewer.com/#code
 * https://github.com/microsoft/vscode/blob/main/build/lib/mangle/index.ts
 */
export class TypeParser {
  constructor(
    private readonly program: ts.Program,
    private readonly checker: ts.TypeChecker
  ) {}

  getInterfaceType(interfaceDeclaration: ts.TypeElement): ITypeMetadata {
    const mainObjectType = this.checker.getTypeAtLocation(interfaceDeclaration);
    const propertyTypeName = this.checker.typeToString(mainObjectType);
    return this.processProperty(mainObjectType, interfaceDeclaration, {
      name: interfaceDeclaration.name?.getText() ?? '',
      type: propertyTypeName.startsWith('{') ? 'object' : propertyTypeName,
      subType: {},
    });
  }

  processProperty(
    type: ts.Type,
    node: ts.Node,
    typeMetadata: ITypeMetadata,
    level = 0
  ): ITypeMetadata {
    for (const property of type.getProperties()) {
      const propertyType = this.checker.getTypeOfSymbolAtLocation(
        property,
        node
      );
      const propertySymbol = propertyType.getSymbol();
      const propertyTypeName = this.checker.typeToString(propertyType);

      /**
       * If it's a local type belonging to our sources we are interested in
       * further analysis, so we process all properties again like we did for the current given property.
       */
      if (propertySymbol !== undefined && this.isTypeLocal(propertySymbol)) {
        console.log(property.name, propertySymbol, propertyTypeName);
        typeMetadata.subType[property.name] = this.processProperty(
          propertyType,
          node,
          {
            name: property.name,
            type: propertyTypeName.startsWith('{')
              ? 'object'
              : propertyTypeName,
            subType: {},
          },
          level + 1
        );
      } else {
        if (propertySymbol === undefined) {
          console.log(property.name, propertySymbol);
          typeMetadata.subType[property.name] = {
            name: property.name,
            type: propertyTypeName.startsWith('{')
              ? 'object'
              : propertyTypeName,
            subType: {},
          };
        }
      }
    }
    return typeMetadata;
  }

  isTypeLocal(symbol: ts.Symbol): boolean {
    const sourceFile = symbol?.valueDeclaration?.getSourceFile();
    const hasSource = !(sourceFile == null);
    const isStandardLibrary =
      hasSource && this.program.isSourceFileDefaultLibrary(sourceFile);
    const isExternal =
      hasSource && this.program.isSourceFileFromExternalLibrary(sourceFile);
    const hasDeclaration = !(symbol?.declarations?.[0] == null);

    return (
      !(Boolean(isStandardLibrary) || Boolean(isExternal)) && hasDeclaration
    );
  }
}
