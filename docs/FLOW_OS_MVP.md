# 魂命術 Flow OS — MVP Specification

## Purpose

Flow OSは「当たる診断」を目的にしない。

**自分という選手を、人生という競技でどう勝たせるか。**

そのために、自己理解を身体・感情・行動へ変換する共通エンジンを作る。

## Product structure

- **上位概念：魂命術 Flow OS**
  - 一般向け：人生の取扱説明書
  - 競技者向け：闘魂取扱説明書 / 闘魂OS
  - 横断モジュール：Shadow Alchemy / 闇の錬金術

占星術、四柱推命、九星、数秘、MBTI、エニアグラム、五行体質は「答え」ではなく自己観察のレンズとして扱う。

## Core transformation engine

`SEE → NAME → BODY → CONVERT → ACT`

1. **SEE** — 今、何が起きているか観察する
2. **NAME** — 感情・状態に名前をつける
3. **BODY** — 呼吸、視線、足裏、重心など身体に戻る
4. **CONVERT** — 感情の意味を破壊から推進へ変換する
5. **ACT** — 必ず具体的な一動作にする

## Shadow model v1

| Shadow | 暴走時 | 奥にあるもの | Weapon |
| --- | --- | --- | --- |
| 怒り | 攻撃・反発 | 尊厳・境界線 | 突破力 |
| 嫉妬 | 比較・自己否定 | 欲望・可能性 | 方向感覚 |
| 恐怖 | 回避・萎縮 | 安全・生存 | 準備力 |
| 執着 | 依存・支配 | 達成欲・愛着 | 継続力 |
| 孤独 | 閉鎖・諦め | 自律・深さ | 洞察・独自性 |

## Current MVP (`/flow-os/`)

### Inputs

- 呼び名
- 生年月日
- 主戦場（人生 / アスリート / 指導者 / 仕事）
- MBTI（任意）
- 主なShadow
- 身体エネルギー 1–5
- プレッシャー 1–5
- 明晰さ 1–5
- 身体に出るサイン
- 今越えたいもの

### Outputs

1. CORE
2. WINNING PATTERN
3. COLLAPSE PATTERN
4. SHADOW
5. WEAPON
6. RESET
7. NEXT MOVE
8. Shadow Alchemy Protocol

### Calculation / interpretation in MVP

- 生年月日：数字和による1–9の簡易Flow Number（数秘レンズ）
- MBTI：入力された4文字が妥当な場合のみ、自己観察レンズとして利用
- State：Energy / Pressure / Clarityから5状態に分類
  - 回復優先
  - 過覚醒
  - 前進モード
  - 設計モード
  - 調律モード
- Shadow：5分類から変換ルールを返す
- Role：人生 / 競技 / 指導 / 事業ごとに行動プロトコルを変える

**現MVPはブラウザ内完結。入力データをサーバーへ送信・保存しない。**

## Ethics / safety rails

- 占術や性格分類を医学・心理・能力・怪我リスクの診断として断定しない
- 恐怖を煽らない
- 依存させない
- 支配や操作へ使わない
- 本人の尊厳と自己決定を優先する
- Shadowは悪の肯定ではなく、自己観察と建設的な行動変換の材料として扱う

## Phase roadmap

### Phase 0 — DONE in this branch

Static MVP on existing `sunlovesflow-site`.

- `/flow-os/index.html`
- `/flow-os/styles.css`
- `/flow-os/app.js`

目的：まず触れるものを出し、言葉・入力・出力の手触りを検証する。

### Phase 1 — Validation

10–30人で使う。

見る指標は「当たっていたか」だけではなく：

- 自分の状態を言語化できたか
- RESETが実行されたか
- NEXT MOVEが実行されたか
- 24–72時間後に行動変化があったか
- アスリートなら練習・試合で再現できたか

### Phase 2 — Supabase + AI

既存 `sunlovesflow-core` へ接続。

推奨データモデル：

```text
flow_profiles
flow_sessions
flow_inputs
flow_outputs
flow_actions
flow_reflections
flow_lenses
```

役割：

- Profileを継続保存
- 過去セッションとの差分を見る
- Flow CodeをAIで文章化
- NEXT MOVEの実行 / 振り返りを追跡
- 一般版とAthlete版を同じエンジンで分岐

### Phase 3 — Full lens integration

追加候補：

- 西洋占星術
- インド占星術 / ダシャー
- 四柱推命
- 九星気学
- 数秘
- MBTI
- Big Five
- エニアグラム
- 五行体質

重要：レンズ同士の一致数を「真実」としない。

`複数レンズの示唆 → 共通パターン抽出 → 本人の一次情報 → 身体反応 → 行動検証`

という順で扱う。

### Phase 4 — 闘魂OS

Before / During / Afterで競技専用にする。

- BEFORE：覚醒、緊張、ルーティン、身体状態
- DURING：ミス、失点、判定、相手、流れ、立て直し
- AFTER：勝敗、悔しさ、疲労、意味づけ、次戦への変換

最重要KPI候補：

**「崩れてから自分に戻るまでの時間」**

## Product ladder

- Entry：人生の取説ライト / Flow Code
- Middle：Flow OS診断
- Premium：闘魂OS / 個別コーチング

ただし、商品価格より先に「診断 → 実践 → 結果 → 修正」の学習ループを作る。

## North Star

> 光だけで勝つな。闇も整えて、力に変えろ。

Flow OSの価値は、情報量ではなく**変換精度**で決まる。
