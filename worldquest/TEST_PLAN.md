# WORLD QUEST v0.1 — Mobile Smoke Test

## Goal
`/worldquest/` を「読むページ」ではなく、スマホで実際に1 Quest完了できる体験として確認する。

## Safety boundary
- Production merge / deploy はこのテスト前に行わない。
- 認証なし。
- Supabaseなし。
- 外部APIなし。
- 入力内容は `localStorage` のみ。外部送信しない。
- 既存 `/quest/`、`/body-flow/`、トップページは変更しない。

## iPhone Safari smoke test
1. `/worldquest/` を開く。
2. HEROで「世界を旅して、常識を再編集する。」が崩れず表示される。
3. Day 1 の `世界へ出発する` をタップし、Zoom Earthが別タブで開く。
4. WORLD QUESTへ戻り、4つの観測ログ欄に短文を入力する。
5. `下書きを保存` を押す。
6. Safariを再読み込みし、Day 1の入力が残ることを確認する。
7. `QUEST COMPLETE` を押し、+10 XP / 完了数 1 / FIRST STEP badge が反映される。
8. `次のQuest` でDay 2へ移動し、Day 1のログが混ざらないことを確認する。
9. `前のQuest` でDay 1へ戻り、保存内容が復元されることを確認する。
10. Day 1は二重にXP加算できないことを確認する。
11. 画面幅を変えて、PassportがスマホではQuestカード下に自然に並ぶことを確認する。
12. リセットは誤操作防止のconfirmが出ることだけ確認し、必要がなければ実行しない。

## Content review gate
各Questは「海外が正しい / 日本が遅れている」のような一方向の結論にしない。
勝利条件は、正解ではなく以下。
- 見る
- 比べる
- 問う
- 再定義する
- 自分で選ぶ

## v0.2 candidates after real use
- WORLD PASSPORTの地図UI
- 今日のランダムQuest
- SNS / note用アウトプット生成
- Share Card画像生成
- 親子モード
- マルチプレイ / 対話Quest
- Supabase同期（ログインを入れる時だけ）
- Raindrop WORLD OBSERVATORYとの管理側リンク
