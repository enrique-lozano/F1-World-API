//const express = require('express');
import express, { NextFunction, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { ValidateError } from 'tsoa';
import { RegisterRoutes } from './routes';

import * as swaggerJSON from './swagger.json';
import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  requestLocale
} from './i18n/country-names';
import { HttpException } from './utils/custom-error';

const app = express();

// Language of the translated content (e.g. the country names), from `?locale=es`
app.use((req: Request, res: Response, next: NextFunction) => {
  const locale = req.query['locale'];

  if (locale === undefined) return requestLocale.run(DEFAULT_LOCALE, next);

  if (typeof locale !== 'string' || !isSupportedLocale(locale)) {
    return res.status(422).json(
      HttpException.fromStatusAndCode(422, 'validation_error', {
        detail: {
          fieldsErrors: `\t - The locale "${String(locale)}" is not supported. Use a BCP 47 tag like "en", "es" or "pt-BR"`
        }
      })
    );
  }

  return requestLocale.run(locale, next);
});

// Register routes thanks to the tsoa generated file
const router = express.Router();
RegisterRoutes(router);

// Base path for all the routes
export const BASE_PATH = '/api';
app.use(BASE_PATH, router);

// Swagger docs generator
app.use(
  `${BASE_PATH}/docs`,
  swaggerUi.serve,
  async (_req: Request, res: Response) => {
    return res.send(
      swaggerUi.generateHTML(swaggerJSON, {
        customSiteTitle: 'RaceDex API docs'
      })
    );
  }
);

// Return swagger json
app.use(`${BASE_PATH}/swagger/json`, (_req, res) => {
  return res.send(swaggerJSON);
});

// Errors handling
app.use(function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): Response | void {
  if (err instanceof ValidateError) {
    return res.status(422).json(
      HttpException.fromStatusAndCode(422, 'validation_error', {
        detail: {
          fieldsErrors: Object.keys(err?.fields)
            .map(
              (x) =>
                `\t - ${err.fields[x].message}. Current value is: ${err.fields[x].value}`
            )
            .join('\n')
        }
      })
    );
  }

  if (err instanceof HttpException) {
    return res.status(err.status).json(err);
  }

  if (err instanceof Error) {
    console.error(err);

    return res
      .status(500)
      .json(HttpException.fromStatusAndCode(500, 'internal_server_error'));
  }

  next();
});

// Send 404 if the route does not exists
app.use(function notFoundHandler(_req, res: Response) {
  res.status(404).send(HttpException.fromStatusAndCode(404, 'route_not_found'));
});

export default app;
