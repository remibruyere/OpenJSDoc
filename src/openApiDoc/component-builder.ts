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
import type { GlobalMetadata } from '../ast/types/global-metadata';

export class OpenApiDocComponentBuilder {
  openApiBuilder: OpenApiBuilder;

  constructor(openApiBuilder: OpenApiBuilder) {
    this.openApiBuilder = openApiBuilder;
  }

  findComponent(
    globalMetadata: GlobalMetadata,
    typeName: string
  ): Array<ClassMetadata | InterfaceMetadata | undefined> {
    return [
      ...globalMetadata.classMetadata.filter(
        (classMetadata) => classMetadata.name === typeName
      ),
      ...globalMetadata.interfaceMetadata.filter(
        (interfaceMetadata) => interfaceMetadata.name === typeName
      ),
    ];
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

  addTypeMetadata(metadata: ITypeMetadata, summary?: string): void {
    this.openApiBuilder.addSchema(metadata.name, {
      title: metadata.name,
      summary,
      properties: metadata.subType?.reduce(
        (
          previousValue: Record<string, SchemaObject | ReferenceObject>,
          currentValue
        ) => {
          const property = this.getSubTypePropertyDefinition(
            Object.values(currentValue)
          );
          if (property === undefined) {
            return previousValue;
          }
          if (Array.isArray(currentValue)) {
            return {
              ...previousValue,
              [currentValue[0].name]: property,
            };
          }
          return {
            ...previousValue,
            [currentValue.name]: property,
          };
        },
        {}
      ),
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
      case 'integer':
        return 'integer';
      case 'number':
        return 'number';
      case 'string':
        return 'string';
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
