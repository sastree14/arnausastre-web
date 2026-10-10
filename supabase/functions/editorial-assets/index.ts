// Scoped capability authentication; storage credentials never leave the server.
const url = Deno.env.get('SUPABASE_URL')!;
const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
async function rpc(name: string, args: Record<string, unknown> = {}) {
  const r = await fetch(`${url}/rest/v1/rpc/${name}`, { method: 'POST', headers, body: JSON.stringify(args) });
  if (!r.ok) throw new Error(`RPC ${name}: ${r.status}`);
  const body = await r.text();
  return body ? JSON.parse(body) : null;
}
Deno.serve(async (req: Request) => {
  const token = req.headers.get('x-editorial-capability') || '';
  if (!token || !await rpc('editorial_worker_authorized', { p_name: 'assets', p_token: token })) return new Response('Unauthorized', { status: 401 });
  const assets = await rpc('editorial_pending_assets');
  const results = [];
  for (const asset of assets) {
    try {
      if (!/^editorial\/approved-2026-10\/P\d{3}\/slide-\d{2}\.png$/.test(asset.asset_key)) throw new Error('Invalid asset key');
      const bytes = Uint8Array.from(atob(asset.payload), c => c.charCodeAt(0));
      if (bytes[0] !== 137 || bytes[1] !== 80 || bytes[2] !== 78 || bytes[3] !== 71) throw new Error('Invalid PNG');
      const r = await fetch(`${url}/storage/v1/object/growth-assets/${asset.asset_key}`, { method: 'POST', headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'image/png', 'x-upsert': 'true' }, body: bytes });
      if (!r.ok) throw new Error(`Storage upload: ${r.status}`);
      await rpc('editorial_asset_result', { p_key: asset.asset_key, p_error: null });
      results.push({ key: asset.asset_key, status: 'completed' });
    } catch (e) {
      const error = String(e).slice(0,200);
      await rpc('editorial_asset_result', { p_key: asset.asset_key, p_error: error });
      results.push({ key: asset.asset_key, status: 'failed', error });
    }
  }
  return Response.json({ results });
});
