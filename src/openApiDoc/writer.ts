import fs from 'fs';
import { type OpenApiDocBuilder } from './builder';

export class OpenApiDocWriter {
  openApiDocBuilder: OpenApiDocBuilder;

  constructor(openApiDocBuilder: OpenApiDocBuilder) {
    this.openApiDocBuilder = openApiDocBuilder;
  }

  writeJson(filePath: string): void {
    fs.writeFileSync(filePath, this.openApiDocBuilder.getAsJson(), {});
  }

  writeYaml(filePath: string): void {
    fs.writeFileSync(filePath, this.openApiDocBuilder.getAsYaml(), {});
  }
}
