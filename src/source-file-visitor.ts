import ts from 'typescript';
import { parseClass } from './parser/class/class';
import { parseFunction } from './parser/function/function';
import { InterfaceParser } from './parser/interface/interface';
import { parseArrowFunction } from './parser/function/arrow-function';
import type { GlobalMetadata } from './types/globalMetadata';
import { parseTypeAlias } from './parser/typeAlias/typeAlias';

export class SourceFileVisitor {
  interfaceParse: InterfaceParser;
  globalMetadata: GlobalMetadata = {
    functionMetadata: [],
    classMetadata: [],
    interfaceMetadata: [],
  };

  constructor(
    private readonly program: ts.Program,
    private readonly checker: ts.TypeChecker
  ) {
    this.interfaceParse = new InterfaceParser(this.program, this.checker);
  }

  visit(node: ts.Node): void {
    if (ts.isClassDeclaration(node)) {
      this.globalMetadata.classMetadata.push(parseClass(node));
    } else if (ts.isFunctionDeclaration(node)) {
      const functionMetadata = parseFunction(node);
      if (functionMetadata !== undefined) {
        this.globalMetadata.functionMetadata.push(functionMetadata);
      }
    } else if (ts.isInterfaceDeclaration(node)) {
      this.globalMetadata.interfaceMetadata.push(
        this.interfaceParse.parseInterface(node)
      );
    } else if (ts.isTypeAliasDeclaration(node)) {
      this.globalMetadata.interfaceMetadata.push(parseTypeAlias(node));
    } else if (ts.isArrowFunction(node)) {
      const functionMetadata = parseArrowFunction(node);
      if (functionMetadata !== undefined) {
        this.globalMetadata.functionMetadata.push(functionMetadata);
      }
    }
    ts.forEachChild(node, (node) => {
      this.visit(node);
    });
  }
}
