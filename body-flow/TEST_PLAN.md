# BODY FLOW v0.1 — iPhone Test Plan

## Gate
Do not merge or deploy to production until the MASA iPhone smoke test passes.

## Device target
- iPhone / Safari first
- Portrait orientation
- Sound on

## Smoke test
1. Open `/body-flow/`.
2. Tap `声を試す` and confirm Japanese speech plays.
3. Change SWEET / ATHLETE / RECOVERY / PLAYFUL and confirm the tone/rate changes.
4. Toggle `今日はアイタン勤務日` ON and confirm RECOVERY becomes selected.
5. Turn the toggle OFF and confirm the normal suggested routine returns.
6. Tap `MAHRU散歩おわった → START`.
7. Confirm the opening voice plays from the tap and the first exercise starts afterward.
8. Confirm WORK timer counts down and automatically enters REST.
9. Confirm `あと10秒` is spoken once near the end of a phase.
10. Confirm REST automatically advances to the next exercise.
11. Tap pause, wait, and resume; confirm the remaining time is preserved.
12. Leave Safari during a session and return; confirm the session is auto-paused rather than drifting.
13. Resume and confirm the timer continues from the preserved remaining time.
14. Confirm the screen stays awake when Screen Wake Lock is available.
15. Tap `今日はここまで`; confirm the 30-second log appears.
16. Save a log and reload the page; confirm history remains on the same device.
17. Confirm existing site routes are unchanged.

## Voice tuning notes
Record only subjective feedback, no secrets.
- Voice name used:
- SWEET pitch: too high / good / too low
- Speaking speed: too fast / good / too slow
- Opening line: motivating / neutral / annoying
- Rest line frequency: too much / good / too little
- Preferred mode:

## Training tuning notes
- Push-up target time:
- Pike push-up target time:
- Ojigi-back target time:
- Rest interval:
- Any pain/discomfort:

## Current known constraints
- v0.1 uses device Web Speech voices; voice quality depends on installed iOS voices.
- Wake Lock is best-effort and can be released when the page loses visibility.
- v0.1 keeps logs in localStorage only; clearing site data removes them.
- No production publish, auth, Supabase, HealthKit, external TTS, or secrets in this PR.
