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
import type { DecoratorMetadata } from '../types/decoratorMetadata';

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
          ...this.getResponse(entryPointMetadata?.decorators),
        },
      },
    });
  }

  getContentRequest(
    decorators: Record<string, DecoratorMetadata> | undefined
  ): RequestBodyObject | undefined {
    if (
      decorators?.content === undefined ||
      decorators?.request === undefined
    ) {
      return undefined;
    }
    return {
      description: decorators?.request?.comment,
      content: {
        [decorators.content.comment]: {
          schema: {
            $ref: `#/components/schemas/${decorators.request.type?.toString()}`,
          },
        },
      },
    };
  }

  getResponse(
    decorators: Record<string, DecoratorMetadata> | undefined
  ): ResponsesObject | undefined {
    if (
      decorators?.content === undefined ||
      decorators?.response === undefined
    ) {
      return {};
    }

    const responseCode: number | 'default' =
      decorators?.response?.responseCode ?? 'default';

    return {
      [responseCode]: {
        description: decorators?.response?.comment,
        content: {
          [decorators.content.comment]: {
            schema: {
              $ref: `#/components/schemas/${decorators.response.type?.toString()}`,
            },
          },
        },
      },
    };
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
    const type = property.decorators.type;
    const format = property.decorators.format;

    if (type?.type === undefined) {
      return undefined;
    }

    return {
      type: this.convertToType(type.type.toString()),
      format: format?.comment?.toString(),
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
