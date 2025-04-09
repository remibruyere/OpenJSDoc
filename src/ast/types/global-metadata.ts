import { type ClassMetadata } from '../parser/class/types/classMetadata';
import { type FunctionMetadata } from '../parser/function/types/functionMetadata';
import { type InterfaceMetadata } from '../parser/interface/types/interfaceMetadata';

export interface GlobalMetadata {
  functionMetadata: FunctionMetadata[];
  classMetadata: ClassMetadata[];
  interfaceMetadata: InterfaceMetadata[];
}
