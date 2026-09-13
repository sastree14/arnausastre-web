import 'server-only'

import { growthSupabaseHeaders, growthSupabaseUrl } from '@/lib/supabase-growth'

export function growthAssetBucket() {
  return (process.env.SUPABASE_ASSET_BUCKET || 'growth-assets').trim() || 'growth-assets'
}

function encodeStorageKey(key: string) {
  return key.split('/').filter(Boolean).map(encodeURIComponent).join('/')
}

export async function uploadGrowthAsset(key: string, data: Uint8Array, contentType: string) {
  const bucket = growthAssetBucket()
  const response = await fetch(`${growthSupabaseUrl()}/storage/v1/object/${bucket}/${encodeStorageKey(key)}`, {
    method: 'POST',
    headers: growthSupabaseHeaders({
      'Content-Type': contentType,
      'x-upsert': 'true',
      'Cache-Control': '3600',
    }),
    body: Buffer.from(data),
    cache: 'no-store',
  })
  if (!response.ok) throw new Error(`Supabase asset upload failed: ${response.status} ${await response.text()}`)
  return `supabase://${bucket}/${key}`
}

export async function fetchGrowthAsset(ref: string) {
  if (!ref.startsWith('supabase://')) throw new Error('Unsupported asset reference')
  const rest = ref.slice('supabase://'.length)
  const slash = rest.indexOf('/')
  if (slash <= 0) throw new Error('Malformed asset reference')
  const bucket = rest.slice(0, slash)
  const key = rest.slice(slash + 1)
  if (bucket !== growthAssetBucket()) throw new Error('Asset bucket not allowed')
  const response = await fetch(`${growthSupabaseUrl()}/storage/v1/object/${bucket}/${encodeStorageKey(key)}`, {
    headers: growthSupabaseHeaders(),
    cache: 'no-store',
  })
  if (!response.ok) throw new Error(`Asset not found: ${response.status}`)
  return response
}
