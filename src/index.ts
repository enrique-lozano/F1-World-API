//const express = require('express');
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { ValidateError } from 'tsoa';
import { RegisterRoutes } from './routes';

import * as swaggerJSON from './swagger.json';

dotenv.config();

const app = express();
const port = process.env['PORT'];

// Register routes thanks to the tsoa generated file
const router = express.Router();
RegisterRoutes(router);

// Base path for all the routes
const BASE_PATH = '/api';
app.use(BASE_PATH, router);

// Swagger docs generator
app.use(
  `${BASE_PATH}/docs`,
  swaggerUi.serve,
  async (_req: Request, res: Response) => {
    return res.send(
      swaggerUi.generateHTML(swaggerJSON, {
        customSiteTitle: 'Swagger - F1 World'
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
    // Invalid params
    console.warn(`Caught Validation Error for ${req.path}:`, err.fields);
    return res.status(422).json({
      message: 'Validation Failed',
      details: err?.fields
    });
  }
  if (err instanceof Error) {
    return res.status(500).json({
      message: 'Internal Server Error'
    });
  }

  next();
});

// Send 404 if the route does not exists
app.use(function notFoundHandler(_req, res: Response) {
  res.status(404).send({
    message: 'Not Found'
  });
});

app.listen(port, () => {
  console.log(`\nListening on http://localhost:${port}/\n`);
});
