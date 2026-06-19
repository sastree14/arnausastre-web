"""Thin client for reading/writing the SC-Analytics Editorial System Google Sheet.

Auth: a Google Cloud service account, whose full JSON key is provided via the
GOOGLE_SHEETS_CREDENTIALS environment variable (never written to disk in git).
"""

from __future__ import annotations

import json
import os
import re
from string import ascii_uppercase
from typing import Any

from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]


class SheetsConfigError(Exception):
    """Raised when required configuration (secrets, sheet structure) is missing or wrong."""


def _col_letter(index: int) -> str:
    """0-indexed column number -> spreadsheet column letter (0 -> A, 25 -> Z, 26 -> AA)."""
    letters = ""
    index += 1
    while index > 0:
        index, remainder = divmod(index - 1, 26)
        letters = ascii_uppercase[remainder] + letters
    return letters


def get_sheets_service():
    raw_credentials = os.environ.get("GOOGLE_SHEETS_CREDENTIALS")
    if not raw_credentials:
        raise SheetsConfigError(
            "Falta el secret GOOGLE_SHEETS_CREDENTIALS. "
            "Crea uno en GitHub (Settings -> Secrets and variables -> Actions) "
            "con el JSON completo de la service account."
        )
    try:
        info = json.loads(raw_credentials)
    except json.JSONDecodeError as exc:
        raise SheetsConfigError(
            "GOOGLE_SHEETS_CREDENTIALS no contiene un JSON valido. "
            "Verifica que pegaste el archivo .json completo de la service account, sin recortar."
        ) from exc

    try:
        credentials = service_account.Credentials.from_service_account_info(info, scopes=SCOPES)
    except ValueError as exc:
        raise SheetsConfigError(
            f"GOOGLE_SHEETS_CREDENTIALS tiene el JSON correcto pero le faltan campos de una service account: {exc}"
        ) from exc

    return build("sheets", "v4", credentials=credentials, cache_discovery=False)


def get_sheet_id() -> str:
    sheet_id = os.environ.get("EDITORIAL_SHEET_ID")
    if not sheet_id:
        raise SheetsConfigError(
            "Falta el secret EDITORIAL_SHEET_ID (el ID de la Google Sheet "
            "'SC-Analytics — Editorial System', tomado de su URL)."
        )
    return sheet_id


def read_tab_as_dicts(service, sheet_id: str, tab_name: str, expected_headers: list[str] | None = None) -> list[dict[str, str]]:
    """Reads a tab and returns each data row as a dict keyed by its header column."""
    try:
        result = (
            service.spreadsheets()
            .values()
            .get(spreadsheetId=sheet_id, range=tab_name)
            .execute()
        )
    except HttpError as exc:
        raise SheetsConfigError(
            f"No se pudo leer la pestaña '{tab_name}' de la Sheet (id={sheet_id}). "
            f"Comprueba que la pestaña existe con ese nombre exacto y que la service account "
            f"tiene acceso. Detalle: {exc}"
        ) from exc

    values = result.get("values", [])
    if not values:
        return []

    headers = values[0]
    if expected_headers is not None and headers != expected_headers:
        raise SheetsConfigError(
            f"La pestaña '{tab_name}' no tiene las columnas esperadas.\n"
            f"  Esperadas: {expected_headers}\n"
            f"  Encontradas: {headers}\n"
            "Alguien debe haber cambiado el encabezado de la hoja — actualiza el mapeo en "
            "el código o restaura las columnas originales."
        )

    rows: list[dict[str, str]] = []
    for raw_row in values[1:]:
        padded = raw_row + [""] * (len(headers) - len(raw_row))
        rows.append({header: padded[i] for i, header in enumerate(headers)})
    return rows


