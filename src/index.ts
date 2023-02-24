//const express = require('express');
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { RegisterRoutes } from './routes';

dotenv.config();

const app = express();
const port = process.env['PORT'];

// Register routes thanks to the tsoa generated file
const router = express.Router();
RegisterRoutes(router);

// Base path for all the routes
app.use('/api/v1', router);

// Swagger docs generator
app.use('/api-docs', swaggerUi.serve, async (_req: Request, res: Response) => {
  return res.send(swaggerUi.generateHTML(await import('./swagger.json')));
});

app.listen(port, () => {
  console.log(`\nListening on http://localhost:${port}/\n`);
});
