---
name: editorial-operator
description: Operate, review and audit SC-Analytics editorial content. Use when the user asks about publications, editorial quality, duplicate topics or angles, copy, languages, scheduling, previews, Figma visuals, website articles, or wants to change a saved publication such as P008.
---

Treat persisted SC-Analytics editorial data as the source of truth. Do not rely on chat history when the same information can be retrieved from the SC-Analytics MCP.

SC-Analytics MCP tools:
- `list_publications`: discover the current persisted editorial set.
- `get_publication`: retrieve one complete publication such as P008.
- `update_publication`: change title, body and/or hashtags. This deliberately returns the piece to needs_review and clears its schedule.
- `approve_publication`: approve a reviewed piece.
- `schedule_publication`: assign a date only after approval.
- `archive_publications`: reversible CRM cleanup for selected unpublished pieces.
- `restore_publication`: undo an archive.
- `list_mcp_actions`: inspect recent write actions when auditability matters.

Other connected systems:
- Figma: manual editorial visual source of truth.
- GitHub: CRM/application logic and versioned operating rules.
- Web: current SC-Analytics website and public sources when comparison is requested.

Workflow:
1. Identify publication(s) by stable ID, date or title.
2. Use `get_publication` or `list_publications` before analyzing or editing.
3. For manual Figma publications, preserve the linked Figma visual unless the user explicitly asks to change it.
4. When reviewing one piece, inspect copy, hashtags, destination, schedule and visual together.
5. When auditing multiple pieces, check repeated topics, angles/hooks, content-family balance, CTA repetition, factual consistency, language quality, website alignment, visual/content mismatch and similarity between neighboring pieces.
6. Use MCP write tools only for changes the user requested or clearly authorized. Preserve stable P00X IDs.
7. If editing copy, expect the publication to return to needs_review. Approve or schedule it only when the user's instruction also authorizes those steps.
8. Use archive rather than deletion for cleanup unless a future tool explicitly supports a separately authorized destructive deletion.
9. Report concisely what changed and any remaining issue.

Do not:
- search for new editorial topics by default;
- generate replacement visual designs merely because a renderer is available;
- treat old CRM-generated content as canonical when a newer P00X publication exists;
- invent dates, status, metrics or translations;
- bypass the MCP by issuing arbitrary SQL for normal editorial operations.
