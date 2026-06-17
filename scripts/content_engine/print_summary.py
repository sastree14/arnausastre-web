"""Appends a short, readable summary of the run to the GitHub Actions job summary."""

from __future__ import annotations

import json
import os
from pathlib import Path

OUTPUT_JSON_PATH = Path(__file__).resolve().parent / ".pipeline_output.json"


def main() -> None:
    summary_path = os.environ.get("GITHUB_STEP_SUMMARY")

    if not OUTPUT_JSON_PATH.exists():
        text = (
            "No había temas pendientes en Topics Bank, o Topics Bank estaba vacía. "
            "Revisa los logs del paso 'Run research + draft pipeline'.\n"
        )
    else:
        data = json.loads(OUTPUT_JSON_PATH.read_text(encoding="utf-8"))
        lines = [
            "### Resultado",
            f"- **Título:** {data['title_en']} / {data['title_es']}",
            f"- **Industria:** {data['industry']}",
            f"- **Ángulo:** {data['angle']}",
            "- **Fuentes:**",
        ]
        lines += [f"  - {url}" for url in data["sources"]]
        text = "\n".join(lines) + "\n"

    if summary_path:
        with open(summary_path, "a", encoding="utf-8") as f:
            f.write(text)
    else:
        print(text)


if __name__ == "__main__":
    main()
