# AI Character Chat Application
<img width="1217" height="736" alt="スクリーンショット 2025-08-23 18 09 03" src="https://github.com/user-attachments/assets/add95c4d-ac91-4d7b-952d-9f8a18881122" />

## プロジェクト概要

このアプリケーションは、ユーザーがAIキャラクターと対話できるWEBアプリケーションです。AIキャラクターは会話内容に応じて9つの感情をイラストの切り替えで表現します。日常会話、勉強、仕事のパートナーとしての利用を想定しています。

## 機能一覧

- **キャラクター表示機能**: `frontend/public/images/` に配置された画像ファイルに基づいて、AIキャラクターの感情表現を切り替えて表示します。
- **チャット機能**: キャラクターとの会話内容に応じて、リアルタイムでイラストが切り替わるチャット機能を提供します。会話AIにはGemini-1.5-Flashを使用しています。

## 技術スタック

- **バックエンド**: Python (FastAPI)
- **フロントエンド**: React (Vite)
- **会話AIモデル**: Google Gemini 1.5 Flash
- **環境変数管理**: `python-dotenv` (バックエンド), `Vite`の環境変数機能 (フロントエンド)

## セットアップ手順

### 前提条件

以下のソフトウェアがシステムにインストールされていることを確認してください。

- **Python**: 3.9以上 (仮想環境の利用を推奨)
- **Node.js**: 18.x以上 (npmが付属)

### Google AI Studio APIキーの取得

Google AI Studio からAPIキーを取得し、安全に管理してください。このキーはバックエンドの `.env` ファイルに設定する必要があります。

### リポジトリのクローン

```bash
git clone <リポジトリのURL> # このプロジェクトのリポジトリURLに置き換えてください
cd ai-character-chat
```

### バックエンドのセットアップ

1.  バックエンドディレクトリに移動します。
    ```bash
    cd backend
    ```

2.  Python仮想環境を作成し、有効化します。
    ```bash
    python3 -m venv venv
    source venv/bin/activate  # macOS/Linux
    # venv\Scripts\activate   # Windows
    ```

3.  必要なPythonライブラリをインストールします。
    ```bash
    pip install -r requirements.txt
    ```

4.  環境変数を設定します。
    `.env.sample` を `.env` にコピーし、取得した `GOOGLE_API_KEY` を設定してください。
    ```bash
    cp .env.sample .env
    # .env ファイルを開き、GOOGLE_API_KEY="YOUR_GOOGLE_API_KEY_HERE" をご自身のAPIキーに置き換えます。
    ```

5.  バックエンドサーバーを起動します。
    ```bash
    uvicorn main:app --reload
    ```
    サーバーは通常 `http://127.0.0.1:8000` で起動します。

### フロントエンドのセットアップ

1.  フロントエンドディレクトリに移動します。
    ```bash
    cd ../frontend
    ```

2.  必要なNode.jsパッケージをインストールします。
    ```bash
    npm install
    ```

3.  環境変数を設定します。
    `.env.sample` を `.env` にコピーし、バックエンドのAPI URLを設定してください。デフォルトでは `http://127.0.0.1:8000` です。
    ```bash
    cp .env.sample .env
    # .env ファイルを開き、VITE_BACKEND_API_URL="http://127.0.0.1:8000" を必要に応じて確認/変更します。
    ```

4.  フロントエンド開発サーバーを起動します。
    ```bash
    npm run dev
    ```
    サーバーは通常 `http://localhost:5173` (または利用可能なポート) で起動します。

### キャラクター画像の準備

`frontend/public/images/` ディレクトリに、以下のファイル名で各感情に対応するキャラクター画像を配置してください。

- `neutral.png`
- `joy.png`
- `sorrow.png`
- `anger.png`
- `surprise.png`
- `fun.png`
- `love.png`
- `anxiety.png`
- `amazement.png`

これらの画像は、アプリケーション起動時に自動的に読み込まれ、チャットの感情に応じて切り替わります。

## 使用方法

1.  バックエンドとフロントエンドの両方のサーバーが起動していることを確認します。
2.  ウェブブラウザでフロントエンドのURL (`http://localhost:5173` など) にアクセスします。
3.  チャット入力欄にメッセージを入力し、送信ボタンをクリックします。AIキャラクターが返答し、会話内容に応じた感情のイラストが表示されます。
