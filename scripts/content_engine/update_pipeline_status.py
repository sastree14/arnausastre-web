"""Patches Content Pipeline sheet fields once the Pull Request exists.

The PR number and URL are only available after run_pipeline.py has already
written the row, so this runs as a separate step in the workflow.

Usage:
  python update_pipeline_status.py <row_number> <pr_number> <pr_url>

Fields updated:
  GitHub Status  → "PR open #<pr_number>"
  Draft Doc URL  → GitHub PR URL (editors click this to access the review + Vercel preview)
  Branch         → "editorial"
  Published      → "No"  (explicit confirmation it is still a draft)
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import sheets_client

CONTENT_PIPELINE_TAB = "Content Pipeline"


def main() -> None:
    if len(sys.argv) < 3:
        print(
            "Uso: python update_pipeline_status.py <row_number> <pr_number> [pr_url]",
            file=sys.stderr,
        )
        sys.exit(1)

    row_number = int(sys.argv[1])
    pr_number = sys.argv[2]
    pr_url = sys.argv[3] if len(sys.argv) > 3 else ""

    updates: dict[str, str] = {
        "GitHub Status": f"PR open #{pr_number}",
        "Branch": "editorial",
        "Published": "No",
    }
    if pr_url:
        updates["Draft Doc URL"] = pr_url

    try:
        service = sheets_client.get_sheets_service()
        sheet_id = sheets_client.get_sheet_id()
        sheets_client.update_cells_by_header(
            service, sheet_id, CONTENT_PIPELINE_TAB, row_number, updates
        )
    except sheets_client.SheetsConfigError as exc:
        print(f"[ERROR] {exc}", file=sys.stderr)
        sys.exit(1)

    print(f"[OK] Fila {row_number} actualizada:")
    for field, value in updates.items():
        print(f"  {field} = {value!r}")


if __name__ == "__main__":
    main()
