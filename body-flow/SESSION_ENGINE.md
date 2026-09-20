# Guided Session Engine v0.1

BODY FLOWを第1ユースケースとした、声・映像・音・進行を差し替え可能な汎用セッションエンジン。

## Design principle
MASA本人の操作は複雑にしない。表側は「START」で十分。拡張性は裏側に持たせる。

## Session schema
各Stepは以下を持てる。

- id
- name
- target
- duration
- restDuration
- sets
- cueText
- voiceCue
- videoSrc
- posterSrc
- bgmSrc
- sfxStart
- sfxFinish
- loopVideo
- mediaMode: none | image | video

## Runtime flow
1. Trigger（例：MAHRU散歩完了）
2. Session決定（上半身 / 下半身 / 全身 / RECOVERY）
3. Step開始
4. voiceCue再生
5. videoSrcがあれば動画を自動表示・再生
6. BGMはセッション全体で継続可能
7. 開始/終了SE
8. WORKタイマー
9. RESTタイマー
10. 次Stepへ自動遷移
11. Session終了
12. 30秒ログ

## Media UX
### Video
- 縦スマホ前提
- 動作説明は3〜10秒程度の短いループ動画を基本
- 音声指示と競合しないよう、運動動画自体は原則muted
- playsinline必須
- preload=metadataを基本
- ポスター画像を用意
- 通信失敗時はテキストCueへfallback

### Voice
- System TTSは無料MVP用
- Voice LabでPitch / Rate / Voiceを実機調整
- 本番品質はAI TTSまたは収録音声へ差し替え可能にする
- voice providerをUIから独立させる

### Sound
- START / SET COMPLETE / SESSION COMPLETE の短いSE
- BGMは任意
- 声を最優先し、BGMはducking（音量を自動で下げる）前提
- RECOVERYは別音響テーマへ切替可能

## First reusable verticals
- BODY FLOW：自重トレ
- MOBILITY FLOW：可動域・ストレッチ
- BREATH FLOW：呼吸
- MORNING FLOW：朝の起動
- FOCUS FLOW：集中セッション
- LEARN FLOW：短時間学習
- ACE KIDS：子どもの運動

## Architecture direction
UI / session data / media assets / voice provider / loggingを分離する。

BODY FLOW固有ロジックを増やしすぎず、将来的には1つのplayerにsession JSONを渡すだけで別プログラムを再生できる形を目指す。

## v0.2 priority
1. Voice Lab
2. Exercise media slot
3. videoSrc対応
4. muted / playsinline / loop
5. media fallback
6. 音声設定のBODY FLOW本体への読込
7. 後からBGM/SE

## Non-goal for now
- 動画CMS
- 大規模バックエンド
- 認証
- 課金
- AIによる自動動画生成

まずMASAが実際に毎日使えることを最優先する。