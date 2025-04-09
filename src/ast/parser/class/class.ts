import ts from 'typescript';
import { parseClassProperty } from './classProperty';
import { type ClassElement, getTextOfJSDocComment } from 'typescript';
import { canHaveJsDoc, getJsDoc } from 'tsutils/util/util';
import { type ClassPropertyMetadata } from './types/classPropertyMetadata';
import { type ClassMetadata } from './types/classMetadata';

export function parseClass(
  classDeclaration: ts.ClassDeclaration
): ClassMetadata {
  return {
    name: classDeclaration.name?.getText() ?? '',
    comment: getClassComment(classDeclaration),
    properties: parseClassMembers(classDeclaration.members),
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
