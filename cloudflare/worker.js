// Liefert die vorgerenderte Angular-Seite aus dist/ aus (Routing der Seiten und 404: siehe wrangler.jsonc).
// Prod: www leitet auf die Hauptdomain um. Jede andere Umgebung: Basic Auth und noindex.
export default {
  async fetch(request, env) {
    const isProd = env.APP_ENV === 'production'
    const url = new URL(request.url)

    if (isProd && url.hostname.startsWith('www.')) {
      url.hostname = url.hostname.slice(4)
      return Response.redirect(url.toString(), 301)
    }

    if (!isProd) {
      const denied = await checkBasicAuth(request, env)
      if (denied) return denied
    }

    const response = await env.ASSETS.fetch(request)
    if (isProd) return response

    const headers = new Headers(response.headers)
    headers.set('X-Robots-Tag', 'noindex, nofollow')
    // Hinter dem Login nichts in geteilten Caches ablegen
    headers.set('Cache-Control', 'private, no-store')
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  },
}

// Gibt null zurück, wenn die Zugangsdaten stimmen, sonst die Antwort für den Browser
async function checkBasicAuth(request, env) {
  // Fehlen die Secrets, bleibt die Seite zu statt offen
  if (!env.BASIC_AUTH_USER || !env.BASIC_AUTH_PASS) {
    return new Response('Basic Auth ist nicht konfiguriert.', { status: 503 })
  }

  const credentials = parseBasicAuth(request.headers.get('Authorization'))
  if (credentials) {
    const userOk = await safeEqual(credentials.user, env.BASIC_AUTH_USER)
    const passOk = await safeEqual(credentials.pass, env.BASIC_AUTH_PASS)
    if (userOk && passOk) return null
  }

  return new Response('Anmeldung erforderlich.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Portfolio Dev", charset="UTF-8"' },
  })
}

function parseBasicAuth(header) {
  const [scheme, encoded] = (header || '').split(' ')
  if (scheme !== 'Basic' || !encoded) return null

  let decoded
  try {
    const bytes = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0))
    decoded = new TextDecoder().decode(bytes)
  } catch {
    return null
  }

  const separator = decoded.indexOf(':')
  if (separator === -1) return null
  return { user: decoded.slice(0, separator), pass: decoded.slice(separator + 1) }
}

// Vergleich über Hashes gleicher Länge, damit die Laufzeit nichts über das Passwort verrät
async function safeEqual(a, b) {
  const encoder = new TextEncoder()
  const [hashA, hashB] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(a)),
    crypto.subtle.digest('SHA-256', encoder.encode(b)),
  ])
  return crypto.subtle.timingSafeEqual(hashA, hashB)
}
