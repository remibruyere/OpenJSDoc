import * as ts from 'typescript';
import { type ClassPropertyMetadata, type ClassMetadata } from 'class';
import { parseClassProperty } from './classProperty';
import { type ClassElement, getTextOfJSDocComment } from 'typescript';
import { canHaveJsDoc, getJsDoc } from 'tsutils/util/util';

export function parseClass(
  classDeclaration: ts.ClassDeclaration
): ClassMetadata {
  const className = classDeclaration.name?.getText() ?? '';
  const properties = parseClassMembers(classDeclaration.members);
  return {
    name: className,
    comment: getClassComment(classDeclaration),
    properties,
  };
}

function parseClassMembers(
  members: ts.NodeArray<ClassElement>
): ClassPropertyMetadata[] {
  const properties: ClassPropertyMetadata[] = [];
  members.forEach((member) => {
    if (ts.isPropertyDeclaration(member)) {
      properties.push(parseClassProperty(member));
    }
  });
  return properties;
}

function getClassComment(classDeclaration: ts.ClassDeclaration): string {
  if (canHaveJsDoc(classDeclaration)) {
    const jsDocs: ts.JSDoc[] = getJsDoc(classDeclaration);
    if (jsDocs[0] !== undefined) {
      return getTextOfJSDocComment(jsDocs[0].comment) ?? '';
    }
  }
  return '';
}
