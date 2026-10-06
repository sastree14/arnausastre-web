# SC-Analytics plugin V1

SC-Analytics is designed as a persistent operating assistant rather than a collection of disconnected chat prompts.

## Operating model

- ChatGPT / Work = interaction, reasoning and execution surface.
- SC-Analytics skills = durable operating rules.
- Connected apps = live external systems such as Upwork and LinkedIn.
- SC-Analytics MCP = authenticated business actions and persistent state.
- Supabase = memory / system of record.
- CMI = compact review surface for calendar, publications, opportunities and metrics.

A meaningful successful action should update persistent state automatically. The user should not need to repeat “actualiza el CMI” after every application, contact, meeting or editorial change.

## V1 skills

- editorial-operator
- opportunity-scout
- commercial-research
- performance-analyst
- daily-operator

## What V1 should support

### Upwork
Search and qualify current jobs using the canonical Growth Engine criteria, inspect client quality, decide Arnau vs Arnau + SC-Analytics vs provider positioning, choose relevant proof/portfolio, recommend pricing/boost/attachments, prepare screening answers and personalized proposals, execute through the Upwork connector after the required confirmation, then persist the successful application and next action.

### Direct clients and technology partners
Research real demand signals, distinguish fact/inference/hypothesis, show the exact source, identify the likely decision-maker, recommend the best contact channel and explain why, and persist only selected opportunities. Technology/delivery partners are a first-class commercial target.

### Editorial
Review and update canonical content, preserve manual Figma visuals, approve/schedule only when authorized and keep the CMI editorial state coherent.

### Metrics
Refresh GA4 + Search Console when requested, read persisted metrics, compare periods and explain only changes that matter.

### Daily operating assistant
Answer questions such as “qué hemos hecho hoy”, “qué queda pendiente”, “cómo estamos” or “qué debería hacer ahora” from persistent state across chats. Surface follow-ups, meetings, scheduled publications, active opportunities, relevant metrics and the next 1–3 actions.

## Design rule

Add a new skill only when a repeated workflow benefits from stable instructions. Prefer adding a safe MCP business action over creating another CMI module.

The CMI should stay small. Research and reasoning remain conversational unless the resulting state has future operational value.
