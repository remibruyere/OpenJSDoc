import { getTextOfJSDocComment } from 'typescript';
import type ts from 'typescript';
import { canHaveJsDoc, getJsDoc } from 'tsutils/util/util';
import { type FunctionMetadata } from './types/functionMetadata';
import { getTagInformation } from '../../lib/tag';
import { type DecoratorMetadata } from '../../types/decoratorMetadata';

export function parseFunction(
  functionDeclaration: ts.FunctionDeclaration
): FunctionMetadata {
  const functionName = functionDeclaration.name?.getText() ?? '';
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
): DecoratorMetadata[] {
  const decorators: DecoratorMetadata[] = [];

  const jsDocs: ts.JSDoc[] = getJsDoc(functionDeclaration);
  for (const jsDoc of jsDocs) {
    if (jsDoc.tags != null) {
      for (const tag of jsDoc.tags) {
        decorators.push(getTagInformation(tag));
      }
    }
  }

  return decorators;
}
