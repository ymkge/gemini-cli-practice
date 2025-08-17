import { Router } from 'express';
import passport from 'passport';

const router = Router();

// Google認証を開始するルート
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar.readonly'],
  })
);

// Google認証のコールバックを処理するルート
router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', (err: any, user: any, info: any) => {
    console.log('[passport callback] err:', err);
    console.log('[passport callback] user:', user);
    console.log('[passport callback] info:', info);

    if (err) {
      return next(err);
    }
    if (!user) {
      // 認証失敗、または何らかの理由でユーザー情報が取得できなかった
      const failureMessage = info?.message || 'unknown_error';
      return res.redirect(`${process.env.CLIENT_URL}/login/failed?message=${encodeURIComponent(failureMessage)}`);
    }
    // 認証成功。手動でログインセッションを確立
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      // 成功リダイレクト
      return res.redirect(process.env.CLIENT_URL!);
    });
  })(req, res, next);
});

// ログアウト
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    req.session.destroy((err) => {
        if (err) {
            return next(err);
        }
        res.clearCookie('connect.sid');
        res.status(200).json({ message: 'Logged out successfully' });
    });
  });
});


// ログイン状態の確認
router.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

export default router;
