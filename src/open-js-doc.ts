import ts from 'typescript';
import { StaticLanguageServiceHost } from './ast/lib/ts/staticLanguageServiceHost';
import { SourceFileVisitor } from './source-file-visitor';
import { type GlobalMetadata } from './ast/types/global-metadata';
import { RouterVisitor } from './plugins/cbs/router-visitor';
import { type RouterConfiguration } from './plugins/cbs/types/router-configuration';
import fs from 'fs';
import type { OpenAPIObject } from 'openapi3-ts/oas31';

export interface IServerConfiguration {
  serverFile: string;
  openapiDoc: OpenAPIObject;
  output: {
    json: string | undefined;
    yaml: string | undefined;
  };
}

export interface IConfiguration {
  projectPath: string;
  serverConfigurations: IServerConfiguration[];
}

export class OpenJsDoc {
  private readonly configuration: IConfiguration;
  private readonly service: ts.LanguageService;
  private readonly program: ts.Program;
  private readonly checker: ts.TypeChecker;
  private readonly visitor: SourceFileVisitor;
  private readonly serverRouterVisitor: Map<string, RouterVisitor>;

  constructor(readonly configurationFilePath: string) {
    this.configuration = this.getConfiguration(configurationFilePath);
    this.service = ts.createLanguageService(
      new StaticLanguageServiceHost(this.configuration.projectPath)
    );
    const program = this.service.getProgram();
    if (program === undefined) {
      throw new Error('❌ Project is not initialized');
    }
    this.program = program;
    this.checker = this.program.getTypeChecker();

    this.visitor = new SourceFileVisitor(this.program, this.checker);
    this.serverRouterVisitor = this.getServerConfigurations().reduce(
      (previousValue, currentValue) => {
        return previousValue.set(
          currentValue.serverFile,
          new RouterVisitor(currentValue.serverFile)
        );
      },
      new Map<string, RouterVisitor>()
    );
  }

  getConfiguration(configurationFilePath: string): IConfiguration {
    if (!fs.existsSync(configurationFilePath)) {
      console.error(
        `❌ Could not find ${configurationFilePath} configuration file`
      );
      process.exit(1);
    }

    const configuration: IConfiguration = JSON.parse(
      fs.readFileSync(configurationFilePath, 'utf-8')
    );

    return {
      projectPath: configuration.projectPath ?? './tsconfig.json',
      serverConfigurations: configuration.serverConfigurations,
    };
  }

  computeProject(): void {
    const serverRouterVisitors = this.serverRouterVisitor.values();
    for (const file of this.program.getSourceFiles()) {
      if (
        !file.isDeclarationFile &&
        !this.program.isSourceFileFromExternalLibrary(file)
      ) {
        ts.forEachChild(file, (node) => {
          this.visitor.visit(node);
          for (const visitor of serverRouterVisitors) {
            if (visitor.isRouterSourceFile(file.fileName)) {
              visitor.visit(node);
            }
          }
        });
      }
    }
  }

  getSourceFilesMetadata(): GlobalMetadata {
    return this.visitor.globalMetadata;
  }

  getServerRouterConfigurationList(
    serverFile: string
  ): RouterConfiguration[] | undefined {
    return this.serverRouterVisitor.get(serverFile)?.routerConfigurationList;
  }

  getServerConfigurations(): IServerConfiguration[] {
    return this.configuration.serverConfigurations;
  }
}
