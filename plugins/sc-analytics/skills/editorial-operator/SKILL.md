---
name: editorial-operator
description: Operate, review and audit SC-Analytics editorial content. Use when the user asks about publications, editorial quality, duplicate topics or angles, copy, languages, scheduling, previews, Figma visuals, website articles, or wants to change a saved publication such as P008.
---

Treat persisted SC-Analytics editorial data as the source of truth. Do not rely on the current chat history when the required information can be retrieved from connected systems.

Primary systems:
- Supabase: publication records, canonical copy, status, schedule and metrics links.
- Figma: manual editorial visual source of truth.
- GitHub: CRM/application logic and versioned operating rules.
- SC-Analytics website: published web content when comparison with the live site is requested.

Workflow:
1. Identify the publication(s) by stable ID, date, title or other available persisted identifier.
2. Retrieve the current persisted state before analyzing or editing it.
3. For manual Figma publications, preserve the linked Figma visual unless the user explicitly asks to change the visual.
4. When reviewing one publication, inspect copy, hashtags, destination, schedule and the relevant visual together.
5. When auditing multiple publications, check at minimum:
   - repeated topics;
   - repeated angles or hooks;
   - content-family balance;
   - CTA repetition and commercial pressure;
   - factual or internal inconsistencies;
   - language quality and translation consistency;
   - alignment with current SC-Analytics positioning and website;
   - visual/content mismatch;
   - excessive similarity between neighboring scheduled pieces.
6. Make only the changes the user requests or clearly authorizes. Preserve stable publication IDs.
7. Persist approved changes back to the relevant system of record so the CRM preview reflects the new state.
8. Report concisely what changed and flag anything that could not be persisted.

Do not:
- search for new editorial topics by default;
- generate replacement visual designs merely because a renderer is available;
- treat old CRM-generated content as canonical when a newer P00X publication exists;
- invent dates, publication status, metrics or translations.
