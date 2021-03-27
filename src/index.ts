import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { handleAuth, handleAuthCallback } from './handlers/auth';
import { configurePassport } from './passport';

const app = express();

configurePassport();

app.get('/v1/auth/:provider', handleAuth);
app.get('/v1/auth/:provider/callback', handleAuthCallback);

app.listen(process.env.PORT ? parseInt(process.env.PORT) : 30000);

console.log('listen');
