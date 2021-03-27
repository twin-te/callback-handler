import express from 'express';
import passport from 'passport';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';
import { handleAuth, handleAuthCallback } from './handlers/auth';

const app = express();

passport.use(
  'google',
  new GoogleStrategy(
    {
      clientID: '236104602181-psovvajpucovntgs9jae5n97dqt9t52c.apps.googleusercontent.com',
      clientSecret: '5jQ7Gf7ax16dvGg8eXG54QpB',
      callbackURL: 'http://localhost:30000/v1/auth/google/callback',
      passReqToCallback: true,
    },
    (req, accessToken, refreshToken, profile, cb) => {
      cb(null, { id: profile.id });
    },
  ),
);

app.get('/v1/auth/:provider', handleAuth);
app.get('/v1/auth/:provider/callback', handleAuthCallback);

app.listen(30000);

console.log('listen');
