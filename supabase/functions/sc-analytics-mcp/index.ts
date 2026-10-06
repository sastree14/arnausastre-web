import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

import { createMcpHandler, McpServer } from 'npm:@modelcontextprotocol/server@^2.0.0'
import { pipeline } from 'npm:@supabase/middleware@1'
import { withOAuthProtectedResource, withSupabase } from 'npm:@supabase/server@^1.6.0'
import { z } from 'npm:zod@^4.3.6'

const CMI_BASE_URL = (Deno.env.get('SC_ANALYTICS_CMI_URL') || 'https://arnausastre-web-git-feat-editorial-r-c0f1cd-sastree14s-projects.vercel.app').replace(/\/$/, '')

function result(data: unknown) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
    structuredContent: typeof data === 'object' && data !== null ? data as Record<string, unknown> : { value: data },
  }
}

Deno.serve(
  pipeline(
    [withOAuthProtectedResource(), withSupabase({ auth: 'user' })],
    async (req, context) => {
      const supabase = (context as any).supabase

      async function currentAccess() {
        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError || !userData?.user) throw new Error('Authenticated Supabase user not available')

        const { data: access, error: accessError } = await supabase
          .from('mcp_authorized_users')
          .select('label, enabled')
          .eq('user_id', userData.user.id)
          .maybeSingle()

        if (accessError) throw new Error(accessError.message)

        return {
          user: userData.user,
          authorized: Boolean(access?.enabled),
          label: access?.label ?? null,
        }
      }

      async function ensureAuthorized() {
        const access = await currentAccess()
        if (!access.authorized) {
          throw new Error('This Supabase user is authenticated but is not authorized for the SC-Analytics MCP.')
        }
        return access
      }

      const handler = createMcpHandler(() => {
        const server = new McpServer({
          name: 'sc-analytics',
          version: '0.1.0',
        })

        server.registerTool(
          'get_profile',
          {
            title: 'SC-Analytics Profile',
            description: 'Return the authenticated SC-Analytics MCP profile and whether it is authorized.',
            inputSchema: z.object({}),
            outputSchema: z.object({
              id: z.string(),
              name: z.string(),
              email: z.string().nullable(),
              nickname: z.string().nullable(),
              authorized: z.boolean(),
            }),
            annotations: { readOnlyHint: true, openWorldHint: false },
            _meta: { 'openai/profile': true },
          },
          async () => {
            const access = await currentAccess()
            const profile = {
              id: access.user.id,
              name: access.label || 'SC-Analytics',
              email: access.user.email || null,
              nickname: access.label || null,
              authorized: access.authorized,
            }
            return {
              content: [{ type: 'text', text: JSON.stringify(profile) }],
              structuredContent: profile,
            }
          },
        )

        server.registerTool(
          'list_publications',
          {
            title: 'List Publications',
            description: 'List persisted SC-Analytics publications from the CRM. Use this before reviewing, scheduling, cleaning or editing editorial content.',
            inputSchema: z.object({
              status: z.string().optional(),
              channel: z.string().optional(),
              limit: z.number().int().min(1).max(250).default(50),
            }),
            annotations: { readOnlyHint: true, openWorldHint: false },
          },
          async ({ status, channel, limit }) => {
            await ensureAuthorized()
            let query = supabase
              .from('content_items')
              .select('content_id,title,status,channel,content_type,language,hashtags,scheduled_at,published_at,source_case,source_url,visual_type,visual_strategy,created_at')
              .eq('tenant_id', 'sc-analytics')
              .order('created_at', { ascending: false })
              .limit(limit)

            if (status) query = query.eq('status', status)
            if (channel) query = query.eq('channel', channel)

            const { data, error } = await query
            if (error) throw new Error(error.message)
            return result({ publications: data })
          },
        )

        server.registerTool(
          'get_publication',
          {
            title: 'Get Publication',
            description: 'Get the complete persisted record for one SC-Analytics publication such as P008.',
            inputSchema: z.object({ content_id: z.string().min(1) }),
            annotations: { readOnlyHint: true, openWorldHint: false },
          },
          async ({ content_id }) => {
            await ensureAuthorized()
            const { data, error } = await supabase
              .from('content_items')
              .select('*')
              .eq('tenant_id', 'sc-analytics')
              .eq('content_id', content_id)
              .maybeSingle()
            if (error) throw new Error(error.message)
            if (!data) throw new Error(`Publication ${content_id} not found`)
            return result(data)
          },
        )

        server.registerTool(
          'update_publication',
          {
            title: 'Update Publication',
            description: 'Update title, body and/or hashtags of an unpublished publication. Editing automatically returns the piece to needs_review and clears its schedule so it must be reviewed again.',
            inputSchema: z.object({
              content_id: z.string().min(1),
              title: z.string().min(1).optional(),
              body: z.string().min(1).optional(),
              hashtags: z.array(z.string()).max(5).optional(),
            }),
            annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
          },
          async ({ content_id, title, body, hashtags }) => {
            await ensureAuthorized()
            const { data, error } = await supabase.rpc('mcp_update_publication', {
              p_content_id: content_id,
              p_title: title ?? null,
              p_body: body ?? null,
              p_hashtags: hashtags ?? null,
            })
            if (error) throw new Error(error.message)
            return result(data)
          },
        )

        server.registerTool(
          'approve_publication',
          {
            title: 'Approve Publication',
            description: 'Mark an unpublished SC-Analytics publication as approved after review.',
            inputSchema: z.object({ content_id: z.string().min(1) }),
            annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
          },
          async ({ content_id }) => {
            await ensureAuthorized()
            const { data, error } = await supabase.rpc('mcp_approve_publication', {
              p_content_id: content_id,
            })
            if (error) throw new Error(error.message)
            return result(data)
          },
        )

        server.registerTool(
          'schedule_publication',
          {
            title: 'Schedule Publication',
            description: 'Schedule an already-approved publication for a specific ISO 8601 date and time.',
            inputSchema: z.object({
              content_id: z.string().min(1),
              scheduled_at: z.string().datetime({ offset: true }),
            }),
            annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
          },
          async ({ content_id, scheduled_at }) => {
            await ensureAuthorized()
            const { data, error } = await supabase.rpc('mcp_schedule_publication', {
              p_content_id: content_id,
              p_scheduled_at: scheduled_at,
            })
            if (error) throw new Error(error.message)
            return result(data)
          },
        )

        server.registerTool(
          'archive_publications',
          {
            title: 'Archive Publications',
            description: 'Clean the editorial CRM by archiving selected unpublished publications. This is reversible and never deletes published content.',
            inputSchema: z.object({
              content_ids: z.array(z.string().min(1)).min(1).max(100),
              reason: z.string().max(500).default('CRM cleanup'),
            }),
            annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
          },
          async ({ content_ids, reason }) => {
            await ensureAuthorized()
            const { data, error } = await supabase.rpc('mcp_archive_publications', {
              p_content_ids: content_ids,
              p_reason: reason,
            })
            if (error) throw new Error(error.message)
            return result(data)
          },
        )

        server.registerTool(
          'restore_publication',
          {
            title: 'Restore Publication',
            description: 'Restore one previously archived publication to an editable workflow state.',
            inputSchema: z.object({ content_id: z.string().min(1) }),
            annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
          },
          async ({ content_id }) => {
            await ensureAuthorized()
            const { data, error } = await supabase.rpc('mcp_restore_publication', {
              p_content_id: content_id,
            })
            if (error) throw new Error(error.message)
            return result(data)
          },
        )

        server.registerTool(
          'get_metrics_snapshot',
          {
            title: 'Get Metrics Snapshot',
            description: 'Read the latest persisted website and LinkedIn metrics currently available in the SC-Analytics CRM. This does not claim to refresh external sources.',
            inputSchema: z.object({
              limit_per_source: z.number().int().min(1).max(100).default(30),
            }),
            annotations: { readOnlyHint: true, openWorldHint: false },
          },
          async ({ limit_per_source }) => {
            await ensureAuthorized()
            const [linkedin, web] = await Promise.all([
              supabase
                .from('linkedin_post_metrics')
                .select('*')
                .order('snapshot_date', { ascending: false })
                .limit(limit_per_source),
              supabase
                .from('web_analytics_daily')
                .select('*')
                .order('metric_date', { ascending: false })
                .limit(limit_per_source),
            ])
            if (linkedin.error) throw new Error(linkedin.error.message)
            if (web.error) throw new Error(web.error.message)
            return result({
              linkedin: linkedin.data,
              website: web.data,
              note: 'These are persisted CRM metrics. External sources are not refreshed by this tool.',
            })
          },
        )

        server.registerTool(
          'search_companies',
          {
            title: 'Search CRM Companies',
            description: 'Search persisted SC-Analytics CRM companies by name.',
            inputSchema: z.object({
              query: z.string().min(1),
              limit: z.number().int().min(1).max(100).default(25),
            }),
            annotations: { readOnlyHint: true, openWorldHint: false },
          },
          async ({ query, limit }) => {
            await ensureAuthorized()
            const { data, error } = await supabase
              .from('companies')
              .select('*')
              .eq('tenant_id', 'sc-analytics')
              .neq('status', 'archived')
              .ilike('name', `%${query}%`)
              .order('score', { ascending: false })
              .limit(limit)
            if (error) throw new Error(error.message)
            return result({ companies: data })
          },
        )

        server.registerTool(
          'update_company',
          {
            title: 'Update CRM Company',
            description: 'Update selected business fields on an existing SC-Analytics CRM company. Only explicit fields are changed.',
            inputSchema: z.object({
              company_id: z.string().min(1),
              status: z.string().optional(),
              notes: z.string().optional(),
              recommended_service: z.string().optional(),
              recommended_offer: z.string().optional(),
              score: z.number().min(0).max(100).optional(),
              score_reason: z.string().optional(),
            }),
            annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
          },
          async (args) => {
            await ensureAuthorized()
            const { data, error } = await supabase.rpc('mcp_update_company', {
              p_company_id: args.company_id,
              p_status: args.status ?? null,
              p_notes: args.notes ?? null,
              p_recommended_service: args.recommended_service ?? null,
              p_recommended_offer: args.recommended_offer ?? null,
              p_score: args.score ?? null,
              p_score_reason: args.score_reason ?? null,
            })
            if (error) throw new Error(error.message)
            return result(data)
          },
        )


        server.registerTool(
          'create_opportunity',
          {
            title: 'Create CRM Opportunity',
            description: 'Save a selected Upwork, web, referral or other opportunity to the SC-Analytics CMI. Use this only when the user wants the opportunity persisted for follow-up.',
            inputSchema: z.object({
              name: z.string().min(1),
              source: z.string().default('manual'),
              value: z.number().min(0).default(0),
              currency: z.string().min(3).max(3).default('EUR'),
              probability: z.number().min(0).max(100).default(0),
              next_action_at: z.string().datetime({ offset: true }).optional(),
              metadata: z.record(z.string(), z.unknown()).optional(),
            }),
            annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
          },
          async (args) => {
            await ensureAuthorized()
            const { data, error } = await supabase.rpc('mcp_create_opportunity', {
              p_name: args.name,
              p_source: args.source,
              p_value: args.value,
              p_currency: args.currency,
              p_probability: args.probability,
              p_next_action_at: args.next_action_at ?? null,
              p_metadata: args.metadata ?? {},
            })
            if (error) throw new Error(error.message)
            return result(data)
          },
        )

        server.registerTool(
          'list_opportunities',
          {
            title: 'List CRM Opportunities',
            description: 'List persisted SC-Analytics commercial opportunities, optionally filtered by stage.',
            inputSchema: z.object({
              stage: z.string().optional(),
              limit: z.number().int().min(1).max(100).default(25),
            }),
            annotations: { readOnlyHint: true, openWorldHint: false },
          },
          async ({ stage, limit }) => {
            await ensureAuthorized()
            let query = supabase
              .from('crm_opportunities')
              .select('*')
              .eq('tenant_id', 'sc-analytics')
              .order('updated_at', { ascending: false })
              .limit(limit)
            if (stage) query = query.eq('stage', stage)
            const { data, error } = await query
            if (error) throw new Error(error.message)
            return result({ opportunities: data })
          },
        )

        server.registerTool(
          'update_opportunity',
          {
            title: 'Update CRM Opportunity',
            description: 'Update selected fields of an existing SC-Analytics commercial opportunity.',
            inputSchema: z.object({
              opportunity_id: z.string().min(1),
              stage: z.string().optional(),
              value: z.number().min(0).optional(),
              probability: z.number().min(0).max(100).optional(),
              next_action_at: z.string().datetime({ offset: true }).optional(),
              name: z.string().min(1).optional(),
              metadata: z.record(z.string(), z.unknown()).optional(),
            }),
            annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
          },
          async (args) => {
            await ensureAuthorized()
            const { data, error } = await supabase.rpc('mcp_update_opportunity', {
              p_opportunity_id: args.opportunity_id,
              p_stage: args.stage ?? null,
              p_value: args.value ?? null,
              p_probability: args.probability ?? null,
              p_next_action_at: args.next_action_at ?? null,
              p_name: args.name ?? null,
              p_metadata: args.metadata ?? null,
            })
            if (error) throw new Error(error.message)
            return result(data)
          },
        )


        server.registerTool(
          'list_meetings',
          {
            title: 'List CRM Meetings',
            description: 'List upcoming SC-Analytics meetings and manual calendar events.',
            inputSchema: z.object({
              limit: z.number().int().min(1).max(100).default(25),
            }),
            annotations: { readOnlyHint: true, openWorldHint: false },
          },
          async ({ limit }) => {
            await ensureAuthorized()
            const { data, error } = await supabase
              .from('crm_meetings')
              .select('*')
              .eq('tenant_id', 'sc-analytics')
              .neq('status', 'cancelled')
              .order('starts_at', { ascending: true })
              .limit(limit)
            if (error) throw new Error(error.message)
            return result({ meetings: data })
          },
        )

        server.registerTool(
          'create_meeting',
          {
            title: 'Create CRM Meeting',
            description: 'Add a meeting or calendar event to the SC-Analytics CMI.',
            inputSchema: z.object({
              title: z.string().min(1),
              starts_at: z.string().datetime({ offset: true }),
              notes: z.string().optional(),
              provider: z.string().default('manual'),
            }),
            annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
          },
          async (args) => {
            await ensureAuthorized()
            const { data, error } = await supabase.rpc('mcp_create_meeting', {
              p_title: args.title,
              p_starts_at: args.starts_at,
              p_notes: args.notes ?? null,
              p_provider: args.provider,
            })
            if (error) throw new Error(error.message)
            return result(data)
          },
        )


        server.registerTool(
          'record_activity',
          {
            title: 'Record Operational Activity',
            description: 'Persist a meaningful SC-Analytics action or outcome so later chats and daily briefs know what happened. Use after successful external actions such as an Upwork application, outreach, a manual contact, or another business-state change that is not already persisted by another MCP write.',
            inputSchema: z.object({
              activity_type: z.string().min(1),
              title: z.string().min(1),
              summary: z.string().optional(),
              channel: z.string().optional(),
              entity_type: z.string().optional(),
              entity_id: z.string().optional(),
              status: z.string().optional(),
              source_url: z.string().url().optional(),
              next_action_at: z.string().datetime({ offset: true }).optional(),
              metadata: z.record(z.string(), z.unknown()).optional(),
            }),
            annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
          },
          async (args) => {
            await ensureAuthorized()
            const { data, error } = await supabase.rpc('mcp_record_activity', {
              p_activity_type: args.activity_type,
              p_title: args.title,
              p_summary: args.summary ?? null,
              p_channel: args.channel ?? null,
              p_entity_type: args.entity_type ?? null,
              p_entity_id: args.entity_id ?? null,
              p_status: args.status ?? null,
              p_source_url: args.source_url ?? null,
              p_next_action_at: args.next_action_at ?? null,
              p_metadata: args.metadata ?? {},
            })
            if (error) throw new Error(error.message)
            return result(data)
          },
        )

        server.registerTool(
          'list_activities',
          {
            title: 'List Operational Activities',
            description: 'Read the persistent SC-Analytics activity timeline across chats and external actions.',
            inputSchema: z.object({
              start_at: z.string().datetime({ offset: true }).optional(),
              end_at: z.string().datetime({ offset: true }).optional(),
              entity_type: z.string().optional(),
              entity_id: z.string().optional(),
              limit: z.number().int().min(1).max(200).default(50),
            }),
            annotations: { readOnlyHint: true, openWorldHint: false },
          },
          async ({ start_at, end_at, entity_type, entity_id, limit }) => {
            await ensureAuthorized()
            let query = supabase
              .from('sc_operational_activities')
              .select('*')
              .eq('tenant_id', 'sc-analytics')
              .order('occurred_at', { ascending: false })
              .limit(limit)
            if (start_at) query = query.gte('occurred_at', start_at)
            if (end_at) query = query.lt('occurred_at', end_at)
            if (entity_type) query = query.eq('entity_type', entity_type)
            if (entity_id) query = query.eq('entity_id', entity_id)
            const { data, error } = await query
            if (error) throw new Error(error.message)
            return result({ activities: data })
          },
        )

        server.registerTool(
          'create_followup',
          {
            title: 'Create Follow-up',
            description: 'Create a persistent SC-Analytics follow-up or next action tied to a person, company, opportunity, Upwork job, publication or other entity.',
            inputSchema: z.object({
              title: z.string().min(1),
              due_at: z.string().datetime({ offset: true }).optional(),
              entity_type: z.string().optional(),
              entity_id: z.string().optional(),
              priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
              notes: z.string().optional(),
              source_activity_id: z.string().uuid().optional(),
              metadata: z.record(z.string(), z.unknown()).optional(),
            }),
            annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
          },
          async (args) => {
            await ensureAuthorized()
            const { data, error } = await supabase.rpc('mcp_create_followup', {
              p_title: args.title,
              p_due_at: args.due_at ?? null,
              p_entity_type: args.entity_type ?? null,
              p_entity_id: args.entity_id ?? null,
              p_priority: args.priority,
              p_notes: args.notes ?? null,
              p_source_activity_id: args.source_activity_id ?? null,
              p_metadata: args.metadata ?? {},
            })
            if (error) throw new Error(error.message)
            return result(data)
          },
        )

        server.registerTool(
          'list_followups',
          {
            title: 'List Follow-ups',
            description: 'List persistent SC-Analytics follow-ups so the assistant can surface what is pending, overdue or coming next.',
            inputSchema: z.object({
              status: z.enum(['open', 'completed', 'cancelled']).default('open'),
              due_before: z.string().datetime({ offset: true }).optional(),
              entity_type: z.string().optional(),
              limit: z.number().int().min(1).max(200).default(50),
            }),
            annotations: { readOnlyHint: true, openWorldHint: false },
          },
          async ({ status, due_before, entity_type, limit }) => {
            await ensureAuthorized()
            let query = supabase
              .from('sc_followups')
              .select('*')
              .eq('tenant_id', 'sc-analytics')
              .eq('status', status)
              .order('due_at', { ascending: true, nullsFirst: false })
              .limit(limit)
            if (due_before) query = query.lte('due_at', due_before)
            if (entity_type) query = query.eq('entity_type', entity_type)
            const { data, error } = await query
            if (error) throw new Error(error.message)
            return result({ followups: data })
          },
        )

        server.registerTool(
          'complete_followup',
          {
            title: 'Complete Follow-up',
            description: 'Mark one persistent SC-Analytics follow-up as completed and optionally record the resolution.',
            inputSchema: z.object({
              followup_id: z.string().uuid(),
              resolution: z.string().optional(),
            }),
            annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
          },
          async ({ followup_id, resolution }) => {
            await ensureAuthorized()
            const { data, error } = await supabase.rpc('mcp_complete_followup', {
              p_followup_id: followup_id,
              p_resolution: resolution ?? null,
            })
            if (error) throw new Error(error.message)
            return result(data)
          },
        )

        server.registerTool(
          'get_daily_brief',
          {
            title: 'Get SC-Analytics Daily Brief',
            description: 'Collect the persistent state needed for an executive daily brief: what happened in the requested day window, pending follow-ups, upcoming meetings, scheduled publications, active opportunities and recent MCP writes.',
            inputSchema: z.object({
              day_start: z.string().datetime({ offset: true }),
              day_end: z.string().datetime({ offset: true }),
              upcoming_until: z.string().datetime({ offset: true }),
              limit: z.number().int().min(1).max(100).default(50),
            }),
            annotations: { readOnlyHint: true, openWorldHint: false },
          },
          async ({ day_start, day_end, upcoming_until, limit }) => {
            await ensureAuthorized()

            const [
              activitiesResult,
              followupsResult,
              meetingsResult,
              publicationsResult,
              opportunitiesResult,
              actionsResult,
            ] = await Promise.all([
              supabase
                .from('sc_operational_activities')
                .select('*')
                .eq('tenant_id', 'sc-analytics')
                .gte('occurred_at', day_start)
                .lt('occurred_at', day_end)
                .order('occurred_at', { ascending: false })
                .limit(limit),
              supabase
                .from('sc_followups')
                .select('*')
                .eq('tenant_id', 'sc-analytics')
                .eq('status', 'open')
                .or(`due_at.is.null,due_at.lte.${upcoming_until}`)
                .order('due_at', { ascending: true, nullsFirst: false })
                .limit(limit),
              supabase
                .from('crm_meetings')
                .select('*')
                .eq('tenant_id', 'sc-analytics')
                .neq('status', 'cancelled')
                .gte('starts_at', day_start)
                .lte('starts_at', upcoming_until)
                .order('starts_at', { ascending: true })
                .limit(limit),
              supabase
                .from('content_items')
                .select('content_id,title,status,channel,content_type,scheduled_at,published_at')
                .eq('tenant_id', 'sc-analytics')
                .in('status', ['approved', 'scheduled'])
                .gte('scheduled_at', day_start)
                .lte('scheduled_at', upcoming_until)
                .order('scheduled_at', { ascending: true })
                .limit(limit),
              supabase
                .from('crm_opportunities')
                .select('*')
                .eq('tenant_id', 'sc-analytics')
                .not('stage', 'in', '("lost","won","archived")')
                .order('updated_at', { ascending: false })
                .limit(limit),
              supabase
                .from('mcp_action_log')
                .select('action_id,tool_name,action,target_type,target_id,metadata,created_at')
                .gte('created_at', day_start)
                .lt('created_at', day_end)
                .order('created_at', { ascending: false })
                .limit(limit),
            ])

            for (const item of [activitiesResult, followupsResult, meetingsResult, publicationsResult, opportunitiesResult, actionsResult]) {
              if (item.error) throw new Error(item.error.message)
            }

            return result({
              window: { day_start, day_end, upcoming_until },
              activities: activitiesResult.data,
              followups: followupsResult.data,
              meetings: meetingsResult.data,
              publications: publicationsResult.data,
              opportunities: opportunitiesResult.data,
              mcp_actions: actionsResult.data,
            })
          },
        )

        server.registerTool(
          'sync_google_metrics',
          {
            title: 'Sync GA4 and Search Console',
            description: 'Refresh SC-Analytics GA4 and Google Search Console data through the authenticated CMI backend, persist the new metrics, and return the sync result.',
            inputSchema: z.object({
              days: z.number().int().min(7).max(730).default(365),
            }),
            annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
          },
          async ({ days }) => {
            await ensureAuthorized()
            const authorization = req.headers.get('authorization') || ''
            if (!authorization) throw new Error('Authenticated MCP bearer token is not available')
            const response = await fetch(`${CMI_BASE_URL}/api/growth-admin/metrics/sync-mcp`, {
              method: 'POST',
              headers: {
                Authorization: authorization,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ days }),
            })
            const body = await response.json().catch(() => ({}))
            if (!response.ok) throw new Error(String((body as any)?.error || `CMI metrics sync failed: ${response.status}`))
            return result(body)
          },
        )

        server.registerTool(
          'list_mcp_actions',
          {
            title: 'List MCP Action Log',
            description: 'Read recent SC-Analytics MCP write actions for audit and troubleshooting.',
            inputSchema: z.object({
              limit: z.number().int().min(1).max(100).default(25),
            }),
            annotations: { readOnlyHint: true, openWorldHint: false },
          },
          async ({ limit }) => {
            await ensureAuthorized()
            const { data, error } = await supabase
              .from('mcp_action_log')
              .select('action_id,tool_name,action,target_type,target_id,metadata,created_at')
              .order('created_at', { ascending: false })
              .limit(limit)
            if (error) throw new Error(error.message)
            return result({ actions: data })
          },
        )

        return server
      })

      return handler.fetch(req)
    },
  ),
)
