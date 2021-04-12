import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import session from 'express-session';
import { handleAuth, handleAuthCallback, handleLogout } from './handlers/auth';
import { configurePassport } from './passport';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { handleGoogleIdToken } from './handlers/idToken';

const app = express();
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

configurePassport();
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV !== 'development' },
    proxy: true,
  }),
);
app.use(passport.initialize());
app.use(passport.session());
app.get('/logout', handleLogout);
app.get('/:provider', handleAuth);
app.use('/:provider/callback', handleAuthCallback);
app.use('/google/idToken', handleGoogleIdToken);

app.listen(process.env.PORT ? parseInt(process.env.PORT) : 3001);

console.log('listen');
