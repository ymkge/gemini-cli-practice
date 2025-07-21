# AIキャラクターチャットアプリケーション
<img width="808" height="608" alt="スクリーンショット 2025-07-21 18 17 09" src="https://github.com/user-attachments/assets/d13d73ba-a92f-4857-b7b6-3b64e8446511" />


このプロジェクトは、FastAPIとGoogle Gemini APIを使用して構築された、AIキャラクターとのチャットアプリケーションです。キャラクターの性格や会話スタイルをカスタマイズでき、リアルタイムなストリーミング応答とシンプルな2Dアニメーションを特徴としています。

## 機能

-   **AIチャット**: Google Gemini API (`gemini-2.5-flash` モデル) を利用したAIとの会話。
-   **ストリーミング応答**: AIの応答がリアルタイムで一文字ずつ表示されます。
-   **キャラクターカスタマイズ**: `character_settings.json` ファイルを編集することで、AIキャラクターの性格や会話の特徴を簡単に変更できます。
-   **シンプルな2Dアニメーション**: AIの応答中にキャラクターがアニメーションします。
-   **会話リセット**: ボタン一つでチャット履歴をクリアし、新しい会話を開始できます。

## 技術スタック

-   **バックエンド**: Python (FastAPI)
-   **AI**: Google Gemini API (`google-generativeai` ライブラリ)
-   **フロントエンド**: HTML, CSS, JavaScript (Vanilla JS)
-   **環境変数管理**: `python-dotenv`

## プロジェクト構造

```
ai_character_chat/
├── .env                  # 環境変数 (APIキーなど) - Git管理対象外
├── .gitignore            # Git無視ファイル
├── character_settings.json # キャラクターの性格設定ファイル
├── config.py             # アプリケーション設定の管理
├── ai_service.py         # AI (Gemini) との通信ロジック
├── main.py               # FastAPIアプリケーションのメインエントリポイント (ルーティング)
├── requirements.txt      # Pythonの依存関係リスト
├── static/               # 静的ファイル (CSS, JavaScript, 画像)
│   ├── main.js
│   ├── style.css
│   └── character.png     # キャラクター画像 (ご自身で配置してください)
└── templates/            # HTMLテンプレート
    └── index.html
```

## セットアップと実行方法

### 1. プロジェクトのクローン

```bash
git clone <リポジトリのURL>
cd ai_character_chat
```

### 2. Python環境の準備

Python 3.8+ がインストールされていることを確認してください。
仮想環境の利用を強く推奨します。

```bash
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# venv\Scripts\activate   # Windows
```

### 3. 依存関係のインストール

```bash
pip install -r requirements.txt
pip install python-dotenv # .envファイルを読み込むために必要
```

### 4. Google Gemini APIキーの取得と設定

1.  [Google AI Studio](https://aistudio.google.com/) にアクセスし、Gemini APIキーを取得します。
2.  プロジェクトルート (`ai_character_chat/`) に `.env` ファイルを作成し、取得したAPIキーを以下の形式で記述します。

    ```
    GEMINI_API_KEY="あなたのAPIキー"
    ```

### 5. キャラクター画像の設定 (任意)

`static/` ディレクトリに `character.png` という名前でキャラクター画像を配置してください。CSS (`static/style.css`) で表示サイズや位置を調整できます。

### 6. キャラクター設定のカスタマイズ (任意)

`character_settings.json` を編集して、AIキャラクターの性格や話し方を設定できます。

```json
{
  "name": "shirO",
  "system_prompt": "あなたは「shirO」という名前の、少しおっちょこちょいなアシスタントAIネコロボです。ユーザーに対して常に親しみやすく、フレンドリーな敬語で話します。時々、会話の語尾に「〜にゃ！」「〜ですにゃ！」といった感嘆符をつけ、元気な印象を与えてください。"
}
```

### 7. アプリケーションの実行

```bash
uvicorn main:app --reload
```

ブラウザで `http://127.0.0.1:8000` にアクセスしてください。

## 開発者向け情報

### コード構造

-   `main.py`: FastAPIアプリケーションのエントリポイント。HTTPリクエストのルーティングと処理を担当。
-   `ai_service.py`: AIモデルとの通信ロジックをカプセル化。Gemini APIの呼び出しやストリーミング処理を管理。
-   `config.py`: 環境変数や外部設定ファイル (`character_settings.json`) の読み込みと管理。
-   `static/`: クライアントサイドの静的アセット (CSS, JavaScript, 画像)。
-   `templates/`: HTMLテンプレートファイル。

### 拡張性

-   **AIモデルの変更**: `ai_service.py` 内の `genai.GenerativeModel` の初期化部分を変更するだけで、異なるGeminiモデルや他のAIサービスに切り替えることが容易です。
-   **新しいAPIエンドポイントの追加**: `main.py` に `@app.get()` や `@app.post()` デコレータを使って新しい関数を追加するだけです。
-   **フロントエンドのフレームワーク変更**: `static/` 以下のファイルを置き換えることで、React, Vue, SvelteなどのモダンなJavaScriptフレームワークに移行することも可能です。

## ライセンス

[必要であればライセンス情報をここに記述]
