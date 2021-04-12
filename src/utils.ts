import { Provider } from './models/provider';
import { Response } from 'express';
import { userService } from './services/userService';
import { sessionService } from './services/sessionService';
import { fromUnixTime } from 'date-fns';

const cookieName = process.env.COOKIE_NAME ?? 'twinte_session';

export async function applySessionCookie(provider: Provider, socialId: string, res: Response) {
  const user = await userService.getOrCreateUser({ provider: provider, socialId: socialId });
  const { session, cookieOptions } = await sessionService.startSession({ userId: user.id });
  const expiredDate = fromUnixTime(session.expiredAt.seconds as number);

  res.cookie(cookieName, session.sessionId, {
    expires: expiredDate,
    secure: cookieOptions.secure,
    httpOnly: true,
    sameSite: 'none',
  });
}
