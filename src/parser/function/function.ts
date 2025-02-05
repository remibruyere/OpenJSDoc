import type ts from 'typescript';
import { getTextOfJSDocComment } from 'typescript';
import { canHaveJsDoc, getJsDoc } from 'tsutils/util/util';
import { type FunctionMetadata } from './types/functionMetadata';
import { getTagInformation } from '../../lib/tag';
import { type DecoratorMetadataList } from '../../types/decoratorMetadataList';

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
): DecoratorMetadataList {
  const decorators: DecoratorMetadataList = [];

  const jsDocs: ts.JSDoc[] = getJsDoc(functionDeclaration);
  for (const jsDoc of jsDocs) {
    if (jsDoc.tags != null) {
      for (const tag of jsDoc.tags) {
        const tagInformation = getTagInformation(tag);
        decorators.push(tagInformation);
      }
    }
  }

  return decorators;
}
