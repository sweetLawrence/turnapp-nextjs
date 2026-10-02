// app/e/[identifier]/page.jsx
import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
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

  if (canonicalSlug && canonicalSlug !== identifier) {
    redirect(`/${canonicalSlug}`)
  }

  return (
    <Suspense fallback={null}>
      <EventDetailsClient event={event} affiliateRef={affiliateRef} />
    </Suspense>
  )
}

export async function generateMetadata({ params }) {
  const { identifier } = await params

  const result = await fetchEventServer(identifier)
  if (!result) return { title: 'Event not found - TurnApp' }

  const { event, canonicalSlug } = result
  // const siteUrl =
  //   process.env.NEXT_PUBLIC_SITE_URL || 'https://turnapp.events'

  const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000')

  const canonicalUrl = `${siteUrl}/${canonicalSlug}`

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
      url: canonicalUrl,
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