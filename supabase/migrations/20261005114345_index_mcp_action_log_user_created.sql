create index if not exists mcp_action_log_user_created_idx
on public.mcp_action_log (user_id, created_at desc);
