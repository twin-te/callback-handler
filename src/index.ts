import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import session from 'express-session';
import { handleAuth, handleAuthCallback } from './handlers/auth';
import { configurePassport } from './passport';
import cookieParser from 'cookie-parser';
import passport from 'passport';

const app = express();
app.use(cookieParser());
configurePassport();
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV !== 'development' },
  }),
);
app.use(passport.initialize());
app.use(passport.session());
app.get('/auth/v3/:provider', handleAuth);
app.get('/auth/v3/:provider/callback', handleAuthCallback);

app.listen(process.env.PORT ? parseInt(process.env.PORT) : 3001);

console.log('listen');
