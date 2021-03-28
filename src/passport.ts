import passport from 'passport';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import AppleStrategy from 'passport-apple';

export function configurePassport() {
  passport.use(
    'google',
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: `${process.env.HOST_URL}/google/callback`,
      },
      (_accessToken, _refreshToken, profile, cb) => {
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
        callbackURL: `${process.env.HOST_URL}/twitter/callback`,
      },
      (_accessToken, _refreshToken, profile, cb) => {
        cb(null, { id: profile.id });
      },
    ),
  );

  passport.use(
    'apple',
    new AppleStrategy(
      {
        clientID: process.env.APPLE_CLIENT_ID!,
        teamID: process.env.APPLE_TEAM_ID!,
        keyID: process.env.APPLE_KEY_ID!,
        scope: '',
        privateKeyString: process.env.APPLE_PRIVATE_KEY,
        callbackURL: `${process.env.HOST_URL}/apple/callback`,
      },
      (_accessToken, _refreshToken, _idToken, profile, cb) => {
        cb(null, { id: profile.id });
      },
    ),
  );
}
