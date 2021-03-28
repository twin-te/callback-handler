import { fromUnixTime } from 'date-fns';
import { Request, Response } from 'express';
import passport from 'passport';
import { sessionService } from '../services/sessionService';
import { userService } from '../services/userService';

export async function handleAuth(req: Request, res: Response) {
  const provider = req.params['provider'];
  if (provider !== 'google' && provider !== 'twitter' && provider !== 'apple') {
    res.sendStatus(404);
    return;
  }

  const callbackUrl = req.query['redirect_url'];

  if (!callbackUrl) {
    res.status(400);
    res.send('please specify redirect_url');
    return;
  }

  res.cookie('twinte_auth_callback', callbackUrl, {
    maxAge: 3 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
  });

  passport.authenticate(provider, {
    scope: ['profile'],
    session: false,
  })(req, res, (err: any) => {
    console.error(err);
    res.status(500);
    res.send(err.message);
  });
}

export async function handleAuthCallback(req: Request, res: Response) {
  const provider = req.params['provider'];
  if (provider !== 'google' && provider !== 'twitter' && provider !== 'apple') {
    res.sendStatus(404);
    return;
  }

  await passport.authenticate(provider, { session: false })(req, res, async () => {
    // cookie cleanup
    await (() =>
      new Promise<void>((resolve, reject) => req.session?.destroy((err) => (err ? reject(err) : resolve()))))();

    if (!req.user) {
      res.sendStatus(400);
      return;
    }

    const user = await userService.getOrCreateUser({ provider: provider, socialId: req.user.id });
    const { session, cookieOptions } = await sessionService.startSession({ userId: user.id });
    const expiredDate = fromUnixTime(session.expiredAt.seconds as number);

    const callbackUrl = req.cookies['twinte_auth_callback'] || 'https://www.twinte.net';

    res.cookie(process.env.COOKIE_NAME!, session.sessionId, {
      expires: expiredDate,
      secure: cookieOptions.secure,
      httpOnly: true,
      sameSite: 'lax',
    });

    // cookie cleanup
    res.clearCookie('connect.sid');
    res.clearCookie('twinte_auth_callback');

    res.redirect(callbackUrl);
    res.send();
  });
}
