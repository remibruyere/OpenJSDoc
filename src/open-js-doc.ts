import ts from 'typescript';
import { StaticLanguageServiceHost } from './ast/lib/ts/staticLanguageServiceHost';
import { SourceFileVisitor } from './source-file-visitor';
import { type GlobalMetadata } from './ast/types/global-metadata';
import { RouterVisitor } from './plugins/cbs/router-visitor';
import { type RouterConfiguration } from './plugins/cbs/types/router-configuration';

export class OpenJsDoc {
  private readonly service: ts.LanguageService;
  private readonly program: ts.Program;
  private readonly checker: ts.TypeChecker;
  private readonly visitor: SourceFileVisitor;
  private readonly routerVisitor: RouterVisitor;

  constructor(private readonly projectFolder: string) {
    this.service = ts.createLanguageService(
      new StaticLanguageServiceHost(this.projectFolder)
    );
    const program = this.service.getProgram();
    if (program === undefined) {
      throw new Error('Project is not initialized');
    }
    this.program = program;
    this.checker = this.program.getTypeChecker();

    this.visitor = new SourceFileVisitor(this.program, this.checker);
    this.routerVisitor = new RouterVisitor(this.program, this.checker);
  }

  computeProject(): void {
    for (const file of this.program.getSourceFiles()) {
      if (
        !file.isDeclarationFile &&
        !this.program.isSourceFileFromExternalLibrary(file)
      ) {
        ts.forEachChild(file, (node) => {
          this.visitor.visit(node);
          if (this.routerVisitor.isRouterSourceFile(file.fileName)) {
            this.routerVisitor.visit(node);
          }
        });
      }
    }
  }

  getSourceFilesMetadata(): GlobalMetadata {
    return this.visitor.globalMetadata;
  }

  getRouterConfigurationList(): RouterConfiguration[] {
    return this.routerVisitor.routerConfigurationList;
  }
}
