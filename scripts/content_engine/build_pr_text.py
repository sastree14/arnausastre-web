"""Builds pr_title.txt and pr_body.md from .pipeline_output.json.

Used by the GitHub Actions step that runs `gh pr create`.
Kept as its own script to avoid heredoc indentation issues in the workflow YAML.
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

    body = f"""## New article draft

**Industry:** {data['industry']}
**Challenge:** {data.get('challenge', '—')}
**Audience:** {data.get('audience', '—')}
**Theme:** {data['theme']}
**Angle:** {data['angle']}

**Excerpt (EN):** {data['excerpt_en']}
**Excerpt (ES):** {data['excerpt_es']}

**MDX file:** `content/articles/{data['slug']}.mdx`
**Status:** Draft — `published: false`. Set to `true` before merging to publish.

### Research sources
{sources_block}

---

### Review checklist

- [ ] Tone matches editorial voice (calm, analytical, no buzzwords)
- [ ] Title follows the article structure patterns
- [ ] Excerpt is direct and specific
- [ ] Body sections start with **bold** subtitles
- [ ] No AI-generated filler phrases
- [ ] Challenge and Audience classification are correct
- [ ] Sources are credible and used appropriately
- [ ] Set `published: true` in the MDX frontmatter before merging

> This article will not appear on the site until `published: true` is set and this PR is merged to main.
"""

    PR_TITLE_PATH.write_text(f"content: {data['title_en']}", encoding="utf-8")
    PR_BODY_PATH.write_text(body, encoding="utf-8")


if __name__ == "__main__":
    main()
