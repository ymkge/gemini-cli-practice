# FAQ対応AIチャットボット
<img width="801" height="623" alt="スクリーンショット 2025-08-25 12 44 49" src="https://github.com/user-attachments/assets/ede117bc-05d0-43aa-a7b0-9074a758b57c" />

Streamlit、LangChain、Google Gemini APIを使用して構築された、設定分離型のFAQ対応AIチャットボットです。

## 概要

`faq.json`に定義されたQ&Aリストを知識源として、ユーザーの質問にAIが回答します。モデル設定やプロンプトが外部ファイル化されており、Pythonコードを編集することなく、チャットボットの挙動を柔軟にカスタマイズできるのが特徴です。

## ✨ 主な機能

- **インタラクティブなUI**: Streamlitによる直感的なチャットインターフェース。
- **FAQベースの回答**: `faq.json`の情報を基に、関連性の高い回答を提示。
- **柔軟なAI応答**: FAQに情報がない場合、LLMが自身の知識を用いて回答を試みます。
- **外部設定ファイル**: モデル、パラメータ、プロンプトを外部ファイルで管理。
- **会話履歴**: セッション中のやり取りを画面に表示。

## 🛠️ 技術スタック

- **UI**: Streamlit
- **LLM連携**: LangChain
- **LLM**: Google `gemini-2.5-flash` （`config.json`で変更可能）
- **Embedding**: Google `models/text-embedding-004` （`config.json`で変更可能）
- **ベクトル検索**: FAISS (CPU)

## 📄 ファイル構成

主要なファイルとその役割です。

```
.
├── 📄 app.py              # Streamlitアプリケーションのメインコード
├── 📄 faq.json              # チャットボットの知識源となるQ&Aデータ
├── 📄 config.json           # モデル名やパラメータを定義する設定ファイル
├── 📄 prompt_template.txt   # LLMへの指示（プロンプト）を定義するテンプレート
├── 📄 requirements.txt      # Pythonの依存ライブラリ
├── 📄 .env                  # APIキーなどの環境変数を格納（.env.sampleから作成）
└── ...
```

---

## 🚀 セットアップとローカルでの実行

### 1. 前提条件

- Python 3.8以上
- Google Gemini APIキー ([Google AI for Developers](https://ai.google.dev/) から取得)

### 2. プロジェクトの準備

```bash
# 1. このリポジトリをクローンします
# git clone https://github.com/your-username/faq-chatbot.git

# 2. プロジェクトディレクトリに移動します
cd faq-chatbot

# 3. (推奨) Python仮想環境を作成して有効化します
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# venv\Scripts\activate    # Windows
```

### 3. 依存ライブラリのインストール

```bash
pip install -r requirements.txt
```

### 4. 環境変数の設定

`.env.sample` をコピーして `.env` ファイルを作成し、ご自身のAPIキーを記述します。

```bash
cp .env.sample .env
```

```dotenv
# .env ファイルの中身
GEMINI_API_KEY="ここにあなたのAPIキーを貼り付け"
```

### 5. アプリケーションの実行

```bash
streamlit run app.py
```

---

## 🔧 カスタマイズ

このチャットボットは、Pythonコードを編集せずに以下の点をカスタマイズできます。

- **FAQの追加・編集**: `faq.json` を直接編集してください。
- **AIへの指示変更**: `prompt_template.txt` の内容を書き換えることで、AIの口調や役割を変更できます。
- **モデルの変更**: `config.json` の `embedding_model` や `llm_model` の値を、利用したいモデル名に変更します。
- **パラメータ調整**: `config.json` の `llm_params` にある `temperature` などの値を変更することで、AIの応答の多様性を調整できます。
