# スケジュール調整アプリ (Schedule Adjustment App)

> [!WARNING]
> この機能は開発途中で固まることが増えた為、未完成のまま放置してます。

候補日程を複数提示し、参加者の都合の良い時間を選択してもらうことで、簡単にスケジュール調整ができるWebアプリケーションです。

## ✨ 主な機能

- イベント作成と候補日程の登録
- イベント共有用のユニークなURL生成
- Googleアカウント連携による認証
- 参加者による出欠入力
- 最適な開催日程の自動集計・表示

## 🛠️ 技術スタック

### フロントエンド

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Material-UI](https://mui.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [axios](https://axios-http.com/)

### バックエンド

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Google API Client Library for Node.js](https://github.com/googleapis/google-api-nodejs-client)
- [Passport.js (Google OAuth 2.0)](http://www.passportjs.org/)

## 📂 ディレクトリ構成

```
schedule-adjustment-app/
├── backend/  # バックエンド (Express, Node.js)
└── frontend/ # フロントエンド (React, Vite)
```

## 🚀 セットアップと実行方法

### 1. リポジトリをクローン

```bash
git clone https://github.com/<your-username>/schedule-adjustment-app.git
cd schedule-adjustment-app
```

### 2. バックエンドのセットアップ

1.  `backend` ディレクトリに移動します。
    ```bash
    cd backend
    ```

2.  `.env.sample` をコピーして `.env` ファイルを作成し、Google APIの認証情報などを設定します。
    ```bash
    cp .env.sample .env
    ```
    ```.env
    # .env ファイルに必要な環境変数を設定
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    SESSION_SECRET=your_session_secret
    CALLBACK_URL=http://localhost:3000/auth/google/callback
    ```

3.  依存関係をインストールします。
    ```bash
    npm install
    ```

4.  開発サーバーを起動します。
    ```bash
    npm run dev
    ```

    サーバーが `http://localhost:3000` で起動します。

### 3. フロントエンドのセットアップ

1.  `frontend` ディレクトリに移動します。
    ```bash
    cd ../frontend
    ```

2.  依存関係をインストールします。
    ```bash
    npm install
    ```

3.  開発サーバーを起動します。
    ```bash
    npm run dev
    ```

    アプリケーションが `http://localhost:5173` (Viteのデフォルト) で起動します。ブラウザでこのURLにアクセスしてください。
