import ts from 'typescript';
import { getTextOfJSDocComment, type TypeElement } from 'typescript';
import { canHaveJsDoc, getJsDoc } from 'tsutils/util/util';
import { type InterfacePropertyMetadata } from './types/interfacePropertyMetadata';
import { type InterfaceMetadata } from './types/interfaceMetadata';
import { parseInterfaceProperty } from './interfaceProperty';

export function parseInterface(
  interfaceDeclaration: ts.InterfaceDeclaration
): InterfaceMetadata {
  return {
    name: interfaceDeclaration.name?.getText() ?? '',
    comment: getInterfaceComment(interfaceDeclaration),
    properties: parseInterfaceMembers(interfaceDeclaration.members),
  };
}

function parseInterfaceMembers(
  members: ts.NodeArray<TypeElement>
): InterfacePropertyMetadata[] {
  const properties: InterfacePropertyMetadata[] = [];
  members.forEach((member) => {
    if (ts.isPropertySignature(member)) {
      properties.push(parseInterfaceProperty(member));
    }
  });
  return properties;
}

function getInterfaceComment(
  interfaceDeclaration: ts.InterfaceDeclaration
): string {
  if (canHaveJsDoc(interfaceDeclaration)) {
    const jsDocs: ts.JSDoc[] = getJsDoc(interfaceDeclaration);
    if (jsDocs[0] !== undefined) {
      return getTextOfJSDocComment(jsDocs[0].comment) ?? '';
    }
  }
  return '';
}
