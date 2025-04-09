export interface RouterConfiguration {
  tagName: string;
  entryPointFunction: string;
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
}
