import { OpenApiDocBuilder } from './openApiDoc/builder';
import { OpenJsDoc } from './open-js-doc';
import { OpenApiDocWriter } from './openApiDoc/writer';

function main(): void {
  // const openJsDoc = new OpenJsDoc(
  //   './fixtures/interface-advanced/tsconfig.json'
  // );
  // const openJsDoc = new OpenJsDoc('./fixtures/arrow-function/tsconfig.json');
  const openJsDoc = new OpenJsDoc('./tests/tsconfig.json');

  openJsDoc.computeProject();

  // console.log(JSON.stringify(openJsDoc.getSourceFilesMetadata(), null, 2));
  console.log(JSON.stringify(openJsDoc.getRouterConfigurationList(), null, 2));

  const openApiDocBuilder = new OpenApiDocBuilder({
    openapi: '3.1.0',
    info: {
      title: 'Test project',
      version: '1.0.0',
    },
  }).addComponentConfiguration(openJsDoc.getSourceFilesMetadata());

  openJsDoc.getRouterConfigurationList().forEach((routerConfiguration) => {
    openApiDocBuilder.addEndpointConfiguration(
      routerConfiguration.entryPointFunction,
      {
        path: routerConfiguration.path,
        method: routerConfiguration.method,
        tagName: routerConfiguration.tagName,
      },
      openJsDoc.getSourceFilesMetadata()
    );
  });

  const openApiDocWriter = new OpenApiDocWriter(openApiDocBuilder);

  openApiDocWriter.writeJson('output/openapi.json');
  openApiDocWriter.writeYaml('output/openapi.yaml');
}

main();
