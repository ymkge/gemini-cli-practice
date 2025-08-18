import { Request, Response } from 'express';
import { google } from 'googleapis';
import asyncHandler from 'express-async-handler';

// カレンダーの空き時間を取得するコントローラ
export const getFreeBusy = asyncHandler(async (req: Request, res: Response) => {
  // セッションからユーザー情報を取得
  const user: any = req.user;
  if (!user || !user.accessToken) {
    const error: any = new Error('Access token not found');
    error.statusCode = 401;
    throw error;
  }

  // リクエストボディから検索期間を取得
  const { timeMin, timeMax } = req.body;
  if (!timeMin || !timeMax) {
    const error: any = new Error('timeMin and timeMax are required');
    error.statusCode = 400;
    throw error;
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
});