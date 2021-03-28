import { Session } from 'express-session';

export {};

declare global {
  namespace Express {
    interface User {
      id: string;
    }
    interface Request {
      session?: Session;
    }
  }
}
