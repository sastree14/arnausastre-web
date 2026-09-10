from __future__ import annotations

import argparse
import json

from .approvals import decide, list_pending
from .brain import validate_brain
from .brief import build_brief
from .config import load_config
from .content import create_content_from_case
from .models import to_dict
from .orchestrator import run_day
from .prospecting import research_companies
from .storage import get_store
from .strategy import build_weekly_plan


def main() -> None:
    parser = argparse.ArgumentParser(prog="sc-growth")
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("validate")
    sub.add_parser("brief")
    sub.add_parser("run-day")
    sub.add_parser("approvals")

    p_plan = sub.add_parser("plan-week")
    p_content = sub.add_parser("content")
    p_content.add_argument("--case", required=True)
    p_content.add_argument("--channel", default="arnau_linkedin")

    p_prospect = sub.add_parser("prospect")
    p_prospect.add_argument("--mode", choices=["partner", "lead"], default="partner")
    p_prospect.add_argument("--limit", type=int, default=10)

    p_approve = sub.add_parser("decide")
    p_approve.add_argument("approval_id")
    p_approve.add_argument("decision", choices=["approved", "rejected"])

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
        store.upsert("weekly_plans", payload, key="week_start")
        for task in plan.tasks:
            store.upsert("tasks", task, key="task_id")
        print(json.dumps(payload, indent=2, ensure_ascii=False))
    elif args.command == "content":
        print(json.dumps(create_content_from_case(args.case, args.channel), indent=2, ensure_ascii=False))
    elif args.command == "prospect":
        print(json.dumps(research_companies(args.mode, args.limit), indent=2, ensure_ascii=False))
    elif args.command == "decide":
        print(json.dumps(decide(args.approval_id, args.decision), indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
