import { type OpenApiBuilder, type SchemaObject } from 'openapi3-ts/oas31';
import type { ClassMetadata } from '../ast/parser/class/types/classMetadata';
import type { InterfaceMetadata } from '../ast/parser/interface/types/interfaceMetadata';
import { type ClassPropertyMetadata } from '../ast/parser/class/types/classPropertyMetadata';
import { type InterfacePropertyMetadata } from '../ast/parser/interface/types/interfacePropertyMetadata';
import {
  type ReferenceObject,
  type SchemaObjectType,
} from 'openapi3-ts/src/model/openapi31';
import { type ITypeMetadata } from '../ast/types/type-metadata.interface';

export class OpenApiDocComponentBuilder {
  openApiBuilder: OpenApiBuilder;

  constructor(openApiBuilder: OpenApiBuilder) {
    this.openApiBuilder = openApiBuilder;
  }

  addComponent(metadata: ClassMetadata | InterfaceMetadata): void {
    this.openApiBuilder.addSchema(metadata.name, {
      title: metadata.name,
      summary: metadata.comment,
      properties: metadata.properties.reduce((previousValue, currentValue) => {
        return {
          ...previousValue,
          [currentValue.name]: this.getPropertyDefinition(currentValue),
        };
      }, {}),
    });
  }

  getPropertyDefinition(
    property: ClassPropertyMetadata | InterfacePropertyMetadata
  ): SchemaObject {
    const type = property.typeMetadata;
    const format = property.decorators.format;

    const propertyDefinition: SchemaObject = {
      type: this.convertToType(type.type),
      items:
        type.arrayType !== undefined
          ? this.getArrayItems(type.arrayType)
          : undefined,
      format: format?.comment?.toString(),
    };

    if (property.typeMetadata.subType !== undefined) {
      propertyDefinition.properties = this.getSubTypePropertyDefinition(
        Object.values(property.typeMetadata.subType)
      );
    }

    return propertyDefinition;
  }

  getSubTypePropertyDefinition(
    typeMetadataArray: ITypeMetadata[]
  ): Record<string, SchemaObject | ReferenceObject> | undefined {
    return typeMetadataArray.reduce((previousValue, currentValue) => {
      return {
        ...previousValue,
        [currentValue.name]: {
          type: this.convertToType(currentValue.type),
          items:
            currentValue.arrayType !== undefined
              ? this.getArrayItems(currentValue.arrayType)
              : undefined,
          properties:
            currentValue.subType !== undefined
              ? this.getSubTypePropertyDefinition(
                  Object.values(currentValue.subType)
                )
              : undefined,
        },
      };
    }, {});
  }

  getArrayItems(
    arrayType: ITypeMetadata['arrayType']
  ): SchemaObject | ReferenceObject | undefined {
    return {
      type: 'string',
      enum: arrayType?.map((value) => value.value),
    };
  }

  convertToType(decoratorType: string): SchemaObjectType {
    switch (decoratorType) {
      case 'string':
        return 'string';
      case 'number':
        return 'number';
      case 'integer':
        return 'integer';
      case 'boolean':
        return 'boolean';
      case 'object':
        return 'object';
      case 'null':
        return 'null';
      case 'array':
        return 'array';
      default:
        return 'string';
    }
  }
}
