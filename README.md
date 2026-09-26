# 🎴 Anki Card Toolkit

> キングジム風ビジュアルバータイマー、学習完了予測HUD、OLEDダークモード切替、単語クリップ、辞書自動整形を備えた、高機能かつ洗練された Anki カード拡張モジュール集です。

---

## 🌟 機能一覧 (Modules)

必要な機能だけを既存のAnkiデッキに個別で導入することも、すべて入った統合パックを一発導入することも可能です。

| モジュール | 概要 | フォルダ |
| :--- | :--- | :--- |
| **📊 Visual Bar Timer** | キングジム「ビジュアルバータイマープラス」風の20分割・4色プログレスバータイマー。ポモドーロや1問タイムアタックに対応。 | [`modules/01-visual-bar-timer`](./modules/01-visual-bar-timer/) |
| **🏁 Study Forecast** | 現在の解答速度と過去のミス率・再出題率を自動計測し、本日の完了時刻や全カード完走までの所要時間をリアルタイム予測。 | [`modules/02-study-forecast`](./modules/02-study-forecast/) |
| **🌙 Theme Toggle** | 目に優しいソフトグリーンとOLED漆黒ブラックをワンタップ切替。めくり時のチラつきゼロ。 | [`modules/03-theme-toggle`](./modules/03-theme-toggle/) |
| **📎 Quick Clip** | 学習中に気になった単語をワンタップ保存。後から一覧表示や一括クリップボードコピーが可能。 | [`modules/04-quick-clip`](./modules/04-quick-clip/) |
| **✨ Meaning Formatter** | 辞書CSVの意味欄に含まれる記号（`＝`、`【品詞】`、`〔解説〕`など）を解析し、モダンなタグや補足文字に自動整形。 | [`modules/05-meaning-formatter`](./modules/05-meaning-formatter/) |
| **🚀 All-in-One Full Pack** | 上記すべての機能を完全に調和させた統合テンプレート（表面・裏面・CSS）。 | [`full-pack`](./full-pack/) |

---

## 📱 対応環境
- **Anki Desktop** (Windows / macOS / Linux)
- **AnkiMobile** (iPhone / iPad)
- **AnkiDroid** (Android)

---

## 🚀 すぐに使いたい場合 (クイックスタート)

全機能が設定済みの完全版を使いたい場合は、[`full-pack`](./full-pack/) フォルダ内のファイルをご利用ください。

1. Ankiのメニュー **「ツール」→「ノートタイプを管理」** を開く
2. お使いのノートタイプを選び、**「カード」** をクリック
3. 以下の対応するコードをコピー＆ペースト：
   - **表面の書式**: [`full-pack/front.html`](./full-pack/front.html)
   - **裏面の書式**: [`full-pack/back.html`](./full-pack/back.html)
   - **書式 (CSS)**: [`full-pack/style.css`](./full-pack/style.css)

---

## 📄 ライセンス
MIT License
