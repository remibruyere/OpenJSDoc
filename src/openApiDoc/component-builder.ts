import { type OpenApiBuilder, type SchemaObjectType } from 'openapi3-ts/oas31';
import type { InterfaceMetadata } from '../ast/parser/interface/types/interfaceMetadata';
import type { GlobalMetadata } from '../ast/types/global-metadata';
import { isObjectType, type NodeType } from '../ast/types/node-types';
import { OpenApiDocComponentNodeTypeBuilder } from './component-node-type-builder';

export class OpenApiDocComponentBuilder {
  openApiBuilder: OpenApiBuilder;

  constructor(openApiBuilder: OpenApiBuilder) {
    this.openApiBuilder = openApiBuilder;
  }

  findComponent(
    globalMetadata: GlobalMetadata,
    typeName: string,
  ): Array<InterfaceMetadata | undefined> {
    return [
      // ...globalMetadata.classMetadata.filter(
      //   (classMetadata) => classMetadata.name === typeName
      // ),
      ...globalMetadata.interfaceMetadata.filter(
        (interfaceMetadata) => interfaceMetadata.name === typeName,
      ),
    ];
  }

  addComponent(metadata: InterfaceMetadata): void {
    this.openApiBuilder.addSchema(metadata.name, {
      title: metadata.name,
      summary: metadata.comment,
      description: metadata.description,
      type: this.convertTypeToSchemaObjectType(metadata),
      properties: isObjectType(metadata)
        ? Object.entries(metadata.properties).reduce(
            (previousValue, currentValue) => {
              return {
                ...previousValue,
                [currentValue[0]]:
                  OpenApiDocComponentNodeTypeBuilder.convertNodeTypeToSchemaObject(
                    currentValue[1].node,
                  ),
              };
            },
            {},
          )
        : {},
      required: isObjectType(metadata)
        ? Object.keys(metadata.properties).filter(
            (prop) => metadata.properties[prop].required,
          )
        : undefined,
    });
  }

  convertTypeToSchemaObjectType(nodeType: NodeType): SchemaObjectType {
    switch (nodeType.type) {
      case 'integer':
        return 'integer';
      case 'number':
        return 'number';
      case 'string':
        return 'string';
      case 'boolean':
        return 'boolean';
      case 'null':
        return 'null';
    }
    return 'object';
  }
}
