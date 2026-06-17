"""Small follow-up script: patches the 'GitHub Status' cell of a Content Pipeline
row once the Pull Request actually exists (its number isn't known until after
run_pipeline.py has already written the row).

Usage: python update_pipeline_status.py <row_number> <pr_number>
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import sheets_client
from run_pipeline import CONTENT_PIPELINE_HEADERS, CONTENT_PIPELINE_TAB

GITHUB_STATUS_COLUMN_INDEX = CONTENT_PIPELINE_HEADERS.index("GitHub Status")


def main() -> None:
    if len(sys.argv) != 3:
        print("Uso: python update_pipeline_status.py <row_number> <pr_number>", file=sys.stderr)
        sys.exit(1)

    row_number = int(sys.argv[1])
    pr_number = sys.argv[2]

    try:
        service = sheets_client.get_sheets_service()
        sheet_id = sheets_client.get_sheet_id()
        sheets_client.update_cell(
            service, sheet_id, CONTENT_PIPELINE_TAB, row_number, GITHUB_STATUS_COLUMN_INDEX, f"PR open #{pr_number}"
        )
    except sheets_client.SheetsConfigError as exc:
        print(f"[ERROR] {exc}", file=sys.stderr)
        sys.exit(1)

    print(f"[OK] Fila {row_number} actualizada: GitHub Status = 'PR open #{pr_number}'")


if __name__ == "__main__":
    main()
