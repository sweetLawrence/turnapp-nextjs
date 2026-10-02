"use client"

import { logCheckoutEvent } from '@/lib/utils/errorLogger'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { EventImagePlaceholder } from '@/components/EventImagePlaceholder'
import { OrganizerCard } from '@/components/OrganizerCard'
import { ImageLightbox } from '@/components/ImageLightbox'
import GoogleMapsEmbed from '@/components/GoogleMapsEmbed'
import { API_BASE_URL } from '@/lib/services/apiClient'
import { checkoutApi } from '@/lib/services/checkoutApi'
import { pageViewApi } from '@/lib/services/pageViewApi'
import {
  Calendar,
  MapPin,
  Minus,
  Plus,
  Ticket,
  Share2,
  Heart,
  Maximize2,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  X,
  Mail,
  Twitter,
  Facebook,
  MessageCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

const sanitizeDescriptionHtml = html => {
  if (!html) return html

  return html
    .replace(/&nbsp;/g, ' ')
    .replace(/\u00A0/g, ' ')
    .replace(/[\u00AD\u200B\u200C\u200D\uFEFF]/g, '')
}

const EventDetailsClient = ({ event: initialEvent, affiliateRef }) => {
  const { identifier } = useParams()
  const router = useRouter()

  const [event] = useState(initialEvent)
  const [selectedTickets, setSelectedTickets] = useState({})
  const [timeLeft, setTimeLeft] = useState({})
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [isDescriptionOverflowing, setIsDescriptionOverflowing] = useState(false)
  const descriptionRef = useRef(null)

  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const cleanDescriptionHtml = useMemo(
    () => sanitizeDescriptionHtml(event?.description),
    [event?.description]
  )

// ========== PAGE VIEW TRACKING (fire once on mount) ==========
useEffect(() => {
  // Prefer slug or uuid — backend route doesn't accept numeric IDs
  const viewId = event?.slug || event?.uuid
  if (viewId) {
    pageViewApi.recordView(viewId).catch(() => {})
  }
}, [event?.slug, event?.uuid])

  // ========== AFFILIATE REFERRAL ==========
  useEffect(() => {
    if (!affiliateRef || !identifier) return

    try {
      localStorage.setItem(
        'affiliate_ref',
        JSON.stringify({
          code: affiliateRef,
          event_id: identifier,
          timestamp: Date.now()
        })
      )
    } catch (error) {
      console.warn('Unable to persist affiliate referral:', error?.name)
    }

    fetch(`${API_BASE_URL}/track-click`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        ref: affiliateRef,
        event_id: identifier,
        referrer_url: document.referrer || null
      })
    }).catch(() => {})
  }, [affiliateRef, identifier])

  // ========== RESOLVE CURRENT IMAGE ==========
  const getCurrentImage = useCallback(() => {
    if (!event) return null

    const resolveUrl = image => {
      if (!image) return null
      if (image.startsWith('http://') || image.startsWith('https://')) {
        return image
      }
      const baseUrl = (
        process.env.NEXT_PUBLIC_API_URL || 'https://api.turnapp.events/api'
      )
        .replace(/\/api$/, '')
        .replace(/\/api\/$/, '')
      return `${baseUrl}/storage/${image}`
    }

    if (event.images && Array.isArray(event.images) && event.images.length > 0) {
      return resolveUrl(event.images[currentImageIndex])
    }

    if (event.image) {
      return resolveUrl(event.image)
    }

    return null
  }, [event, currentImageIndex])

  const coverImage = getCurrentImage()

  // ========== COUNTDOWN TIMER ==========
  useEffect(() => {
    if (!event) return

    const calculateTimeLeft = () => {
      const eventDate = new Date(event.date + 'T' + event.time)
      const now = new Date()
      const difference = eventDate - now

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        }
      }
      return {}
    }

    setTimeLeft(calculateTimeLeft())
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [event])

  // Check if description content actually overflows the collapsed container
  const checkDescriptionOverflow = useCallback(() => {
    if (descriptionRef.current) {
      const el = descriptionRef.current
      setIsDescriptionOverflowing(el.scrollHeight > el.clientHeight + 4)
    }
  }, [])

  useEffect(() => {
    if (cleanDescriptionHtml) {
      const timer = setTimeout(checkDescriptionOverflow, 100)
      window.addEventListener('resize', checkDescriptionOverflow)
      return () => {
        clearTimeout(timer)
        window.removeEventListener('resize', checkDescriptionOverflow)
      }
    }
  }, [cleanDescriptionHtml, checkDescriptionOverflow])

  // ========== TICKET STATUS ==========
  const getTicketStatus = ticket => {
    if (ticket.sales_status === 'closed') {
      return { label: 'Sales Closed', isAvailable: false }
    }

    if (ticket.sale_starts_at && new Date(ticket.sale_starts_at) > new Date()) {
      const startDate = new Date(ticket.sale_starts_at).toLocaleDateString(
        'en-KE',
        { month: 'short', day: 'numeric', year: 'numeric' }
      )
      const startTime = new Date(ticket.sale_starts_at).toLocaleTimeString(
        'en-KE',
        { hour: '2-digit', minute: '2-digit' }
      )
      return {
        label: `Coming Soon (${startDate} ${startTime})`,
        isAvailable: false
      }
    }

    if (ticket.sale_ends_at && new Date(ticket.sale_ends_at) < new Date()) {
      return { label: 'Sales Ended', isAvailable: false }
    }

    if (ticket.available <= 0) {
      return { label: 'Sold Out', isAvailable: false }
    }

    return { label: 'Available', isAvailable: true }
  }

  const updateTicketQuantity = (ticketId, change) => {
    setSelectedTickets(prev => {
      const currentQty = prev[ticketId] || 0
      const newQty = Math.max(0, currentQty + change)

      if (newQty === 0) {
        const { [ticketId]: removed, ...rest } = prev
        return rest
      }

      return { ...prev, [ticketId]: newQty }
    })
  }

  const calculateTotal = () => {
    return Object.entries(selectedTickets).reduce(
      (total, [ticketId, quantity]) => {
        const ticket = event.tickets.find(t => t.id === ticketId)
        return total + (ticket ? ticket.price * quantity : 0)
      },
      0
    )
  }

  const handleCheckout = async () => {
    const selectedTicketsList = Object.entries(selectedTickets)
      .map(([ticketId, quantity]) => {
        const ticket = event.tickets.find(t => t.id === ticketId)

        return ticket ? { ...ticket, quantity } : null
      })
      .filter(Boolean)

    if (selectedTicketsList.length === 0) {
      toast.error('Please select at least one ticket')
      return
    }

    try {
      const existingToken = localStorage.getItem('cart_token')

      const buildCart = async () => {
        checkoutApi.clearCart()

        const newToken = checkoutApi.getCartToken()

        await logCheckoutEvent({
          action: 'build_cart_start',
          eventId: event?.id,
          cartToken: newToken,
          success: true,
          extra: {
            selected_tickets: selectedTicketsList.map(ticket => ({
              id: ticket.id,
              quantity: ticket.quantity
            }))
          }
        })

        await checkoutApi.createCart()

        for (const ticket of selectedTicketsList) {
          await checkoutApi.addItem(ticket.id, ticket.quantity)
        }

        await logCheckoutEvent({
          action: 'build_cart_success',
          eventId: event?.id,
          cartToken: checkoutApi.getCartToken(),
          success: true,
          extra: {
            selected_tickets: selectedTicketsList.map(ticket => ({
              id: ticket.id,
              quantity: ticket.quantity
            }))
          }
        })
      }

      if (!existingToken) {
        await buildCart()
      } else {
        let validation = await checkoutApi.validateCart()

        if (!validation.success) {
          await logCheckoutEvent({
            action: 'existing_cart_invalid',
            eventId: event?.id,
            cartToken: existingToken,
            success: false,
            extra: { response: validation }
          })

          await buildCart()
        }
      }

      const finalValidation = await checkoutApi.validateCart()

      if (!finalValidation.success) {
        await logCheckoutEvent({
          action: 'final_cart_validation_failed',
          eventId: event?.id,
          cartToken: checkoutApi.getCartToken(),
          success: false,
          extra: { response: finalValidation }
        })

        toast.error(
          'We had trouble preparing your checkout. Please try again.'
        )

        return
      }

      await logCheckoutEvent({
        action: 'handle_checkout_success',
        eventId: event?.id,
        cartToken: checkoutApi.getCartToken(),
        success: true,
        extra: {
          selected_tickets: selectedTicketsList.map(ticket => ({
            id: ticket.id,
            quantity: ticket.quantity
          }))
        }
      })

      sessionStorage.setItem(
        'checkout_state',
        JSON.stringify({
          event,
          selectedTickets: selectedTicketsList,
          total: calculateTotal()
        })
      )

      router.push('/checkout')
    } catch (error) {
      console.error('Checkout error:', error)

      await logCheckoutEvent({
        action: 'handle_checkout_error',
        eventId: event?.id,
        cartToken: checkoutApi.getCartToken(),
        success: false,
        extra: {
          response: error.response?.data,
          message: error.message,
          selected_tickets: selectedTicketsList.map(ticket => ({
            id: ticket.id,
            quantity: ticket.quantity
          }))
        }
      })

      toast.error(
        'We had trouble preparing your checkout. Please try again.'
      )
    }
  }

  const handleTouchStart = e => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = e => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (event.images && event.images.length > 1) {
      if (isLeftSwipe) {
        setCurrentImageIndex(prev =>
          prev < event.images.length - 1 ? prev + 1 : 0
        )
      }
      if (isRightSwipe) {
        setCurrentImageIndex(prev =>
          prev > 0 ? prev - 1 : event.images.length - 1
        )
      }
    }
  }

  // ========== SHARE ==========
  const getShareUrl = () => {
    const shareIdentifier = event?.slug || event?.uuid || event?.id
    return `${window.location.origin}/${shareIdentifier}`
  }

  const getShareText = () => {
    const cleanDescription = (
      event?.shortDescription ||
      event?.description?.replace(/<[^>]*>/g, '').substring(0, 150) ||
      'Check out this amazing event on TurnApp!'
    ).trim()

    return `${event?.title}\n\n${cleanDescription}\n\nLocation: ${
      event?.venue || ''
    }\nDate: ${new Date(event?.date).toLocaleDateString('en-KE', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })}${
      event?.time ? ` at ${event.time.substring(0, 5)}` : ''
    }\n\nGet your tickets at:`
  }

  const handleCopyLink = async () => {
    const url = getShareUrl()
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 3000)
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      toast.error('Failed to copy link')
    }
  }

  const shareToPlatform = platform => {
    const url = getShareUrl()
    const text = getShareText()
    const encodedText = encodeURIComponent(text)
    const encodedUrl = encodeURIComponent(url)

    let shareUrl = ''

    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText}%0A${encodedUrl}`
        break
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`
        break
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`
        break
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(
          `${event?.title} - TurnApp`
        )}&body=${encodedText}%0A${encodedUrl}`
        break
      default:
        return
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=600')
    }
  }

  const toggleShareModal = () => {
    setShareModalOpen(!shareModalOpen)
    setCopied(false)
  }

  const handleShare = async () => {
    if (!event) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: getShareText(),
          url: getShareUrl()
        })
        toast.success('Event shared successfully!')
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing via Web Share API:', error)
          toggleShareModal()
        }
      }
    } else {
      toggleShareModal()
    }
  }

  const handleSaveToCalendar = () => {
    if (!event) return

    try {
      const eventDate = new Date(event.date + 'T' + event.time)
      const endDate = new Date(eventDate.getTime() + 3 * 60 * 60 * 1000)

      const formatCalendarDate = date => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
      }

      const startTime = formatCalendarDate(eventDate)
      const endTime = formatCalendarDate(endDate)

      const description =
        event.shortDescription ||
        event.description.replace(/<[^>]*>/g, '').substring(0, 200)

      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        event.title
      )}&dates=${startTime}/${endTime}&details=${encodeURIComponent(
        description
      )}&location=${encodeURIComponent(event.venue)}&sf=true&output=xml`

      window.open(googleCalendarUrl, '_blank')

      setIsFavorite(!isFavorite)

      if (!isFavorite) {
        toast.success('Event saved to calendar!')
      } else {
        toast.info('Opening calendar...')
      }
    } catch (error) {
      console.error('Error saving to calendar:', error)
      toast.error('Failed to save to calendar. Please try again.')
    }
  }

  if (!event) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-white mb-4'>
            Event not found
          </h1>
          <Button onClick={() => router.push('/')}>Back to Events</Button>
        </div>
      </div>
    )
  }

  const totalTickets = Object.values(selectedTickets).reduce((a, b) => a + b, 0)

  return (
    <>
      <div className='min-h-screen'>
        <Navbar />

        <ImageLightbox
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          imageUrl={coverImage}
          title={event.title}
        />

        {/* Hero Image */}
        <div className='relative h-[400px] mt-16 group'>
          {coverImage && !imageError ? (
            <>
              <img
                src={coverImage}
                alt={event.title}
                className={`w-full h-full object-cover smooth-transition cursor-pointer ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImageError(true)
                  setImageLoaded(false)
                }}
                onClick={() => setLightboxOpen(true)}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              />
              {!imageLoaded && (
                <EventImagePlaceholder
                  title={event.title}
                  category={event.category}
                  className='absolute inset-0'
                />
              )}

              {imageLoaded && (
                <button
                  onClick={() => setLightboxOpen(true)}
                  className='absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-lg flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm border border-white/5'
                >
                  <Maximize2 className='h-4 w-4' />
                  <span className='text-sm font-medium'>View Full Image</span>
                </button>
              )}

              <div className='absolute top-4 right-4 flex gap-2 sm:hidden pointer-events-auto z-20'>
                <Button
                  variant='outline'
                  size='icon'
                  onClick={handleSaveToCalendar}
                  className={`h-10 w-10 border-white/10 backdrop-blur-md hover:bg-white/10 hover:border-red-600 transition-all ${
                    isFavorite
                      ? 'bg-red-600/30 border-red-600 text-red-600'
                      : 'bg-black/50 text-white'
                  }`}
                  title='Save to calendar'
                >
                  <Heart
                    className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`}
                  />
                </Button>
                <Button
                  variant='outline'
                  size='icon'
                  onClick={handleShare}
                  className='h-10 w-10 border-white/10 bg-black/50 text-white hover:bg-white/10 hover:border-red-600 backdrop-blur-md'
                  title='Share event'
                >
                  <Share2 className='h-5 w-5' />
                </Button>
              </div>
            </>
          ) : (
            <>
              <EventImagePlaceholder
                title={event.title}
                category={event.category}
                className='w-full h-full'
              />
              <div className='absolute top-4 right-4 flex gap-2 sm:hidden pointer-events-auto z-20'>
                <Button
                  variant='outline'
                  size='icon'
                  onClick={handleSaveToCalendar}
                  className={`h-10 w-10 border-white/10 backdrop-blur-md hover:bg-white/10 hover:border-red-600 transition-all ${
                    isFavorite
                      ? 'bg-red-600/30 border-red-600 text-red-600'
                      : 'bg-black/50 text-white'
                  }`}
                  title='Save to calendar'
                >
                  <Heart
                    className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`}
                  />
                </Button>
                <Button
                  variant='outline'
                  size='icon'
                  onClick={handleShare}
                  className='h-10 w-10 border-white/10 bg-black/50 text-white hover:bg-white/10 hover:border-red-600 backdrop-blur-md'
                  title='Share event'
                >
                  <Share2 className='h-5 w-5' />
                </Button>
              </div>
            </>
          )}
          <div className='absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none' />
        </div>

        <div className='container mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10'>
          <div
            className={`grid grid-cols-1 gap-8 ${
              event.eventType === 'experience' &&
              !event.externalLink &&
              (!event.tickets || event.tickets.length === 0)
                ? 'lg:grid-cols-1 max-w-5xl mx-auto'
                : 'lg:grid-cols-3'
            }`}
          >
            <div
              className={`space-y-6 min-w-0 ${
                event.eventType === 'experience' &&
                !event.externalLink &&
                (!event.tickets || event.tickets.length === 0)
                  ? ''
                  : 'lg:col-span-2'
              }`}
            >
              <div className='glass rounded-xl p-6 sm:p-8'>
                <div className='flex flex-wrap gap-2 mb-4'>
                  {event.featured && (
                    <Badge className='bg-gradient-to-r from-red-700 to-red-800 text-white border-0 text-[10px] px-1.5 py-0'>
                      FEATURED
                    </Badge>
                  )}
                  <Badge
                    variant='outline'
                    className='border-red-700 bg-transparent text-red-700 hover:bg-red-700/10 text-[10px] sm:text-xs px-3 py-1 rounded-sm font-normal transition-colors'
                  >
                    {event.category?.toUpperCase() || 'EVENT'}
                  </Badge>
                </div>

                <div className='flex items-start justify-between gap-4 mb-4 sm:mb-6'>
                  <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold text-white flex-1'>
                    {event.title}
                  </h1>
                  <div className='hidden sm:flex gap-2 flex-shrink-0'>
                    <Button
                      variant='outline'
                      size='icon'
                      onClick={handleSaveToCalendar}
                      className={`h-8 w-8 border-white/5 hover:bg-white/10 hover:border-red-600 transition-all ${
                        isFavorite
                          ? 'bg-red-600/20 border-red-600 text-red-600'
                          : 'text-white'
                      }`}
                      title='Save to calendar'
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          isFavorite ? 'fill-current' : ''
                        }`}
                      />
                    </Button>
                    <Button
                      variant='outline'
                      size='icon'
                      onClick={handleShare}
                      className='h-8 w-8 border-white/5 text-white hover:bg-white/10 hover:border-red-600'
                      title='Share event'
                    >
                      <Share2 className='h-4 w-4' />
                    </Button>
                  </div>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4'>
                  <div className='flex items-center gap-2 sm:gap-3'>
                    <Calendar className='h-4 w-4 sm:h-5 sm:w-5 text-red-700 flex-shrink-0' />
                    <div className='min-w-0'>
                      <p className='text-white font-medium text-xs sm:text-sm'>
                        {new Date(event.date).toLocaleDateString('en-KE', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                        {event.endDate && event.endDate !== event.date && (
                          <>
                            {' '}
                            -{' '}
                            {new Date(event.endDate).toLocaleDateString(
                              'en-KE',
                              {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              }
                            )}
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-2 sm:gap-3'>
                    <Clock className='h-4 w-4 sm:h-5 sm:w-5 text-red-700 flex-shrink-0' />
                    <div className='min-w-0'>
                      <p className='text-white font-medium text-xs sm:text-sm'>
                        {event.time?.substring(0, 5)}
                        {event.endTime
                          ? ` - ${event.endTime.substring(0, 5)}`
                          : ''}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-2 sm:gap-3'>
                    <MapPin className='h-4 w-4 sm:h-5 sm:w-5 text-red-700 flex-shrink-0' />
                    <div className='min-w-0 flex-1'>
                      <p className='text-white font-medium text-xs sm:text-sm line-clamp-2'>
                        {event.venue}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                {Object.keys(timeLeft).length > 0 && (
                  <div className='glass rounded-xl p-4 sm:p-6 h-full'>
                    <h3 className='text-sm font-semibold text-white mb-3 sm:mb-4'>
                      Event Starts In
                    </h3>
                    <div className='grid grid-cols-4 gap-2 sm:gap-3'>
                      {Object.entries(timeLeft).map(([unit, value]) => (
                        <div key={unit} className='text-center'>
                          <div className='bg-gradient-red hover:opacity-90 text-white red-glow rounded-lg p-1.5 sm:p-3 mb-1 sm:mb-2'>
                            <p className='text-base sm:text-lg lg:text-xl font-bold text-white'>
                              {value}
                            </p>
                          </div>
                          <p className='text-xs text-muted-foreground capitalize'>
                            {unit}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {event.organizer && event.userId && (
                  <div className='hidden lg:block h-full'>
                    <OrganizerCard
                      organizer={event.organizer}
                      userId={event.userId}
                    />
                  </div>
                )}
              </div>

              <div className='glass rounded-xl p-4 sm:p-6 lg:p-8 min-w-0 overflow-hidden'>
                <h2 className='text-sm font-bold text-white mb-3 sm:mb-4'>
                  About This Event
                </h2>
                <div className='relative min-w-0'>
                  <div
                    ref={descriptionRef}
                    className={`event-description min-w-0 text-sm text-muted-foreground leading-relaxed transition-[max-height] duration-300 ease-in-out overflow-hidden ${
                      showFullDescription ? 'max-h-[none]' : 'max-h-[9rem]'
                    }`}
                    style={{
                      maxHeight: showFullDescription
                        ? `${descriptionRef.current?.scrollHeight || 9999}px`
                        : '9rem'
                    }}
                    dangerouslySetInnerHTML={{ __html: cleanDescriptionHtml }}
                  />

                  {!showFullDescription && isDescriptionOverflowing && (
                    <div className='absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--glass-bg,rgba(0,0,0,0.6))] to-transparent pointer-events-none' />
                  )}
                  {isDescriptionOverflowing && (
                    <button
                      onClick={() => setShowFullDescription(prev => !prev)}
                      className='mt-3 text-xs text-muted-foreground hover:text-white hover:underline inline-flex items-center gap-1 transition-colors relative z-10'
                    >
                      {showFullDescription ? (
                        <>
                          Read Less
                          <ChevronUp className='h-4 w-4' />
                        </>
                      ) : (
                        <>
                          Read More
                          <ChevronDown className='h-4 w-4' />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {(event.latitude && event.longitude) ||
              event.googleMapsLocation ? (
                <GoogleMapsEmbed
                  latitude={event.latitude}
                  longitude={event.longitude}
                  venue={event.venue}
                  googleMapsLocation={event.googleMapsLocation}
                  hideViewOnMaps={true}
                />
              ) : null}

              {event.organizer && event.userId && (
                <div className='lg:hidden'>
                  <OrganizerCard
                    organizer={event.organizer}
                    userId={event.userId}
                  />
                </div>
              )}

              {event.highlights && event.highlights.length > 0 && (
                <div className='glass rounded-xl p-4 sm:p-6 lg:p-8'>
                  <h2 className='text-sm font-bold text-white mb-3 sm:mb-4'>
                    Event Highlights
                  </h2>
                  <ul className='space-y-2 sm:space-y-3'>
                    {event.highlights.map((highlight, index) => (
                      <li
                        key={index}
                        className='text-xs text-muted-foreground flex items-start gap-2'
                      >
                        <span className='text-muted-foreground mt-1 text-xs'>
                          •
                        </span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {event.lineup && event.lineup.length > 0 && (
                <div className='glass rounded-xl p-4 sm:p-6 lg:p-8'>
                  <h2 className='text-sm font-bold text-white mb-3 sm:mb-4'>
                    Lineup
                  </h2>
                  <div className='flex flex-wrap gap-2 sm:gap-3'>
                    {event.lineup.map((artist, index) => (
                      <Badge
                        key={index}
                        variant='outline'
                        className='border-white/10 bg-transparent text-muted-foreground px-3 py-1.5 sm:px-4 sm:py-2 text-xs'
                      >
                        {artist}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {event.eventType === 'experience' &&
            !event.externalLink &&
            (!event.tickets || event.tickets.length === 0) ? (
              event.organizer && event.userId ? (
                <div className='hidden lg:block lg:col-span-1'>
                  <div className='sticky top-24'>
                    <OrganizerCard
                      organizer={event.organizer}
                      userId={event.userId}
                    />
                  </div>
                </div>
              ) : null
            ) : (
              <div className='lg:col-span-1'>
                {(event.eventType === 'promotional' ||
                  event.eventType === 'experience') &&
                event.externalLink ? (
                  <div className='glass rounded-xl p-4 sm:p-6 sticky top-24'>
                    <h2 className='text-sm font-semibold text-white mb-4'>
                      Ticket Information
                    </h2>
                    <div className='space-y-4'>
                      {event.priceFrom && (
                        <div className='glass-light rounded-lg p-4 border-l-4 border-red-600'>
                          <div className='flex justify-between items-center'>
                            <div>
                              <p className='text-xs text-zinc-400 uppercase tracking-wider mb-1 font-medium'>
                                Price From
                              </p>
                            </div>
                            <div className='text-right'>
                              <p className='text-lg font-bold text-white'>
                                {event.currency || 'KES'}{' '}
                                {parseFloat(event.priceFrom).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      <Button
                        className='w-full bg-gradient-to-r bg-gradient-red hover:opacity-90 text-white red-glow text-sm sm:text-base py-4 sm:py-5 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-red-700/25'
                        onClick={() =>
                          window.open(event.externalLink, '_blank')
                        }
                      >
                        <ExternalLink className='h-4 w-4 mr-2' />
                        Book Now
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className='glass rounded-xl p-4 sm:p-6 sticky top-24'>
                    <h2 className='text-sm font-semibold text-white mb-4 sm:mb-6'>
                      Select Tickets
                    </h2>

                    <div className='space-y-3 sm:space-y-4 mb-4 sm:mb-6'>
                      {event.tickets.map(ticket => {
                        const status = getTicketStatus(ticket)
                        const isUnavailable = !status.isAvailable

                        return (
                          <div
                            key={ticket.id}
                            className={`glass-light rounded-lg p-3 sm:p-4 border-l-4 transition-all ${
                              isUnavailable
                                ? 'border-zinc-700 opacity-60'
                                : 'border-primary'
                            }`}
                          >
                            <div className='flex justify-between items-start mb-2 sm:mb-3'>
                              <div className='flex-1 min-w-0 pr-2'>
                                <div className='flex items-center gap-2 mb-1'>
                                  <h3
                                    className={`font-semibold text-xs sm:text-sm truncate ${
                                      isUnavailable
                                        ? 'text-zinc-400'
                                        : 'text-white'
                                    }`}
                                  >
                                    {ticket.name}
                                  </h3>
                                  {isUnavailable && (
                                    <Badge
                                      variant='destructive'
                                      className='text-[10px] px-2 py-0.5'
                                    >
                                      {status.label}
                                    </Badge>
                                  )}
                                </div>
                                {ticket.description && (
                                  <p className='text-[10px] sm:text-xs text-muted-foreground mb-2 line-clamp-2'>
                                    {ticket.description}
                                  </p>
                                )}
                                {!isUnavailable &&
                                  ticket.available <= 10 &&
                                  ticket.available > 0 && (
                                    <p className='text-[10px] text-amber-500 font-medium'>
                                      Only {ticket.available} left!
                                    </p>
                                  )}
                              </div>
                              <div className='text-right flex-shrink-0'>
                                {ticket.type === 'free' ||
                                ticket.type === 'complimentary' ? (
                                  <p className='text-xs sm:text-sm font-bold text-emerald-400'>
                                    FREE
                                  </p>
                                ) : (
                                  <>
                                    <p
                                      className={`text-xs sm:text-sm font-bold ${
                                        isUnavailable
                                          ? 'text-zinc-400 line-through'
                                          : 'text-white'
                                      }`}
                                    >
                                      {parseFloat(
                                        ticket.price
                                      ).toLocaleString()}
                                    </p>
                                    <p className='text-[10px] text-muted-foreground'>
                                      {event.currency || 'KES'}
                                    </p>
                                  </>
                                )}
                              </div>
                            </div>

                            {!isUnavailable && (
                              <div className='flex items-center justify-between mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-white/5'>
                                <span className='text-[10px] sm:text-xs text-muted-foreground'>
                                  Quantity
                                </span>
                                <div className='flex items-center gap-2'>
                                  <Button
                                    size='icon'
                                    variant='outline'
                                    className='h-7 w-7 sm:h-8 sm:w-8 rounded-full'
                                    onClick={() =>
                                      updateTicketQuantity(ticket.id, -1)
                                    }
                                    disabled={!selectedTickets[ticket.id]}
                                  >
                                    <Minus className='h-3 w-3' />
                                  </Button>
                                  <span className='w-6 sm:w-8 text-center font-semibold text-white text-sm sm:text-base'>
                                    {selectedTickets[ticket.id] || 0}
                                  </span>
                                  <Button
                                    size='icon'
                                    variant='outline'
                                    className='h-7 w-7 sm:h-8 sm:w-8 rounded-full'
                                    onClick={() =>
                                      updateTicketQuantity(ticket.id, 1)
                                    }
                                    disabled={
                                      (selectedTickets[ticket.id] || 0) >=
                                      ticket.available
                                    }
                                  >
                                    <Plus className='h-3 w-3' />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    <div className='border-t border-white/5 pt-3 sm:pt-4 mb-4 sm:mb-6'>
                      <div className='flex justify-between items-center'>
                        <span className='text-sm sm:text-base font-semibold text-white'>
                          Total
                        </span>
                        <span className='text-sm sm:text-base font-bold text-white'>
                          {event.currency || 'KES'}{' '}
                          {calculateTotal().toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <Button
                      className='w-full bg-gradient-to-r from-[#DC143C] to-[#B01030] hover:from-[#B01030] hover:to-[#8B0A24] text-white text-sm sm:text-base py-4 sm:py-5 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-[#DC143C]/25'
                      onClick={handleCheckout}
                      disabled={totalTickets === 0}
                    >
                      <Ticket className='h-4 w-4 mr-2' />
                      Proceed to Checkout
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {shareModalOpen && (
          <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm'>
            <div className='relative bg-zinc-900 rounded-2xl max-w-md w-full p-6 border border-white/10 shadow-2xl'>
              <button
                onClick={() => setShareModalOpen(false)}
                className='absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors'
              >
                <X className='h-5 w-5' />
              </button>

              <h2 className='text-xl font-bold text-white mb-2'>Share Event</h2>
              <p className='text-sm text-zinc-400 mb-6'>
                Share "{event?.title}" with your friends
              </p>

              <div className='flex items-center gap-2 bg-zinc-800 rounded-xl p-2 mb-6'>
                <input
                  type='text'
                  value={getShareUrl()}
                  readOnly
                  className='flex-1 bg-transparent text-white text-sm px-3 py-2 focus:outline-none'
                />
                <Button
                  onClick={handleCopyLink}
                  className='flex-shrink-0 bg-primary hover:bg-primary/90 text-white px-4'
                >
                  {copied ? (
                    <>
                      <Check className='h-4 w-4 mr-1' />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className='h-4 w-4 mr-1' />
                      Copy Link
                    </>
                  )}
                </Button>
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <Button
                  onClick={() => shareToPlatform('whatsapp')}
                  className='bg-[#25D366] hover:bg-[#1DA851] text-white'
                >
                  <MessageCircle className='h-4 w-4 mr-2' />
                  WhatsApp
                </Button>
                <Button
                  onClick={() => shareToPlatform('facebook')}
                  className='bg-[#1877F2] hover:bg-[#166FE5] text-white'
                >
                  <Facebook className='h-4 w-4 mr-2' />
                  Facebook
                </Button>
                <Button
                  onClick={() => shareToPlatform('twitter')}
                  className='bg-[#000000] hover:bg-[#1a1a1a] text-white border border-white/10'
                >
                  <Twitter className='h-4 w-4 mr-2' />
                  Twitter / X
                </Button>
                <Button
                  onClick={() => shareToPlatform('email')}
                  className='bg-zinc-700 hover:bg-zinc-600 text-white'
                >
                  <Mail className='h-4 w-4 mr-2' />
                  Email
                </Button>
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </>
  )
}

export default EventDetailsClient