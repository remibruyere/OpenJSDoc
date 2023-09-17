import type * as ts from 'typescript';
import { type ClassPropertyMetadata, type DecoratorMetadata } from 'class';
import { canHaveJsDoc, getJsDoc } from 'tsutils/util/util';
import {
  getTextOfJSDocComment,
  isJSDocTypeTag,
  isParenthesizedTypeNode,
  isTypeReferenceNode,
  isUnionTypeNode,
} from 'typescript';
import {
  parseCustomTagTypedComment,
  parseCustomTagTypedType,
} from './custom/response';

export function parseClassProperty(
  propertyDeclaration: ts.PropertyDeclaration
): ClassPropertyMetadata {
  let comment: string = '';
  const decorators: DecoratorMetadata[] = [];

  if (canHaveJsDoc(propertyDeclaration)) {
    const jsDocs: ts.JSDoc[] = getJsDoc(propertyDeclaration);
    for (const jsDoc of jsDocs) {
      comment = getPropertyGlobalComment(jsDoc);
      if (jsDoc.tags != null) {
        for (const tag of jsDoc.tags) {
          decorators.push(getTagInformation(tag));
        }
      }
    }
  }

  return {
    name: propertyDeclaration.name.getText(),
    comment,
    decorators,
  };
}

function getTagInformation(tag: ts.JSDocTag): DecoratorMetadata {
  return {
    name: getPropertyName(tag),
    comment: getPropertyTagComment(tag),
    type: getDecoratorType(tag),
  };
}

function getPropertyName(tag: ts.JSDocTag): string {
  return tag.tagName.getText();
}

function getPropertyGlobalComment(jsDoc: ts.JSDoc): string {
  return getTextOfJSDocComment(jsDoc.comment) ?? '';
}

function getPropertyTagComment(tag: ts.JSDocTag): string {
  const comment = getTextOfJSDocComment(tag.comment);
  if (comment !== undefined && tag.tagName.getText() === 'response') {
    return parseCustomTagTypedComment(comment);
  }
  return comment ?? '';
}

function getDecoratorType(
  tag: ts.JSDocTag | ts.JSDocTypeTag
): string | string[] | undefined {
  if (tag.tagName.getText() === 'response') {
    return parseCustomTagTypedType(tag);
  }
  if (isJSDocTypeTag(tag)) {
    const typeNode = tag.typeExpression.type;
    if (isParenthesizedTypeNode(typeNode)) {
      if (isUnionTypeNode(typeNode.type)) {
        return typeNode.type.types.map((value) => value.getText());
      } else {
        return typeNode.getText();
      }
    } else if (isTypeReferenceNode(typeNode)) {
      return typeNode.getText();
    }
  }
  return undefined;
}
