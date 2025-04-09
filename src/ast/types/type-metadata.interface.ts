export interface ITypeMetadata {
  name: string;
  type: string;
  arrayType?: Array<{ type: 'string' | 'object'; value: string }>;
  subType?: Record<string, ITypeMetadata>;
}
