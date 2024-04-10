import ts from 'typescript';
import {
  parseCustomTagTypedComment,
  parseCustomTagTypedResponseCode,
  parseCustomTagTypedType,
} from './customDecorator/typed';
import { type DecoratorMetadata } from '../types/decoratorMetadata';

const customTags = ['response', 'request'];

export function getTagInformation(tag: ts.JSDocTag): DecoratorMetadata {
  return {
    name: getPropertyName(tag),
    comment: getPropertyTagComment(tag),
    type: getDecoratorType(tag),
    responseCode: getDecoratorResponseCode(tag),
  };
}

export function getPropertyName(tag: ts.JSDocTag): string {
  return tag.tagName.getText();
}

export function getPropertyGlobalComment(jsDoc: ts.JSDoc): string {
  return ts.getTextOfJSDocComment(jsDoc.comment) ?? '';
}

export function getPropertyTagComment(tag: ts.JSDocTag): string {
  const comment = ts.getTextOfJSDocComment(tag.comment);
  if (comment !== undefined && customTags.includes(tag.tagName.getText())) {
    return parseCustomTagTypedComment(comment);
  }
  return comment ?? '';
}

export function getDecoratorType(
  tag: ts.JSDocTag | ts.JSDocTypeTag
): string | string[] | undefined {
  if (customTags.includes(tag.tagName.getText())) {
    return parseCustomTagTypedType(tag);
  }
  if (ts.isJSDocTypeTag(tag)) {
    const typeNode = tag.typeExpression.type;
    if (ts.isParenthesizedTypeNode(typeNode)) {
      if (ts.isUnionTypeNode(typeNode.type)) {
        return typeNode.type.types.map((value) => value.getText());
      } else {
        return typeNode.getText();
      }
    } else if (ts.isTypeReferenceNode(typeNode)) {
      return typeNode.getText();
    }
  }
  return undefined;
}

export function getDecoratorResponseCode(
  tag: ts.JSDocTag | ts.JSDocTypeTag
): number | undefined {
  if (['response'].includes(tag.tagName.getText())) {
    return parseCustomTagTypedResponseCode(tag);
  }
  return undefined;
}
