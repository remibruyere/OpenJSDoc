import type { HttpRequest, HttpResponse, TemplatedApp } from 'uWebSockets.js';

export class RouterHelper {
  static post({
    app,
    basePath,
    controller,
  }: {
    app: TemplatedApp;
    basePath: `/${string}`;
    controller(
      basePath: `/${string}`,
    ): (res: HttpResponse, req: HttpRequest) => Promise<void>;
  }) {
    app.post(basePath, controller(basePath));
  }

  static get({
    app,
    basePath,
    controller,
  }: {
    app: TemplatedApp;
    basePath: `/${string}`;
    controller(
      basePath: `/${string}`,
    ): (res: HttpResponse, req: HttpRequest) => Promise<void>;
  }) {
    app.get(basePath, controller(basePath));
  }

  static put({
    app,
    basePath,
    controller,
  }: {
    app: TemplatedApp;
    basePath: `/${string}`;
    controller(
      basePath: `/${string}`,
    ): (res: HttpResponse, req: HttpRequest) => Promise<void>;
  }) {
    app.put(basePath, controller(basePath));
  }

  static patch({
    app,
    basePath,
    controller,
  }: {
    app: TemplatedApp;
    basePath: `/${string}`;
    controller(
      basePath: `/${string}`,
    ): (res: HttpResponse, req: HttpRequest) => Promise<void>;
  }) {
    app.patch(basePath, controller(basePath));
  }

  static delete({
    app,
    basePath,
    controller,
  }: {
    app: TemplatedApp;
    basePath: `/${string}`;
    controller(
      basePath: `/${string}`,
    ): (res: HttpResponse, req: HttpRequest) => Promise<void>;
  }) {
    app.del(basePath, controller(basePath));
  }
}
