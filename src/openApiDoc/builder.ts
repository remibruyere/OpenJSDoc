import { OpenApiBuilder, type OpenAPIObject } from 'openapi3-ts/oas31';
import { type GlobalMetadata } from '../ast/types/global-metadata';
import { type PathConfiguration } from '../ast/types/path-configuration';
import { OpenApiDocComponentBuilder } from './component-builder';
import { OpenApiDocPathBuilder } from './path-builder';
import type { RouterConfiguration } from '../plugins/cbs/types/router-configuration';

export class OpenApiDocBuilder {
  openApiBuilder: OpenApiBuilder;
  private readonly openApiComponentBuilder: OpenApiDocComponentBuilder;
  private readonly openApiDocPathBuilder: OpenApiDocPathBuilder;

  constructor(doc?: OpenAPIObject) {
    this.openApiBuilder = OpenApiBuilder.create(
      doc ?? {
        openapi: '3.1.0',
        info: {
          title: 'Default title',
          version: '1.0.0',
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
    this.openApiComponentBuilder = new OpenApiDocComponentBuilder(
      this.openApiBuilder
    );
    this.openApiDocPathBuilder = new OpenApiDocPathBuilder(this.openApiBuilder);
  }

  getAsJson(): string {
    return this.openApiBuilder.getSpecAsJson(undefined, 2);
  }

  getAsYaml(): string {
    return this.openApiBuilder.getSpecAsYaml();
  }

  addComponentConfiguration(globalMetadata: GlobalMetadata): this {
    globalMetadata.classMetadata.forEach((metadata) => {
      this.openApiComponentBuilder.addComponent(metadata);
    });

    globalMetadata.interfaceMetadata.forEach((metadata) => {
      this.openApiComponentBuilder.addComponent(metadata);
    });

    return this;
  }

  addEndpointConfiguration(
    entryPointFunction: string,
    pathConfiguration: PathConfiguration,
    globalMetadata: GlobalMetadata
  ): this {
    this.openApiDocPathBuilder.addPath({
      entryPointFunction,
      pathConfiguration,
      globalMetadata,
    });

    return this;
  }
}
