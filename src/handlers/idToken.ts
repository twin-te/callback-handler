import { OAuth2Client } from 'google-auth-library';
import { Request, Response } from 'express';
import { applySessionCookie } from '../utils';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID!);

export async function handleGoogleIdToken(req: Request, res: Response) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: req.query.token as string,
      audience: process.env.GOOGLE_CLIENT_ID!,
    });
    const payload = ticket.getPayload();
    const userid = payload?.sub;

    if (userid) {
      await applySessionCookie('google', userid, res);
      res.send(200);
    } else {
      res.send(400);
    }
  } catch (e) {
    console.error(e);
    res.send(400);
  }
}
