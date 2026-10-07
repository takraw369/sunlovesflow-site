# BODY FLOW｜ElevenLabs Voice 01 Audition

## Goal
「可愛いAI声」ではなく、iPhoneスピーカーで聞いても“人間が横にいる”と感じる声を選ぶ。

## First candidates
ElevenLabs Japanese TTS / Eleven v3 で同じ台詞を生成する。

1. Shizuka — Natural and Soft
2. Hinata — Inviting, Smooth and Measured
3. Otani — Inviting, Clear and Measured

## Test script
まさ、散歩おつかれ。
じゃ、ちょっとだけやろっか。
急がなくていいよ。フォームきれいに、あと3回。
うん、いい感じ。肩の力抜いて。30秒だけ休も。
次、お辞儀背中いこっか。
今日はここまで。ちゃんと積み上がったよ。おつかれ。

## Direction
- アニメ声にしない
- ナレーター声にしない
- 接客口調にしない
- 声を作りすぎない
- 近い距離の会話
- 短文
- 息と間を残す
- 語尾を毎回きれいに閉じない
- 過剰に励まさない
- “一緒にやっている”感じ

## Blind scoring
`voice-audition.html` に3音源をA/B/Cで読み込み、候補名を隠して採点する。

重み：
- 人間っぽさ 60%
- 距離感 25%
- 運動中ずっと聞ける 15%

機械感が明確に出た候補は点数に関係なく失格。

## If TTS still sounds synthetic
ElevenLabs Voice Changer（旧Speech-to-Speech）へ移る。

人間が自然に台詞を演じたソース音声を用意し、声だけ女性Voiceへ変換する。元音声の間、呼吸、笑い、ためらい、抑揚を残すことを優先する。

## Production architecture
勝者の音声はAPIで毎回生成せず、短い固定CueはMP3/WAVのVoice Packとして事前生成する。

例：
- start_01.mp3
- work_last3_01.mp3
- rest_30_01.mp3
- next_back_01.mp3
- recovery_01.mp3
- finish_01.mp3

BODY FLOW本体はVoice Packを再生し、通信や生成待ちを避ける。動的な会話が必要になった時だけサーバー側APIを使う。API keyはクライアント、GitHub、Driveへ保存しない。
