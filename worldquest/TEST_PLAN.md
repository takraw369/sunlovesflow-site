# WORLD QUEST v0.2 — Mobile / Migration Smoke Test

## Goal
`/worldquest/` を新しい別サービスにせず、既存v0.1の進捗を保ったまま「30日の旅」として育てる。

## Safety boundary
- Production merge / deploy はpreview smoke前に行わない。
- 既存localStorage key `worldQuestV01` を維持し、v0.1進捗を消さない。
- 認証なし / Supabaseなし / 外部書込APIなし。
- 観測ログは端末localStorageのみ。
- 外部通信はユーザーが明示的に `世界へ出発する` で開く観測サイトと、OS共有UIを使う場合のみ。
- WORLD QUEST以外のroute / auth / LINE / backendは変更しない。

## v0.1 → v0.2 migration gate
1. v0.1でDay 1にログを保存し、Questを1件完了した状態を用意する。
2. v0.2を開く。
3. Day 1の完了状態・既存4ログが残る。
4. 新規field `place` が空でもエラーにならない。
5. 新規state `completedAt / sharedDays / launches / version` が不足していても起動する。
6. アップデートだけでXP・完了数・ログがリセットされない。

## Core mobile smoke
1. `/worldquest/` を開き、HERO / Quest / Passportが崩れず表示される。
2. `世界へ出発する` で該当観測サイトが別タブで開く。
3. `今日どこへ行った？` と4つの観測ログを入力し、下書き保存→再読込で復元される。
4. `QUEST COMPLETE` で完了数と+10 XPが反映され、同じDayを二重完了できない。
5. 完了QuestのPassport Stampに入力した場所が表示される。場所未入力でもDAY表記で壊れない。
6. 30日カレンダーで、現在Day / 完了Day / 下書きありDayが区別できる。
7. カレンダーのDayをタップして移動し、各Dayのログが混ざらない。
8. `次の未完了Quest` が最初の未完了Dayへ移動する。
9. `ランダム旅へ` が未完了Questを優先して別Dayへ移動する。
10. 前/次Questが端で無効化される。

## Share / XP gate
1. ログ入力に合わせてShare previewが更新される。
2. `投稿文をコピー` でWORLD QUEST投稿文がコピーされる。
3. 同一Dayの共有XP +5は最初の1回だけ加算される。
4. Web Share API対応端末では共有シートが開く。キャンセルしても壊れない。
5. Web Share API非対応時はコピーへfallbackする。
6. 投稿文に未入力欄があってもページが落ちない。

## Streak / Passport gate
1. 新しくQuestを完了した日にcompletion dateが保存される。
2. 当日または前日を起点に連続完了日がstreakとして表示される。
3. 既存v0.1完了データにcompletion dateが無くてもstreak 0として安全に動く。
4. `訪れた場所` は入力済み場所の重複を除いて数える。
5. Perspective / Updateはログ実績から計算される。

## Content review gate
各Questは「海外が正しい / 日本が遅れている」のような一方向の結論にしない。
勝利条件は、正解ではなく以下。
- 見る
- 比べる
- 問う
- 再定義する
- 自分で選ぶ

## Production regression
Merge後に最低限以下をliveで再確認する。
1. `https://sunlovesflow.com/` が既存トップを表示。
2. `https://sunlovesflow.com/worldquest/` がv0.2を表示。
3. WORLD QUEST以外の既存公開挙動がmain直前状態から変わっていない。
4. Cloudflare Pages technical fallbackでも同じWORLD QUESTが取得できる。
5. `/quest/` と `/body-flow/` は2026-09-16時点で専用タイトルを返す本番routeとは確認できていないため、存在をDone条件にしない。変更前後で同じ公開挙動かだけ比較する。
6. `www.sunlovesflow.com` は別domain taskとして扱い、未接続ならWORLD QUEST releaseと混ぜない。

## v0.3 candidates — real use後だけ判断
- Share Card画像生成
- 親子モード
- マルチプレイ / 対話Quest
- Supabase同期（ログイン・複数端末同期の実需要が出た時だけ）
- 強い発見のSource Card化 / SNS・note pipeline接続
- WORLD OBSERVATORY 50サイトからの追加Quest生成
