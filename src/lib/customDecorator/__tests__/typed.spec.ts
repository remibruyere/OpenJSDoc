import {
  parseCustomTagTypedComment,
  parseCustomTagTypedResponseCode,
  parseCustomTagTypedType,
} from '../typed';
import type ts from 'typescript';

describe('[src/lib/customDecorator]', () => {
  describe('#parseCustomTagTypedResponseCode', () => {
    it('should return statusCode from custom tag', () => {
      const result = parseCustomTagTypedResponseCode({
        comment: '200 {TestResDTO} Response body test dto',
      } as ts.JSDocTag);

      expect(result).toStrictEqual(200);
    });

    it('should return undefined when custom tag do not contain number at start', () => {
      const result = parseCustomTagTypedResponseCode({
        comment: '{TestResDTO} 200 Response body test dto',
      } as ts.JSDocTag);

      expect(result).toBeUndefined();
    });

    it('should return undefined when custom tag is undefined', () => {
      const result = parseCustomTagTypedResponseCode({
        comment: undefined,
      } as ts.JSDocTag);

      expect(result).toBeUndefined();
    });
  });

  describe('#parseCustomTagTypedType', () => {
    it('should return type of the custom tag', () => {
      const result = parseCustomTagTypedType({
        comment: '200 {TestResDTO} Response body test dto',
      } as ts.JSDocTag);

      expect(result).toStrictEqual('TestResDTO');
    });

    it('should return array type of the custom tag', () => {
      const result = parseCustomTagTypedType({
        comment: '200 {TestResDTO | TestResDTO2} Response body test dto',
      } as ts.JSDocTag);

      expect(result).toStrictEqual(['TestResDTO', 'TestResDTO2']);
    });

    it('should return undefined when custom tag do not contain type', () => {
      const result = parseCustomTagTypedType({
        comment: '200 Response body test dto',
      } as ts.JSDocTag);

      expect(result).toBeUndefined();
    });

    it('should return undefined when custom tag is undefined', () => {
      const result = parseCustomTagTypedType({
        comment: undefined,
      } as ts.JSDocTag);

      expect(result).toBeUndefined();
    });
  });

  describe('#parseCustomTagTypedComment', () => {
    it('should return type of the custom tag', () => {
      const result = parseCustomTagTypedComment(
        '200 {TestResDTO} Response body test dto'
      );

      expect(result).toStrictEqual('Response body test dto');
    });

    it('should return empty string when custom tag do not contain comment', () => {
      const result = parseCustomTagTypedComment('200 {TestResDTO}');

      expect(result).toBe('');
    });

    it('should return empty string when custom tag is empty', () => {
      const result = parseCustomTagTypedComment('');

      expect(result).toBe('');
    });
  });
});
