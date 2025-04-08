import { OpenApiDocBuilder } from './openApiDoc/builder';
import { OpenJsDoc } from './open-js-doc';
import { OpenApiDocWriter } from './openApiDoc/writer';

function main(): void {
  // const openJsDoc = new OpenJsDoc('./fixtures/type/tsconfig.json');
  const openJsDoc = new OpenJsDoc('./fixtures/interface/tsconfig.json');
  // const openJsDoc = new OpenJsDoc('./tests/tsconfig.json');

  openJsDoc.computeProject();

  console.log(JSON.stringify(openJsDoc.getSourceFilesMetadata(), null, 2));

  const openApiDocBuilder = new OpenApiDocBuilder({
    openapi: '3.1.0',
    info: {
      title: 'Test project',
      version: '1.0.0',
    },
  });
  openApiDocBuilder.addEndpointConfiguration(
    'accountFetchHandler',
    {
      path: '/test',
      method: 'get',
      summary: 'A test example',
      description: 'Test to see if all is working',
    },
    openJsDoc.getSourceFilesMetadata()
  );

  const openApiDocWriter = new OpenApiDocWriter(openApiDocBuilder);

  openApiDocWriter.writeJson('output/openapi.json');
  openApiDocWriter.writeYaml('output/openapi.yaml');
}

main();
