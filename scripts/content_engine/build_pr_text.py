"""Builds pr_title.txt and pr_body.md from .pipeline_output.json, for the
GitHub Actions step that runs `gh pr create`. Kept as its own script instead
of an inline heredoc in the workflow YAML, to avoid indentation issues.
"""

from __future__ import annotations

import json
from pathlib import Path

OUTPUT_JSON_PATH = Path(__file__).resolve().parent / ".pipeline_output.json"
PR_TITLE_PATH = Path("pr_title.txt")
PR_BODY_PATH = Path("pr_body.md")


def main() -> None:
    data = json.loads(OUTPUT_JSON_PATH.read_text(encoding="utf-8"))
    sources_block = "\n".join(f"- {url}" for url in data["sources"])

    body = f"""## Borrador generado automáticamente

**Industria:** {data['industry']}
**Tema:** {data['theme']}
**Ángulo:** {data['angle']}

**Excerpt (EN):** {data['excerpt_en']}
**Excerpt (ES):** {data['excerpt_es']}

### Fuentes investigadas
{sources_block}

---
Revisa el contenido (precision, tono, fuentes) antes de hacer merge. Este articulo
no se ha publicado todavia, solo esta insertado en `lib/articles.ts` en esta rama.
"""

    PR_TITLE_PATH.write_text(f"New article: {data['title_en']}", encoding="utf-8")
    PR_BODY_PATH.write_text(body, encoding="utf-8")


if __name__ == "__main__":
    main()
