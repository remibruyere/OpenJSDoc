import { beforeEach, describe, it } from 'vitest';
import ts from 'typescript';
import { StaticLanguageServiceHost } from '../../../lib/ts/staticLanguageServiceHost';
import { type NodeDocument } from '../../../types/node-types';
import { InterfaceParser } from '../interface';

describe('[src/ast/parser]', () => {
  describe('InterfaceParser', () => {
    const visitFile = (
      projectPath: string,
      visitFn: (
        node: ts.Node,
        program: ts.Program,
        checker: ts.TypeChecker
      ) => NodeDocument
    ): void => {
      const service = ts.createLanguageService(
        new StaticLanguageServiceHost(projectPath)
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
      beforeEach(() => {});

      it('should parse interface with one member as number', () => {
        visitFile(
          '/Users/remibruyere/Documents/open-source/OpenJSDoc/fixtures/interface/tsconfig.json',
          (node, program, checker) => {
            if (ts.isInterfaceDeclaration(node)) {
              console.log(
                JSON.stringify(
                  new InterfaceParser(program, checker).parseInterface(node),
                  null,
                  2
                )
              );
            }
            return {
              types: [],
              version: 1,
            };
          }
        );
      });
    });
  });
});
