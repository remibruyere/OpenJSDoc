import ts from 'typescript';
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

  getPropertyTypeMetadata(
    propertySignature: ts.PropertySignature
  ): ITypeMetadata {
    const mainObjectType = this.checker.getTypeAtLocation(propertySignature);
    const propertyTypeName = this.checker.typeToString(mainObjectType);

    if (this.checker.isArrayType(mainObjectType)) {
      return {
        name: propertySignature.name?.getText() ?? '',
        type: 'array',
        arrayType: this.getArrayType(propertySignature),
        subType: this.processProperty({
          type: mainObjectType,
          node: propertySignature,
        }),
      };
    } else {
      return {
        name: propertySignature.name?.getText() ?? '',
        type: propertyTypeName.startsWith('{') ? 'object' : propertyTypeName,
        subType: this.processProperty({
          type: mainObjectType,
          node: propertySignature,
        }),
      };
    }
  }

  private getArrayType(
    propertySignature: ts.PropertySignature
  ): ITypeMetadata['arrayType'] {
    return (
      propertySignature.type as ts.NodeWithTypeArguments
    ).typeArguments?.flatMap((value) => {
      if (ts.isUnionTypeNode(value)) {
        return value.types.map((type) => {
          if (ts.isLiteralTypeNode(type)) {
            return {
              type: 'string',
              value: type.literal.getText().replaceAll("'", ''),
            };
          }
          return {
            type: 'object',
            value: type.getText(),
          };
        });
      }
      return {
        type: 'object',
        value: value.getText(),
      };
    });
  }

  processProperty({
    type,
    node,
    level = 0,
  }: {
    type: ts.Type;
    node: ts.Node;
    level?: number;
  }): ITypeMetadata['subType'] {
    let typeMetadata: ITypeMetadata['subType'];
    for (const property of type.getProperties()) {
      const propertyType = this.checker.getTypeOfSymbolAtLocation(
        property,
        node
      );
      const propertySymbol = propertyType.getSymbol();
      const propertyTypeName = this.checker.typeToString(propertyType);

      if (this.isTypeLocal(propertySymbol) || this.isTypeLocal(property)) {
        typeMetadata = typeMetadata ?? {};
        if (this.checker.isArrayType(propertyType)) {
          typeMetadata[property.name] = {
            name: property.name,
            type: 'array',
            subType: this.processProperty({
              type: propertyType,
              node,
              level: level + 1,
            }),
          };
        } else {
          typeMetadata[property.name] = {
            name: property.name,
            type: propertyTypeName,
            subType: this.processProperty({
              type: propertyType,
              node,
              level: level + 1,
            }),
          };
        }
      }
    }
    return typeMetadata;
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
