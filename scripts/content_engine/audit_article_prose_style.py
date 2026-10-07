from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BANK = ROOT / "content" / "article-bank"

WEAK_BOLD_ENDINGS = {
    "es": {"de","del","la","las","el","los","y","o","en","con","por","para","un","una","que"},
    "ca": {"de","del","la","les","el","els","i","o","en","amb","per","un","una","que"},
    "en": {"of","the","and","or","in","with","by","for","a","an","to","that"},
}

QUESTION_RE = re.compile(r"(?P<sentence>(?:^|(?<=[.!]\s)|(?<=\n))[A-ZÁÉÍÓÚÑÜ][^\n?]{3,220}\?)", re.MULTILINE)
BOLD_RE = re.compile(r"\*\*([^*\n]+)\*\*")


def words(text: str) -> list[str]:
    return re.findall(r"[\wÀ-ÿ'-]+", text or "")


def main() -> int:
    findings: dict[str, list[dict]] = defaultdict(list)

    for path in sorted(BANK.glob("[0-9][0-9][0-9]-*.json")):
        article = json.loads(path.read_text(encoding="utf-8"))
        spec_id = str(article.get("spec_id") or path.stem)

        for lang in ("es","ca","en"):
            variant = (article.get("variants") or {}).get(lang)
            if not isinstance(variant, dict):
                continue
            body = str(variant.get("body") or "")

            if lang == "es":
                for m in QUESTION_RE.finditer(body):
                    sentence = m.group("sentence").strip()
                    if "¿" not in sentence:
                        findings["es_missing_inverted_question"].append({
                            "spec_id": spec_id,
                            "text": sentence,
                        })
                for phrase in ("qué tan ", "cuán "):
                    if phrase in body.lower():
                        findings["es_locale_style"].append({
                            "spec_id": spec_id,
                            "text": phrase.strip(),
                        })

            for m in BOLD_RE.finditer(body):
                phrase = m.group(1).strip()
                toks = words(phrase.lower())
                if toks and toks[-1] in WEAK_BOLD_ENDINGS[lang]:
                    after = re.sub(r"\s+", " ", body[m.end():m.end()+90]).strip()
                    findings["weak_bold_ending"].append({
                        "spec_id": spec_id,
                        "lang": lang,
                        "bold": phrase,
                        "after": after,
                    })

            # Detect adjacent duplicate sentences inside a paragraph.
            for p_idx, paragraph in enumerate(re.split(r"\n\s*\n", body), start=1):
                if not paragraph.strip() or re.fullmatch(r"\*\*[^*\n]+\*\*", paragraph.strip()):
                    continue
                sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", paragraph.strip()) if s.strip()]
                for idx in range(len(sentences)-1):
                    a = set(w.lower() for w in words(sentences[idx]) if len(w) > 3)
                    b = set(w.lower() for w in words(sentences[idx+1]) if len(w) > 3)
                    if not a or not b:
                        continue
                    sim = len(a & b) / len(a | b)
                    if sim >= 0.72:
                        findings["adjacent_sentence_similarity"].append({
                            "spec_id": spec_id,
                            "lang": lang,
                            "paragraph": p_idx,
                            "similarity": round(sim, 2),
                            "a": sentences[idx],
                            "b": sentences[idx+1],
                        })

    summary = {key: len(value) for key, value in findings.items()}
    print(json.dumps({"summary": summary, "findings": findings}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
