# PageIndex local probe

Small, isolated proof-of-concept for testing PageIndex against real SLF PDFs before production adoption.

## What it does

- builds a PageIndex tree for a local text-based PDF
- asks a question against that indexed document
- reuses the returned `doc_id` for later questions
- keeps secrets outside Git

This tool is intentionally separate from the production site.

## Requirements

- Python 3.10+
- an OpenAI API key for PageIndex local mode
- a text-based PDF

For scanned/image-heavy documents, use PageIndex Cloud or another OCR/vision ingestion layer instead of assuming this local probe will parse them correctly.

## Setup

```bash
cd tools/pageindex
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export OPENAI_API_KEY='...'
```

Optional model overrides:

```bash
export PAGEINDEX_INDEX_MODEL='gpt-5.6-luna'
export PAGEINDEX_CHAT_MODEL='gpt-5.6-sol'
export PAGEINDEX_STORAGE_PATH='.pageindex-data'
```

## Index + ask

```bash
python probe.py /path/to/document.pdf \
  --question 'What are the three most important operating principles in this document?'
```

The command prints the `doc_id` followed by the answer.

## Ask an already indexed document

```bash
python probe.py --doc-id '<doc_id>' \
  --question 'Where does the document define the decision criteria?'
```

## Evaluation use

For adoption decisions, do not judge from one impressive question. Build a small question set that includes:

- direct lookup
- cross-section reasoning
- terminology that differs from the source wording
- exact date/name lookup
- intentionally unanswerable questions

Compare PageIndex with the current retrieval path on correctness, citation quality, latency and cost.

## Intended production role

This probe is **not** the production knowledge base.

In SLF, PageIndex should sit behind a query router as a deep retriever for long canonical documents. Supabase/metadata/full-text (and optional semantic retrieval) remain useful for corpus-wide discovery, short fragments and exact lookups.
