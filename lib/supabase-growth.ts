import 'server-only'

function env(name: string): string {
  return (process.env[name] || '').trim()
}

export function growthSupabaseUrl(): string {
  const url = env('SUPABASE_URL').replace(/\/$/, '')
  if (!url) throw new Error('SUPABASE_URL is not configured')
  return url
}

export function growthSupabaseKey(): string {
  const key = env('SUPABASE_SECRET_KEY') || env('SUPABASE_SERVICE_ROLE_KEY')
  if (!key) throw new Error('SUPABASE_SECRET_KEY is not configured')
  return key
}

export function growthSupabaseHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const key = growthSupabaseKey()
  const headers: Record<string, string> = {
    apikey: key,
    'Content-Type': 'application/json',
    ...extra,
  }
  // Legacy service_role keys are JWTs. Modern sb_secret_* keys are API keys and
  // should not be presented as a Bearer JWT.
  if (key.startsWith('eyJ')) headers.Authorization = `Bearer ${key}`
  return headers
}

export async function queryGrowthTable<T>(table: string, params: Record<string, string> = {}): Promise<T[]> {
  const url = new URL(`${growthSupabaseUrl()}/rest/v1/${table}`)
  url.searchParams.set('select', '*')
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value))
  const response = await fetch(url, { headers: growthSupabaseHeaders(), cache: 'no-store' })
  if (!response.ok) throw new Error(`Supabase ${table} query failed: ${response.status} ${await response.text()}`)
  return response.json() as Promise<T[]>
}

export async function updateGrowthRow<T>(table: string, key: string, value: string, changes: Record<string, unknown>): Promise<T | null> {
  const url = new URL(`${growthSupabaseUrl()}/rest/v1/${table}`)
  url.searchParams.set(key, `eq.${value}`)
  const response = await fetch(url, {
    method: 'PATCH',
    headers: growthSupabaseHeaders({ Prefer: 'return=representation' }),
    body: JSON.stringify(changes),
    cache: 'no-store',
  })
  if (!response.ok) throw new Error(`Supabase ${table} update failed: ${response.status} ${await response.text()}`)
  const rows = await response.json() as T[]
  return rows[0] || null
}

export async function insertGrowthRow<T>(table: string, row: Record<string, unknown>): Promise<T | null> {
  const response = await fetch(`${growthSupabaseUrl()}/rest/v1/${table}`, {
    method: 'POST',
    headers: growthSupabaseHeaders({ Prefer: 'return=representation' }),
    body: JSON.stringify(row),
    cache: 'no-store',
  })
  if (!response.ok) throw new Error(`Supabase ${table} insert failed: ${response.status} ${await response.text()}`)
  const rows = await response.json() as T[]
  return rows[0] || null
}

export async function upsertGrowthRow<T>(table: string, row: Record<string, unknown>, onConflict: string): Promise<T | null> {
  const url = new URL(`${growthSupabaseUrl()}/rest/v1/${table}`)
  url.searchParams.set('on_conflict', onConflict)
  const response = await fetch(url, {
    method: 'POST',
    headers: growthSupabaseHeaders({ Prefer: 'resolution=merge-duplicates,return=representation' }),
    body: JSON.stringify(row),
    cache: 'no-store',
  })
  if (!response.ok) throw new Error(`Supabase ${table} upsert failed: ${response.status} ${await response.text()}`)
  const rows = await response.json() as T[]
  return rows[0] || null
}
