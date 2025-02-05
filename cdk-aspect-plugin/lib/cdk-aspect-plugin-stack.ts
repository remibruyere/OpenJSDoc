import * as cdk from 'aws-cdk-lib';
import { type Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { LogLevel, NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

export class CdkAspectPluginStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Define a sample Lambda function
    new NodejsFunction(this, 'MyFunction', {
      bundling: {
        target: 'es2020',
        keepNames: false,
        logLevel: LogLevel.INFO,
        sourceMap: false,
        minify: true,
      },
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handler',
      entry:
        '/Users/remibruyere/Documents/perso/OpenJSDoc/fixtures/function.ts',
    });

    // Define another sample Lambda function
    new NodejsFunction(this, 'AnotherFunction', {
      bundling: {
        target: 'es2020',
        keepNames: false,
        logLevel: LogLevel.INFO,
        sourceMap: false,
        minify: true,
      },
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handler',
      entry:
        '/Users/remibruyere/Documents/perso/OpenJSDoc/fixtures/function_multi_file.ts',
    });

    // Apply the LambdaLoggerAspect to the entire app
    // cdk.Aspects.of(this).add(new LambdaLoggerAspect());
  }
}
