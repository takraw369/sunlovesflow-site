# PageIndex Hybrid RAG — SLF adoption decision

Status: **experimental / adopt behind a routing layer**

Date: 2026-09-30

## Decision

Do **not** replace Supabase / keyword / vector retrieval wholesale.

Adopt PageIndex as a **deep-reading second-stage retriever** for long, structured, canonical documents where section hierarchy and cross-section reasoning matter.

The intended SLF retrieval flow is:

1. **Corpus registry / source-of-truth metadata**
   - Keep document identity, canonical source, timestamps, permissions, status and sync state in the existing Knowledge Layer / Supabase metadata layer.
2. **Document routing / shortlist**
   - Use deterministic metadata filters first.
   - Use full-text / keyword retrieval for exact names, dates, IDs and phrases.
   - Keep semantic/vector retrieval as an optional coarse document-level fallback for heterogeneous corpora.
3. **Deep retrieval with PageIndex**
   - For long PDFs or structured manuals/reports, build/reuse a PageIndex tree and let the model reason through sections rather than retrieving arbitrary chunks.
4. **Answer synthesis**
   - Return the answer with document + page/section citations.
   - If PageIndex confidence/evidence is insufficient, fall back to conventional retrieval rather than forcing a tree answer.

This is a **hybrid retrieval architecture**, not a vectorless ideology.

## Why this fits SLF

SLF has two different knowledge shapes that should not be forced through one retriever:

### A. Long canonical assets
Examples: constitutions, project specifications, training manuals, research PDFs, policy/reference documents, long educational material.

Best first choice: **PageIndex**

Reason: structure, hierarchy, page traceability and reasoning over sections are more important than nearest-neighbour text similarity.

### B. Fragmented / fast-moving knowledge
Examples: short notes, X captures, snippets, ideas, status updates, task receipts, small Drive docs, records where exact dates/names matter.

Best first choice: **metadata + full-text**, with optional semantic/vector retrieval.

Reason: a tree index is not naturally superior for thousands of tiny, weakly structured fragments.

## Routing policy

Use PageIndex when most of these are true:

- document is long (roughly 30–50+ pages or equivalent)
- headings/sections carry meaning
- question may require navigating multiple sections
- page-level traceability is valuable
- source is relatively stable / canonical
- user asks “what does this document say?” rather than “which item in the whole corpus mentions X?”

Prefer metadata / full-text / semantic retrieval when most of these are true:

- many short documents or snippets
- frequent updates
- exact phrase / entity / date lookup
- corpus-wide discovery across unrelated topics
- source structure is weak or missing
- latency must be minimal

## SLF target architecture

```text
User / Agent query
        |
        v
Query Router
  | exact/date/entity? ------> metadata + FTS
  | corpus discovery? -------> metadata + FTS + optional semantic shortlist
  | long canonical doc? -----> PageIndex tree search
        |                         |
        +-----------+-------------+
                    v
            Evidence bundle
       (source, page, section, text)
                    |
                    v
             Answer / Action
                    |
                    v
          Retrieval receipt/log
```

## Storage boundary

PageIndex should not become the source of truth.

- **Drive**: authored/canonical knowledge documents when Drive is the canonical owner.
- **GitHub**: implementation and architecture.
- **Supabase**: application metadata, document registry, sync state, permissions, receipts, optional FTS/vector shortlist.
- **PageIndex index**: derived retrieval artifact. Rebuildable from the canonical source.

Recommended document registry fields (future):

```text
source_id
source_type
canonical_uri
content_hash
updated_at
retrieval_mode       # pageindex | fts | semantic | hybrid
pageindex_doc_id      # nullable
pageindex_index_hash  # nullable
index_status
index_version
sensitivity
last_verified_at
```

## Rollout gate

Do not promote PageIndex to default merely because a public benchmark is strong.

Run a small SLF evaluation set first:

- 3–5 representative long documents
- 20–50 real questions
- compare:
  - answer correctness
  - evidence/page correctness
  - missed retrievals
  - latency
  - token/API cost
  - failure modes

Promotion rule:

- PageIndex wins or ties on correctness/evidence for long canonical docs
- no material citation regressions
- cost/latency remains acceptable
- conventional fallback stays available

## Current implementation in this repository

`tools/pageindex/` contains a local proof-of-concept runner.

It intentionally:

- does not commit API keys
- does not alter production routing
- does not remove existing retrieval options
- stores derived indexes outside the canonical source
- can be used to benchmark a real PDF before deeper integration

## Next integration step

Once the SLF app-side Knowledge Layer / Supabase document registry is available in the same workspace, connect the router to the registry and persist PageIndex document/index IDs there.

The desired end state is **retrieval-by-fit**:

> exact things are found exactly; broad things are discovered broadly; long documents are read structurally; the final answer carries evidence.
