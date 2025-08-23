# 📝 コンプライアンス校正アプリ
<img width="1799" height="904" alt="スクリーンショット 2025-08-23 23 39 12" src="https://github.com/user-attachments/assets/e81783c9-0cb4-4c9e-a884-75914d7b8443" />

## 概要

入力されたテキストのコンプライアンスをチェックするStreamlitアプリケーションです。Gemini APIを利用して、不適切な表現を抽出し、その理由と修正案を提示します。

## 主な機能

- **モダンなUI**: シンプルで分かりやすいインターフェース。
- **テキスト入力**: チェックしたい文章を貼り付けて、ボタンを押すだけでチェックが可能です。
- **セキュアなAPIキー管理**: StreamlitのSecrets管理機能を利用し、APIキーを安全に扱います。
- **モデル選択**: `gemini-2.5-flash` と `gemini-2.5-pro` から使用するモデルを選択できます。       
- **結果表示**: 不適切な表現、その理由、修正案を分かりやすいテーブル形式で表示します。

## 技術スタック

- **Python**
- **Streamlit**: フロントエンドとアプリケーションの実行環境
- **Google Generative AI**: コンプライアンスチェックのためのAIモデル
- **Pandas**: 結果の整形と表示

## セットアップと実行方法

1. **リポジトリをクローンします**
   ```bash
   git clone <repository_url>
   cd proofreading_app
   ```

2. **必要なライブラリをインストールします**
   ```bash
   pip install -r requirements.txt
   ```

3. **APIキーを設定します**
   `.streamlit` ディレクトリに `secrets.toml` ファイルを新規作成し、以下のようにご自身のGemini APIキーを記述します。

   **`.streamlit/secrets.toml`**:
   ```toml
   api_key = "YOUR_GEMINI_API_KEY"
   ```

4. **Streamlitアプリケーションを実行します**
   ```bash
   streamlit run app.py
   ```
   アプリケーションが起動したら、Webブラウザで表示されたURLにアクセスして利用できます。

## プロンプトについて

AIモデルへの指示（プロンプト）は`prompt.txt`ファイルに記載されています。必要に応じて内容をカスタマイズすることも可能です。

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は[LICENSE](LICENSE)ファイルをご覧ください。
