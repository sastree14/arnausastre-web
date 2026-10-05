export const dynamic = 'force-dynamic'
export const revalidate = 0

function js(value: string) {
  return JSON.stringify(value)
}

export async function GET(request: Request) {
  const supabaseUrl = (process.env.SUPABASE_URL || '').trim()
  const publishableKey = (process.env.SUPABASE_PUBLISHABLE_KEY || '').trim()
  const authorizationId = new URL(request.url).searchParams.get('authorization_id') || ''

  if (!supabaseUrl || !publishableKey) {
    return new Response('Supabase OAuth consent is not configured.', { status: 500 })
  }

  const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>SC-Analytics · Autorizar ChatGPT</title>
  <style>
    :root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#0f172a;background:#f8fafc}
    *{box-sizing:border-box}
    body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;background:linear-gradient(180deg,#f8fafc 0%,#eef2ff 100%)}
    main{width:min(620px,100%);background:#fff;border:1px solid #e2e8f0;border-radius:24px;box-shadow:0 24px 60px rgba(15,23,42,.10);overflow:hidden}
    header{padding:30px;background:#020617;color:#fff}
    .eyebrow{font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#a5b4fc}
    h1{font-size:30px;line-height:1.15;margin:10px 0 0}
    section{padding:28px}
    p{line-height:1.65;color:#475569;margin:0}
    .muted{font-size:13px;color:#64748b}
    .box{margin-top:18px;border:1px solid #e2e8f0;border-radius:16px;background:#f8fafc;padding:16px}
    .row{display:flex;gap:10px;align-items:center;justify-content:space-between;padding:9px 0;border-bottom:1px solid #e2e8f0}
    .row:last-child{border-bottom:0}
    label{display:block;font-size:12px;font-weight:700;color:#475569;margin:18px 0 7px}
    input{width:100%;border:1px solid #cbd5e1;border-radius:10px;padding:12px 13px;font:inherit}
    button{border:0;border-radius:10px;padding:12px 16px;font-weight:700;cursor:pointer}
    .primary{background:#0f172a;color:#fff}
    .secondary{background:#fff;color:#334155;border:1px solid #cbd5e1}
    .actions{display:flex;gap:10px;margin-top:20px}
    .actions button{flex:1}
    .error{margin-top:14px;border:1px solid #fecaca;background:#fef2f2;color:#991b1b;padding:12px;border-radius:10px;font-size:13px}
    .success{margin-top:14px;border:1px solid #bbf7d0;background:#f0fdf4;color:#166534;padding:12px;border-radius:10px;font-size:13px}
    [hidden]{display:none!important}
  </style>
</head>
<body>
  <main>
    <header>
      <div class="eyebrow">SC-Analytics · Secure Access</div>
      <h1>Autorizar acceso desde ChatGPT</h1>
    </header>
    <section>
      <div id="loading"><p>Comprobando la solicitud de autorización…</p></div>

      <div id="login" hidden>
        <p>Primero inicia sesión con el correo autorizado para SC-Analytics. Te enviaremos un enlace de acceso.</p>
        <form id="login-form">
          <label for="email">Correo</label>
          <input id="email" name="email" type="email" autocomplete="email" required placeholder="tu@correo.com" />
          <button class="primary" style="margin-top:12px;width:100%" type="submit">Enviar enlace de acceso</button>
        </form>
        <div id="login-message"></div>
      </div>

      <div id="consent" hidden>
        <p>Una aplicación está solicitando acceso a las herramientas privadas de SC-Analytics.</p>
        <div class="box">
          <div class="row"><strong>Aplicación</strong><span id="client-name" class="muted"></span></div>
          <div class="row"><strong>Cuenta</strong><span id="user-email" class="muted"></span></div>
          <div class="row"><strong>Permisos OAuth</strong><span id="scope" class="muted"></span></div>
        </div>
        <p class="muted" style="margin-top:16px">
          Las acciones sobre CRM y Supabase están limitadas por RLS, allowlist y un registro de auditoría. No se concede acceso SQL genérico.
        </p>
        <div class="actions">
          <button id="deny" class="secondary" type="button">Cancelar</button>
          <button id="approve" class="primary" type="button">Autorizar</button>
        </div>
        <div id="decision-message"></div>
      </div>

      <div id="fatal" class="error" hidden></div>
    </section>
  </main>

  <script type="module">
    import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

    const SUPABASE_URL = ${js(supabaseUrl)}
    const SUPABASE_KEY = ${js(publishableKey)}
    const AUTHORIZATION_ID = ${js(authorizationId)}

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: true, detectSessionInUrl: true, flowType: 'pkce' }
    })

    const el = (id) => document.getElementById(id)
    const show = (id) => { el(id).hidden = false }
    const hide = (id) => { el(id).hidden = true }
    const fail = (message) => { hide('loading'); hide('login'); hide('consent'); el('fatal').textContent = message; show('fatal') }

    async function loadConsent() {
      if (!AUTHORIZATION_ID) return fail('Falta authorization_id. Inicia la conexión desde ChatGPT para generar una solicitud válida.')

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) return fail(sessionError.message)

      if (!sessionData.session) {
        hide('loading')
        show('login')
        return
      }

      const { data: details, error } = await supabase.auth.oauth.getAuthorizationDetails(AUTHORIZATION_ID)
      if (error || !details) return fail(error?.message || 'La solicitud OAuth no es válida.')

      if (!('authorization_id' in details)) {
        window.location.assign(details.redirect_url)
        return
      }

      el('client-name').textContent = details.client_name || details.client?.name || details.client_id || 'ChatGPT'
      el('scope').textContent = details.scope || 'profile'
      el('user-email').textContent = sessionData.session.user.email || 'Cuenta autenticada'
      hide('loading')
      hide('login')
      show('consent')
    }

    el('login-form').addEventListener('submit', async (event) => {
      event.preventDefault()
      const email = el('email').value.trim()
      const message = el('login-message')
      message.className = ''
      message.textContent = 'Enviando…'
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.href,
          shouldCreateUser: true
        }
      })
      if (error) {
        message.className = 'error'
        message.textContent = error.message
      } else {
        message.className = 'success'
        message.textContent = 'Revisa tu correo y abre el enlace de acceso en este navegador.'
      }
    })

    el('approve').addEventListener('click', async () => {
      el('decision-message').textContent = 'Autorizando…'
      const { data, error } = await supabase.auth.oauth.approveAuthorization(AUTHORIZATION_ID)
      if (error || !data?.redirect_url) return fail(error?.message || 'No se pudo aprobar la solicitud.')
      window.location.assign(data.redirect_url)
    })

    el('deny').addEventListener('click', async () => {
      el('decision-message').textContent = 'Cancelando…'
      const { data, error } = await supabase.auth.oauth.denyAuthorization(AUTHORIZATION_ID)
      if (error || !data?.redirect_url) return fail(error?.message || 'No se pudo cancelar la solicitud.')
      window.location.assign(data.redirect_url)
    })

    await loadConsent()
  </script>
</body>
</html>`

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
    },
  })
}
