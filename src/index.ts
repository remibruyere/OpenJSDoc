import ts from 'typescript';
import fs from 'fs';
import { type GlobalMetadata } from './types/globalMetadata';
import { parseClass } from './parser/class/class';
import { parseFunction } from './parser/function/function';
import { parseInterface } from './parser/interface/interface';
import { OpenApiDocBuilder } from './openApiDoc/builder';
import { type PathConfiguration } from './types/pathConfiguration';

export function extractGlobalMetadata(code: string): GlobalMetadata {
  const ast = ts.createSourceFile(
    'fixtures/function.ts',
    code,
    ts.ScriptTarget.Latest,
    true
  );
  const globalMetadata: GlobalMetadata = {
    functionMetadata: [],
    classMetadata: [],
    interfaceMetadata: [],
  };

  const visit = (node: ts.Node): void => {
    if (ts.isClassDeclaration(node)) {
      globalMetadata.classMetadata.push(parseClass(node));
    } else if (ts.isFunctionDeclaration(node)) {
      globalMetadata.functionMetadata.push(parseFunction(node));
    } else if (ts.isInterfaceDeclaration(node)) {
      globalMetadata.interfaceMetadata.push(parseInterface(node));
    }
    ts.forEachChild(node, visit);
  };

  visit(ast);
  return globalMetadata;
}

function test(): void {
  const code = fs.readFileSync('fixtures/function.ts');
  const handlerFunctionName = 'handler';
  const pathConfiguration: PathConfiguration = {
    path: '/test',
    method: 'get',
    summary: 'A test example',
    description: 'Test to see if all is working',
  };
  const globalMetadata = extractGlobalMetadata(code.toString());
  console.log(JSON.stringify(globalMetadata, null, 2));
  const openApiDocBuilder = new OpenApiDocBuilder();
  openApiDocBuilder.addEndpointConfiguration(
    handlerFunctionName,
    pathConfiguration,
    globalMetadata
  );
  fs.writeFileSync('output/openapi.json', openApiDocBuilder.getAsJson(), {});
  fs.writeFileSync('output/openapi.yaml', openApiDocBuilder.getAsXml(), {});
}

test();
