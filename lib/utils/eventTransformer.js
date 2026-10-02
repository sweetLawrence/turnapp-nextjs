/**
 * Transform API event data to match the frontend component structure
 */

/**
 * Resolve a single image path to a full URL.
 * Exported so components can reuse the exact same logic if needed.
 */
export const resolveImageUrl = image => {
  if (!image) return null
  if (typeof image !== 'string') return null
  if (image === 'null' || image === '/placeholder-event.jpg') return null

  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image
  }

  const baseUrl = (
    process.env.NEXT_PUBLIC_API_URL || 'https://api.turnapp.events/api'
  )
    .replace(/\/api$/, '')
    .replace(/\/api\/$/, '')

  // Already an absolute server path like "/storage/..."
  if (image.startsWith('/storage/')) {
    return `${baseUrl}${image}`
  }

  return `${baseUrl}/storage/${image}`
}

/**
 * Helper: pick the best cover image from an API event and return a full URL.
 */
const getEventImageUrl = event => {
  if (!event) return null

  // 1. images array with cover_image_index
  if (Array.isArray(event.images) && event.images.length > 0) {
    const coverIndex = event.cover_image_index ?? 0
    const candidate = event.images[coverIndex] || event.images[0]
    const resolved = resolveImageUrl(candidate)
    if (resolved) return resolved
  }

  // 2. poster_url
  if (event.poster_url) {
    const resolved = resolveImageUrl(event.poster_url)
    if (resolved) return resolved
  }

  // 3. direct image field
  if (event.image) {
    const resolved = resolveImageUrl(event.image)
    if (resolved) return resolved
  }

  // 4. folder + filename combination
  if (event.folder && event.filename) {
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000')
      .replace(/\/api$/, '')
      .replace(/\/api\/$/, '')
    return `${baseUrl}/storage/${event.folder}/${event.filename}`
  }

  return null
}

/**
 * Transform event list item from API
 */
export const transformEventListItem = (apiEvent, isExperience = false) => {
  const getPrice = () => {
    if (apiEvent.event_type === 'promotional' && apiEvent.price_from) {
      return parseFloat(apiEvent.price_from)
    }
    return apiEvent.price_range?.min || 0
  }

  const coverImage = getEventImageUrl(apiEvent)

  const resolvedImages = Array.isArray(apiEvent.images)
    ? apiEvent.images.map(resolveImageUrl).filter(Boolean)
    : []

  return {
    id: apiEvent.id,
    uuid: apiEvent.uuid,
    slug: apiEvent.slug,
    cover_image_index: apiEvent.cover_image_index ?? 0,
    title: apiEvent.title,
    description: apiEvent.short_description || '',
    shortDescription: apiEvent.short_description || '',
    date: apiEvent.from,
    time: apiEvent.from_time,
    endTime: apiEvent.to_time,
    venue: apiEvent.location,
    location: apiEvent.location,

    // Fully-resolved image URL (or null — EventCard shows placeholder)
    image: coverImage,

    // Fully-resolved image array
    images: resolvedImages,

    folder: apiEvent.folder,
    filename: apiEvent.filename,
    category: apiEvent.category?.name?.toLowerCase() || 'general',
    featured: false,
    price: getPrice(),
    priceRange: apiEvent.price_range,
    event_type: isExperience ? 'promotional' : apiEvent.event_type,
    price_from: apiEvent.price_from,
    external_link: apiEvent.external_link,
    currency: apiEvent.currency || 'KES',
    isExperience: isExperience,
    tickets: []
  }
}

/**
 * Transform detailed event data from API
 */
