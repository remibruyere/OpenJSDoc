import type { TemplatedApp } from 'uWebSockets.js';
import { controller } from '../http/controller.helper';
import { RouterHelper } from '../http/router.helper';
import { accountFetchApiRequestDtoSchema } from '../schema/account-fetch-api-request-dto.schema';
import { accountFetchHandler } from './account-fetch.api';

export const accountRouter = (
  app: TemplatedApp,
  basePath: `/${string}` = '/account',
) => {
  RouterHelper.get({
    app,
    basePath: `${basePath}/:accountId`,
    controller: controller(
      accountFetchHandler,
      accountFetchApiRequestDtoSchema,
    ),
  });
};
