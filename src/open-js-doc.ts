import ts from 'typescript';
import { StaticLanguageServiceHost } from './lib/ts/staticLanguageServiceHost';
import { SourceFileVisitor } from './source-file-visitor';
import { type GlobalMetadata } from './types/globalMetadata';

export class OpenJsDoc {
  service: ts.LanguageService;
  program: ts.Program;
  checker: ts.TypeChecker;
  visitor: SourceFileVisitor;

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
  }

  computeProject(): void {
    for (const file of this.program.getSourceFiles()) {
      if (!file.isDeclarationFile) {
        ts.forEachChild(file, (node) => {
          this.visitor.visit(node);
        });
      }
    }
  }

  getSourceFilesMetadata(): GlobalMetadata {
    return this.visitor.globalMetadata;
  }
}
