import ts, { getTextOfJSDocComment } from 'typescript';
import { canHaveJsDoc, getJsDoc } from 'tsutils/util/util';
import { getTagInformation } from '../../lib/tag';
import { type DecoratorMetadata } from '../../types/decorator-metadata';
import { type FunctionMetadata } from './types/functionMetadata';

/**
 * Parse arrow function and return metadata
 * Use parent since arrow function will be stored in it and all information
 * is attached to the parent
 * @param arrowFunction
 */
export function parseArrowFunction(
  arrowFunction: ts.ArrowFunction
): FunctionMetadata | undefined {
  const functionName = getArrowFunctionVariableName(arrowFunction);
  if (functionName === undefined || functionName.length === 0) {
    return undefined;
  }
  return {
    name: functionName,
    comment: getArrowFunctionComment(arrowFunction),
    decorators: getArrowFunctionDecorator(arrowFunction),
  };
}

/**
 * Get variable name from parent of the arrow function.
 * This is because arrow functions are stored in a variable declaration and
 * all information is attached to the parent.
 *
 * @param arrowFunction
 */
function getArrowFunctionVariableName(
  arrowFunction: ts.ArrowFunction
): string | undefined {
  if (ts.isVariableDeclaration(arrowFunction.parent)) {
    return arrowFunction.parent.name?.getText();
  }
}

/**
 * Get comment from parent of the arrow function.
 * This is because arrow functions are stored in a variable declaration and
 * all information is attached to the parent
 *
 * @param arrowFunction
 */
function getArrowFunctionComment(arrowFunction: ts.ArrowFunction): string {
  if (canHaveJsDoc(arrowFunction.parent.parent.parent)) {
    const jsDocs: ts.JSDoc[] = getJsDoc(arrowFunction.parent.parent.parent);
    if (jsDocs[0] !== undefined) {
      return getTextOfJSDocComment(jsDocs[0].comment) ?? '';
    }
  }
  return '';
}

/**
 * Get decorator from parent of the arrow function.
 *
 * @param arrowFunction
 */
function getArrowFunctionDecorator(
  arrowFunction: ts.ArrowFunction
): Record<string, DecoratorMetadata> {
  const decorators: Record<string, DecoratorMetadata> = {};

  const jsDocs: ts.JSDoc[] = getJsDoc(arrowFunction.parent.parent.parent);
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