def append_row(service, sheet_id: str, tab_name: str, row_values: list[Any]) -> int:
    """Appends a row and returns its 1-indexed row number (header counts as row 1)."""
    try:
        result = (
            service.spreadsheets()
            .values()
            .append(
                spreadsheetId=sheet_id,
                range=tab_name,
                valueInputOption="USER_ENTERED",
                insertDataOption="INSERT_ROWS",
                body={"values": [row_values]},
            )
            .execute()
        )
    except HttpError as exc:
        raise SheetsConfigError(
            f"No se pudo escribir la nueva fila en la pestaña '{tab_name}'. Detalle: {exc}"
        ) from exc

    updated_range = result.get("updates", {}).get("updatedRange", "")
    match = re.search(r"![A-Z]+(\d+):", updated_range)
    if not match:
        raise SheetsConfigError(
            f"La fila se escribió en '{tab_name}' pero no se pudo determinar su número de fila "
            f"a partir de '{updated_range}'."
        )
    return int(match.group(1))


def update_cell(service, sheet_id: str, tab_name: str, row_number_1indexed: int, column_index_0indexed: int, value: str) -> None:
    """row_number_1indexed counts the header row as row 1 (so first data row is row 2)."""
    cell_range = f"{tab_name}!{_col_letter(column_index_0indexed)}{row_number_1indexed}"
    try:
        service.spreadsheets().values().update(
            spreadsheetId=sheet_id,
            range=cell_range,
            valueInputOption="USER_ENTERED",
            body={"values": [[value]]},
        ).execute()
    except HttpError as exc:
        raise SheetsConfigError(f"No se pudo actualizar la celda {cell_range}. Detalle: {exc}") from exc


def get_tab_headers(service, sheet_id: str, tab_name: str) -> list[str]:
    """Returns the header row of a tab as a list of strings."""
    try:
        result = (
            service.spreadsheets()
            .values()
            .get(spreadsheetId=sheet_id, range=f"{tab_name}!1:1")
            .execute()
        )
    except HttpError as exc:
        raise SheetsConfigError(
            f"No se pudo leer el encabezado de la pestaña '{tab_name}'. Detalle: {exc}"
        ) from exc
    rows = result.get("values", [])
    return rows[0] if rows else []


def append_row_by_headers(service, sheet_id: str, tab_name: str, row_data: dict[str, str]) -> int:
    """Appends a row using column names as keys.

    Reads the sheet's actual header row to determine column positions, then builds
    the row list in the correct order. Columns in row_data that don't exist in the
    sheet are silently skipped with a warning. Columns in the sheet that are not
    in row_data are left empty.

    Returns the 1-indexed row number of the appended row.
    """
    headers = get_tab_headers(service, sheet_id, tab_name)
    if not headers:
        raise SheetsConfigError(
            f"La pestaña '{tab_name}' no tiene fila de encabezado — no se puede añadir la fila."
        )

    row: list[str] = [""] * len(headers)
    for key, value in row_data.items():
        if key in headers:
            row[headers.index(key)] = str(value)
        else:
            print(f"[WARN] Columna '{key}' no encontrada en '{tab_name}' — se omite.")

    try:
        result = (
            service.spreadsheets()
            .values()
            .append(
                spreadsheetId=sheet_id,
                range=tab_name,
                valueInputOption="USER_ENTERED",
                insertDataOption="INSERT_ROWS",
                body={"values": [row]},
            )
            .execute()
        )
    except HttpError as exc:
        raise SheetsConfigError(
            f"No se pudo escribir la nueva fila en la pestaña '{tab_name}'. Detalle: {exc}"
        ) from exc

    updated_range = result.get("updates", {}).get("updatedRange", "")
    match = re.search(r"![A-Z]+(\d+):", updated_range)
    if not match:
        raise SheetsConfigError(
            f"La fila se escribió en '{tab_name}' pero no se pudo determinar su número de fila "
            f"a partir de '{updated_range}'."
        )
    return int(match.group(1))


def update_cells_by_header(
    service,
    sheet_id: str,
    tab_name: str,
    row_number_1indexed: int,
    updates: dict[str, str],
) -> None:
    """Updates specific cells in a row, looking up column positions by header name.

    Columns in `updates` that don't exist in the sheet are skipped with a warning.
    This means adding new columns to the sheet never breaks the pipeline.
    """
    headers = get_tab_headers(service, sheet_id, tab_name)
    for header_name, value in updates.items():
        if header_name not in headers:
            print(f"[WARN] Columna '{header_name}' no encontrada en '{tab_name}' — se omite.")
            continue
        col_index = headers.index(header_name)
        update_cell(service, sheet_id, tab_name, row_number_1indexed, col_index, value)
