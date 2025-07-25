# ツムツム風パズルゲーム

これは、かわいいキャラクターをつなげて消していく、シンプルなパズルゲームです。

![スクリーンショット 2025-07-07 21 55 44](https://github.com/user-attachments/assets/df8f743e-8136-4b56-9a55-8107f01d1ea8)


## 遊び方

1.  **ゲームの開始:** 「ゲーム開始」ボタンをクリックすると、ゲームが始まります。
2.  **キャラクターを繋げる:** マウスをドラッグして、同じ種類の隣接するキャラクターを3つ以上つなげます。
3.  **スコア獲得:** 3つ以上つなげたキャラクターは消え、スコアが加算されます。
4.  **ゲーム終了:**
    *   60秒の制限時間が経過すると、自動的にゲームオーバーになります。
    *   「ゲーム終了」ボタンを押すと、いつでもゲームを中断してタイトル画面に戻ることができます。

## BGMについて

`puzzle`ディレクトリに`game.mp3`という名前の音声ファイルを置くと、ゲーム中のBGMとして再生されます。

## ファイル構成

*   `index.html`: ゲームのメインとなるHTMLファイルです。
*   `style.css`: ゲームの見た目を整えるためのCSSファイルです。
*   `game.js`: ゲームの動作ロジックを記述したJavaScriptファイルです。
*   `game.mp3` (オプション): ゲームのBGMファイルです。
*   `images/`: ゲームに使用されるキャラクター画像が格納されています。game.jsの `const CHARACTERS` を修正すれば、自分の好きなイラストとキャラクターを表示することが可能です。 
