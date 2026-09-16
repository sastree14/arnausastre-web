import 'server-only'

const OWNER = 'sastree14'
const REPO = 'arnausastre-web'
const WORKFLOW = 'growth-operator-queue.yml'
const API_VERSION = '2022-11-28'

type DispatchResult = {
  dispatched: boolean
  reason: 'ok' | 'missing_token' | 'github_error' | 'network_error'
  transport?: 'workflow_dispatch' | 'repository_dispatch'
}

function githubTokens() {
  return [...new Set([
    (process.env.GITHUB_ACTIONS_TOKEN || '').trim(),
    (process.env.GITHUB_WORKFLOW_TOKEN || '').trim(),
  ].filter(Boolean))]
}

function headers(token: string) {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': API_VERSION,
    'Content-Type': 'application/json',
  }
}

async function workflowDispatch(token: string) {
  return fetch(`https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW}/dispatches`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({ ref: 'main' }),
    cache: 'no-store',
  })
}

async function repositoryDispatch(token: string) {
  return fetch(`https://api.github.com/repos/${OWNER}/${REPO}/dispatches`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({
      event_type: 'operator_queue',
      client_payload: { source: 'growth-admin', requested_at: new Date().toISOString() },
    }),
    cache: 'no-store',
  })
}

export async function dispatchOperatorQueue(): Promise<DispatchResult> {
  const tokens = githubTokens()
  if (!tokens.length) return { dispatched: false, reason: 'missing_token' }

  let networkFailed = false

  for (const token of tokens) {
    try {
      const response = await workflowDispatch(token)
      if (response.ok) return { dispatched: true, reason: 'ok', transport: 'workflow_dispatch' }
      const detail = (await response.text()).slice(0, 300)
      console.error('GitHub operator workflow_dispatch failed', response.status, detail)
    } catch (error) {
      networkFailed = true
      console.error('GitHub operator workflow_dispatch request failed', error)
    }
  }

  // Fine-grained PATs require Actions:write for workflow_dispatch, but
  // repository_dispatch only requires Contents:write. Keep this independent
  // fallback so CRM buttons can still start the worker immediately when the
  // existing token has repository write access but not Actions write access.
  for (const token of tokens) {
    try {
      const response = await repositoryDispatch(token)
      if (response.ok) return { dispatched: true, reason: 'ok', transport: 'repository_dispatch' }
      const detail = (await response.text()).slice(0, 300)
      console.error('GitHub operator repository_dispatch failed', response.status, detail)
    } catch (error) {
      networkFailed = true
      console.error('GitHub operator repository_dispatch request failed', error)
    }
  }

  return { dispatched: false, reason: networkFailed ? 'network_error' : 'github_error' }
}
