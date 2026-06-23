"""Builds pr_title.txt and pr_body.md from .linkedin_pack_output.json.

Used by the GitHub Actions step that runs `gh pr create`.
Kept as its own script to avoid heredoc indentation issues in the workflow YAML.
"""

from __future__ import annotations

import json
from pathlib import Path

OUTPUT_JSON_PATH = Path(__file__).resolve().parent / ".linkedin_pack_output.json"
PR_TITLE_PATH = Path("pr_title.txt")
PR_BODY_PATH = Path("pr_body.md")


def main() -> None:
    data = json.loads(OUTPUT_JSON_PATH.read_text(encoding="utf-8"))
    posts_block = "\n".join(f"- **{p['day'].capitalize()}** ({p['publish_date']}): {p['title']}" for p in data["posts"])

    body = f"""## New LinkedIn Pack

**Source article:** [{data['source_article_slug']}]({data['source_article_url']})
**Industry:** {data['industry']}
**Theme:** {data['theme']}
**Language:** {data['language']}
**Publish mode:** {data['publish_mode']}

**JSON file:** `{data['json_path']}`
**Status:** `ready_for_review` — `approved: false`. Nothing publishes until this is reviewed and `approved` is set to `true`.

### Posts in this pack
{posts_block}

---

### Review checklist

- [ ] Tone matches SC-Analytics positioning (sober, technical, no AI buzz)
- [ ] No invented data, statistics or client examples
- [ ] Wednesday's numbers are clearly illustrative, not presented as real figures
- [ ] Hashtags are relevant (3-5 per post)
- [ ] Friday's post links correctly to the source article
- [ ] Set `approved: true` in the JSON before this pack can ever be published

> This pack does not publish anything automatically. `publish_mode: manual` means
> posts are meant to be copied into LinkedIn by hand. `publish_mode: api` is
> reserved for when LinkedIn API access is approved — see scripts/linkedin_pack/publish_linkedin.py.
"""

    PR_TITLE_PATH.write_text(f"linkedin: weekly pack — {data['campaign_id']}", encoding="utf-8")
    PR_BODY_PATH.write_text(body, encoding="utf-8")


if __name__ == "__main__":
    main()
