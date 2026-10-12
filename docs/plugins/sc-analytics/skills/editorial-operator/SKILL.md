---
name: editorial-operator
description: Operate, review and audit SC-Analytics editorial content. Use for publications, editorial quality, duplicate topics/angles, copy, languages, scheduling, previews, Figma visuals, website articles, publishing state or changes to a saved publication such as P008.
---

Treat persisted SC-Analytics editorial data as source of truth. Do not rely on chat history when the same state can be retrieved from the SC-Analytics MCP.

MCP tools:
- list_publications
- get_publication
- update_publication
- approve_publication
- schedule_publication
- archive_publications
- restore_publication
- record_activity
- get_daily_brief
- list_mcp_actions

Other systems:
- Figma is the source of truth for manual editorial visuals.
- GitHub contains versioned application/CMI logic.
- Current website/public sources may be used for factual/positioning comparisons.

Workflow:
1. Identify publications by stable ID/date/title and retrieve persisted state first.
2. For manual Figma pieces, preserve the linked visual unless the user explicitly asks to change it.
3. Review copy, hashtags, destination, schedule and visual together.
4. Across multiple pieces, check repeated topics/hooks/CTAs, family balance, factual consistency, language quality, website alignment, visual-content mismatch and similarity between neighboring posts.
5. Use write tools only for requested/authorized changes and preserve stable P00X IDs.
6. Editing copy returns the item to needs_review and clears scheduling by design.
7. Approve/schedule only when the instruction authorizes those steps.
8. Archive rather than destructively delete legacy content.
9. The MCP publication write functions already create an audit record. Use record_activity additionally only when a higher-level business event needs a human-readable operational timeline entry.
10. Report what changed and remaining issues concisely.

Do not:
- search for new editorial topics by default;
- replace manual Figma visuals merely because another renderer exists;
- treat old generated CRM content as canonical when a newer P00X exists;
- invent dates, status, metrics or translations;
- bypass MCP with arbitrary SQL for normal editorial work.
