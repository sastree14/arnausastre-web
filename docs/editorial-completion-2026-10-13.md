# Editorial and integration completion — 13 October 2026

Verified persisted state: 150 personal LinkedIn items, two published and 148 scheduled. Knowledge bank: one published family and 199 scheduled families, each in ES/CA/EN. No family has inconsistent language dates. Upcoming articles run Tuesday, Thursday and Saturday at 09:00 Europe/Madrid, from 15 October 2026 through 20 January 2028. Existing published content was preserved. All 600 article variants have a valid editorial contract without contract issues. Approvals and schedules were written through the authenticated SC-Analytics MCP, preserving action logs.

Both Supabase publishers remain active. Future time-sensitive articles are subject to the existing freshness guard; scheduling does not override that guard.

Gmail personal OAuth reauthorization succeeded. The subsequent 403 was explicitly identified as Gmail per-user Total Query Cost quota, not insufficient scope. Worker now paces API reads and retries only explicit quota failures, preserving failed-window state. A message-level fallback handles inaccessible whole threads without claiming full-thread context.

Plugin source version 1.3.1 preserves the app ID, logo and existing commercial policy. Live deployed MCP source registers get_commercial_memory, update_commercial_memory and record_activity. Current ChatGPT session registry exposes editorial tools but not those three newer tools. Updating repository files cannot refresh an installed ChatGPT connector registry or grant OAuth consent. Reconnect/refresh that app and verify tool discovery in a new session before claiming all commercial chat operations work end to end.
