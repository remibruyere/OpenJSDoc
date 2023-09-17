import * as ts from 'typescript';
import * as fs from 'fs';
import { type ClassMetadata } from './parser/class/types/classMetadata';
import { parseClass } from './parser/class/class';

export function extractClassMetadata(code: string): ClassMetadata[] {
  const ast = ts.createSourceFile(
    'fixtures/classMetadata.ts',
    code,
    ts.ScriptTarget.Latest,
    true
  );
  const classMetadata: ClassMetadata[] = [];

  function visit(node: ts.Node): void {
    if (ts.isClassDeclaration(node)) {
      classMetadata.push(parseClass(node));
    }
    ts.forEachChild(node, visit);
  }

  visit(ast);
  return classMetadata;
}

function test(): void {
  const code = fs.readFileSync('fixtures/classMetadata.ts');
  const classMetadata = extractClassMetadata(code.toString());
  console.log(JSON.stringify(classMetadata, null, 2));
}

test();
