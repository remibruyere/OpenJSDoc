import { OpenApiDocBuilder } from './openApiDoc/builder';
import { OpenJsDoc } from './open-js-doc';
import { OpenApiDocWriter } from './openApiDoc/writer';

export function main(configPath: string): void {
  const openJsDoc = new OpenJsDoc(configPath);

  openJsDoc.computeProject();

  // console.log(JSON.stringify(openJsDoc.getSourceFilesMetadata(), null, 2));
  // console.log(JSON.stringify(openJsDoc.getRouterConfigurationList(), null, 2));

  openJsDoc.getServerConfigurations().forEach((serverConfig) => {
    const openApiDocBuilder = new OpenApiDocBuilder(serverConfig.openapiDoc);

    const serverRouterConfigurationList =
      openJsDoc.getServerRouterConfigurationList(serverConfig.serverFile);

    if (serverRouterConfigurationList === undefined) {
      console.error(
        `❌ No router visitor configured for server ${serverConfig.serverFile}`
      );
      throw new Error(
        `❌ No router visitor configured for server ${serverConfig.serverFile}`
      );
    }

    const typeUsedInPath = serverRouterConfigurationList.map(
      (routerConfiguration) => {
        return openApiDocBuilder.addEndpointConfiguration(
          routerConfiguration.entryPointFunction,
          {
            path: routerConfiguration.path,
            method: routerConfiguration.method,
            tagName: routerConfiguration.tagName,
          },
          openJsDoc.getSourceFilesMetadata()
        );
      }
    );

    openApiDocBuilder.addComponentConfiguration(
      openJsDoc.getSourceFilesMetadata(),
      typeUsedInPath.flatMap((value) => value.typeNameUsed)
    );

    const openApiDocWriter = new OpenApiDocWriter(openApiDocBuilder);

    const output = serverConfig.output;
    if (output.json === undefined && output.yaml === undefined) {
      console.warn(
        `⚠️ No output configuration for ${serverConfig.openapiDoc.info.title} found`
      );
    }
    if (output.json !== undefined) {
      console.info(
        `✅ Writing json output for ${serverConfig.openapiDoc.info.title}`
      );
      openApiDocWriter.writeJson(output.json);
    }
    if (output.yaml !== undefined) {
      console.info(
        `✅ Writing yaml output for ${serverConfig.openapiDoc.info.title}`
      );
      openApiDocWriter.writeYaml(output.yaml);
    }
  });
}
