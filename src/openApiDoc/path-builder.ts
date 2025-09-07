import {
  type OpenApiBuilder,
  type ParameterObject,
  type ReferenceObject,
  type RequestBodyObject,
  type ResponsesObject,
  type SchemaObject,
} from 'openapi3-ts/oas31';
import type { DecoratorMetadata } from '../ast/types/decorator-metadata';
import { type GlobalMetadata } from '../ast/types/global-metadata';
import { type NamedType, type ObjectProperty } from '../ast/types/node-types';
import { type PathConfiguration } from '../ast/types/path-configuration';
import { type OpenApiDocComponentBuilder } from './component-builder';
import { OpenApiDocComponentNodeTypeBuilder } from './component-node-type-builder';

export class OpenApiDocPathBuilder {
  openApiBuilder: OpenApiBuilder;
  openApiDocComponentBuilder: OpenApiDocComponentBuilder;

  constructor(
    openApiBuilder: OpenApiBuilder,
    openApiDocComponentBuilder: OpenApiDocComponentBuilder,
  ) {
    this.openApiBuilder = openApiBuilder;
    this.openApiDocComponentBuilder = openApiDocComponentBuilder;
  }

  addPath({
    entryPointFunction,
    pathConfiguration,
    globalMetadata,
  }: {
    entryPointFunction: string;
    pathConfiguration: PathConfiguration;
    globalMetadata: GlobalMetadata;
  }): {
    typeNameUsed: string[];
  } {
    const entryPointMetadata = globalMetadata.functionMetadata.find(
      (value) => value.name === entryPointFunction,
    );

    const tags = [pathConfiguration.tagName];

    if (entryPointMetadata?.decorators?.tagName?.comment != null) {
      tags.push(entryPointMetadata?.decorators?.tagName?.comment);
    }

    const contentByLocation = this.getRequestContentByLocation(
      entryPointMetadata?.decorators,
      globalMetadata,
    );

    // if (contentByLocation === undefined) {
    //   console.log(entryPointFunction);
    //   console.log(pathConfiguration);
    //   console.log(globalMetadata);
    //   throw new Error(
    //     `Not request type found for entry point ${entryPointFunction}`
    //   );
    // }

    const { request, typeNameUsed: typeNameRequestUsed } =
      this.getContentRequest(
        entryPointMetadata?.decorators,
        contentByLocation?.body ?? [],
      );

    const { responses, typeNameUsed: typeNameResponseUsed } = this.getResponse(
      entryPointMetadata?.decorators,
    );

    this.openApiBuilder.addPath(pathConfiguration.path, {
      summary: pathConfiguration.summary,
      description: pathConfiguration.description,
      [pathConfiguration.method]: {
        tags,
        description: entryPointMetadata?.comment,
        parameters: [
          ...this.getParameters(contentByLocation?.query ?? []),
          ...this.getParameters(contentByLocation?.headers ?? []),
          ...this.getParameters(contentByLocation?.path ?? []),
        ],
        requestBody: request,
        responses: {
          ...responses,
        },
      },
    });

    return {
      typeNameUsed: [...typeNameRequestUsed, ...typeNameResponseUsed],
    };
  }

  getParameters(queryArray: NamedType[]): ParameterObject[] {
    return queryArray
      .filter((query) => query.type === 'object')
      .flatMap((query): ParameterObject[] | undefined =>
        Object.entries(query.properties).map(
          (prop) =>
            ({
              name: prop[0],
              in: 'query',
              schema:
                OpenApiDocComponentNodeTypeBuilder.convertNodeTypeToSchemaObject(
                  prop[1].node,
                ),
              required: prop[1].required,
            }) satisfies ParameterObject,
        ),
      )
      .filter(Boolean) as ParameterObject[];
  }

  splitRequestContentByLocation(
    globalMetadata: GlobalMetadata,
    typeName: string,
  ):
    | {
        name: string;
        body: ObjectProperty | undefined;
        headers: ObjectProperty | undefined;
        path: ObjectProperty | undefined;
        query: ObjectProperty | undefined;
      }
    | undefined {
    // We will only take the first found, it can cause problem on multiple
    // definition with same name but ignored for the moment
    const matchComponents = this.openApiDocComponentBuilder.findComponent(
      globalMetadata,
      typeName,
    )[0];

    if (matchComponents === undefined) {
      return;
    }

    if (matchComponents.type !== 'object') {
      throw new Error(
        `Request type ${typeName} is not an object. You need to provide an object as input request handler to use this lib`,
      );
    }

    return {
      name: matchComponents.name,
      body: Object.entries(matchComponents.properties).filter(
        (prop) => prop[0] === 'body',
      )[0]?.[1],
      headers: Object.entries(matchComponents.properties).filter(
        (prop) => prop[0] === 'headers',
      )[0]?.[1],
      path: Object.entries(matchComponents.properties).filter(
        (prop) => prop[0] === 'pathParameters',
      )[0]?.[1],
      query: Object.entries(matchComponents.properties).filter(
        (prop) => prop[0] === 'queryStringParameters',
      )[0]?.[1],
    };
  }

