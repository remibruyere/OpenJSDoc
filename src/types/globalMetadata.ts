import { type ClassMetadata } from '../parser/class/types/classMetadata';
import { type FunctionMetadata } from '../parser/function/types/functionMetadata';
import { type InterfaceMetadata } from '../parser/interface/types/interfaceMetadata';

export type GlobalMetadata = Array<
  ClassMetadata | FunctionMetadata | InterfaceMetadata
>;
