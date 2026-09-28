# Theme Toggle

グリーン（#B6BDA7）とOLED漆黒ブラック（#000000）を切り替えるテーマトグル。

<p align="center">
  <img src="../../docs/images/card-overview-green.png" alt="Green Theme" width="48%">
  <img src="../../docs/images/card-overview-dark.png" alt="OLED Dark Theme" width="48%">
</p>

## 仕様
- **多層ストレージ永続化**: `localStorage` + `sessionStorage` + `window` のフォールバック連携により、AnkiDroid の WebView 再生成時やカードめくり時も状態を完全保持。
- **白飛び・自動反転防止**: `color-scheme: light dark` の宣言と、最上位タグ（`<html>`）判定により、カード読み込み時の背景色フラッシュや WebView の不要な強制白反転を抑止。
- **OLED True Black**: 完全な黒（#000000）と目に優しいスプリンググリーン（#B6BDA7）の2モード。
- **UI**: ヘッダー右上に配置するシンプルな絵文字ボタン（`🌙` / `☀️`）。

## ファイル
- `template.html`: 先頭プリローダーおよびヘッダーボタン
- `script.js`: テーマ切り替えロジック

## 導入
1. `template.html` の先頭スクリプトをカードテンプレートの1行目に配置。
2. ボタンマークアップをヘッダー要素内に配置。
3. `script.js` をメイン `<script>` 内に追加。
