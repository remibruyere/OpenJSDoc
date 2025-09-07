import { canHaveJsDoc, getJsDoc } from 'tsutils/util/util';
import ts, { getTextOfJSDocComment } from 'typescript';
import { getTagInformation } from '../../lib/tag';
import { type DecoratorMetadata } from '../../types/decorator-metadata';
import { type FunctionMetadata } from './types/functionMetadata';

/**
 * Parse arrow function and return metadata
 * Use parent since arrow function will be stored in it and all information
 * is attached to the parent
 * @param arrowFunction
 * @param checker
 */
export function parseArrowFunction(
  arrowFunction: ts.ArrowFunction,
  checker: ts.TypeChecker,
): FunctionMetadata | undefined {
  const functionName = getArrowFunctionVariableName(arrowFunction);
  if (functionName === undefined || functionName.length === 0) {
    return undefined;
  }
  return {
    name: functionName,
    comment: getArrowFunctionComment(arrowFunction),
    decorators: getArrowFunctionDecorator(arrowFunction, checker),
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
  arrowFunction: ts.ArrowFunction,
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

function getArrowFunctionResponseDecorator(
  arrowFunction: ts.ArrowFunction,
  checker: ts.TypeChecker,
): DecoratorMetadata {
  if (ts.isVariableDeclaration(arrowFunction.parent)) {
    const type = checker.getTypeAtLocation(arrowFunction.parent);
    const signatures = type.getCallSignatures();

    if (signatures.length > 0) {
      const returnType = signatures[0].getReturnType();
      if (returnType.symbol?.getName() === 'Promise') {
        const typeRef = returnType as ts.TypeReference;
        const promiseArg = typeRef.typeArguments?.[0];

        if (promiseArg != null) {
          if (promiseArg.aliasSymbol?.name === 'ControllerTypedResponse') {
            const controllerTypeRef = promiseArg as ts.TypeReference;
            const innerArg = controllerTypeRef.aliasTypeArguments?.[0];

            if (innerArg != null) {
              return {
                type: checker.typeToString(innerArg),
                comment: '',
                name: 'response',
              };
            }
          }
          return {
            type: checker.typeToString(promiseArg),
            comment: '',
            name: 'response',
          };
        }
      }
      return {
        type: checker.typeToString(returnType),
        comment: '',
        name: 'response',
      };
    }
  }
  return {
    type: 'void',
    comment: '',
    name: 'response',
  };
}

function getArrowFunctionRequestDecorator(
  arrowFunction: ts.ArrowFunction,
): DecoratorMetadata {
  return {
    type: arrowFunction.parameters[0]?.type?.getText(),
    comment: '',
    name: 'request',
  };
}

/**
 * Get decorator from parent of the arrow function.
 *
 * @param arrowFunction
 * @param checker
 */
function getArrowFunctionDecorator(
  arrowFunction: ts.ArrowFunction,
  checker: ts.TypeChecker,
): Record<string, DecoratorMetadata> {
  const decorators: Record<string, DecoratorMetadata> = {};

  decorators.request = getArrowFunctionRequestDecorator(arrowFunction);

  decorators.response = getArrowFunctionResponseDecorator(
    arrowFunction,
    checker,
  );

  // Set default content as application/json
  decorators.content = {
    name: 'content',
    comment: 'application/json',
    type: '',
  };

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
