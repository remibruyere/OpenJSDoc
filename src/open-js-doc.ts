import fs from 'fs';
import type { OpenAPIObject } from 'openapi3-ts/oas31';
import ts from 'typescript';
import { StaticLanguageServiceHost } from './ast/lib/ts/staticLanguageServiceHost';
import { type GlobalMetadata } from './ast/types/global-metadata';
import { RouterVisitor } from './plugins/cbs/router-visitor';
import { type RouterConfiguration } from './plugins/cbs/types/router-configuration';
import { SourceFileVisitor } from './source-file-visitor';

export interface IServerConfiguration {
  serverBasePath: string;
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
      new StaticLanguageServiceHost(this.configuration.projectPath),
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
          currentValue.serverBasePath,
          new RouterVisitor(currentValue.serverBasePath),
        );
      },
      new Map<string, RouterVisitor>(),
    );
  }

  getConfiguration(configurationFilePath: string): IConfiguration {
    if (!fs.existsSync(configurationFilePath)) {
      console.error(
        `❌ Could not find ${configurationFilePath} configuration file`,
      );
      process.exit(1);
    }

    const configuration: IConfiguration = JSON.parse(
      fs.readFileSync(configurationFilePath, 'utf-8'),
    );

    return {
      projectPath: configuration.projectPath ?? './tsconfig.json',
      serverConfigurations: configuration.serverConfigurations,
    };
  }

  computeProject(): void {
    let fileNumber = 0;
    let usedFileNumber = 0;
    const perfStartAll = performance.now();
    for (const file of this.program.getSourceFiles()) {
      fileNumber++;
      if (
        !file.isDeclarationFile &&
        !this.program.isSourceFileFromExternalLibrary(file)
      ) {
        usedFileNumber++;
        ts.forEachChild(file, (node) => {
          this.visitor.visit(node);
          for (const visitor of this.serverRouterVisitor.values()) {
            if (visitor.isRouterSourceFile(file.fileName)) {
              visitor.visit(node);
            }
          }
        });
      }
    }
    const perfEndAll = performance.now();
    console.info(
      `⏱️ Checked ${fileNumber} files. ${usedFileNumber} files used. Parsed in ${Math.round(perfEndAll - perfStartAll)}ms`,
    );
  }

  getSourceFilesMetadata(): GlobalMetadata {
    return this.visitor.globalMetadata;
  }

  getServerRouterConfigurationList(
    serverFile: string,
  ): RouterConfiguration[] | undefined {
    return this.serverRouterVisitor.get(serverFile)?.routerConfigurationList;
  }

  getServerConfigurations(): IServerConfiguration[] {
    return this.configuration.serverConfigurations;
  }
}
