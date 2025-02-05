import type * as cdk from 'aws-cdk-lib';
import { type IConstruct } from 'constructs';
import { buildDocumentation } from '../../../index';
import { AssetStaging } from 'aws-cdk-lib';

export class LambdaDocumentationBuilderAspect implements cdk.IAspect {
  static sourcePaths: string[] = [];

  visit(node: IConstruct): void {
    console.log(node.node.id);
    if (node instanceof AssetStaging) {
      const asset = node;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      if (asset.fingerprintOptions.bundling !== undefined) {
        const sourcePath =
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          asset.fingerprintOptions.bundling.projectRoot +
          '/' +
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          asset.fingerprintOptions.bundling.relativeEntryPath; // Retrieve the source path
        LambdaDocumentationBuilderAspect.sourcePaths.push(sourcePath);
        // console.log(`Source path for ${node.node.id}: ${sourcePath}`);
      }
    } else if (node.node.id === 'Tree') {
      // console.log(LambdaDocumentationBuilderAspect.sourcePaths);
      buildDocumentation(
        LambdaDocumentationBuilderAspect.sourcePaths,
        'output'
      );
    }
  }
}
