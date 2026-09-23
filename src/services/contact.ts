import { tableRead, tableWrite, tableUpsert, uid, nowIso } from '@/lib/local-store'
import { cloudPostContact } from '@/lib/cloud'
import type { ContactFormPayload, ContactFormResult, ContactMessageRow } from '@/types'

const KEY = 'sfaxien.messages'

interface SubmitOptions {
  /** Honeypot — bots fill this hidden field. */
  website?: string
  /** Client timestamp for human-timing heuristics. */
  startedAt: number
  /** Lightweight anonymous fingerprint used for IP-correlated hashing. */
  fingerprint?: string
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

/**
 * Contact submissions are stored in the browser's local storage (the local
 * CMS message inbox). Validation mirrors the previous server-side checks so
 * malformed rows can never be inserted.
 */
export async function submitContact(
  payload: ContactFormPayload,
  options: SubmitOptions,
): Promise<ContactFormResult> {
  const name = payload.name.trim()
  const email = payload.email.trim()
  const message = payload.message.trim()

  if (name.length < 2 || name.length > 120) {
    return { ok: false, error: 'Name must be between 2 and 120 characters.' }
  }
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return { ok: false, error: 'Please enter a valid email address.' }
  }
  if (message.length < 10 || message.length > 5000) {
    return { ok: false, error: 'Message must be between 10 and 5000 characters.' }
  }
  if (options.website) {
    return { ok: true }
  }

  const row: ContactMessageRow = {
    id: uid(),
    name,
    email,
    project_type: payload.projectType || 'Other',
    budget: payload.budget || null,
    message,
    status: 'new',
    ip_hash: options.fingerprint ? await simpleHash(`${options.fingerprint}:${email}`) : null,
    created_at: nowIso(),
  }

  const rows = tableRead<ContactMessageRow>(KEY)
  if (rows.length >= 2000) {
    tableWrite(KEY, [...rows.slice(-1999), row])
  } else {
    tableUpsert(KEY, row)
  }

  await cloudPostContact({
    name,
    email,
    projectType: payload.projectType || 'Other',
    budget: payload.budget || '',
    message,
    website: options.website ?? '',
  })

  return { ok: true }
}

async function simpleHash(value: string): Promise<string> {
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32)
  } catch {
    return value.slice(0, 32)
  }
}