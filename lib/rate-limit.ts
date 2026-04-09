/**
 * Simple in-memory IP-based rate limiter for Next.js API routes.
 * Uses a sliding window approach — no external dependencies required.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) store.delete(key)
  }
}, 5 * 60 * 1000)

export interface RateLimitOptions {
  /** Max requests allowed in the window */
  limit: number
  /** Window duration in milliseconds */
  windowMs: number
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

export function rateLimit(ip: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now()
  const key = ip
  const existing = store.get(key)

  if (!existing || now > existing.resetAt) {
    // New window
    const entry: RateLimitEntry = { count: 1, resetAt: now + options.windowMs }
    store.set(key, entry)
    return { success: true, remaining: options.limit - 1, resetAt: entry.resetAt }
  }

  if (existing.count >= options.limit) {
    return { success: false, remaining: 0, resetAt: existing.resetAt }
  }

  existing.count += 1
  return { success: true, remaining: options.limit - existing.count, resetAt: existing.resetAt }
}

/** Extract the real client IP from a Next.js request */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') ?? 'unknown'
}
