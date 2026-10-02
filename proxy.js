// middleware.js
import { NextResponse } from 'next/server'

/**
 * Every top-level path segment that is a REAL Next.js route (or file).
 * Anything not in this set is treated as an event slug and internally
 * rewritten to `/e/:slug` — the browser URL stays `/slug`.
 */
const RESERVED = new Set([
  'events',
  'event',
  'login',
  'register',
  'checkout',
  'success',
  'tickets',
  'manual-payment',
  'organizer',
  'dashboard',
  'affiliate',
  'admin',
  'auth',
  'api',
  '_next',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
  'manifest.json',
  'opengraph-image',
  'twitter-image',
])

export function proxy(request) {
  const { pathname } = request.nextUrl
  const segments = pathname.split('/').filter(Boolean)

  // Root (/) or single reserved segment — let Next handle it normally
  if (segments.length === 0) return NextResponse.next()

  const first = segments[0]

  // Reserved route or a file with an extension (e.g. /logo.png) → pass through
  if (RESERVED.has(first) || first.includes('.')) {
    return NextResponse.next()
  }

  // Otherwise: rewrite /some-event-slug → /e/some-event-slug (URL bar unchanged)
  const url = request.nextUrl.clone()
  url.pathname = `/e/${segments.join('/')}`
  return NextResponse.rewrite(url)
}

export const config = {
  // Run on everything except Next internals and static assets
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}