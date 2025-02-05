import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import { type GlobalMetadata } from './types/globalMetadata';
import { parseClass } from './parser/class/class';
import { parseFunction } from './parser/function/function';
import { parseInterface } from './parser/interface/interface';
import { OpenApiDocBuilder } from './openApiDoc/builder';
import { type PathConfiguration } from './types/pathConfiguration';

export { LambdaDocumentationBuilderAspect } from './aws/cdk/aspects/lambda-documentation-builder.aspect';

const visitedFiles = new Set<string>();

function resolveImportPath(
  currentFilePath: string,
  importPath: string
): string | null {
  const dir = path.dirname(currentFilePath);
  const fullPath = path.resolve(dir, importPath);

  // Handle relative imports
  if (fs.existsSync(fullPath + '.ts')) {
    return fullPath + '.ts';
  }
  if (fs.existsSync(fullPath + '.tsx')) {
    return fullPath + '.tsx';
  }
  if (fs.existsSync(fullPath + '/index.ts')) {
    return fullPath + '/index.ts';
  }
  if (fs.existsSync(fullPath + '/index.tsx')) {
    return fullPath + '/index.tsx';
  }

  // Handle node_modules imports (simplified, you might need more logic here)
  const nodeModulesPath = path.resolve(dir, 'node_modules', importPath);
  if (fs.existsSync(nodeModulesPath + '.ts')) {
    return nodeModulesPath + '.ts';
  }
  if (fs.existsSync(nodeModulesPath + '.tsx')) {
    return nodeModulesPath + '.tsx';
  }

  return null;
}

function extractFile(filePath: string, globalMetadata: GlobalMetadata): void {
  if (visitedFiles.has(filePath)) {
    return;
  }
  visitedFiles.add(filePath);

  // console.log(`* Explore - ${filePath}`);

  const sourceCode = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  );

  ts.forEachChild(sourceFile, (node) => {
    if (ts.isClassDeclaration(node)) {
      globalMetadata.classMetadata.push(parseClass(node));
    } else if (ts.isFunctionDeclaration(node)) {
      globalMetadata.functionMetadata.push(parseFunction(node));
    } else if (ts.isInterfaceDeclaration(node)) {
      globalMetadata.interfaceMetadata.push(parseInterface(node));
    } else if (ts.isImportDeclaration(node)) {
      const importPath = node.moduleSpecifier
        .getText(sourceFile)
        .replace(/['"]/g, '');
      const resolvedImportPath = resolveImportPath(filePath, importPath);
      if (resolvedImportPath !== null) {
        extractFile(resolvedImportPath, globalMetadata);
      }
    }
  });
}

function extractGlobalMetadata(filePath: string): GlobalMetadata {
  const globalMetadata: GlobalMetadata = {
    functionMetadata: [],
    classMetadata: [],
    interfaceMetadata: [],
  };

  extractFile(filePath, globalMetadata);

  return globalMetadata;
}

function getPathConfiguration(): PathConfiguration {
  return {
    path: '/test' + Math.random(),
    method: 'get',
    summary: 'A test example',
    description: 'Test to see if all is working',
  } satisfies PathConfiguration;
}

function getEndpointDocumentation(filePath: string): {
  entryPointFunction: string;
  pathConfiguration: PathConfiguration;
  globalMetadata: GlobalMetadata;
} {
  const handlerFunctionName = 'handler';
  const pathConfiguration = getPathConfiguration();
  const globalMetadata = extractGlobalMetadata(filePath);

  // console.log(JSON.stringify(globalMetadata, null, 2));

  return {
    entryPointFunction: handlerFunctionName,
    pathConfiguration,
    globalMetadata,
  };
}

export function buildDocumentation(
  filePaths: string[],
  outputDir: string
): void {
  const openApiDocBuilder = new OpenApiDocBuilder();

  filePaths.forEach((filePath) => {
    const endpointDocumentation = getEndpointDocumentation(filePath);
    openApiDocBuilder.addEndpointConfiguration(
      endpointDocumentation.entryPointFunction,
      endpointDocumentation.pathConfiguration,
      endpointDocumentation.globalMetadata
    );
  });

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  fs.writeFileSync(
    `${outputDir}/openapi.json`,
    openApiDocBuilder.getAsJson(),
    {}
  );
  fs.writeFileSync(
    `${outputDir}/openapi.yaml`,
    openApiDocBuilder.getAsXml(),
    {}
  );
}

/*
buildDocumentation(
  [
    path.resolve(__dirname, '../fixtures/function_multi_file.ts'),
    path.resolve(__dirname, '../fixtures/function.ts'),
  ],
  'output'
);
*/
