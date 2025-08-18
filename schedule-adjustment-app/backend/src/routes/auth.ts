import { Router, Request, Response, NextFunction } from 'express'; // Add Request, Response, NextFunction
import passport from 'passport';
import asyncHandler from 'express-async-handler'; // Add this line

const router = Router();

// Google認証を開始するルート
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar.readonly'],
  })
);

// Google認証のコールバックを処理するルート
router.get('/google/callback', asyncHandler(async (req, res, next) => { // Wrap with asyncHandler
  passport.authenticate('google', (err: any, user: any, info: any) => {
    // console.log('[passport callback] err:', err); // Remove console.log
    // console.log('[passport callback] user:', user); // Remove console.log
    // console.log('[passport callback] info:', info); // Remove console.log

    if (err) {
      throw err; // Throw error to errorHandler
    }
    if (!user) {
      // 認証失敗、または何らかの理由でユーザー情報が取得できなかった
      const failureMessage = info?.message || 'unknown_error';
      // return res.redirect(`${process.env.CLIENT_URL}/login/failed?message=${encodeURIComponent(failureMessage)}`);
      const error: any = new Error(`Authentication failed: ${failureMessage}`);
      error.statusCode = 401;
      throw error;
    }
    // 認証成功。手動でログインセッションを確立
    req.logIn(user, (err) => {
      if (err) {
        throw err; // Throw error to errorHandler
      }
      // 成功リダイレクト
      return res.redirect(process.env.CLIENT_URL!);
    });
  })(req, res, next);
})); // Close asyncHandler

// ログアウト
router.get('/logout', asyncHandler(async (req, res, next) => { // Wrap with asyncHandler
  req.logout((err) => {
    if (err) { throw err; } // Throw error to errorHandler
    req.session.destroy((err) => {
        if (err) {
            throw err; // Throw error to errorHandler
        }
        res.clearCookie('connect.sid');
        res.status(200).json({ message: 'Logged out successfully' });
    });
  });
})); // Close asyncHandler


// ログイン状態の確認
router.get('/me', (req, res) => { // No need to wrap with asyncHandler if no async operations
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

export default router;
