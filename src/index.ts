import ts from 'typescript';
import fs from 'fs';
import { type GlobalMetadata } from './types/globalMetadata';
import { parseClass } from './parser/class/class';
import { parseFunction } from './parser/function/function';
import { parseInterface } from './parser/interface/interface';

export function extractGlobalMetadata(code: string): GlobalMetadata {
  const ast = ts.createSourceFile(
    'fixtures/function.ts',
    code,
    ts.ScriptTarget.Latest,
    true
  );
  const globalMetadata: GlobalMetadata = [];

  const visit = (node: ts.Node): void => {
    if (ts.isClassDeclaration(node)) {
      globalMetadata.push(parseClass(node));
    } else if (ts.isFunctionDeclaration(node)) {
      globalMetadata.push(parseFunction(node));
    } else if (ts.isInterfaceDeclaration(node)) {
      globalMetadata.push(parseInterface(node));
    }
    ts.forEachChild(node, visit);
  };

  visit(ast);
  return globalMetadata;
}

function test(): void {
  const code = fs.readFileSync('fixtures/function.ts');
  const classMetadata = extractGlobalMetadata(code.toString());
  console.log(JSON.stringify(classMetadata, null, 2));
}

test();
