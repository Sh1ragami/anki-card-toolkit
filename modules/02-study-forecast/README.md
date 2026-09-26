# Study Forecast

直近の解答速度と過去のミス率・再出題率から、本日の学習完了時刻および全カード走破までの所要時間を算出するHUDです。

## 仕様
- **予測アルゴリズム**:
  - カード遷移速度（秒/問）をローカルにサンプリングして移動平均を算出。
  - 再出題率（約46%）を加味した実質解答回数を推定し、完了時刻を計算。
- **モード**:
  - 本日の学習分（期日・新規カード）
  - 全カード完走（デッキ内すべての未学習・復習対象）
- **スコープ**:
  - デッキ全体
  - 対象Part（単一デッキ）

## ファイル
- `template.html`: HUD表示部および設定モーダルのマークアップ
- `style.css`: パネルおよびインジケータのスタイル定義
- `script.js`: ペース計算・予測ロジック
- `_deck_forecast.js.template`: デッキ母数定義ファイル（`collection.media` 用）

## 導入
1. `_deck_forecast.js.template` を編集し、デッキ名とカード枚数を指定して `collection.media` に `_deck_forecast.js` として保存。
2. テンプレート先頭に `<script src="_deck_forecast.js"></script>` を追加。
3. `template.html`、`style.css`、`script.js` をカード書式に追加。
