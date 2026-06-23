"""Future LinkedIn publishing script — currently dry-run only.

Not wired into any GitHub Actions workflow yet. Intended to be run manually
once LinkedIn approves company API access and the following secrets exist:

  LINKEDIN_MODE              must be "api" for this script to do anything but print
  LINKEDIN_ACCESS_TOKEN
  LINKEDIN_ORGANIZATION_ID
  LINKEDIN_AUTHOR_URN
  LINKEDIN_API_VERSION

No tokens or credentials are hardcoded anywhere in this file — they are only
ever read from the environment.

Usage:
  python scripts/linkedin_pack/publish_linkedin.py --pack content/linkedin/2026-06-23-some-slug.json
  python scripts/linkedin_pack/publish_linkedin.py --pack content/linkedin/2026-06-23-some-slug.json --execute

Without --execute, this only prints what it would do. Even with --execute,
it refuses to do anything unless LINKEDIN_MODE=api and the pack is approved.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

import requests

LINKEDIN_REST_BASE = "https://api.linkedin.com/rest/posts"


class PublishError(Exception):
    pass


def load_pack(pack_path: Path) -> dict:
    if not pack_path.exists():
        raise PublishError(f"No existe el fichero {pack_path}.")
    return json.loads(pack_path.read_text(encoding="utf-8"))


def save_pack(pack_path: Path, pack: dict) -> None:
    pack_path.write_text(json.dumps(pack, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def read_linkedin_env() -> dict:
    return {
        "mode": os.environ.get("LINKEDIN_MODE", "manual"),
        "access_token": os.environ.get("LINKEDIN_ACCESS_TOKEN", ""),
        "organization_id": os.environ.get("LINKEDIN_ORGANIZATION_ID", ""),
        "author_urn": os.environ.get("LINKEDIN_AUTHOR_URN", ""),
        "api_version": os.environ.get("LINKEDIN_API_VERSION", ""),
    }


def build_post_payload(post: dict, author_urn: str, organization_id: str) -> dict:
    """Builds a LinkedIn REST `/rest/posts` payload for a text share.

    Documented publicly at https://learn.microsoft.com/en-us/linkedin/marketing/integrations/community-management/shares/posts-api
    Kept here so the future activation is a config change, not a rewrite.
    """
    return {
        "author": author_urn,
        "commentary": post["text"],
        "visibility": "PUBLIC",
        "distribution": {
            "feedDistribution": "MAIN_FEED",
            "targetEntities": [],
            "thirdPartyDistributionChannels": [],
        },
        "lifecycleState": "PUBLISHED",
        "isReshareDisabledByAuthor": False,
    }


def publish_post_to_linkedin(post: dict, env: dict) -> str:
    """Calls the real LinkedIn API. Only ever invoked when mode=api and --execute is set."""
    headers = {
        "Authorization": f"Bearer {env['access_token']}",
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
        "LinkedIn-Version": env["api_version"],
    }
    payload = build_post_payload(post, env["author_urn"], env["organization_id"])
    response = requests.post(LINKEDIN_REST_BASE, headers=headers, json=payload, timeout=60)
    if response.status_code not in (200, 201):
        raise PublishError(f"LinkedIn API devolvió HTTP {response.status_code}: {response.text[:500]}")
    post_id = response.headers.get("x-restli-id", "")
    return f"https://www.linkedin.com/feed/update/{post_id}" if post_id else ""


def main() -> None:
    parser = argparse.ArgumentParser(description="Publish (or dry-run) a LinkedIn Pack.")
    parser.add_argument("--pack", required=True, help="Path to a content/linkedin/*.json pack file.")
    parser.add_argument("--execute", action="store_true", help="Actually call the LinkedIn API instead of dry-running.")
    args = parser.parse_args()

    pack_path = Path(args.pack)
    try:
        pack = load_pack(pack_path)
    except PublishError as exc:
        print(f"[ERROR] {exc}", file=sys.stderr)
        sys.exit(1)

    if not pack.get("approved"):
        print(f"[BLOCKED] '{pack['campaign_id']}' no está aprobado (approved: false). No se publica nada.")
        sys.exit(1)

    env = read_linkedin_env()
    live_mode = args.execute and pack.get("publish_mode") == "api" and env["mode"] == "api"

    if not live_mode:
        reason = "--execute no usado" if not args.execute else f"publish_mode={pack.get('publish_mode')!r} / LINKEDIN_MODE={env['mode']!r}"
        print(f"[DRY RUN] ({reason}) — ningún post se publicará realmente.")

    changed = False
    for post in pack["posts"]:
        if post.get("published"):
            print(f"  - {post['day']}: ya publicado el {post.get('published_at')}, se omite.")
            continue

        if not live_mode:
            print(f"  - {post['day']}: se publicaría ahora -> {post['title']!r}")
            continue

        missing = [k for k in ("access_token", "organization_id", "author_urn", "api_version") if not env[k]]
        if missing:
            print(f"[ERROR] Faltan variables de entorno LinkedIn: {missing}. Abortando publicación real.", file=sys.stderr)
            sys.exit(1)

        post_url = publish_post_to_linkedin(post, env)
        post["published"] = True
        post["published_at"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        post["linkedin_post_url"] = post_url
        changed = True
        print(f"  - {post['day']}: publicado -> {post_url}")

    if changed:
        save_pack(pack_path, pack)


if __name__ == "__main__":
    main()
