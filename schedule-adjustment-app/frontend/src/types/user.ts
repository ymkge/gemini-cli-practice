import { Profile } from 'passport-google-oauth20';

export interface User extends Profile {
  accessToken: string;
}
