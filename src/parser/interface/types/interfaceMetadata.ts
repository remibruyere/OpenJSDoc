import { type InterfacePropertyMetadata } from './interfacePropertyMetadata';

export interface InterfaceMetadata {
  name: string;
  properties: InterfacePropertyMetadata[];
  comment: string;
}
