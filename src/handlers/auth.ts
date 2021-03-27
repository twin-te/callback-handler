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
  passport.authenticate(provider, { scope: ['profile'], session: false })(req, res);
}

export async function handleAuthCallback(req: Request, res: Response) {
  const provider = req.params['provider'];
  if (provider !== 'google' && provider !== 'twitter' && provider !== 'apple') {
    res.sendStatus(404);
    return;
  }

  await passport.authenticate(provider, { session: false })(req, res, async () => {
    if (!req.user) {
      res.sendStatus(400);
      return;
    }

    const user = await userService.getOrCreateUser({ provider: provider, socialId: req.user.id });
    const { session, cookieOptions } = await sessionService.startSession({ userId: user.id });
    const expiredDate = fromUnixTime(session.expiredAt.seconds as number);

    res.cookie('twinte_session', session.sessionId, {
      expires: expiredDate,
      secure: cookieOptions.secure,
      httpOnly: true,
      sameSite: 'lax',
    });

    res.redirect(`https://www.twinte.net/?provider=${provider}&id=${session.userId}`);
    res.send();
  });
}
