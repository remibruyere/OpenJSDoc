import type { TemplatedApp } from 'uWebSockets.js';
import { accountFetchHandler } from './account-fetch.api';
import {
  accountFetchApiRequestDtoSchema
} from '../schema/account-fetch-api-request-dto.schema';
import { controller } from '../http/controller.helper';

export const router = (app: TemplatedApp, basePath = '/account') => {
  app.get(
    `${basePath}/:accountId`,
    controller(accountFetchHandler, accountFetchApiRequestDtoSchema),
  );
};
