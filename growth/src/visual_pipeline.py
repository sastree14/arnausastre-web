from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from PIL import Image

from .assets import get_asset_store
from .config import load_config
from .llm import get_llm
from .models import new_id
from .presentation import build_presentation_package
from .storage import get_store
from .visual_critic import critique_render
from .visual_format_planner import recommend_visual_formats
from .visual_planner import plan_visual_candidates
from .visual_qa import hard_qa
from .visual_renderer_v2 import render_visual_spec

VISUAL_SYSTEM_VERSION = "sc_visual_v1"


def _now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _tenant_id() -> str:
    return str(load_config()["company"]["tenant_id"])


def _persist_canonical_content(store: Any, content_object: dict[str, Any], tenant_id: str, content_object_id: str) -> None:
    now = _now()
    row = {
        "content_object_id": content_object_id,
        "tenant_id": tenant_id,
        "status": str(content_object.get("status") or "draft"),
        "origin": str(content_object.get("origin") or "manual_idea"),
        "editorial_pillar": str(content_object.get("editorial_pillar") or "consulting_decision_insights"),
        "content_family": str(content_object.get("content_family") or "explain_understand"),
        "angle": str(content_object.get("angle") or ""),
        "topic_entities": content_object.get("topic_entities") if isinstance(content_object.get("topic_entities"), list) else [],
        "business_problem": str(content_object.get("business_problem") or ""),
        "business_question": str(content_object.get("business_question") or ""),
        "thesis": str(content_object.get("thesis") or ""),
        "key_points": content_object.get("key_points") if isinstance(content_object.get("key_points"), list) else [],
        "commercial_spine": content_object.get("commercial_spine") if isinstance(content_object.get("commercial_spine"), dict) else {},
        "evidence": content_object.get("evidence") if isinstance(content_object.get("evidence"), dict) else {},
        "primary_objective": str(content_object.get("primary_objective") or "authority"),
        "secondary_objectives": content_object.get("secondary_objectives") if isinstance(content_object.get("secondary_objectives"), list) else [],
        "practical_takeaway": str(content_object.get("practical_takeaway") or ""),
        "desired_reader_action": str(content_object.get("desired_reader_action") or "understand_concept"),
        "target_audience": content_object.get("target_audience") if isinstance(content_object.get("target_audience"), list) else [],
        "industry_context": content_object.get("industry_context") if isinstance(content_object.get("industry_context"), list) else [],
        "funnel_stage": str(content_object.get("funnel_stage") or "awareness"),
        "timeliness": str(content_object.get("timeliness") or "evergreen"),
        "why_now": str(content_object.get("why_now") or ""),
        "valid_until": content_object.get("valid_until"),
        "confidentiality": str(content_object.get("confidentiality") or "public"),
        "language_context": content_object.get("language_context") if isinstance(content_object.get("language_context"), list) else [],
        "risks_or_limits": content_object.get("risks_or_limits") if isinstance(content_object.get("risks_or_limits"), list) else [],
        "output_hints": content_object.get("output_hints") if isinstance(content_object.get("output_hints"), dict) else {},
        "payload": {**content_object, "content_object_id": content_object_id},
        "created_at": str(content_object.get("created_at") or now),
        "updated_at": now,
    }
    store.upsert("canonical_content_objects", row, "content_object_id")


def _clip(value: str, limit: int) -> str:
    value = str(value or "").strip()
    if len(value) <= limit:
        return value
    return value[: max(1, limit - 1)].rstrip(" ,.;:-") + "…"


