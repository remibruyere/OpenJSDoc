export interface ITypeMetadata {
  name: string;
  type: string;
  subType: Record<string, ITypeMetadata>;
}
