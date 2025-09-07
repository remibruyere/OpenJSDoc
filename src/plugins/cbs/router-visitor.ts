import ts from 'typescript';
import { type RouterConfiguration } from './types/router-configuration';

export class RouterVisitor {
  private readonly basePath: string;
  private readonly routerFindRegex: RegExp;
  private readonly tagRegex: RegExp;
  private readonly basePathRegex: RegExp;
  private readonly routerControllerRegex: RegExp;
  readonly routerConfigurationList: RouterConfiguration[];

  constructor(basePath: string) {
    this.basePath = basePath;
    this.routerFindRegex = /.*router\.ts/;
    this.tagRegex = /export const (?<tagName>.*)Router/g;
    this.basePathRegex =
      /export [\w\s\\=(:,`/${}]*basePath.*= '(?<basePath>.*)'/g;
    this.routerControllerRegex =
      /RouterHelper\.(?<method>.*)\([\w\s=():,`/${}]*basePath: `(?<path>.*)`[\w\s=():,`/${}]*controller\(\s*(?<handler>[\w]*),[\w\s=():,`/${}]*\);/gm;
    this.routerConfigurationList = [];
  }

  isRouterSourceFile(sourceFilePath: string): boolean {
    return (
      sourceFilePath.startsWith(this.basePath) &&
      sourceFilePath.match(this.routerFindRegex) !== null
    );
  }

  visit(node: ts.Node): void {
    if (ts.isVariableStatement(node)) {
      this.tagRegex.lastIndex = 0;
      this.basePathRegex.lastIndex = 0;
      this.routerControllerRegex.lastIndex = 0;
      const routerCode = node.getText();
      const tagMatch = this.tagRegex.exec(routerCode);
      const basePathMatch = this.basePathRegex.exec(routerCode);
      const routerControllerMatches = routerCode.matchAll(
        this.routerControllerRegex
      );

      const tagName = tagMatch?.groups?.tagName;
      const basePath = basePathMatch?.groups?.basePath;

      for (const routerControllerMatch of routerControllerMatches) {
        const method = routerControllerMatch.groups?.method;
        const path = routerControllerMatch.groups?.path.replace(
          `\${basePath}`,
          basePath ?? ''
        );
        const handler = routerControllerMatch.groups?.handler;

        if (
          handler !== undefined &&
          method !== undefined &&
          path !== undefined
        ) {
          this.routerConfigurationList.push({
            tagName: tagName ?? '',
            entryPointFunction: handler,
            path,
            method: method as
              | 'get'
              | 'post'
              | 'put'
              | 'delete'
              | 'options'
              | 'head'
              | 'patch'
              | 'trace',
          });
        }
      }
    }
  }
}
