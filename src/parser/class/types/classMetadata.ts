import { type ClassPropertyMetadata } from './classPropertyMetadata';

export interface ClassMetadata {
  name: string;
  properties: ClassPropertyMetadata[];
  comment: string;
}
