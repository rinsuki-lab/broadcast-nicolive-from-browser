# broadcast-nicolive-from-browser

ニコ生をブラウザから配信してみる、実験プロジェクト。
H.264でのエンコードが必要なために、現状ではChromium系ブラウザでのみ動作 (Chrome, Edge, etc...)。

動いている様子 → https://twitter.com/428rinsuki/status/1221152143480107009

:warning: このプロジェクトはセキュリティ考えてないので、サーバーを公開せずlocalhostだけで楽しむことをおすすめします。あとエラーハンドリングが雑。

## How it works

1. [`navigator.mediaDevices.getDisplayMedia`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia) で画面を取得
1. [`MediaRecorder`](https://developer.mozilla.org/ja/docs/Web/API/MediaRecorder) で H.264 in WebM にエンコード
1. WebSocket でエンコードしたデータをサーバーに送り付ける
1. WebSocket でクライアントから送られてきたデータを、そのまま ffmpeg に`-codec copy`でrtmpに流させる
