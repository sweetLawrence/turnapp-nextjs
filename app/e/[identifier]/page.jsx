
import { notFound, permanentRedirect } from 'next/navigation'
import { Suspense } from 'react'
import { fetchEventServer } from '@/lib/eventApi.server'
import EventDetailsClient from './EventDetailsClient'

export const revalidate = 60

export default async function EventPage({ params, searchParams }) {
  const { identifier } = await params
  const sp = (await searchParams) || {}
  const affiliateRef = sp.ref || sp.affiliate || null

  const result = await fetchEventServer(identifier)
  if (!result) notFound()

  const { event, canonicalSlug } = result

  // Only redirect if we have a REAL slug (not numeric, not empty, not uuid-like)
  const hasRealSlug =
    typeof canonicalSlug === 'string' &&
    canonicalSlug.length > 0 &&
    !/^\d+$/.test(canonicalSlug) &&
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(canonicalSlug)

  const isDifferent = String(canonicalSlug) !== String(identifier)

  if (hasRealSlug && isDifferent) {
    permanentRedirect(`/${canonicalSlug}`)
  }

  return (
    <Suspense fallback={null}>
      <EventDetailsClient event={event} affiliateRef={affiliateRef} />
    </Suspense>
  )
}

// generateMetadata stays the same, but change `og:url` to use `identifier`:

export async function generateMetadata({ params }) {
  'use cache'
  const { identifier } = await params

  const result = await fetchEventServer(identifier)
  if (!result) return { title: 'Event not found - TurnApp' }

  const { event, canonicalSlug } = result
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000')

  // Use the identifier (the URL the user shared) for og:url
  const sharedUrl = `${siteUrl}/${identifier}`
  // But canonical should be the slug if we have one
  const canonicalUrl = `${siteUrl}/${canonicalSlug || identifier}`

  const cleanDescription = (
    event.shortDescription ||
    (event.description || '').replace(/<[^>]*>/g, '').substring(0, 160) ||
    'Check out this amazing event on TurnApp!'
  ).trim()

  const image = event.image || `${siteUrl}/og-image.jpg`

  return {
    title: `${event.title} - TurnApp`,
    description: cleanDescription,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${event.title} - TurnApp`,
      description: cleanDescription,
      url: sharedUrl,
      siteName: 'TurnApp',
      locale: 'en_KE',
      type: 'article',
      images: [{ url: image, width: 1200, height: 630, alt: event.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${event.title} - TurnApp`,
      description: cleanDescription,
      images: [image],
    },
  }
}