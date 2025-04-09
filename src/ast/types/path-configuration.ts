export interface PathConfiguration {
  tagName: string;
  path: string;
  method:
    | 'get'
    | 'post'
    | 'put'
    | 'delete'
    | 'options'
    | 'head'
    | 'patch'
    | 'trace';
  summary?: string;
  description?: string;
}
