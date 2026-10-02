// lib/eventApi.server.js
import { transformEventDetails } from '@/lib/utils/eventTransformer'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.turnapp.events/api'

export async function fetchEventServer(identifier) {
  if (!identifier) return null

  const url = `${API_BASE_URL}/events/items/${encodeURIComponent(identifier)}`

  let res
  try {
    res = await fetch(url, {
      next: { revalidate: 60 },
      headers: { Accept: 'application/json' },
    })
  } catch (err) {
    console.error('[eventApi.server] fetch failed:', err)
    return null
  }

  if (!res.ok) return null

  const json = await res.json().catch(() => null)
  if (!json || json.success === false) return null

  const rawEvent = json.data ?? json
  const canonicalSlug =
    json.canonical_slug ||
    rawEvent.slug ||
    rawEvent.uuid ||
    rawEvent.id ||
    identifier

  const event = transformEventDetails(rawEvent)

  return { event, canonicalSlug }
}