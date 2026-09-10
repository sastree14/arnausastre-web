# SC-Analytics Growth Agent v2

This folder contains the code-first growth system that runs alongside the SC-Analytics website.

## What it does

The system can:

- build an adaptive weekly growth plan from the SC-Analytics Brain and recent state;
- research direct-sales and partnership company candidates on the public web;
- identify likely decision-makers from public search evidence without scraping LinkedIn;
- score candidates and prepare personalized founder-led outreach;
- create separate approval items for connecting/following and messaging;
- generate evidence-aware LinkedIn posts from approved anonymized SC-Analytics cases;
- create 1200x1200 branded metric visuals, business diagrams and cards;
- persist generated visuals to private object storage;
- expose a private `/growth-admin` console where Arnau reviews posts, visuals, people and messages;
- publish approved posts through the official LinkedIn Posts + Images APIs when permissions are configured;
- record completed manual LinkedIn actions as interactions;
- review weekly execution using actual stored metrics/interactions rather than invented performance.

The system intentionally does **not** scrape LinkedIn or automate browser clicks for follow/connect/message actions. Those actions are prepared by the agent, approved by Arnau, opened through the console and executed manually unless LinkedIn exposes an authorized API for that action.

## Repository layout

- `brain/` — editable business context, values, positioning, ICP, voice and content policy.
- `src/` — Python orchestration and service code.
- `schemas/` — data contracts.
- `tests/` — deterministic tests.
- `generated/` — local generated previews; ignored by git.
- `data/` — local JSON development state; ignored by git.
- `../database/migrations/` — Supabase/Postgres schema.
- `../app/growth-admin/` — private approval console in the existing Next.js app.

## Local development

From repository root:

```bash
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r growth/requirements.txt
python -m growth.src.cli validate
pytest -q growth/tests
```

Local state defaults to `growth/data/*.json`. No database is required for deterministic development/tests.

## Required cloud setup

### 1. Supabase

Create a Supabase project and run, in order, the SQL in:

- `database/migrations/001_growth_agent.sql`
- `database/migrations/002_weekly_reviews.sql`

The first migration also creates a private storage bucket named `growth-assets`.

Add these GitHub Actions secrets:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Add the same two values to Vercel environment variables because `/growth-admin` reads the same state server-side.

Never expose `SUPABASE_SERVICE_ROLE_KEY` to browser/client code.

### 2. OpenAI

Add GitHub Actions secret:

- `OPENAI_API_KEY`

The default models are defined in `growth/config.yaml`. The API integration uses the Responses API. Generative imagery is optional; exact text, metrics and diagrams are rendered programmatically.

### 3. Brave Search

Add GitHub Actions secret:

- `BRAVE_API_KEY`

This is used for public-web company/person discovery. The code explicitly refuses to fetch LinkedIn pages directly.

### 4. Approval console

Generate a long random value for `GROWTH_ADMIN_TOKEN` and add it to Vercel only.

Then visit:

`https://sc-analytics.io/growth-admin`

The token is stored only in an HttpOnly session cookie after login.

### 5. LinkedIn publishing (optional until API approval is ready)

For official API publishing, configure:

GitHub Actions secrets:

- `LINKEDIN_ACCESS_TOKEN`
- `LINKEDIN_ORGANIZATION_ID` (company-page publishing)
- `LINKEDIN_PERSON_URN` (personal publishing, only if your LinkedIn app has the required member permission)

GitHub Actions variable:

- `LINKEDIN_API_VERSION`

The publisher refuses to publish content unless both the content item and its publish approval are explicitly approved. It is idempotent on `external_post_id`.

## Automation switches

Schedules are present but disabled until configuration has been verified.

Repository Actions variables:

- `GROWTH_AUTOMATION_ENABLED=true` enables the weekday 08:30 Europe/Madrid daily agent.
- `GROWTH_PUBLISHING_ENABLED=true` enables the hourly publisher for already-approved content.

Do not enable either variable before Supabase and required secrets are configured and a manual workflow run succeeds.

## Manual smoke-test sequence

With environment variables configured:

```bash
STATE_PROVIDER=supabase ASSET_PROVIDER=supabase python -m growth.src.cli plan-week
STATE_PROVIDER=supabase ASSET_PROVIDER=supabase python -m growth.src.cli prospect --mode partner --limit 3
STATE_PROVIDER=supabase ASSET_PROVIDER=supabase python -m growth.src.cli content --case ecommerce-demand-forecasting --channel arnau_linkedin
STATE_PROVIDER=supabase python -m growth.src.cli approvals
```

Then use `/growth-admin` to review the generated candidate/message and post/visual.

## Approval semantics

Approval is deliberately separated from execution.

- `publish_post`: approval changes content to `approved`; a separate official publisher performs the external LinkedIn API call.
- `connect_person`, `follow_person`, `send_message`, `contact_partner`: approval makes the prepared action visible in the "Ready for manual LinkedIn action" queue. Arnau opens the profile/search result, performs the action on LinkedIn, then presses **Mark done**. The system records that interaction for future follow-up and strategy.

This separation prevents accidental public actions and keeps LinkedIn account behavior compliant with the platform boundary.

## Editing company philosophy, values or strategy

The Brain is intentionally plain Markdown. Arnau can edit or add company knowledge without touching Python. The required seed files live in `growth/brain/`.

Good additions include:

- philosophy and values;
- service changes;
- ideal/non-ideal clients;
- real approved cases and lessons;
- writing examples Arnau genuinely likes;
- partnership criteria;
- claims that may or may not be used publicly;
- visual brand rules.

When adding information, distinguish internal/confidential context from content approved for public use. The evidence policy is in `brain/evidence/evidence_policy.md`.

## Legacy v1

The existing article generator and old five-post LinkedIn Pack remain untouched while v2 is validated. They can be retired progressively after the corresponding v2 capability proves better in production.
