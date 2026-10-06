create policy "MCP users can read own authorization"
on public.mcp_authorized_users
for select to authenticated
using (user_id = (select auth.uid()));

grant select on public.mcp_authorized_users to authenticated;
