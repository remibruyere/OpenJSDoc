import {
  type OpenApiBuilder,
  type ParameterObject,
  type RequestBodyObject,
  type ResponsesObject,
  type SchemaObject,
} from 'openapi3-ts/oas31';
import { type GlobalMetadata } from '../ast/types/global-metadata';
import { type PathConfiguration } from '../ast/types/path-configuration';
import type { DecoratorMetadata } from '../ast/types/decorator-metadata';
import { type OpenApiDocComponentBuilder } from './component-builder';
import { type ClassPropertyMetadata } from '../ast/parser/class/types/classPropertyMetadata';
import { type InterfacePropertyMetadata } from '../ast/parser/interface/types/interfacePropertyMetadata';
import { type ReferenceObject } from 'openapi3-ts/src/model/openapi31';
import { type ITypeMetadata } from '../ast/types/type-metadata.interface';

export class OpenApiDocPathBuilder {
  openApiBuilder: OpenApiBuilder;
  openApiDocComponentBuilder: OpenApiDocComponentBuilder;

  constructor(
    openApiBuilder: OpenApiBuilder,
    openApiDocComponentBuilder: OpenApiDocComponentBuilder
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
      (value) => value.name === entryPointFunction
    );

    const tags = [pathConfiguration.tagName];

    if (entryPointMetadata?.decorators?.tagName?.comment != null) {
      tags.push(entryPointMetadata?.decorators?.tagName?.comment);
    }

    const contentByLocation = this.getRequestContentByLocation(
      entryPointMetadata?.decorators,
      globalMetadata
    );

    if (contentByLocation === undefined) {
      throw new Error(
        `Not request type found for entry point ${entryPointFunction}`
      );
    }

    const { request, typeNameUsed: typeNameRequestUsed } =
      this.getContentRequest(
        entryPointMetadata?.decorators,
        contentByLocation.body
      );

    const { responses, typeNameUsed: typeNameResponseUsed } = this.getResponse(
      entryPointMetadata?.decorators
    );

    this.openApiBuilder.addPath(pathConfiguration.path, {
      summary: pathConfiguration.summary,
      description: pathConfiguration.description,
      [pathConfiguration.method]: {
        tags,
        description: entryPointMetadata?.comment,
        parameters: [
          ...this.getParameters(contentByLocation.query),
          ...this.getParameters(contentByLocation.headers),
          ...this.getParameters(contentByLocation.path),
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

  getParameters(
    queryArray: Array<ClassPropertyMetadata | InterfacePropertyMetadata>
  ): ParameterObject[] {
    return queryArray
      .filter((query) => query.typeMetadata.subType !== undefined)
      .flatMap((query): ParameterObject[] | undefined =>
        query.typeMetadata.subType?.flatMap(
          (subType) =>
            ({
              name: (subType as ITypeMetadata).name,
              in: 'query',
              schema: {
                type: 'string',
              },
            }) satisfies ParameterObject
        )
      )
      .filter(Boolean) as ParameterObject[];
  }

  splitRequestContentByLocation(
    globalMetadata: GlobalMetadata,
    typeName: string
  ):
    | {
        name: string;
        body: ClassPropertyMetadata | InterfacePropertyMetadata;
        headers: ClassPropertyMetadata | InterfacePropertyMetadata;
        path: ClassPropertyMetadata | InterfacePropertyMetadata;
        query: ClassPropertyMetadata | InterfacePropertyMetadata;
      }
    | undefined {
    // We will only take the first found, it can cause problem on multiple
    // definition with same name but ignored for the moment
    const matchComponents = this.openApiDocComponentBuilder.findComponent(
      globalMetadata,
      typeName
    )[0];

    if (matchComponents === undefined) {
      return;
    }

    return {
      name: matchComponents.name,
      body: matchComponents.properties.filter(
        (prop) => prop.name === 'body'
      )[0],
      headers: matchComponents.properties.filter(
        (prop) => prop.name === 'headers'
      )[0],
      path: matchComponents.properties.filter(
        (prop) => prop.name === 'pathParameters'
      )[0],
      query: matchComponents.properties.filter(
        (prop) => prop.name === 'queryStringParameters'
      )[0],
    };
  }

  getRequestContentByLocation(
    decorators: Record<string, DecoratorMetadata> | undefined,
    globalMetadata: GlobalMetadata
  ):
    | {
        body: Array<ClassPropertyMetadata | InterfacePropertyMetadata>;
        headers: Array<ClassPropertyMetadata | InterfacePropertyMetadata>;
        path: Array<ClassPropertyMetadata | InterfacePropertyMetadata>;
        query: Array<ClassPropertyMetadata | InterfacePropertyMetadata>;
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
      body: Array<ClassPropertyMetadata | InterfacePropertyMetadata>;
      headers: Array<ClassPropertyMetadata | InterfacePropertyMetadata>;
      path: Array<ClassPropertyMetadata | InterfacePropertyMetadata>;
      query: Array<ClassPropertyMetadata | InterfacePropertyMetadata>;
    } = {
      body: [],
      headers: [],
      path: [],
      query: [],
    };
    for (const requestTypeSplitElement of requestTypeSplit) {
      const contentByLocation = this.splitRequestContentByLocation(
        globalMetadata,
        requestTypeSplitElement
      );
      if (contentByLocation !== undefined) {
        const body: ClassPropertyMetadata | InterfacePropertyMetadata = {
          ...contentByLocation.body,
          name: `${contentByLocation.name}Body`,
        };
        contentByLocationArray.body.push(body);
        this.openApiDocComponentBuilder.addTypeMetadata(
          body.typeMetadata,
          body.comment
        );

        const headers: ClassPropertyMetadata | InterfacePropertyMetadata = {
          ...contentByLocation.headers,
          name: `${contentByLocation.name}Headers`,
        };
        contentByLocationArray.headers.push(headers);

        const path: ClassPropertyMetadata | InterfacePropertyMetadata = {
          ...contentByLocation.path,
          name: `${contentByLocation.name}Path`,
        };
        contentByLocationArray.path.push(path);

        const query: ClassPropertyMetadata | InterfacePropertyMetadata = {
          ...contentByLocation.query,
          name: `${contentByLocation.name}Query`,
        };
        contentByLocationArray.query.push(query);
      }
    }

    return contentByLocationArray;
  }

  getContentRequest(
    decorators: Record<string, DecoratorMetadata> | undefined,
    bodyArray: Array<ClassPropertyMetadata | InterfacePropertyMetadata>
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
    } else if (bodyArray.length === 1) {
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
                value
              )
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

    return {
      responses: {
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
      },
      typeNameUsed: [
        ...(responseTypeSplit ?? []).filter(
          (value) =>
            !['undefined', 'void', 'string', 'number', 'boolean'].includes(
              value
            )
        ),
      ],
    };
  }
}
