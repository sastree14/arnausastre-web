from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BANK = ROOT / "content" / "article-bank"
LANGUAGES = ("es", "ca", "en")
# Editorial pass: preserve meaning while consolidating fragmented prose into article paragraphs.
WORD_RE = re.compile(r"\b[\wÀ-ÿ'-]+\b")
HEADING_RE = re.compile(r"^\*\*[^*\n]+\*\*$")


def words(text: str) -> int:
    return len(WORD_RE.findall(text or ""))


def structured(block: str) -> bool:
    lines = [line.strip() for line in block.splitlines() if line.strip()]
    if not lines:
        return False
    if all(line.startswith("|") for line in lines):
        return True
    if all(re.match(r"^[-*]\s+", line) for line in lines):
        return True
    if all(re.match(r"^\d+\.\s+", line) for line in lines):
        return True
    return False


def compact_run(blocks: list[str]) -> list[str]:
    out: list[str] = []
    buffer: list[str] = []
    buffer_words = 0

    def flush() -> None:
        nonlocal buffer, buffer_words
        if buffer:
            out.append(" ".join(part.strip() for part in buffer if part.strip()))
        buffer = []
        buffer_words = 0

    for block in blocks:
        clean = block.strip()
        if not clean:
            continue
        if structured(clean):
            flush()
            out.append(clean)
            continue

        count = words(clean)
        if buffer and buffer_words >= 55 and buffer_words + count > 110:
            flush()

        buffer.append(clean)
        buffer_words += count

        if buffer_words >= 80:
            flush()

    flush()

    # Avoid orphan one-line prose at the end of a section. If a final short
    # paragraph can be absorbed without creating an oversized paragraph, merge
    # it back into the preceding idea. Lists/tables never enter this run.
    if len(out) >= 2 and words(out[-1]) < 25 and words(out[-2]) + words(out[-1]) <= 150:
        out[-2] = f"{out[-2]} {out[-1]}".strip()
        out.pop()

    # The same rule applies to a short opening fragment inside a section.
    if len(out) >= 2 and words(out[0]) < 25 and words(out[0]) + words(out[1]) <= 150:
        out[1] = f"{out[0]} {out[1]}".strip()
        out.pop(0)

    return out


def polish_body(body: str) -> str:
    # Canonical files sometimes place a bold section heading directly above
    # its first paragraph with only one newline. Isolate those headings before
    # paragraph consolidation so editorial structure can never be swallowed.
    prepared = re.sub(r"(?m)^(\*\*[^*\n]+\*\*)\s*$", r"\n\n\1\n\n", body or "")
    blocks = [part.strip() for part in re.split(r"\n\s*\n", prepared) if part.strip()]
    if not blocks:
        return body

    result: list[str] = []
    prose_run: list[str] = []

    def flush_run() -> None:
        nonlocal prose_run
        if prose_run:
            result.extend(compact_run(prose_run))
            prose_run = []

    for block in blocks:
        if HEADING_RE.fullmatch(block):
            flush_run()
            result.append(block)
        else:
            prose_run.append(block)

    flush_run()
    return "\n\n".join(result).strip()


def main() -> int:
    files = sorted(BANK.glob("[0-9][0-9][0-9]-*.json"))
    changed = 0
    variants_changed = 0

    for path in files:
        article = json.loads(path.read_text(encoding="utf-8"))
        touched = False

        for language in LANGUAGES:
            variant = (article.get("variants") or {}).get(language)
            if not isinstance(variant, dict):
                continue
            body = str(variant.get("body") or "")
            polished = polish_body(body)
            if polished != body:
                variant["body"] = polished
                touched = True
                variants_changed += 1

        if touched:
            path.write_text(
                json.dumps(article, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
            changed += 1

    print(json.dumps({
        "files_seen": len(files),
        "files_changed": changed,
        "variants_changed": variants_changed,
    }, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
