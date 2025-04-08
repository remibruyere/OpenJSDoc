import ts from 'typescript';
import { canHaveJsDoc, getJsDoc } from 'tsutils/util/util';
import { type InterfaceMetadata } from '../interface/types/interfaceMetadata';
import { type InterfacePropertyMetadata } from '../interface/types/interfacePropertyMetadata';
import { parseTypeAliasProperty } from './typeAliasProperty';

export function parseTypeAlias(
  typeAliasDeclaration: ts.TypeAliasDeclaration
): InterfaceMetadata {
  return {
    name: typeAliasDeclaration.name?.getText() ?? '',
    comment: getInterfaceComment(typeAliasDeclaration),
    properties:
      typeAliasDeclaration.type !== undefined
        ? parseTypeMembers(typeAliasDeclaration.type)
        : [],
  };
}

function parseTypeMembers(node: ts.TypeNode): InterfacePropertyMetadata[] {
  const properties: InterfacePropertyMetadata[] = [];
  if (ts.isTypeLiteralNode(node)) {
    node.members.forEach((member) => {
      if (ts.isPropertySignature(member)) {
        properties.push(parseTypeAliasProperty(member));
      }
    });
  }
  return properties;
}

function getInterfaceComment(
  typeAliasDeclaration: ts.TypeAliasDeclaration
): string {
  if (canHaveJsDoc(typeAliasDeclaration)) {
    const jsDocs: ts.JSDoc[] = getJsDoc(typeAliasDeclaration);
    if (jsDocs[0] !== undefined) {
      return ts.getTextOfJSDocComment(jsDocs[0].comment) ?? '';
    }
  }
  return '';
}
