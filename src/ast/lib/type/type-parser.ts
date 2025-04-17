import type ts from 'typescript';
import { type ITypeMetadata } from '../../types/type-metadata.interface';

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

  getPropertyTypeMetadata(symbol: ts.Symbol): ITypeMetadata | undefined {
    if (symbol.valueDeclaration == null) {
      return;
    }
    const type = this.checker.getTypeOfSymbolAtLocation(
      symbol,
      symbol.valueDeclaration
    );
    const propertyTypeName = this.checker.typeToString(type);

    if (this.checker.isArrayType(type)) {
      return {
        ...this.processArrayType(type, type.symbol, 0),
        name: symbol.getName(),
      };
    }
    return {
      name: symbol.getName(),
      type: propertyTypeName,
      subType: this.processProperty({
        type,
      }),
    };
  }

  processProperty({
    type,
    level = 0,
  }: {
    type: ts.Type;
    level?: number;
  }): ITypeMetadata['subType'] {
    if (level > 20) {
      return;
    }
    const typeMetadata: ITypeMetadata[] = [];
    for (const property of type.getProperties()) {
      if (property.valueDeclaration === undefined) {
        continue;
      }
      const propertyType = this.checker.getTypeOfSymbolAtLocation(
        property,
        property.valueDeclaration
      );
      const propertySymbol = propertyType.getSymbol();
      const propertyTypeName = this.checker.typeToString(propertyType);

      if (this.isTypeLocal(propertySymbol) || this.isTypeLocal(property)) {
        const items = this.processAnyType(
          propertyType,
          property,
          level,
          propertyTypeName
        );
        typeMetadata.push(items);
      }
    }
    return typeMetadata.length === 0 ? undefined : typeMetadata;
  }

  private processAnyType(
    propertyType: ts.Type | ts.UnionOrIntersectionType,
    property: ts.Symbol,
    level: number,
    propertyTypeName: string
  ): ITypeMetadata {
    if (this.checker.isArrayType(propertyType)) {
      return this.processArrayType(propertyType, property, level);
    } else if (propertyType.isUnionOrIntersection()) {
      return {
        name: property.name,
        type: 'union',
        subType: this.processUnionType(propertyType, property, level),
      };
    } else {
      return {
        name: property.name,
        type: propertyTypeName,
        subType: this.processProperty({
          type: propertyType,
          level: level + 1,
        }),
      };
    }
  }

  private processArrayType(
    propertyType: ts.Type,
    property: ts.Symbol,
    level: number
  ): ITypeMetadata {
    const arrayElementType = this.getArrayElementType(propertyType);
    if (
      arrayElementType !== undefined &&
      arrayElementType.getProperties().length > 0
    ) {
      return {
        name: property.name,
        type: 'array',
        subType: this.processProperty({
          type: arrayElementType,
          level: level + 1,
        }),
      };
    } else {
      return {
        name: property.name,
        type: 'array',
        subType: undefined,
      };
    }
  }

  private processUnionType(
    propertyType: ts.UnionOrIntersectionType,
    property: ts.Symbol,
    level: number
  ): ITypeMetadata[][] {
    const typeMetadata: ITypeMetadata[][] = [];
    for (const value of propertyType.types) {
      if (this.checker.isArrayType(value)) {
        typeMetadata.push([
          {
            ...this.processArrayType(value, value.symbol, 0),
            name: value.symbol.getName(),
          },
        ]);
      } else {
        const items = this.processProperty({ type: value, level: level + 1 });
        if (items !== undefined) {
          typeMetadata.push(items as ITypeMetadata[]);
        }
      }
    }
    return typeMetadata;
  }

  getArrayElementType(type: ts.Type): ts.Type | undefined {
    const symbolName = type.symbol?.getName();
    if (symbolName === 'Array' || symbolName === 'ReadonlyArray') {
      const typeArgs = (type as ts.TypeReference).typeArguments;
      return typeArgs?.[0];
    }
  }

  isTypeLocal(symbol: ts.Symbol | undefined): boolean {
    const sourceFile = symbol?.valueDeclaration?.getSourceFile();
    const hasSource = !(sourceFile == null);
    const isStandardLibrary =
      hasSource && this.program.isSourceFileDefaultLibrary(sourceFile);
    const isExternal =
      hasSource && this.program.isSourceFileFromExternalLibrary(sourceFile);
    const hasDeclaration = !(symbol?.declarations?.[0] == null);

    return (
      !(Boolean(isStandardLibrary) || Boolean(isExternal)) &&
      hasDeclaration &&
      symbol?.getName() !== '__type'
    );
  }
}
