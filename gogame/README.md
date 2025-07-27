# Web版 囲碁ゲーム
<img width="724" height="577" alt="スクリーンショット 2025-07-27 23 44 01" src="https://github.com/user-attachments/assets/2d638e22-75c1-41d2-b063-7f56669da8ee" />

ブラウザで動作する、リッチなUIの囲碁ゲームです。
バックエンドにPython (Flask)、フロントエンドにHTML/CSS/JavaScriptを使用しています。

## 機能

- 9x9, 13x13, 19x19 の盤面サイズ選択
- 石を置く、パス、一手戻し、投了の基本操作
- アゲハマの表示
- 終局時の自動得点計算
- 木目調の美しいUIと立体的な石のデザイン

## 技術スタック

- **バックエンド**: Python, Flask
- **フロントエンド**: HTML, CSS, JavaScript (Vanilla JS)

## セットアップと実行方法

1. **リポジトリをクローンします** (まだの場合)

2. **必要なライブラリをインストールします**
   ターミナルで`gogame`ディレクトリに移動し、`requirements.txt`を使ってFlaskをインストールします。
   ```bash
   cd gogame
   pip install -r requirements.txt
   ```

3. **サーバーを起動します**
   同じく`gogame`ディレクトリで、以下のコマンドを実行してFlask開発サーバーを起動します。
   ```bash
   python app.py
   ```

4. **ゲームをプレイ**
   サーバーが起動したら、Webブラウザを開き、アドレスバーに `http://127.0.0.1:5000` と入力してください。
   ブラウザに囲碁ゲームが表示され、プレイを開始できます。
