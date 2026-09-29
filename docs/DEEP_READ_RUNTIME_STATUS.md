# Deep Read Runtime Status

Last verified: 2026-09-30 JST

## Production state

Supabase project: `sunlovesflow-core` (`qydbtholbwbuwiswmqsr`)

Active Edge Functions:

- `knowledge-deep-index` — production version 3
- `knowledge-ask-v3` — production version 2 / API response version `3.1`

The runtime is intentionally hybrid:

1. `knowledge_fabric_search_v2` discovers the best source across the corpus.
2. Short/exact queries remain on the standard retrieval lane.
3. Long structured documents or document/section-specific queries can route to Deep Read.
4. Deep Read currently uses provider `reasoning_tree` and preserves a provider contract for future `pageindex_cloud` / `pageindex_local` promotion.
5. Deep indexes are derived artifacts. Canonical source text remains in `knowledge_canonical_snapshots`.
6. Every retrieval records a receipt and feedback event.

## Why this is not a wholesale vector-RAG replacement

Deep Read is strongest after the corpus has already identified the likely document. Corpus discovery, exact lookup, metadata filters and graph traversal remain useful. The router therefore chooses the least expensive retrieval lane that preserves grounding.

## Live evaluation result

Test source: `ミライエット講師専用_言葉の教科書.pdf`.

The current test snapshot is a partial PDF text fixture, not the full 38-page canonical text. It contains 4,619 characters and currently covers roughly the first 11 pages. Do not treat this fixture as a complete source.

The indexer evolved during live testing:

- v1: 32 flat nodes; TOC headings were incorrectly treated as real sections.
- v2: 9 nodes; TOC noise removed and duplicates collapsed.
- v3: 6 top-level chapter nodes with nested numbered subheadings.

Current v3 hierarchy includes:

- 第1章 はじめに
- 第2章 ミライエット講師として一番大切な考え方
- 第3章 クライアントとの信頼関係の作り方
- 第4章 ミライエットらしい言葉とは
  - 1. 指示しない
  - 2. 決めつけない
  - 3. 責めない
  - 4. 選択肢を渡す
  - 5. クライアントが決る
- 第5章 言ってはいけない言葉（NG 辞典）
- 第6章 言い換え辞典

A live query asking how the manual explains giving choices without blaming the client routed `auto -> deep` and selected both Chapter 4 and Chapter 6. A short exact query `言霊とは何？` routed `auto -> standard`.

## Improvements discovered through use

### 1. Service-role table access

RLS bypass alone was insufficient because explicit table privileges were missing for canonical snapshots. Minimal service-role permissions were added for the Deep Read runtime.

### 2. TOC filtering

Dense chapter headings on a single page and explicit `目次` markers are treated as TOC noise. Later body headings are preserved.

### 3. Hierarchical sections

Numbered subheadings no longer truncate chapter bodies. They are nested under their parent chapter.

### 4. Japanese exact-phrase retrieval

`knowledge_fabric_search_v2` now gives strong weight to title/alias phrases literally contained in a Japanese question. This fixed cases where a grounded but unrelated document could outrank an exact entity match.

### 5. Optional LLM navigation

The Edge runtime currently has no `OPENAI_API_KEY`. Therefore the system uses deterministic Japanese tree navigation and returns grounded source sections. If a server-side LLM key is configured later, `knowledge-ask-v3` can promote tree selection and answer synthesis to the LLM path without changing the retrieval contract.

## Security posture

- `knowledge_deep_indexes` has RLS enabled.
- No public read policy is defined for the table.
- Direct anon/authenticated access is revoked.
- The Deep Read usage counter RPC is executable by `service_role` only.
- Owner authentication remains required at the Edge layer.
- No API keys are committed to GitHub.

Supabase's project-wide security advisor reports pre-existing warnings across many public SECURITY DEFINER functions. They are broader than this Deep Read change and should be addressed as a separate security-hardening project rather than silently changing unrelated application contracts.

## Current limitations

1. Official PageIndex Cloud/local is **not** connected in production yet. Current live provider is `reasoning_tree`.
2. The test PDF snapshot is partial. The canonical Drive -> snapshot path must provide the full text before a full-document quality judgment is meaningful.
3. Server-side answer synthesis is disabled until an LLM key is intentionally configured. Grounded retrieval is active now.
4. Automatic periodic indexing was intentionally not wired through a database cron because that would require carrying the owner credential through a scheduled SQL/network path. Indexing stays on an explicit authenticated path until a dedicated internal service credential is designed.

## Promotion gate for official PageIndex

Promote `pageindex_local` or `pageindex_cloud` above `reasoning_tree` only after representative SLF documents show a measurable gain in grounded section selection / answer correctness without unacceptable latency or cost. The provider preference in `knowledge-ask-v3` is already: `pageindex_cloud > pageindex_local > reasoning_tree` when a ready index exists.