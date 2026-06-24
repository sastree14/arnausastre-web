"""Appends a short, readable summary of the run to the GitHub Actions job summary."""

from __future__ import annotations

import json
import os
from pathlib import Path

OUTPUT_JSON_PATH = Path(__file__).resolve().parent / ".linkedin_pack_output.json"


def main() -> None:
    summary_path = os.environ.get("GITHUB_STEP_SUMMARY")

    if not OUTPUT_JSON_PATH.exists():
        text = (
            "No se generó ningún LinkedIn Pack en esta ejecución — o no había artículos "
            "publicados pendientes sin pack (mode=auto), o el paso de generación falló. "
            "Revisa los logs del paso 'Generate LinkedIn pack'.\n"
        )
    else:
        data = json.loads(OUTPUT_JSON_PATH.read_text(encoding="utf-8"))
        lines = [
            "### Resultado",
            f"- **Campaign:** {data['campaign_id']}",
            f"- **Industria:** {data['industry']}",
            f"- **Tema:** {data['theme']}",
            f"- **Modo de publicación:** {data['publish_mode']}",
            "- **Posts:**",
        ]
        lines += [f"  - {p['day']} ({p['publish_date']}): {p['title']}" for p in data["posts"]]
        text = "\n".join(lines) + "\n"

    if summary_path:
        with open(summary_path, "a", encoding="utf-8") as f:
            f.write(text)
    else:
        print(text)


if __name__ == "__main__":
    main()
