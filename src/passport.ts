import passport from 'passport';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';
import { Strategy as TwitterStrategy } from 'passport-twitter';

export function configurePassport() {
  passport.use(
    'google',
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: `${process.env.HOST_URL}/v1/auth/google/callback`,
      },
      (accessToken, refreshToken, profile, cb) => {
        cb(null, { id: profile.id });
      },
    ),
  );

  passport.use(
    'twitter',
    new TwitterStrategy(
      {
        consumerKey: process.env.TWITTER_CONSUMER_KEY!,
        consumerSecret: process.env.TWITTER_CONSUMER_SECRET!,
        callbackURL: `${process.env.HOST_URL}/v1/auth/twitter/callback`,
      },
      (accessToken, refreshToken, profile, cb) => {
        cb(null, { id: profile.id });
      },
    ),
  );
}
