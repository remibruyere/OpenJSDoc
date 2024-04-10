export interface PathConfiguration {
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
