import 'server-only'

import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

function encryptionKey(): Buffer {
  const raw = (process.env.GROWTH_ENCRYPTION_KEY || '').trim()
  if (!raw) throw new Error('GROWTH_ENCRYPTION_KEY is not configured')
  const key = Buffer.from(raw, 'base64')
  if (key.length !== 32) throw new Error('GROWTH_ENCRYPTION_KEY must decode to exactly 32 bytes')
  return key
}

function b64url(value: Buffer) {
  return value.toString('base64url')
}

export function encryptIntegrationSecret(value: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv)
  const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `v1.${b64url(iv)}.${b64url(tag)}.${b64url(ciphertext)}`
}

export function decryptIntegrationSecret(value: string): string {
  const [version, ivRaw, tagRaw, ciphertextRaw] = value.split('.')
  if (version !== 'v1' || !ivRaw || !tagRaw || !ciphertextRaw) throw new Error('Unsupported encrypted secret format')
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(ivRaw, 'base64url'))
  decipher.setAuthTag(Buffer.from(tagRaw, 'base64url'))
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(ciphertextRaw, 'base64url')),
    decipher.final(),
  ])
  return plaintext.toString('utf8')
}

export function encryptionConfigured() {
  try {
    encryptionKey()
    return true
  } catch {
    return false
  }
}
