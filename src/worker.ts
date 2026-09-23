interface AssetFetcher {
  fetch: (request: Request) => Promise<Response>
}

interface KVLike {
  get: (key: string) => Promise<string | null>
  put: (key: string, value: string) => Promise<void>
}

interface Env {
  ASSETS: AssetFetcher
  CONTENT: KVLike
  ADMIN_USERNAME?: string
  ADMIN_PASSWORD?: string
  SESSION_SECRET?: string
}

interface StoredMessage {
  id: string
  name: string
  email: string
  project_type: string
  budget: string | null
  message: string
  status: string
  ip_hash: string | null
  created_at: string
}

const CONTENT_TABLES = ['projects', 'categories', 'technologies']
const MESSAGES_KEY = 'messages'
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    },
  })
}

function b64urlEncode(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function b64urlDecode(value: string): Uint8Array {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4))
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return bytes
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

async function signToken(username: string, expiresAt: number, secret: string): Promise<string> {
  const payload = b64urlEncode(new TextEncoder().encode(`${username}.${expiresAt}`))
  const signature = await crypto.subtle.sign('HMAC', await hmacKey(secret), new TextEncoder().encode(payload))
  return `${payload}.${b64urlEncode(new Uint8Array(signature))}`
}

async function verifyToken(token: string, secret: string): Promise<string | null> {
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return null
  let valid = false
  try {
    valid = await crypto.subtle.verify(
      'HMAC',
      await hmacKey(secret),
      b64urlDecode(signature) as unknown as BufferSource,
      new TextEncoder().encode(payload),
    )
  } catch {
    return null
  }
  if (!valid) return null
  const decoded = new TextDecoder().decode(b64urlDecode(payload))
  const separator = decoded.lastIndexOf('.')
  const expiresAt = Number(decoded.slice(separator + 1))
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return null
  return decoded.slice(0, separator)
}

async function readJson<T>(env: Env, key: string, fallback: T): Promise<T> {
  const raw = await env.CONTENT.get(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

async function authorized(request: Request, env: Env): Promise<boolean> {
  const secret = env.SESSION_SECRET
  const header = request.headers.get('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
  if (!secret || !token) return false
  return (await verifyToken(token, secret)) !== null
}

async function readBody<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T
  } catch {
    return null
  }
}

async function handleLogin(request: Request, env: Env): Promise<Response> {
  const body = await readBody<{ username?: string; password?: string }>(request)
  if (!body?.username || !body?.password) {
    return json({ error: 'Username and password are required.' }, 400)
  }
  if (!env.ADMIN_USERNAME || !env.ADMIN_PASSWORD || !env.SESSION_SECRET) {
    return json({ error: 'Admin access is not configured on this deployment.' }, 503)
  }
  const usernameMatch =
    (await sha256Hex(body.username.trim().toLowerCase())) === (await sha256Hex(env.ADMIN_USERNAME.trim().toLowerCase()))
  const passwordMatch = (await sha256Hex(body.password)) === (await sha256Hex(env.ADMIN_PASSWORD))
  if (!usernameMatch || !passwordMatch) {
    return json({ error: 'Invalid credentials.' }, 401)
  }
  const expiresAt = Date.now() + SESSION_TTL_MS
  const token = await signToken(env.ADMIN_USERNAME, expiresAt, env.SESSION_SECRET)
  return json({ token, expiresAt, username: env.ADMIN_USERNAME })
}

async function handleContent(env: Env): Promise<Response> {
  const [projects, categories, technologies] = await Promise.all([
    readJson<unknown[]>(env, 'content:projects', []),
    readJson<unknown[]>(env, 'content:categories', []),
    readJson<unknown[]>(env, 'content:technologies', []),
  ])
  return json({ projects, categories, technologies })
}

async function handleContact(request: Request, env: Env): Promise<Response> {
  const body = await readBody<Record<string, string>>(request)
  if (!body) return json({ error: 'Invalid request.' }, 400)
  if (body.website) return json({ ok: true })
  const name = (body.name ?? '').trim()
  const email = (body.email ?? '').trim()
  const message = (body.message ?? '').trim()
  const projectType = (body.projectType ?? '').trim() || 'Other'
  const budget = (body.budget ?? '').trim() || null
  if (!name || !email || !message) {
    return json({ error: 'Name, email and message are required.' }, 400)
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'Please provide a valid email address.' }, 400)
  }
  const messages = await readJson<StoredMessage[]>(env, MESSAGES_KEY, [])
  messages.push({
    id: crypto.randomUUID(),
    name: name.slice(0, 120),
    email: email.slice(0, 254),
    project_type: projectType.slice(0, 80),
    budget: budget ? budget.slice(0, 80) : null,
    message: message.slice(0, 5000),
    status: 'new',
    ip_hash: null,
    created_at: new Date().toISOString(),
  })
  await env.CONTENT.put(MESSAGES_KEY, JSON.stringify(messages.slice(-500)))
  return json({ ok: true })
}

async function handlePutTable(request: Request, env: Env, table: string): Promise<Response> {
  if (!CONTENT_TABLES.includes(table)) return json({ error: 'Unknown table.' }, 400)
  const body = await readBody<unknown[]>(request)
  if (!Array.isArray(body)) return json({ error: 'Expected an array.' }, 400)
  await env.CONTENT.put(`content:${table}`, JSON.stringify(body))
  return json({ ok: true, count: body.length })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const { pathname } = url

    if (pathname === '/health' || pathname === '/api/health') {
      return json({ ok: true, service: 'sfaxien-portfolio' })
    }

    if (pathname === '/api/content' && request.method === 'GET') {
      return handleContent(env)
    }

    if (pathname === '/api/contact' && request.method === 'POST') {
      return handleContact(request, env)
    }

    if (pathname === '/api/admin/login' && request.method === 'POST') {
      return handleLogin(request, env)
    }

    if (pathname.startsWith('/api/admin/')) {
      if (!(await authorized(request, env))) {
        return json({ error: 'Unauthorized.' }, 401)
      }
      if (pathname === '/api/admin/session' && request.method === 'GET') {
        return json({ ok: true })
      }
      if (pathname === '/api/admin/messages' && request.method === 'GET') {
        return json({ data: await readJson<StoredMessage[]>(env, MESSAGES_KEY, []) })
      }
      if (pathname === '/api/admin/messages' && request.method === 'PUT') {
        const body = await readBody<StoredMessage[]>(request)
        if (!Array.isArray(body)) return json({ error: 'Expected an array.' }, 400)
        await env.CONTENT.put(MESSAGES_KEY, JSON.stringify(body))
        return json({ ok: true, count: body.length })
      }
      if (pathname.startsWith('/api/admin/table/') && request.method === 'PUT') {
        return handlePutTable(request, env, pathname.slice('/api/admin/table/'.length))
      }
      return json({ error: 'Not found.' }, 404)
    }

    return env.ASSETS.fetch(request)
  },
}
