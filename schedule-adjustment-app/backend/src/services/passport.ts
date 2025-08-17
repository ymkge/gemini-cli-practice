import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_REDIRECT_URI!,
      scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar.readonly'],
    },
    (accessToken, refreshToken, profile, done) => {
      // ユーザー情報にアクセストークンを追加して渡す
      const user = {
        ...profile,
        accessToken,
      };
      return done(null, user);
    }
  )
);

// セッションにユーザー情報を保存
passport.serializeUser((user, done) => {
  done(null, user);
});

// セッションからユーザー情報を復元
passport.deserializeUser((obj: any, done) => {
  done(null, obj);
});