def _compact_content(content: dict[str, Any]) -> dict[str, Any]:
    """Compact visual-only copy without changing factual payloads or evidence."""
    try:
        result = get_llm(high_reasoning=True).json(
            "You are the SC-Analytics visual copy editor. Compact copy only. Preserve facts, numbers, direction, caveats and meaning. Do not add claims. Return JSON only.",
            f"""Shorten only visible visual copy so it fits an executive 1080×1350 asset.
Do not remove evidence, alter metrics or invent information.
Keep the same JSON structure and keys.
Priorities:
- titles: concise, usually <= 70 characters;
- context/subtitle: <= 150 characters;
- node/card labels: <= 42 characters where possible;
- takeaways: <= 180 characters.

CONTENT:
{content}
""",
        )
        if isinstance(result, dict):
            return result
    except Exception:
        pass

    out = deepcopy(content)
    for key, limit in {"title":70,"headline":70,"context":150,"subtitle":150,"takeaway":180,"transformation_takeaway":180}.items():
        if isinstance(out.get(key), str):
            out[key] = _clip(out[key], limit)
    slides = out.get("slides")
    if isinstance(slides, list):
        for slide in slides:
            if not isinstance(slide, dict):
                continue
            for key, limit in {"title":70,"subtitle":120,"context":120,"statement":180,"takeaway":180}.items():
                if isinstance(slide.get(key), str):
                    slide[key] = _clip(slide[key], limit)
    rows = out.get("nodes")
    if isinstance(rows, list):
        for row in rows:
            if isinstance(row, dict) and isinstance(row.get("label"), str):
                row["label"] = _clip(row["label"], 42)
    for side in ("before", "after"):
        obj = out.get(side)
        if isinstance(obj, dict) and isinstance(obj.get("nodes"), list):
            for row in obj["nodes"]:
                if isinstance(row, dict) and isinstance(row.get("label"), str):
                    row["label"] = _clip(row["label"], 38)
    return out


def adapt_visual_spec(spec: dict[str, Any], qa_report: dict[str, Any], *, pass_number: int) -> dict[str, Any]:
    adapted = deepcopy(spec)
    issues = set(qa_report.get("issues") or [])
    composition = adapted.setdefault("composition", {})
    options = composition.setdefault("options", {})
    options["adaptation_pass"] = pass_number

    if pass_number == 1:
        composition["density"] = "low"
        if "connector_crossings_in_clean_architecture" in issues:
            composition["variant_key"] = "layered_flow"
            composition["orientation"] = "auto"
        if "too_many_visible_line_series" in issues:
            composition["variant_key"] = "small_multiples"
            composition["chart_type"] = "small_multiples"
        if "text_overflow" in issues or "footer_zone_violation" in issues:
            options["compact_layout"] = True
        return adapted

    if pass_number == 2 and ("text_overflow" in issues or "footer_zone_violation" in issues or "overlap" in issues):
        adapted["content"] = _compact_content(dict(adapted.get("content") or {}))
        options["copy_compacted"] = True
    return adapted


