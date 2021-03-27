import passport from 'passport';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';

export function configurePassport() {
  passport.use(
    'google',
    new GoogleStrategy(
      {
        clientID: '236104602181-psovvajpucovntgs9jae5n97dqt9t52c.apps.googleusercontent.com',
        clientSecret: '5jQ7Gf7ax16dvGg8eXG54QpB',
        callbackURL: 'http://localhost:30000/v1/auth/google/callback',
        passReqToCallback: true,
        accessType: 'offline',
      },
      (req, accessToken, refreshToken, profile, cb) => {
        console.log('req', req);
        cb(null, { id: 'test' });
      },
    ),
  );
}
