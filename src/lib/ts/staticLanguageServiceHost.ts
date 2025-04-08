import ts from 'typescript';
import path from 'path';

export class StaticLanguageServiceHost implements ts.LanguageServiceHost {
  private readonly _cmdLine: ts.ParsedCommandLine;
  private readonly _scriptSnapshots = new Map<string, ts.IScriptSnapshot>();

  constructor(readonly projectPath: string) {
    const existingOptions: Partial<ts.CompilerOptions> = {};
    const parsed = ts.readConfigFile(projectPath, ts.sys.readFile);
    if (parsed.error !== undefined) {
      throw new Error(JSON.stringify(parsed.error));
    }
    this._cmdLine = ts.parseJsonConfigFileContent(
      parsed.config,
      ts.sys,
      path.dirname(projectPath),
      existingOptions
    );
    if (this._cmdLine.errors.length > 0) {
      throw new Error(JSON.stringify(parsed.error));
    }
  }

  getCompilationSettings(): ts.CompilerOptions {
    return this._cmdLine.options;
  }

  getScriptFileNames(): string[] {
    return this._cmdLine.fileNames;
  }

  getScriptVersion(_fileName: string): string {
    return '1';
  }

  getProjectVersion(): string {
    return '1';
  }

  getScriptSnapshot(fileName: string): ts.IScriptSnapshot | undefined {
    let result: ts.IScriptSnapshot | undefined =
      this._scriptSnapshots.get(fileName);
    if (result === undefined) {
      const content = ts.sys.readFile(fileName);
      if (content === undefined) {
        return undefined;
      }
      result = ts.ScriptSnapshot.fromString(content);
      this._scriptSnapshots.set(fileName, result);
    }
    return result;
  }

  getCurrentDirectory(): string {
    return path.dirname(this.projectPath);
  }

  getDefaultLibFileName(options: ts.CompilerOptions): string {
    return ts.getDefaultLibFilePath(options);
  }

  // eslint-disable-next-line @typescript-eslint/unbound-method
  directoryExists = ts.sys.directoryExists;
  getDirectories = ts.sys.getDirectories;
  fileExists = ts.sys.fileExists;
  readFile = ts.sys.readFile;
  readDirectory = ts.sys.readDirectory;
  // this is necessary to make source references work.
  realpath = ts.sys.realpath;
}
