import 'server-only'

const OWNER = 'sastree14'
const REPO = 'arnausastre-web'
const WORKFLOW = 'growth-operator-queue.yml'

export async function dispatchOperatorQueue() {
  const token = (process.env.GITHUB_ACTIONS_TOKEN || process.env.GITHUB_WORKFLOW_TOKEN || '').trim()
  if (!token) return { dispatched: false, reason: 'missing_token' as const }

  try {
    const response = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW}/dispatches`, {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ref: 'main' }),
      cache: 'no-store',
    })
    if (response.status === 204) return { dispatched: true, reason: 'ok' as const }
    const detail = (await response.text()).slice(0, 300)
    console.error('GitHub operator workflow dispatch failed', response.status, detail)
    return { dispatched: false, reason: 'github_error' as const }
  } catch (error) {
    console.error('GitHub operator workflow dispatch request failed', error)
    return { dispatched: false, reason: 'network_error' as const }
  }
}
