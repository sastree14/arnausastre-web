# Editorial presentation and scheduled tests

- Long-form article paragraphs use justified text, automatic hyphenation and the article language. Card headings and short summaries remain centered.
- Sibling cards use equal columns, uniform padding and equal heights. Keep numbering, text and arrows aligned consistently.
- Website article previews use GeneratedKnowledgeArticleGoldStandard, the same component as public Knowledge pages.
- Preserve complete core article prose. Collapsible content is limited to explicitly supplementary examples, technical notes or appendices; its control must show a background, border, hover and keyboard focus state.
- Presentation variants come from persisted article_meta: statement, duo, triad, sequence and supporting variants. Do not manufacture statistics for visual decoration.
- A scheduled publishing test must use a future scheduled_at, visible in the CMI. Never use Publish now, dispatch a workflow or invoke editorial_request_tick to validate an automatic schedule.
- On 2026-10-12 Arnau authorized P002 and article family KB-001 for 15:22:49 Europe/Madrid. P002 was moved from its former 2026-10-16 date; do not restore it after successful publication.
- A read-only check is scheduled at 15:30 Europe/Madrid. Report actual states and URLs; do not force publication to make a test look successful.
- MCP approval must approve the executable approval record and preserve a future scheduled_at. The SQL patch includes scoped authenticated access protected by private.mcp_is_authorized() and tenant RLS; no anonymous access or SECURITY DEFINER change is introduced.