  getRequestContentByLocation(
    decorators: Record<string, DecoratorMetadata> | undefined,
    globalMetadata: GlobalMetadata,
  ):
    | {
        body: NamedType[];
        headers: NamedType[];
        path: NamedType[];
        query: NamedType[];
      }
    | undefined {
    if (decorators?.request === undefined) {
      return undefined;
    }

    const requestType = decorators.request.type?.toString();

    const requestTypeSplit = requestType
      ?.split('|')
      .map((value) => value.trim());

    if (requestTypeSplit === undefined) {
      return undefined;
    }

    const contentByLocationArray: {
      body: NamedType[];
      headers: NamedType[];
      path: NamedType[];
      query: NamedType[];
    } = {
      body: [],
      headers: [],
      path: [],
      query: [],
    };
    for (const requestTypeSplitElement of requestTypeSplit) {
      const contentByLocation = this.splitRequestContentByLocation(
        globalMetadata,
        requestTypeSplitElement,
      );
      if (contentByLocation === undefined) {
        continue;
      }

      if (contentByLocation.body !== undefined) {
        const body: NamedType = {
          ...contentByLocation.body?.node,
          name: `${contentByLocation.name}Body`,
        };

        contentByLocationArray.body.push(body);
        this.openApiDocComponentBuilder.addComponent({
          ...contentByLocation.body.node,
          name: `${contentByLocation.name}Body`,
        });
      }

      if (contentByLocation.headers !== undefined) {
        const headers: NamedType = {
          ...contentByLocation.headers?.node,
          name: `${contentByLocation.name}Headers`,
        };

        contentByLocationArray.headers.push(headers);
        this.openApiDocComponentBuilder.addComponent({
          ...contentByLocation.headers.node,
          name: `${contentByLocation.name}Headers`,
        });
      }

      if (contentByLocation.path !== undefined) {
        const path: NamedType = {
          ...contentByLocation.path?.node,
          name: `${contentByLocation.name}Path`,
        };

        contentByLocationArray.path.push(path);
        this.openApiDocComponentBuilder.addComponent({
          ...contentByLocation.path.node,
          name: `${contentByLocation.name}Path`,
        });
      }

      if (contentByLocation.query !== undefined) {
        const query: NamedType = {
          ...contentByLocation.query?.node,
          name: `${contentByLocation.name}Query`,
        };

        contentByLocationArray.query.push(query);
        this.openApiDocComponentBuilder.addComponent({
          ...contentByLocation.query.node,
          name: `${contentByLocation.name}Query`,
        });
      }
    }

    return contentByLocationArray;
  }

  getContentRequest(
    decorators: Record<string, DecoratorMetadata> | undefined,
    bodyArray: NamedType[],
  ): {
    request: RequestBodyObject | undefined;
    typeNameUsed: string[];
  } {
    let schema: ReferenceObject | SchemaObject;

    if (bodyArray.length === 0) {
      return {
        request: {
          description: decorators?.request?.comment,
          content: {},
        },
        typeNameUsed: [],
      };
    }
    if (bodyArray.length === 1) {
      schema = {
        $ref: `#/components/schemas/${bodyArray[0].name}`,
        description: bodyArray[0].comment,
      };
    } else {
      schema = {
        anyOf: bodyArray.map((body) => ({
          $ref: `#/components/schemas/${body.name}`,
          description: body.comment,
        })),
      };
    }

    return {
      request: {
        description: decorators?.request?.comment,
        content: {
          [decorators?.content?.comment ?? 'application/json']: {
            schema,
          },
        },
      },
      typeNameUsed: [
        ...bodyArray
          .map((body) => body.name)
          .filter(
            (value) =>
              !['undefined', 'void', 'string', 'number', 'boolean'].includes(
                value,
              ),
          ),
      ],
    };
  }

  getResponse(decorators: Record<string, DecoratorMetadata> | undefined): {
    responses: ResponsesObject | undefined;
    typeNameUsed: string[];
  } {
    if (
      decorators?.content === undefined ||
      decorators?.response === undefined
    ) {
      return {
        responses: undefined,
        typeNameUsed: [],
      };
    }

    const responseCode: number | 'default' =
      decorators?.response?.responseCode ?? 'default';

    const responseType = decorators.response.type?.toString();

    const responseTypeSplit = responseType
      ?.split('|')
      .map((value) => value.trim());

    const responseTypeSplitWithoutNative = (responseTypeSplit ?? []).filter(
      (value) =>
        !['undefined', 'void', 'string', 'number', 'boolean'].includes(value),
    );

    const schema: SchemaObject | ReferenceObject =
      responseTypeSplitWithoutNative.length > 1
        ? {
            anyOf: responseTypeSplitWithoutNative.map((value) => ({
              $ref: `#/components/schemas/${value}`,
            })),
          }
        : responseTypeSplitWithoutNative.length === 1
          ? {
              $ref: `#/components/schemas/${responseTypeSplitWithoutNative[0]}`,
            }
          : {};

    return {
      responses: {
        [responseCode]: {
          description: decorators?.response?.comment,
          content: {
            [decorators.content.comment]: {
              schema,
            },
          },
        },
      },
      typeNameUsed: [
        ...(responseTypeSplit ?? []).filter(
          (value) =>
            !['undefined', 'void', 'string', 'number', 'boolean'].includes(
              value,
            ),
        ),
      ],
    };
  }
}
