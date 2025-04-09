import { getTextOfJSDocComment } from 'typescript';
import type ts from 'typescript';
import { canHaveJsDoc, getJsDoc } from 'tsutils/util/util';
import { type FunctionMetadata } from './types/functionMetadata';
import { getTagInformation } from '../../lib/tag';
import { type DecoratorMetadata } from '../../types/decorator-metadata';

export function parseFunction(
  functionDeclaration: ts.FunctionDeclaration
): FunctionMetadata | undefined {
  const functionName = functionDeclaration.name?.getText();
  if (functionName === undefined || functionName.length === 0) {
    return undefined;
  }

  return {
    name: functionName,
    comment: getFunctionComment(functionDeclaration),
    decorators: getFunctionDecorator(functionDeclaration),
  };
}

function getFunctionComment(
  functionDeclaration: ts.FunctionDeclaration
): string {
  if (canHaveJsDoc(functionDeclaration)) {
    const jsDocs: ts.JSDoc[] = getJsDoc(functionDeclaration);
    if (jsDocs[0] !== undefined) {
      return getTextOfJSDocComment(jsDocs[0].comment) ?? '';
    }
  }
  return '';
}

function getFunctionDecorator(
  functionDeclaration: ts.FunctionDeclaration
): Record<string, DecoratorMetadata> {
  const decorators: Record<string, DecoratorMetadata> = {};

  const jsDocs: ts.JSDoc[] = getJsDoc(functionDeclaration);
  for (const jsDoc of jsDocs) {
    if (jsDoc.tags != null) {
      for (const tag of jsDoc.tags) {
        const tagInformation = getTagInformation(tag);
        decorators[tagInformation.name] = tagInformation;
      }
    }
  }

  return decorators;
}
