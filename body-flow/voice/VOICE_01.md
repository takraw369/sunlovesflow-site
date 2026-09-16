# BODY FLOW — VOICE 01

## Goal
AIっぽくない。可愛いを作りにいかない。最優先は「本当に人が横で話している」に聞こえること。

## Current casting decision
Top candidate: **ElevenLabs Voice Library / Iroha / Young Female** — user-selected on 2026-09-10 after listening in ElevenLabs.

Important: do not lock production to the display name `Iroha` alone. ElevenLabs Voice Library voices can be discovered/added from a large library, so the production identity must be pinned by the exact ElevenLabs Voice ID once captured from the selected voice page/account. Until that ID is recorded, casting status remains `candidate-selected-id-pending`.

## Provider strategy
Primary: ElevenLabs.
Primary casting path: user-selected Voice Library voice `Iroha / Young Female`.
Quality generation: Eleven v3 for pre-generated core cues.
Humanity fallback: ElevenLabs Voice Changer / speech-to-speech if text-to-speech still feels synthetic.
Fallback provider for separate audition: Gemini 3.1 Flash TTS.

## Voice identity
- Young adult Japanese woman
- Natural Japanese first; cuteness is secondary
- Close conversational distance, as if nearby during training
- Warm, relaxed, lightly playful
- No announcer / customer-service / anime / idol performance
- Short phrases, natural pauses, uneven human timing
- Encourages without overpraising
- Countdowns can be crisp but must remain the same person

## Iroha acceptance test
Use the exact same short lines first. No exaggerated style tags on the first pass.

### START
まさ、散歩おつかれ。じゃ、ちょっとだけやろっか。

### WORK
急がなくていいよ。フォームきれいに、あと三回。

### REST
うん、いい感じ。肩の力抜いて。三十秒だけ休も。

### NEXT
次、お辞儀背中いこっか。

### FINISH
今日はここまで。ちゃんと積み上がったよ。おつかれ。

## Reject immediately if
- 1秒でAI音声だと分かる
- 日本語のアクセントが不自然
- 文末が毎回同じ抑揚
- 読み上げ／ナレーション感がある
- アニメ声・声優芝居・接客声に寄る
- 可愛さを作りすぎている
- 「まさ」が不自然
- 数字カウントで人格が変わる

## Second pass only after human-first pass succeeds
If Iroha passes the human gate, add subtle performance variation only where useful:
- tiny smile
- relaxed exhale before rest cue
- slightly brighter NEXT cue
- crisp COUNT cue

Do not add theatrical giggles, whisper tags, exaggerated breath, or heart-mark acting by default.

## Speech-to-Speech escalation
If Iroha TTS still reveals synthetic timing, do not keep tuning pitch/rate indefinitely. Record a natural human performance of the cue and use ElevenLabs Voice Changer to preserve the human timing, pauses, breath and emphasis while transforming the voice. This is the preferred path when the hard requirement is “computer感ゼロ”.

## Core cue pack
Generate each cue as a separate audio asset after the exact Voice ID is pinned and casting is approved.

- START → `/body-flow/media/voice/voice01/start.mp3`
- WORK_START → `/body-flow/media/voice/voice01/work-start.mp3`
- COUNT_3 → `/body-flow/media/voice/voice01/count-3.mp3`
- REST → `/body-flow/media/voice/voice01/rest.mp3`
- NEXT → `/body-flow/media/voice/voice01/next.mp3`
- RECOVERY → `/body-flow/media/voice/voice01/recovery.mp3`
- FINISH → `/body-flow/media/voice/voice01/finish.mp3`

## Production rule
Core cues are pre-generated and cached/static so playback is instant and consistent. Realtime generation is reserved for personalized/dynamic comments later. Never expose API keys in browser code, GitHub, Drive, or chat.
