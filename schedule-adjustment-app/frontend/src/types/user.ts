import type { Profile } from 'passport-google-oauth20';

export interface User extends Profile {
  accessToken: string;
  // Add properties from Profile that are used in App.tsx
  displayName: string;
  emails: Array<{ value: string; verified: boolean; }>; // Corrected type for emails
  // Add other properties if needed, e.g., photos, id
}
