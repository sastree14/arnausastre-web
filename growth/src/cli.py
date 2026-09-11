from __future__ import annotations

import argparse
import json

from .approvals import decide, list_pending
from .brain import validate_brain
from .brief import build_brief
from .config import load_config
from .content import create_content_from_case
from .editorial import editorial_from_url, run_editorial_cycle
from .models import to_dict
from .orchestrator import run_day
from .prospecting import research_companies
from .publishing import publish_all_approved, publish_content
from .storage import get_store
from .strategy import build_weekly_plan


def main() -> None:
    parser = argparse.ArgumentParser(prog="sc-growth")
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("validate")
    sub.add_parser("brief")
    sub.add_parser("run-day")
    sub.add_parser("approvals")
    sub.add_parser("publish-approved")

    sub.add_parser("plan-week")
    p_content = sub.add_parser("content")
    p_content.add_argument("--case", required=True)
    p_content.add_argument("--channel", default="arnau_linkedin")

    p_editorial = sub.add_parser("editorial-run")
    p_editorial.add_argument("--signals", type=int, default=50)
    p_editorial.add_argument("--briefs", type=int, default=3)
    p_editorial.add_argument("--theme", default="")

    p_editorial_url = sub.add_parser("editorial-url")
    p_editorial_url.add_argument("url")
    p_editorial_url.add_argument("--title", default="")
    p_editorial_url.add_argument("--snippet", default="")
    p_editorial_url.add_argument("--no-generate", action="store_true")

    p_prospect = sub.add_parser("prospect")
    p_prospect.add_argument("--mode", choices=["partner", "lead"], default="partner")
    p_prospect.add_argument("--limit", type=int, default=10)

    p_approve = sub.add_parser("decide")
    p_approve.add_argument("approval_id")
    p_approve.add_argument("decision", choices=["approved", "rejected"])

    p_publish = sub.add_parser("publish")
    p_publish.add_argument("content_id")

    args = parser.parse_args()

    if args.command == "validate":
        cfg = load_config()
        files = validate_brain()
        print(json.dumps({"ok": True, "tenant": cfg["company"]["tenant_id"], "brain_files": files}, indent=2))
    elif args.command == "brief":
        print(build_brief())
    elif args.command == "run-day":
        print(json.dumps(run_day(), indent=2, ensure_ascii=False))
    elif args.command == "approvals":
        print(json.dumps(list_pending(), indent=2, ensure_ascii=False))
    elif args.command == "plan-week":
        plan = build_weekly_plan()
        store = get_store()
        payload = to_dict(plan)
        store.upsert("weekly_plans", payload, key="tenant_id,week_start")
        for task in plan.tasks:
            task["tenant_id"] = plan.tenant_id
            store.upsert("tasks", task, key="task_id")
        print(json.dumps(payload, indent=2, ensure_ascii=False))
    elif args.command == "content":
        print(json.dumps(create_content_from_case(args.case, args.channel), indent=2, ensure_ascii=False))
    elif args.command == "editorial-run":
        print(json.dumps(run_editorial_cycle(max_signals=args.signals, max_briefs=args.briefs, theme_hint=args.theme), indent=2, ensure_ascii=False))
    elif args.command == "editorial-url":
        print(json.dumps(editorial_from_url(args.url, title=args.title, snippet=args.snippet, generate=not args.no_generate), indent=2, ensure_ascii=False))
    elif args.command == "prospect":
        print(json.dumps(research_companies(args.mode, args.limit), indent=2, ensure_ascii=False))
    elif args.command == "decide":
        print(json.dumps(decide(args.approval_id, args.decision), indent=2, ensure_ascii=False))
    elif args.command == "publish":
        print(json.dumps(publish_content(args.content_id), indent=2, ensure_ascii=False))
    elif args.command == "publish-approved":
        print(json.dumps(publish_all_approved(), indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
