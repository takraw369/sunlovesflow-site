#!/usr/bin/env python3
"""Minimal PageIndex probe for long, text-based PDFs.

This is intentionally isolated from the production site. It is a benchmark/probe
for deciding when PageIndex should be promoted into the SLF retrieval router.
"""

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

from pageindex import PageIndexClient


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Index a PDF with PageIndex local mode and ask a question."
    )
    parser.add_argument(
        "pdf",
        nargs="?",
        help="Path to a text-based PDF. Omit when --doc-id is provided.",
    )
    parser.add_argument(
        "--doc-id",
        help="Reuse an already indexed PageIndex document ID.",
    )
    parser.add_argument(
        "--question",
        required=True,
        help="Question to ask against the document.",
    )
    return parser


def make_client() -> PageIndexClient:
    if not os.getenv("OPENAI_API_KEY"):
        raise RuntimeError(
            "OPENAI_API_KEY is not set. Export it in your shell; never commit it."
        )

    index_model = os.getenv("PAGEINDEX_INDEX_MODEL", "gpt-5.6-luna")
    chat_model = os.getenv("PAGEINDEX_CHAT_MODEL", "gpt-5.6-sol")
    storage_path = os.getenv("PAGEINDEX_STORAGE_PATH", ".pageindex-data")

    return PageIndexClient(
        index=index_model,
        chat=chat_model,
        storage_path=storage_path,
    )


def resolve_doc_id(client: PageIndexClient, pdf: str | None, doc_id: str | None) -> str:
    if doc_id:
        return doc_id

    if not pdf:
        raise ValueError("Provide a PDF path or --doc-id.")

    path = Path(pdf).expanduser().resolve()
    if not path.exists():
        raise FileNotFoundError(f"PDF not found: {path}")
    if path.suffix.lower() != ".pdf":
        raise ValueError("This probe currently accepts PDF files only.")

    submitted = client.submit_document(str(path))
    indexed_id = submitted.get("doc_id") if isinstance(submitted, dict) else None
    if not indexed_id:
        raise RuntimeError(f"PageIndex did not return a doc_id: {submitted!r}")

    print(f"doc_id={indexed_id}")
    return indexed_id


def main() -> int:
    args = build_parser().parse_args()

    try:
        client = make_client()
        doc_id = resolve_doc_id(client, args.pdf, args.doc_id)
        answer = client.chat(args.question, doc_id=doc_id)
    except Exception as exc:  # CLI boundary: show a concise actionable failure.
        print(f"error: {exc}", file=sys.stderr)
        return 1

    print(answer)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
