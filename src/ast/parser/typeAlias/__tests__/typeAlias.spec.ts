import ts from 'typescript';
import { describe, it } from 'vitest';
import { StaticLanguageServiceHost } from '../../../lib/ts/staticLanguageServiceHost';
import { type NodeDocument } from '../../../types/node-types';
import { TypeAliasParser } from '../typeAlias';

describe('[src/ast/parser]', () => {
  describe('TypeAliasParser', () => {
    const visitFile = (
      projectPath: string,
      visitFn: (
        node: ts.Node,
        program: ts.Program,
        checker: ts.TypeChecker,
      ) => NodeDocument,
    ): void => {
      const service = ts.createLanguageService(
        new StaticLanguageServiceHost(projectPath),
      );
      const program = service.getProgram();
      if (program === undefined) {
        throw new Error('Project is not initialized');
      }

      const visit = (node: ts.Node, depth = 0): void => {
        visitFn(node, program, program?.getTypeChecker());
        ts.forEachChild(node, (childNode) => {
          visit(childNode, depth + 1);
        });
      };

      for (const file of program.getSourceFiles()) {
        if (
          !file.isDeclarationFile &&
          !program.isSourceFileFromExternalLibrary(file)
        ) {
          ts.forEachChild(file, (node) => {
            visit(node);
          });
        }
      }
    };

    describe('number', () => {
      it('should parse interface with one member as number', () => {
        visitFile('./fixtures/type/tsconfig.json', (node, program, checker) => {
          if (ts.isTypeAliasDeclaration(node)) {
            console.log(
              JSON.stringify(
                new TypeAliasParser(program, checker).parseTypeAlias(node),
                null,
                2,
              ),
            );
          }
          return {
            types: [],
            version: 1,
          };
        });
      });
    });
  });
});
