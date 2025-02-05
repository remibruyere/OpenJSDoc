import {
  type SchemaObject,
  type OpenAPIObject,
  OpenApiBuilder,
  type ResponsesObject,
  type RequestBodyObject,
} from 'openapi3-ts/oas31';
import { type GlobalMetadata } from '../types/globalMetadata';
import type { ClassMetadata } from '../parser/class/types/classMetadata';
import type { InterfaceMetadata } from '../parser/interface/types/interfaceMetadata';
import { type ClassPropertyMetadata } from '../parser/class/types/classPropertyMetadata';
import { type InterfacePropertyMetadata } from '../parser/interface/types/interfacePropertyMetadata';
import { type SchemaObjectType } from 'openapi3-ts/src/model/openapi31';
import { type PathConfiguration } from '../types/pathConfiguration';
import { type DecoratorMetadataList } from '../types/decoratorMetadataList';

export class OpenApiDocBuilder {
  openApiBuilder: OpenApiBuilder;

  constructor(doc?: OpenAPIObject) {
    this.openApiBuilder = OpenApiBuilder.create(
      doc ?? {
        openapi: '3.1.0',
        info: {
          title: 'app',
          version: 'version',
        },
        paths: {},
        components: {
          schemas: {},
          responses: {},
          parameters: {},
          examples: {},
          requestBodies: {},
          headers: {},
          securitySchemes: {},
          links: {},
          callbacks: {},
        },
        tags: [],
        servers: [],
      }
    );
  }

  getAsJson(): string {
    return this.openApiBuilder.getSpecAsJson(undefined, 2);
  }

  getAsXml(): string {
    return this.openApiBuilder.getSpecAsYaml();
  }

  addEndpointConfiguration(
    entryPointFunction: string,
    pathConfiguration: PathConfiguration,
    globalMetadata: GlobalMetadata
  ): void {
    const entryPointMetadata = globalMetadata.functionMetadata.find(
      (value) => value.name === entryPointFunction
    );

    globalMetadata.classMetadata.forEach((metadata) => {
      this.addComponent(metadata);
    });

    globalMetadata.interfaceMetadata.forEach((metadata) => {
      this.addComponent(metadata);
    });

    this.openApiBuilder.addPath(pathConfiguration.path, {
      summary: pathConfiguration.summary,
      description: pathConfiguration.description,
      [pathConfiguration.method]: {
        description: entryPointMetadata?.comment,
        requestBody: this.getContentRequest(entryPointMetadata?.decorators),
        responses: {
          ...this.getResponses(entryPointMetadata?.decorators),
        },
      },
    });
  }

  getContentRequest(
    decorators: DecoratorMetadataList | undefined
  ): RequestBodyObject | undefined {
    const contentDecorator = decorators?.find(
      (decorator) => decorator.name === 'content'
    );
    if (contentDecorator === undefined) {
      return undefined;
    }

    const requestDecorator = decorators?.find(
      (decorator) => decorator.name === 'request'
    );
    if (requestDecorator === undefined) {
      return undefined;
    }

    return {
      description: requestDecorator?.comment,
      content: {
        [contentDecorator.comment]: {
          schema: {
            $ref: `#/components/schemas/${requestDecorator.type?.toString()}`,
          },
        },
      },
    };
  }

  getResponses(
    decorators: DecoratorMetadataList | undefined
  ): ResponsesObject | undefined {
    const contentDecorator = decorators?.find(
      (decorator) => decorator.name === 'content'
    );
    if (contentDecorator === undefined) {
      return undefined;
    }

    const responseDecorators = decorators?.filter(
      (decorator) => decorator.name === 'response'
    );
    if (responseDecorators === undefined) {
      return undefined;
    }

    const responses: ResponsesObject[] = responseDecorators.map(
      (responseDecorator) => {
        const responseCode: number | 'default' =
          responseDecorator.responseCode ?? 'default';

        return {
          [responseCode]: {
            description: responseDecorator?.comment,
            content: {
              [contentDecorator.comment]: {
                schema: {
                  $ref: `#/components/schemas/${responseDecorator.type?.toString()}`,
                },
              },
            },
          },
        } satisfies ResponsesObject;
      }
    );

    return responses.reduce(
      (previousValue, currentValue) => ({ ...previousValue, ...currentValue }),
      {}
    );
  }

  addComponent(metadata: ClassMetadata | InterfaceMetadata): void {
    this.openApiBuilder.addSchema(metadata.name, {
      title: metadata.name,
      summary: metadata.comment,
      properties: metadata.properties.reduce((previousValue, currentValue) => {
        return {
          ...previousValue,
          [currentValue.name]: this.getProperty(currentValue),
        };
      }, {}),
    });
  }

  getProperty(
    property: ClassPropertyMetadata | InterfacePropertyMetadata
  ): SchemaObject | undefined {
    const typeDecorator = property.decorators?.find(
      (decorator) => decorator.name === 'type'
    );
    if (typeDecorator?.type === undefined) {
      return undefined;
    }
    const formatDecorator = property.decorators?.find(
      (decorator) => decorator.name === 'format'
    );

    return {
      type: this.convertToType(typeDecorator.type.toString()),
      format: formatDecorator?.comment?.toString(),
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
