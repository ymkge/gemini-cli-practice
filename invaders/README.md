# インベーダーゲーム

HTML、CSS、JavaScriptで作成された、シンプルなレトロ風のスペースインベーダーゲームです。

## 遊び方

1.  `index.html` ファイルをウェブブラウザで開きます。
2.  **Start** ボタンをクリックしてゲームを開始します。

### 操作方法

*   **矢印キー (左/右):** プレイヤーの宇宙船を移動します。
*   **スペースキー:** 弾を発射します。
*   **Startボタン:** ゲームを開始します。
*   **Stopボタン:** ゲームを一時停止します。
*   **Resetボタン:** ゲームを初期状態にリセットします。

## 開発

このゲームは、オブジェクト指向の原則を用いてコードを構造化した、プレーンなJavaScriptで構築されています。メインのゲームロジックは`Game`クラス内にカプセル化されており、プレイヤー、インベーダー、弾、そしてゲームループを管理しています。

ローカルでゲームを実行するには、シンプルなHTTPサーバーを使用できます。Pythonがインストールされている場合は、プロジェクトディレクトリで次のコマンドを実行します:

```bash
python -m http.server
```

その後、ブラウザで `http://localhost:8000` を開きます。