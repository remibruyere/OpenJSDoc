#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkAspectPluginStack } from '../lib/cdk-aspect-plugin-stack';
import { LambdaDocumentationBuilderAspect } from '../../src/aws/cdk/aspects/lambda-documentation-builder.aspect';

const app = new cdk.App();
new CdkAspectPluginStack(app, 'CdkAspectPluginStack');

cdk.Aspects.of(app).add(new LambdaDocumentationBuilderAspect());
app.synth();
