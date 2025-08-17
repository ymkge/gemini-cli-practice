import { Router, Request, Response, NextFunction } from 'express';
import { google } from 'googleapis';

const router = Router();

// ユーザーが認証済みか確認するミドルウェア
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
};

// カレンダーの空き時間を取得するAPI
router.post('/calendar/freebusy', isAuthenticated, async (req, res) => {
  try {
    // セッションからユーザー情報を取得
    const user: any = req.user;
    if (!user || !user.accessToken) {
      return res.status(401).json({ message: 'Access token not found' });
    }

    // リクエストボディから検索期間を取得
    const { timeMin, timeMax } = req.body;
    if (!timeMin || !timeMax) {
      return res.status(400).json({ message: 'timeMin and timeMax are required' });
    }

    // OAuth2クライアントをセットアップ
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: user.accessToken });

    // Calendar APIクライアントを作成
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // freebusy情報を取得
    const freeBusyResponse = await calendar.freebusy.query({
      requestBody: {
        timeMin: timeMin, // 例: '2024-05-23T00:00:00Z'
        timeMax: timeMax, // 例: '2024-05-30T23:59:59Z'
        items: [{ id: 'primary' }], // 自分のプライマリカレンダー
      },
    });

    res.status(200).json(freeBusyResponse.data);

  } catch (error) {
    console.error('Error fetching free-busy information:', error);
    res.status(500).json({ message: 'Failed to fetch free-busy information' });
  }
});

export default router;
