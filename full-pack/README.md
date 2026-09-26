# Full Pack

全モジュール（ビジュアルバータイマー、学習完了予測、テーマ切替、単語クリップ、意味欄整形）を統合したテンプレートです。

## 構成
- `front.html`: 表面テンプレート
- `back.html`: 裏面テンプレート
- `style.css`: スタイルシート

## インストール
1. Ankiのメニューから **「ツール」→「ノートタイプを管理」** を開く。
2. 対象のノートタイプを選択し、**「カード」** を開く。
3. 各ファイルを対応するエリアに貼り付ける：
   - 表面: `front.html`
   - 裏面: `back.html`
   - 書式: `style.css`
4. 学習完了予測を利用する場合は、`modules/02-study-forecast/_deck_forecast.js.template` を参考にデッキ母数を設定した `_deck_forecast.js` を `collection.media` に配置してください。
