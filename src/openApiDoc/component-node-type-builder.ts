import {
  type AndType,
  type AnyType,
  type ArrayType,
  type BooleanType,
  type CoreTypeAnnotations,
  type IntegerType,
  type NodeType,
  type NullType,
  type NumberType,
  type ObjectType,
  type OrType,
  type RefType,
  type StringType,
  type TupleType,
} from '../ast/types/node-types';
import { type ReferenceObject, type SchemaObject } from 'openapi3-ts/oas31';

export class OpenApiDocComponentNodeTypeBuilder {
  static convertNodeTypeToSchemaObject(
    nodeType: NodeType
  ): SchemaObject | ReferenceObject {
    switch (nodeType.type) {
      case 'null':
        return this.getSchemaObjectFromNullType(nodeType);
      case 'string':
        return this.getSchemaObjectFromStringType(nodeType);
      case 'number':
        return this.getSchemaObjectFromNumberType(nodeType);
      case 'integer':
        return this.getSchemaObjectFromIntegerType(nodeType);
      case 'boolean':
        return this.getSchemaObjectFromBooleanType(nodeType);
      case 'any':
        return this.getSchemaObjectFromAnyType(nodeType);
      case 'array':
        return this.getSchemaObjectFromArrayType(nodeType);
      case 'object':
        return this.getSchemaObjectFromObjectType(nodeType);
      case 'tuple':
        return this.getSchemaObjectFromTupleType(nodeType);
      case 'and':
        return this.getSchemaObjectFromAndType(nodeType);
      case 'or':
        return this.getSchemaObjectFromOrType(nodeType);
      case 'ref':
        return this.getSchemaObjectFromRefType(nodeType);
    }
  }

  static getAnnotationSchemaObject(
    coreTypeAnnotations: CoreTypeAnnotations
  ): Partial<SchemaObject> {
    return {
      title: coreTypeAnnotations.name,
      description:
        coreTypeAnnotations.description !== undefined ||
        coreTypeAnnotations.comment !== undefined
          ? [coreTypeAnnotations.description, coreTypeAnnotations.comment].join(
              '\n\n'
            )
          : undefined,
      ...(Array.isArray(coreTypeAnnotations.examples)
        ? {
            examples: coreTypeAnnotations.examples,
          }
        : {
            example: coreTypeAnnotations.examples,
          }),
      default: coreTypeAnnotations.default,
    };
  }

  static getSchemaObjectFromNullType(nullType: NullType): SchemaObject {
    return {
      ...this.getAnnotationSchemaObject(nullType),
      type: 'null',
    };
  }

  static getSchemaObjectFromStringType(stringType: StringType): SchemaObject {
    return {
      ...this.getAnnotationSchemaObject(stringType),
      type: 'string',
      const: stringType.const,
      enum: stringType.enum,
    };
  }

  static getSchemaObjectFromNumberType(numberType: NumberType): SchemaObject {
    return {
      ...this.getAnnotationSchemaObject(numberType),
      type: 'number',
      const: numberType.const,
      enum: numberType.enum,
    };
  }

  static getSchemaObjectFromIntegerType(
    integerType: IntegerType
  ): SchemaObject {
    return {
      ...this.getAnnotationSchemaObject(integerType),
      type: 'integer',
      const: integerType.const,
      enum: integerType.enum,
    };
  }

  static getSchemaObjectFromBooleanType(
    booleanType: BooleanType
  ): SchemaObject {
    return {
      ...this.getAnnotationSchemaObject(booleanType),
      type: 'boolean',
      const: booleanType.const,
      enum: booleanType.enum,
    };
  }

  static getSchemaObjectFromAnyType(anyType: AnyType): SchemaObject {
    return {
      ...this.getAnnotationSchemaObject(anyType),
    };
  }

  static getSchemaObjectFromArrayType(arrayType: ArrayType): SchemaObject {
    return {
      ...this.getAnnotationSchemaObject(arrayType),
      type: arrayType.type,
      items: this.convertNodeTypeToSchemaObject(arrayType.elementType),
    };
  }

  static getSchemaObjectFromObjectType(objectType: ObjectType): SchemaObject {
    const allKeys = Object.keys(objectType.properties);

    const required = allKeys.filter(
      (prop) => objectType.properties[prop].required
    );

    const properties = Object.fromEntries(
      allKeys.map((prop) => [
        prop,
        this.convertNodeTypeToSchemaObject(objectType.properties[prop].node),
      ])
    );

    return {
      ...this.getAnnotationSchemaObject(objectType),
      type: objectType.type,
      ...(allKeys.length > 0 ? { properties } : {}),
      ...(required.length > 0 ? { required } : {}),
      ...(objectType.additionalProperties === true
        ? {}
        : objectType.additionalProperties === false
          ? { additionalProperties: false }
          : {
              additionalProperties: this.convertNodeTypeToSchemaObject(
                objectType.additionalProperties
              ),
            }),
    };
  }

  static getSchemaObjectFromTupleType(tupleType: TupleType): SchemaObject {
    return {
      ...this.getAnnotationSchemaObject(tupleType),
      type: 'array',
      prefixItems: tupleType.elementTypes.map((item) =>
        this.convertNodeTypeToSchemaObject(item)
      ),
      ...(tupleType.additionalItems === true
        ? {}
        : tupleType.additionalItems === false
          ? { additionalItems: false }
          : {
              additionalItems: this.convertNodeTypeToSchemaObject(
                tupleType.additionalItems
              ),
            }),
      minItems: tupleType.minItems,
    };
  }

  static getSchemaObjectFromAndType(andType: AndType): SchemaObject {
    return {
      ...this.getAnnotationSchemaObject(andType),
      allOf: andType.and.map((subNode) =>
        this.convertNodeTypeToSchemaObject(subNode)
      ),
    };
  }

  static getSchemaObjectFromOrType(orType: OrType): SchemaObject {
    return {
      ...this.getAnnotationSchemaObject(orType),
      anyOf: orType.or.map((subNode) =>
        this.convertNodeTypeToSchemaObject(subNode)
      ),
    };
  }

  static getSchemaObjectFromRefType(refType: RefType): ReferenceObject {
    return {
      ...this.getAnnotationSchemaObject(refType),
      $ref: `#/components/schemas/${refType.ref}`,
    };
  }
}
