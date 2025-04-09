import {
  type OpenApiBuilder,
  type RequestBodyObject,
  type ResponsesObject,
} from 'openapi3-ts/oas31';
import { type GlobalMetadata } from '../ast/types/global-metadata';
import { type PathConfiguration } from '../ast/types/path-configuration';
import type { DecoratorMetadata } from '../ast/types/decorator-metadata';

export class OpenApiDocPathBuilder {
  openApiBuilder: OpenApiBuilder;

  constructor(openApiBuilder: OpenApiBuilder) {
    this.openApiBuilder = openApiBuilder;
  }

  addPath({
    entryPointFunction,
    pathConfiguration,
    globalMetadata,
  }: {
    entryPointFunction: string;
    pathConfiguration: PathConfiguration;
    globalMetadata: GlobalMetadata;
  }): void {
    const entryPointMetadata = globalMetadata.functionMetadata.find(
      (value) => value.name === entryPointFunction
    );

    this.openApiBuilder.addPath(pathConfiguration.path, {
      summary: pathConfiguration.summary,
      description: pathConfiguration.description,
      [pathConfiguration.method]: {
        tags: [
          pathConfiguration.tagName,
          entryPointMetadata?.decorators.tagName.comment,
        ],
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
}
