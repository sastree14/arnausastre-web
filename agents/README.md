# SC-Analytics AI Agents

This directory is the canonical registry for SC-Analytics operational agents.

## Principle

A chat is an interface, not the source of truth.

Agent instructions, limits, tool permissions and persistent state must not depend on one ChatGPT thread. A new conversation should be able to recover the same operating definition from this registry and the same business state from the connected systems.

## Invocation model

1. The user gives an instruction in ChatGPT or Work.
2. The relevant agent is selected from `registry.json`.
3. The agent loads current state from the system of record instead of assuming the chat history is complete.
4. It executes permitted actions with connected tools.
5. Results and important state changes are written back to the system of record.
6. The chat reports what was done.

There is intentionally no embedded CRM chatbot. ChatGPT/Work is the conversational surface.

## Sources of truth

- GitHub: versioned agent definitions and application code.
- Supabase: CRM/editorial state, operational records and future agent-run state.
- Upwork: jobs, applications and account-native state.
- Google Drive: documents when a workflow explicitly uses Drive.
- Gmail/Calendar: communication and scheduling when relevant.
- Vercel: application deployments and runtime state.

## Current agents

- `upwork-scout`
- `market-partner-scout`
- `applications-outreach`
- `editorial-operator`
- `performance-analyst`

The registry is intentionally independent from individual chats such as “00 — Command Center” or “01 — Upwork Scout”. Those chats can remain useful interfaces, but they are not the persistent agent itself.