export const transformEventDetails = apiEvent => {
  const parseJsonField = field => {
    if (!field) return []
    if (Array.isArray(field)) return field
    if (typeof field === 'string') {
      try {
        const parsed = JSON.parse(field)
        return Array.isArray(parsed) ? parsed : []
      } catch (e) {
        return []
      }
    }
    return []
  }

  const coverImage = getEventImageUrl(apiEvent)

  const resolvedImages = Array.isArray(apiEvent.images)
    ? apiEvent.images.map(resolveImageUrl).filter(Boolean)
    : []

  return {
    id: apiEvent.id,
    uuid: apiEvent.uuid,
    slug: apiEvent.slug,
    cover_image_index: apiEvent.cover_image_index ?? 0,
    title: apiEvent.title,
    description: apiEvent.description || apiEvent.short_description || '',
    shortDescription: apiEvent.short_description || '',
    date: apiEvent.from,
    endDate: apiEvent.to,
    time: apiEvent.from_time,
    endTime: apiEvent.to_time,
    venue: apiEvent.location,
    location: apiEvent.location,
    googleMapsLocation: apiEvent.google_maps_location,
    latitude: apiEvent.latitude,
    longitude: apiEvent.longitude,
    eventType:
      (apiEvent.type === 'event' ? apiEvent.event_type : apiEvent.type) ||
      'ticketed',
    externalLink: apiEvent.external_link,

    image: coverImage,
    images: resolvedImages.length
      ? resolvedImages
      : coverImage
      ? [coverImage]
      : [],

    currency: apiEvent.currency || 'KES',
    priceFrom: apiEvent.price_from,
    category: apiEvent.category?.name?.toLowerCase() || 'general',
    featured: false,
    highlights: parseJsonField(apiEvent.event_highlights),
    lineup: parseJsonField(apiEvent.lineup),
    userId: apiEvent.user_id,
    organizer: apiEvent.user
      ? {
          name: apiEvent.user.name,
          email: apiEvent.user.email,
          profile_photo_url: apiEvent.user.profile_photo_url,
          bio: apiEvent.user.bio,
          social_links: apiEvent.user.social_links
        }
      : {
          name: apiEvent.owner,
          email: apiEvent.email,
          phone: apiEvent.phone
        },
    tickets: (apiEvent.tickets || []).map(transformTicket)
  }
}

/**
 * Transform ticket data from API
 */
export const transformTicket = apiTicket => {
  return {
    id: apiTicket.id.toString(),
    name: apiTicket.name,
    description: apiTicket.description || '',
    price: parseFloat(apiTicket.price) || 0,
    available: parseInt(apiTicket.available) || 0,
    total: parseInt(apiTicket.total) || 0,
    ticketType: apiTicket.ticket_type,
    groupSize: apiTicket.group_size,
    status: apiTicket.status,
    sales_status: apiTicket.sales_status || 'open',
    sale_starts_at: apiTicket.sale_starts_at || null,
    sale_ends_at: apiTicket.sale_ends_at || null,
    is_available: apiTicket.is_available ?? true,
    sale_status_label: apiTicket.sale_status_label || 'Available'
  }
}

/**
 * Transform multiple events from API
 */
export const transformEventList = (
  apiEvents,
  isFeatured = false,
  isExperience = false
) => {
  let eventsArray = apiEvents

  if (apiEvents && typeof apiEvents === 'object' && !Array.isArray(apiEvents)) {
    if (Array.isArray(apiEvents.items)) {
      eventsArray = apiEvents.items
    } else if (Array.isArray(apiEvents.data)) {
      eventsArray = apiEvents.data
    } else {
      console.warn(
        'transformEventList received non-array data without items/data property:',
        apiEvents
      )
      return []
    }
  }

  if (!Array.isArray(eventsArray)) {
    console.warn('transformEventList received non-array data:', apiEvents)
    return []
  }

  return eventsArray.map(event => ({
    ...transformEventListItem(event, isExperience),
    featured: isFeatured
  }))
}

/**
 * Format price for display
 */
export const formatPrice = price => {
  return `KES ${price.toLocaleString()}`
}

/**
 * Format date for display
 */
export const formatDate = dateString => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-KE', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

/**
 * Format time for display
 */
export const formatTime = timeString => {
  if (!timeString) return ''
  const [hours, minutes] = timeString.split(':')
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}
