import type ts from 'typescript';
import { TypeFlags } from 'typescript';
import {
  type AndType,
  type AnyType,
  type ArrayType,
  type NodeType,
  type ObjectProperty,
  type ObjectType,
  type OrType,
} from '../../types/node-types';

export class TypeParser {
  constructor(
    private readonly program: ts.Program,
    private readonly checker: ts.TypeChecker
  ) {}

  getObjectProperty(symbol: ts.Symbol, level = 0): ObjectProperty | undefined {
    if (symbol.valueDeclaration == null) {
      return;
    }
    const type = this.checker.getTypeOfSymbolAtLocation(
      symbol,
      symbol.valueDeclaration
    );

    const anyTypeResult = this.processAnyType(type, type.symbol, level + 1);
    if (anyTypeResult.node === undefined) {
      return undefined;
    }
    return {
      required: anyTypeResult.required,
      node: anyTypeResult.node,
    };
  }

  private processAnyType(
    propertyType: ts.Type,
    property: ts.Symbol,
    level: number
  ): { node: NodeType | undefined; required: boolean } {
    if (this.checker.isArrayType(propertyType)) {
      return {
        node: this.processArrayType(propertyType, property, level + 1),
        required: true,
      };
    } else if (propertyType.isIntersection()) {
      return this.processIntersectionType(propertyType, level + 1);
    } else if (propertyType.isUnion()) {
      return this.processUnionType(propertyType, property, level + 1);
    } else if (propertyType.isNumberLiteral()) {
      return {
        node: {
          type: 'number',
          const: propertyType.value,
        },
        required: true,
      };
    } else if (propertyType.isStringLiteral()) {
      return {
        node: {
          type: 'string',
          const: propertyType.value,
        },
        required: true,
      };
    } else if (propertyType.flags === TypeFlags.Boolean) {
      console.log(propertyType);
      return {
        node: {
          type: 'boolean',
        },
        required: true,
      };
    } else if (propertyType.flags === TypeFlags.BooleanLiteral) {
      return {
        node: {
          type: 'boolean',
          const: this.checker.typeToString(propertyType) === 'true',
        },
        required: true,
      };
    } else if (propertyType.flags === TypeFlags.Number) {
      return {
        node: {
          type: 'number',
        },
        required: true,
      };
    } else if (
      propertyType.flags === TypeFlags.String ||
      propertyType.flags === TypeFlags.TemplateLiteral
    ) {
      return {
        node: {
          type: 'string',
        },
        required: true,
      };
    } else if (
      [TypeFlags.Undefined, TypeFlags.Void, TypeFlags.VoidLike].includes(
        propertyType.flags
      )
    ) {
      return { node: undefined, required: false };
    } else if ([TypeFlags.Object].includes(propertyType.flags)) {
      return {
        node: this.processObjectProperty({
          type: propertyType,
          level: level + 1,
        }),
        required: true,
      };
    } else if (
      [TypeFlags.TypeParameter, TypeFlags.Conditional].includes(
        propertyType.flags
      )
    ) {
      return { node: undefined, required: true };
    } else if (propertyType.flags === TypeFlags.Null) {
      return { node: { type: 'null' }, required: true };
    } else if (propertyType.flags === TypeFlags.Any) {
      return {
        node: {
          type: 'any',
        },
        required: true,
      };
    } else {
      console.log(new Error(`Unsupported flag ${propertyType.flags}`));
      console.log(propertyType);
      return {
        node: this.processObjectProperty({
          type: propertyType,
          level: level + 1,
        }),
        required: true,
      };
    }
  }

  processObjectProperty({
    type,
    level = 0,
  }: {
    type: ts.Type;
    level?: number;
  }): ObjectType | AnyType | undefined {
    if (level > 20) {
      return {
        type: 'any',
      } satisfies AnyType;
    }
    if (this.checker.typeToString(type).match(/Record<.*never>/) !== null) {
      return undefined;
    }
    const objectType: ObjectType = {
      name: this.checker.typeToString(type),
      type: 'object',
      properties: {},
      additionalProperties: false,
    };
    for (const property of type.getProperties()) {
      if (property.valueDeclaration === undefined) {
        continue;
      }
      const propertyType = this.checker.getTypeOfSymbolAtLocation(
        property,
        property.valueDeclaration
      );
      const propertySymbol = propertyType.getSymbol();

      if (this.isTypeLocal(propertySymbol) || this.isTypeLocal(property)) {
        const objectProp = this.getObjectProperty(property, level + 1);
        if (objectProp !== undefined) {
          Object.assign(objectType.properties, {
            [property.name]: objectProp,
          });
        }
      }
    }
    Object.entries(objectType.properties).forEach((value) => {
      if (value[1].node.type === 'or') {
        const booleans = value[1].node.or.filter(
          (orProp) => orProp.type === 'boolean'
        );
        if (booleans.length === 2) {
          if (value[1].node.or.length === 2) {
            value[1].node = {
              type: 'boolean',
            };
          } else {
            value[1].node.or = [
              ...value[1].node.or.filter((orProp) => orProp.type !== 'boolean'),
              {
                type: 'boolean',
              },
            ];
          }
        }
      }
    });
    return objectType;
  }

  private processArrayType(
    propertyType: ts.Type,
    property: ts.Symbol,
    level: number
  ): ArrayType {
    const arrayElementType = this.getArrayItemType(propertyType);
    if (
      arrayElementType !== undefined &&
      arrayElementType.getProperties().length > 0
    ) {
      return {
        name: property.name,
        type: 'array',
        elementType: this.processAnyType(
          arrayElementType,
          arrayElementType.symbol,
          level + 1
        ).node ?? {
          type: 'null',
        },
      };
    } else {
      return {
        name: property.name,
        type: 'array',
        elementType: {
          type: 'any',
        },
      };
    }
  }

  private processUnionType(
    propertyType: ts.UnionOrIntersectionType,
    property: ts.Symbol,
    level: number
  ): { node: NodeType | undefined; required: boolean } {
    const nodeType: OrType = {
      type: 'or',
      or: [],
    };
    for (const value of propertyType.types) {
      const anyTypeResult = this.processAnyType(value, value.symbol, level + 1);
      if (anyTypeResult.node !== undefined) {
        nodeType.or.push(anyTypeResult.node);
      }
    }
    if (propertyType.types.length > 1 && nodeType.or.length === 1) {
      return {
        node: nodeType.or[0],
        required: false,
      };
    }
    if (nodeType.or.length === 0) {
      return { node: undefined, required: false };
    }
    return {
      node: nodeType,
      required: propertyType.types.length === nodeType.or.length,
    };
  }

  private processIntersectionType(
    propertyType: ts.UnionOrIntersectionType,
    level: number
  ): { node: NodeType | undefined; required: boolean } {
    const nodeType: AndType = {
      type: 'and',
      and: [],
    };
    for (const value of propertyType.types) {
      const anyTypeResult = this.processAnyType(value, value.symbol, level + 1);
      if (anyTypeResult.node !== undefined) {
        nodeType.and.push(anyTypeResult.node);
      }
    }
    return {
      node: nodeType,
      required: true,
    };
  }

  private getArrayItemType(type: ts.Type): ts.Type | undefined {
    const symbolName = type.symbol?.getName();
    if (symbolName === 'Array' || symbolName === 'ReadonlyArray') {
      const typeArgs = (type as ts.TypeReference).typeArguments;
      return typeArgs?.[0];
    }
  }

  private isTypeLocal(symbol: ts.Symbol | undefined): boolean {
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
