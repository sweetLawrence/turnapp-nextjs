"use client"

import { MapPin, ExternalLink } from 'lucide-react'

const GoogleMapsEmbed = ({
  latitude,
  longitude,
  venue,
  googleMapsLocation
}) => {
  //The coordinates fetched from the api are strings, we do a type conversion using Number() --- lawrence_tsungu
  if (typeof latitude === 'string') {
    latitude = parseFloat(latitude)
  }
  if (typeof longitude === 'string') {
    longitude = parseFloat(longitude)
  }

  const hasCoords = Number.isFinite(latitude) && Number.isFinite(longitude)// stricter validity check --- L.T

  if (!hasCoords && !googleMapsLocation) {
    return (
      <div className='glass rounded-xl p-4 sm:p-6 flex items-center'>
        <div className='w-full flex items-center justify-between gap-3 p-2 rounded-lg'>
          <span className='text-sm font-semibold text-white'>{venue}</span>
          <div className='w-10 h-10 rounded-full bg-black/60 flex items-center justify-center border-2 border-white/10 flex-shrink-0'>
            <MapPin className='h-5 w-5 text-primary' />
          </div>
        </div>
      </div>
    )
  }

  const directionsUrl = hasCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
    : googleMapsLocation.startsWith('http')
    ? googleMapsLocation
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        googleMapsLocation
      )}`

  let embedUrl

  if (hasCoords) {
    embedUrl = `https://www.google.com/maps?q=${latitude},${longitude}&output=embed`
  } else {
    embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
      googleMapsLocation
    )}&output=embed`
  }

  return (
    <div className='glass rounded-xl p-4 sm:p-6'>
      <div className='flex items-center justify-between gap-3 mb-3'>
        <div className='flex items-center gap-2'>
          <MapPin className='h-4 w-4 text-primary flex-shrink-0' />
          <span className='text-sm font-semibold text-white'>{venue}</span>
        </div>
        <a
          href={directionsUrl}
          target='_blank'
          rel='noopener noreferrer'
          className='text-xs text-primary hover:underline flex items-center gap-1 flex-shrink-0'
        >
          Get Directions
          <ExternalLink className='h-3 w-3' />
        </a>
      </div>
      <div className='rounded-lg overflow-hidden border border-white/10'>
        <iframe
          src={embedUrl}
          width='100%'
          height='250'
          style={{ border: 0, display: 'block' }}
          allowFullScreen
          loading='lazy'
          referrerPolicy='no-referrer-when-downgrade'
          title='Event Location'
        />
      </div>
    </div>
  )
}

export default GoogleMapsEmbed
