import { SyntaxKind } from 'typescript';

export function convertKindToType(kind: SyntaxKind): string {
  switch (kind) {
    case SyntaxKind.StringKeyword:
      return 'string';
    case SyntaxKind.NumberKeyword:
      return 'number';
    case SyntaxKind.BooleanKeyword:
      return 'boolean';
    case SyntaxKind.ObjectKeyword:
      return 'object';
    case SyntaxKind.TypeReference:
      return 'object';
    case SyntaxKind.NullKeyword:
      return 'null';
    case SyntaxKind.ArrayType:
      return 'array';
    default:
      return 'string';
  }
}
