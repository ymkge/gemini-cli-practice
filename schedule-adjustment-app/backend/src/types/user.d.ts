import { Profile } from 'passport-google-oauth20';

declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
  }
}

export interface User extends Profile {
  accessToken: string;
}