def _critic_image(assets: list[dict[str, Any]], workdir: Path, slug: str) -> Path:
    paths = [Path(a["png_path"]) for a in assets if a.get("png_path")]
    if not paths:
        raise RuntimeError("No PNG asset available for visual critic")
    if len(paths) <= 1:
        return paths[0]
    thumbs = []
    for path in paths[:8]:
        image = Image.open(path).convert("RGB")
        image.thumbnail((270, 338), Image.Resampling.LANCZOS)
        thumbs.append(image.copy())
    cols = 2
    rows = (len(thumbs) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * 270, rows * 338), "white")
    for i, image in enumerate(thumbs):
        sheet.paste(image, ((i % cols) * 270, (i // cols) * 338))
    path = workdir / f"{slug}-critic-contact-sheet.jpg"
    sheet.save(path, quality=88)
    return path


def _upload_assets(assets: list[dict[str, Any]], *, tenant_id: str, package_id: str, candidate_id: str) -> list[dict[str, Any]]:
    store = get_asset_store()
    refs: list[dict[str, Any]] = []
    for asset in assets:
        row = {"index": asset.get("index"), "role": asset.get("role")}
        for key in ("svg_path", "png_path"):
            if not asset.get(key):
                continue
            path = Path(str(asset[key]))
            remote_key = f"{tenant_id}/visual-engine/{package_id}/{candidate_id}/{path.name}"
            row[key.replace("_path", "_ref")] = store.put(path, remote_key)
        refs.append(row)
    return refs


def _render_candidate(spec: dict[str, Any], *, workdir: Path, slug: str) -> dict[str, Any]:
    current = deepcopy(spec)
    attempts: list[dict[str, Any]] = []
    rendered: dict[str, Any] | None = None
    qa: dict[str, Any] = {}

    # Initial render + maximum two adaptation passes.
    for pass_number in range(0, 3):
        rendered = render_visual_spec(current, output_dir=workdir, slug=f"{slug}-p{pass_number}")
        qa = hard_qa(current, rendered["layout"])
        attempts.append({"pass": pass_number, "qa": qa, "spec": current})
        if qa.get("passed"):
            break
        if pass_number >= 2:
            break
        current = adapt_visual_spec(current, qa, pass_number=pass_number + 1)

    if rendered is None:
        raise RuntimeError("Renderer produced no output")

    critic_path = _critic_image(rendered["assets"], workdir, slug)
    critic = critique_render(current, critic_path, qa)
    return {
        "spec": current,
        "assets": rendered["assets"],
        "layout": rendered["layout"],
        "qa": qa,
        "critic": critic,
        "attempts": attempts,
    }


def run_visual_pipeline(
    content_object: dict[str, Any],
    *,
    channel: str,
    format_key: str | None = None,
    visual_language: str = "AUTO",
    candidate_count: int = 3,
    language: str = "en",
    persist: bool = True,
    auto_select: bool = True,
    workdir: Path | None = None,
) -> dict[str, Any]:
    """Run Phase 5 end-to-end without CRM/UI coupling."""
    candidate_count = max(1, min(3, int(candidate_count)))
    content_object_id = str(content_object.get("content_object_id") or new_id("content"))
    tenant_id = _tenant_id()
    store = get_store() if persist else None
    if store:
        _persist_canonical_content(store, content_object, tenant_id, content_object_id)

    format_options = recommend_visual_formats(content_object, channel=channel, max_options=3)
    selected_format = str(format_key or (format_options[0]["format"] if format_options else "carousel"))
    plan_id = new_id("vplan")
    now = _now()
    plan = {
        "plan_id": plan_id,
        "tenant_id": tenant_id,
        "content_object_id": content_object_id,
        "channel": channel,
        "format_key": selected_format,
        "requested_visual_language": visual_language.upper(),
        "candidate_count": candidate_count,
        "plan_json": {"format_options": format_options, "auto_format": format_key is None},
        "status": "planning",
        "created_at": now,
        "updated_at": now,
    }
    if store:
        store.insert("publication_plans", plan)

    package = build_presentation_package(
        {**content_object, "content_object_id": content_object_id},
        channel=channel,
        format_key=selected_format,
        visual_language=visual_language,
        language=language,
    )
    package_id = str(package["package_id"])
    package_row = {
        "package_id": package_id,
        "tenant_id": tenant_id,
        "plan_id": plan_id,
        "content_object_id": content_object_id,
        "channel": channel,
        "format_key": selected_format,
        "visual_role": str(package.get("visual_role") or ""),
        "external_copy_mode": str(package.get("external_copy_mode") or "medium"),
        "package_json": package,
        "status": "ready",
        "created_at": package.get("created_at") or now,
        "updated_at": now,
    }
    if store:
        store.insert("presentation_packages", package_row)

    specs = plan_visual_candidates(
        {**content_object, "content_object_id": content_object_id},
        package,
        candidate_count=candidate_count,
    )
    workdir = workdir or (Path(__file__).resolve().parents[1] / "generated" / "visuals_v2")
    workdir.mkdir(parents=True, exist_ok=True)
    results: list[dict[str, Any]] = []

    for rank, spec in enumerate(specs, start=1):
        candidate_id = new_id("vcand")
        candidate = {
            "candidate_id": candidate_id,
            "tenant_id": tenant_id,
            "package_id": package_id,
            "rank": rank,
            "visual_language": spec["visual_language"],
            "format_key": spec["format"],
            "semantic_pattern": spec["semantic_pattern"],
            "evidence_mode": spec["evidence_mode"],
            "spec": spec,
            "planner_score": float(spec.get("planner_score") or 0),
            "render_score": None,
            "planner_reason": str(spec.get("planner_reason") or ""),
            "recommended": rank == 1,
            "selected": False,
            "status": "rendering",
            "created_at": now,
            "updated_at": now,
        }
        if store:
            store.insert("visual_candidates", candidate)

        output = _render_candidate(spec, workdir=workdir, slug=candidate_id)
        qa = output["qa"]
        critic = output["critic"]
        planner_score = float(spec.get("planner_score") or 0)
        critic_score = float(critic.get("score") or 0)
        final_score = round(planner_score * 0.65 + critic_score * 0.35, 5) if qa.get("passed") else 0.0
        status = "rendered" if qa.get("passed") else "needs_review"
        refs = _upload_assets(
            output["assets"],
            tenant_id=tenant_id,
            package_id=package_id,
            candidate_id=candidate_id,
        ) if store else output["assets"]

        render_id = new_id("vrun")
        render_row = {
            "render_id": render_id,
            "tenant_id": tenant_id,
            "candidate_id": candidate_id,
            "design_id": None,
            "asset_refs": refs,
            "layout_json": output["layout"],
            "qa_report": {"hard_qa": qa, "critic": critic, "attempts": output["attempts"]},
            "status": status,
            "created_at": _now(),
        }
        if store:
            store.insert("visual_render_runs", render_row)
            store.update("visual_candidates", "candidate_id", candidate_id, {
                "spec": output["spec"],
                "render_score": final_score,
                "status": status,
                "updated_at": _now(),
            })

        results.append({
            **candidate,
            "spec": output["spec"],
            "render_score": final_score,
            "status": status,
            "assets": refs,
            "qa": qa,
            "critic": critic,
            "render_id": render_id,
            "layout": output["layout"],
        })

    passed = [r for r in results if r["status"] == "rendered"]
    passed.sort(key=lambda r: (-float(r.get("render_score") or 0), int(r.get("rank") or 99)))
    selected = passed[0] if auto_select and passed else None
    design = None

    if selected:
        selected_id = str(selected["candidate_id"])
        if store:
            for row in results:
                store.update("visual_candidates", "candidate_id", row["candidate_id"], {
                    "selected": row["candidate_id"] == selected_id,
                    "recommended": row["candidate_id"] == selected_id,
                    "updated_at": _now(),
                })

            first_ref = selected["assets"][0].get("png_ref") if selected.get("assets") else ""
            design_id = new_id("vdesign")
            design = {
                "design_id": design_id,
                "tenant_id": tenant_id,
                "content_id": None,
                "name": f"{selected_format} {selected['spec']['visual_language']} — {content_object_id}",
                "template_key": str(selected["spec"]["composition"].get("variant_key") or selected_format),
                "format_key": selected_format,
                "publication_mode": "visual_first" if selected_format == "carousel" else "text_with_visual",
                "design_json": selected["spec"],
                "asset_path": first_ref or "",
                "status": "attached",
                "is_template": False,
                "candidate_id": selected_id,
                "system_version_id": VISUAL_SYSTEM_VERSION,
                "visual_language": selected["spec"]["visual_language"],
                "semantic_pattern": selected["spec"]["semantic_pattern"],
                "evidence_mode": selected["spec"]["evidence_mode"],
                "visual_spec": selected["spec"],
                "qa_report": {"hard_qa": selected["qa"], "critic": selected["critic"]},
                "created_at": _now(),
                "updated_at": _now(),
            }
            store.insert("visual_designs", design)
            store.update("visual_render_runs", "render_id", selected["render_id"], {"design_id": design_id})
            store.update("publication_plans", "plan_id", plan_id, {
                "status": "ready",
                "updated_at": _now(),
                "plan_json": {**plan["plan_json"], "selected_candidate_id": selected_id, "design_id": design_id},
            })
    elif store:
        store.update("publication_plans", "plan_id", plan_id, {"status": "needs_review", "updated_at": _now()})

    return {
        "plan": plan,
        "format_options": format_options,
        "package": package,
        "candidates": results,
        "selected_candidate_id": selected.get("candidate_id") if selected else None,
        "design": design,
        "status": "ready" if selected else "needs_review",
    }
