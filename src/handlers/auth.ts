import { fromUnixTime } from 'date-fns';
import { Request, Response } from 'express';
import passport from 'passport';
import { sessionService } from '../services/sessionService';
import { userService } from '../services/userService';
import { applySessionCookie } from '../utils';

const cookieName = process.env.COOKIE_NAME ?? 'twinte_session';

/**
 * twinteのドメインにしかリダイレクトを返さないようにする
 */
function validateRedirectUrl(url?: string) {
  if (!url) return false;
  else if (process.env.NODE_ENV === 'development') return true;
  else return /^https:\/\/([a-zA-Z0-9-]+\.)*twinte\.net/.test(url);
}

export async function handleAuth(req: Request, res: Response) {
  const provider = req.params['provider'];
  if (provider !== 'google' && provider !== 'twitter' && provider !== 'apple') {
    res.sendStatus(404);
    return;
  }

  const callbackUrl = req.query['redirect_url'] as string;

  if (!callbackUrl) {
    res.status(400);
    res.send('please specify redirect_url');
    return;
  }

  if (!validateRedirectUrl(callbackUrl)) {
    res.status(400);
    res.send('invalid redirect_url');
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
      res.status(400).send(`
        <p>BadRequest</p>
        <button onclick="location.reload()">再読み込み</button>
      `); // twitterが上手く動かない対応一時処理
      return;
    }

    await applySessionCookie(provider, req.user.id, res);

    // cookie cleanup
    res.clearCookie('connect.sid');
    res.clearCookie('twinte_auth_callback');

    const callbackUrl = req.cookies['twinte_auth_callback'] || 'https://app.twinte.net';

    res.redirect(callbackUrl);
    res.send();
  });
}

export async function handleLogout(req: Request, res: Response) {
  const callbackUrl = req.query['redirect_url'] as string;

  if (!callbackUrl) {
    res.status(400);
    res.send('please specify redirect_url');
    return;
  }

  if (!validateRedirectUrl(callbackUrl)) {
    res.status(400);
    res.send('invalid redirect_url');
    return;
  }

  res.clearCookie(cookieName);
  res.redirect(callbackUrl);
}
