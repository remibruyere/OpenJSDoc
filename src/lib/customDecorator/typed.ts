import { getTextOfJSDocComment } from 'typescript';
import type ts from 'typescript';

const customTagRegex = /^\s*(\d\d\d)?\s*{([\s\S]*?)}\s*([\s\S]*)$/;

export function parseCustomTagTypedResponseCode(
  tag: ts.JSDocTag
): number | undefined {
  const comment = getTextOfJSDocComment(tag.comment);

  if (comment === undefined) {
    return undefined;
  }

  const matches = comment.match(customTagRegex);

  return matches !== null ? Number(matches[1]) : undefined;
}

export function parseCustomTagTypedType(
  tag: ts.JSDocTag
): string | string[] | undefined {
  const comment = getTextOfJSDocComment(tag.comment);

  if (comment === undefined) {
    return undefined;
  }

  const matches = comment.match(customTagRegex);

  return matches !== null ? matches[2] : undefined;
}

export function parseCustomTagTypedComment(comment: string): string {
  const matches = comment.match(customTagRegex);

  return matches !== null ? matches[3] : comment;
}
