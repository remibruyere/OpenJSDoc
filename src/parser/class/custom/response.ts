import type * as ts from 'typescript';
import { getTextOfJSDocComment } from 'typescript';

export function parseCustomTagTypedType(
  tag: ts.JSDocTag
): string | string[] | undefined {
  const comment = getTextOfJSDocComment(tag.comment);

  if (comment === undefined) {
    return undefined;
  }

  const matches = comment.match(/^\s*{([\s\S]*?)}\s*([\s\S]*)$/);

  return matches !== null ? matches[1] : undefined;
}

export function parseCustomTagTypedComment(comment: string): string {
  const matches = comment.match(/^\s*{([\s\S]*?)}\s*([\s\S]*)$/);

  return matches !== null ? matches[2] : comment;
}
