import { convertKindToType } from '../kind';
import { SyntaxKind } from 'typescript';

describe('[src/lib]', () => {
  describe('#convertKindToType', () => {
    it('should return "string" for StringKeyword', () => {
      expect(convertKindToType(SyntaxKind.StringKeyword)).toBe('string');
    });

    it('should return "number" for NumberKeyword', () => {
      expect(convertKindToType(SyntaxKind.NumberKeyword)).toBe('number');
    });

    it('should return "boolean" for BooleanKeyword', () => {
      expect(convertKindToType(SyntaxKind.BooleanKeyword)).toBe('boolean');
    });

    it('should return "object" for ObjectKeyword', () => {
      expect(convertKindToType(SyntaxKind.ObjectKeyword)).toBe('object');
    });

    it('should return "object" for TypeReference', () => {
      expect(convertKindToType(SyntaxKind.TypeReference)).toBe('object');
    });

    it('should return "null" for NullKeyword', () => {
      expect(convertKindToType(SyntaxKind.NullKeyword)).toBe('null');
    });

    it('should return "array" for ArrayType', () => {
      expect(convertKindToType(SyntaxKind.ArrayType)).toBe('array');
    });

    it('should return "string" for any other kind', () => {
      expect(convertKindToType(SyntaxKind.AbstractKeyword)).toBe('string'); // Example of an undefined kind
    });
  });
});
