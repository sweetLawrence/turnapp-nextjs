"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { DashboardLayout } from '@/components/DashboardLayout'
import { organizerEventApi } from '@/lib/services/organizerEventApi'
import { pageViewApi } from '@/lib/services/pageViewApi'
import { EventImagePlaceholder } from '@/components/EventImagePlaceholder'
import {
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Ticket,
  Users,
  Edit,
  Trash2,
  ArrowLeft,
  Loader2,
  TrendingUp,
  Eye,
  Share2,
  Download,
  BarChart3,
  ExternalLink,
  Globe,
  CheckCircle2,
  MoreVertical,
  Star,
  Copy,
  X,
  Mail,
  Twitter,
  Facebook,
  MessageCircle,
  Link as LinkIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

//    Import the Toggle component
import { CustomToggle } from '@/components/ui/CustomToggle'

const ShowEventPage = () => {
  const { identifier } = useParams()
  const router = useRouter()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)
  const [analyticsOpen, setAnalyticsOpen] = useState(false)
  const [analytics, setAnalytics] = useState(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  //    Share modal state
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const sanitizeDescriptionHtml = html => {
    if (!html) return html

    return html
      .replace(/&nbsp;/g, ' ')
      .replace(/\u00A0/g, ' ')
      .replace(/[\u00AD\u200B\u200C\u200D\uFEFF]/g, '')
  }

  const cleanDescriptionHtml = sanitizeDescriptionHtml(event?.description)

  //    Get share URL (slug > uuid > id)
  const getShareUrl = () => {
    const shareIdentifier = event?.slug || event?.uuid || event?.id
    return `${window.location.origin}/${shareIdentifier}`
  }

  //    Get share text
  const getShareText = () => {
    const cleanDescription = (
      event?.short_description ||
      event?.description?.replace(/<[^>]*>/g, '').substring(0, 150) ||
      'Check out this amazing event!'
    ).trim()

    return `🎉 ${event?.title}\n\n${cleanDescription}\n\n📍 ${
      event?.location || ''
    }\n📅 ${new Date(event?.from).toLocaleDateString('en-KE', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })}${
      event?.from_time ? ` at ${event.from_time.substring(0, 5)}` : ''
    }\n\n🎟️ Get your tickets:`
  }

  //    Copy link to clipboard
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

  //    Share to specific platform
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
          `🎉 ${event?.title}`
        )}&body=${encodedText}%0A${encodedUrl}`
        break
      default:
        return
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=600')
    }
  }

  //    Toggle share modal
  const toggleShareModal = () => {
    setShareModalOpen(!shareModalOpen)
    setCopied(false)
  }

  //    Handle share button click
  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: event?.title,
          text: getShareText(),
          url: getShareUrl()
        })
        .catch(error => {
          if (error.name !== 'AbortError') {
            console.error('Error sharing:', error)
            toggleShareModal()
          }
        })
    } else {
      toggleShareModal()
    }
  }

  // Original share function for fallback
  const handleShareLegacy = async () => {
    if (!event) return

    const eventUrl = getShareUrl()

    try {
      await navigator.clipboard.writeText(eventUrl)
      toast.success('Event link copied to clipboard!')
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      toast.error('Failed to copy link. Please try again.')
    }
  }

  const handleAnalytics = async () => {
    if (!event) return

    setAnalyticsOpen(true)
    setAnalyticsLoading(true)

    try {
      const response = await pageViewApi.getAnalytics(event.id)
      if (response.success) {
        setAnalytics(response.data)
      } else {
        toast.error('Failed to load analytics')
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
      toast.error('Failed to load analytics')
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const handleExportData = async () => {
    if (!event) return

    try {
      const csvContent = `Event: ${event.title}\nDate: ${
        event.from
      }\nLocation: ${event.location}\nTickets Sold: ${
        event.tickets_sold
      }\nRevenue: ${event.currency || 'KES'} ${
        event.revenue
      }\n\nNote: Detailed attendee data export coming soon.`

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${event.title
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase()}_summary.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('Event summary exported successfully!')
    } catch (error) {
      console.error('Error exporting data:', error)
      toast.error('Failed to export data. Please try again.')
    }
  }

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    setCurrentUser(user)
    loadEvent()
  }, [identifier])

  const loadEvent = async () => {
    try {
      setLoading(true)
      const response = await organizerEventApi.getEvent(identifier)
      if (response.success) {
        setEvent(response.data)
      }
    } catch (error) {
      console.error('Error loading event:', error)
      toast.error('Failed to load event details')
      router.push('/dashboard/events')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${event.title}"?`))
      return
    try {
      const response = await organizerEventApi.deleteEvent(event.id)
      if (response.success) {
        toast.success('Event deleted successfully')
        router.push('/dashboard/events')
      }
    } catch (error) {
      toast.error('Failed to delete event')
    }
  }

  const handleStatusChange = async newStatus => {
    try {
      const eventEndDate = new Date(event.to)
      const now = new Date()

      if (newStatus === 'Ongoing' && eventEndDate < now) {
        toast.error('Cannot set past event to Ongoing')
        return
      }

      const response = await organizerEventApi.updateEventStatus(
        event.id,
        newStatus
      )
      if (response.success) {
        toast.success('Status updated')
        loadEvent()
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to update status'
      toast.error(errorMessage)
    }
  }

const handleToggleFeatured = async () => {
  // Save current state for rollback
  const previousState = event.is_featured;
  const newState = previousState === 'yes' ? 'no' : 'yes';
  
  // Optimistic update
  setEvent({
    ...event,
    is_featured: newState,
  });

  try {
    const response = await organizerEventApi.toggleFeatured(event.id);
    
    if (response.success) {
      toast.success(response.message);
      // Sync with server to get any additional changes
      const freshEvent = await organizerEventApi.getEvent(identifier);
      if (freshEvent.success) {
        setEvent(freshEvent.data);
      }
    } else {
      // Rollback on failure
      setEvent({
        ...event,
        is_featured: previousState,
      });
      toast.error(response.message || 'Failed to update featured status');
    }
  } catch (error) {
    // Rollback on error
    setEvent({
      ...event,
      is_featured: previousState,
    });
    const errorMessage = error.response?.data?.message || 'Failed to toggle featured status';
    toast.error(errorMessage);
  }
};

  const getStatusBadge = (status, clickable = false) => {
    const isAdmin = currentUser?.user_type?.toLowerCase() === 'admin'

    const styles = {
      Ongoing:
        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]',
      Archived: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      Closed: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
      Ended: 'bg-red-500/10 text-red-400 border-red-500/20'
    }
    const style = styles[status] || styles['Closed']

    const getAvailableStatuses = currentStatus => {
      const baseStatuses = []

      if (currentStatus === 'Ongoing') {
        baseStatuses.push('Archived')
        if (isAdmin) {
          baseStatuses.push('Closed')
        }
      } else if (currentStatus === 'Archived') {
        baseStatuses.push('Ongoing')
        if (isAdmin) {
          baseStatuses.push('Closed')
        }
      } else if (currentStatus === 'Closed') {
        if (isAdmin) {
          baseStatuses.push('Ongoing')
        }
      } else if (currentStatus === 'Ended') {
        // Ended events cannot be changed
      }

      return baseStatuses
    }

    if (!clickable) {
      return (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide border ${style} flex items-center gap-1.5`}
        >
          <span className='w-1.5 h-1.5 rounded-full bg-current animate-pulse' />
          {status}
        </span>
      )
    }

    const availableStatuses = getAvailableStatuses(status)

    if (availableStatuses.length === 0) {
      return (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide border ${style} flex items-center gap-1.5`}
        >
          <span className='w-1.5 h-1.5 rounded-full bg-current animate-pulse' />
          {status}
        </span>
      )
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide border ${style} flex items-center gap-1.5 hover:scale-105 transition-all cursor-pointer`}
          >
            <span className='w-1.5 h-1.5 rounded-full bg-current animate-pulse' />
            {status}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='bg-zinc-900 border-zinc-800'>
          {availableStatuses.map(option => (
            <DropdownMenuItem
              key={option}
              onClick={() => handleStatusChange(option)}
              className='text-zinc-300 hover:text-white hover:bg-white/10 cursor-pointer focus:bg-white/10'
            >
              <span
                className={`w-2 h-2 rounded-full mr-2 ${
                  option === 'Ongoing'
                    ? 'bg-emerald-400'
                    : option === 'Archived'
                    ? 'bg-purple-400'
                    : option === 'Closed'
                    ? 'bg-slate-400'
                    : 'bg-red-400'
                }`}
              />
              {option}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className='flex items-center justify-center min-h-[60vh]'>
          <Loader2 className='h-8 w-8 animate-spin text-primary' />
        </div>
      </DashboardLayout>
    )
  }

  if (!event) {
    return (
      <DashboardLayout>
        <div className='flex flex-col items-center justify-center py-20 text-zinc-400'>
          <Calendar className='h-16 w-16 mb-4 opacity-20' />
          <h2 className='text-xl font-medium text-zinc-300'>Event not found</h2>
          <Button
            variant='link'
            onClick={() => router.push('/dashboard/events')}
            className='mt-2 text-primary'
          >
            Return to Events
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const startDate = new Date(event.from)
  const endDate = new Date(event.to)

  return (
    <>
      <DashboardLayout>
        <div className='max-w-7xl mx-auto pb-20 space-y-8 animate-in fade-in duration-500'>
          {/* Navigation Header */}
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
            <Button
              variant='ghost'
              onClick={() => router.push('/dashboard/events')}
              className='text-zinc-400 hover:text-white hover:bg-white/5 w-fit pl-0'
            >
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to Events
            </Button>

            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                onClick={() =>
                  window.open(
                    `/events/${event.slug || event.uuid || event.id}`,
                    '_blank'
                  )
                }
                className='hidden sm:flex border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300'
              >
                <ExternalLink className='h-4 w-4 mr-2' />
                Public Page
              </Button>

              <Button
                variant='outline'
                onClick={handleShare}
                className='border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300'
              >
                <Share2 className='h-4 w-4 sm:mr-2' />
                <span className='hidden sm:inline'>Share</span>
              </Button>

              <div className='h-6 w-px bg-zinc-800 hidden sm:block mx-1' />

              <Button
                onClick={() => router.push(`/dashboard/events/${event.id}/edit`)}
                className='bg-primary hover:bg-primary/90 text-primary-foreground'
              >
                <Edit className='h-4 w-4 mr-2' />
                Edit Event
              </Button>
              <Button
                variant='ghost'
                size='icon'
                onClick={handleDelete}
                className='text-zinc-400 hover:text-red-400 hover:bg-red-500/10'
              >
                <Trash2 className='h-4 w-4' />
              </Button>
            </div>
          </div>

          {/* Cinematic Hero Section */}
          <div className='relative group rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl'>
            {/* Blurry Background Layer */}
            <div className='absolute inset-0 z-0'>
              {event.image ? (
                <img
                  src={event.image}
                  alt=''
                  className='w-full h-full object-cover opacity-30 blur-3xl scale-110'
                />
              ) : (
                <div className='w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950' />
              )}
              <div className='absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent' />
            </div>

            <div className='relative z-10 flex flex-col md:flex-row gap-8 p-6 md:p-10 items-end'>
              {/* Main Image */}
              <div className='w-full md:w-[350px] aspect-[4/3] md:aspect-square rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-zinc-900 flex-shrink-0'>
                {event.image ? (
                  <img
                    src={event.image}
                    alt={event.title}
                    className='w-full h-full object-cover hover:scale-105 transition-transform duration-700'
                  />
                ) : (
                  <div className='w-full h-full flex items-center justify-center bg-zinc-800/50'>
                    <EventImagePlaceholder
                      title={event.title}
                      category={event.category?.name}
                    />
                  </div>
                )}
              </div>

              {/* Title & Key Info */}
              <div className='flex-1 w-full space-y-4 pb-2'>
                <div className='flex flex-wrap items-center gap-3'>
                  {getStatusBadge(event.status, true)}

                  {currentUser?.user_type?.toLowerCase() === 'admin' && (
                    <CustomToggle
                      enabled={event.is_featured === 'yes'}
                      onChange={handleToggleFeatured}
                      enabledLabel='Unfeature'
                      disabledLabel='Feature'
                      loading={loading}
                      onColor='yellow'
                      offColor='zinc'
                      icon={Star}
                      iconClassName={
                        event.is_featured === 'yes' ? 'fill-yellow-400' : ''
                      }
                    />
                  )}

                  {event.is_featured === 'yes' &&
                    currentUser?.user_type?.toLowerCase() !== 'admin' && (
                      <span className='px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400 border-yellow-500/30 flex items-center gap-1.5'>
                        <Star className='h-3 w-3 fill-yellow-400' />
                        FEATURED
                      </span>
                    )}

                  {event.category?.name && (
                    <span className='px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-zinc-300 border border-white/10'>
                      {event.category.name}
                    </span>
                  )}
                </div>

                <h1 className='text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight'>
                  {event.title}
                </h1>

                {event.short_description && (
                  <p className='text-lg text-zinc-400 max-w-2xl line-clamp-2'>
                    {event.short_description}
                  </p>
                )}

                <div className='flex flex-wrap items-center gap-x-6 gap-y-3 pt-4 text-zinc-300'>
                  <div className='flex items-center gap-2'>
                    <Calendar className='h-4 w-4 text-primary' />
                    <span>
                      {startDate.toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Clock className='h-4 w-4 text-primary' />
                    <span>{event.from_time}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <MapPin className='h-4 w-4 text-primary' />
                    <span>{event.location}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            {[
              {
                label: 'Tickets Sold',
                value: event.tickets_sold || 0,
                icon: Ticket,
                color: 'text-blue-400',
                bg: 'bg-blue-500/10'
              },
              {
                label: 'Revenue',
                value: `KES ${(event.revenue || 0).toLocaleString()}`,
                icon: DollarSign,
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/10'
              },
              {
                label: 'Page Views',
                value: event.page_views || 0,
                icon: Eye,
                color: 'text-purple-400',
                bg: 'bg-purple-500/10'
              },
              {
                label: 'Attendees',
                value: event.tickets_sold || 0,
                icon: Users,
                color: 'text-orange-400',
                bg: 'bg-orange-500/10'
              }
            ].map((stat, i) => (
              <div
                key={i}
                className='bg-zinc-900/50 backdrop-blur-sm border border-white/5 hover:border-white/10 transition-colors rounded-xl p-5'
              >
                <div className='flex items-start justify-between mb-4'>
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <TrendingUp className={`h-4 w-4 opacity-50 ${stat.color}`} />
                </div>
                <p className='text-2xl font-bold text-white tracking-tight'>
                  {stat.value}
                </p>
                <p className='text-xs text-zinc-500 font-medium uppercase tracking-wider mt-1'>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
            {/* Left Column: Main Content */}
            <div className='lg:col-span-8 space-y-8'>
              {/* About / Description */}
              <div className='space-y-4'>
                <h3 className='text-xl font-semibold text-white flex items-center gap-2'>
                  About Event
                </h3>
                <div className='bg-zinc-900/50 border border-white/5 rounded-2xl p-6 md:p-8 overflow-hidden max-w-full'>
                  {event.description ? (
                    <div
                      className='prose prose-invert prose-zinc max-w-full overflow-auto break-words 
                               prose-p:text-zinc-400 prose-headings:text-zinc-200 prose-strong:text-white
                               prose-img:max-w-full prose-img:h-auto prose-img:rounded-lg
                               prose-table:max-w-full prose-table:overflow-auto prose-table:block
                               prose-pre:max-w-full prose-pre:overflow-auto
                               [&_*]:max-w-full [&_*]:break-words'
                      dangerouslySetInnerHTML={{ __html: cleanDescriptionHtml }}
                    />
                  ) : (
                    <p className='text-zinc-500 italic'>
                      No detailed description provided.
                    </p>
                  )}

                  {/* Highlights */}
                  {event.event_highlights?.length > 0 && (
                    <div className='mt-8 pt-6 border-t border-white/5'>
                      <h4 className='text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4'>
                        Highlights
                      </h4>
                      <div className='flex flex-wrap gap-2'>
                        {event.event_highlights.map((highlight, index) => (
                          <div
                            key={index}
                            className='flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 rounded-lg border border-white/5 text-zinc-300 text-sm'
                          >
                            <CheckCircle2 className='h-3.5 w-3.5 text-primary' />
                            {highlight}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tickets Section */}
              <div className='space-y-4'>
                <h3 className='text-xl font-semibold text-white flex items-center gap-2'>
                  Tickets
                  <span className='text-xs font-normal text-zinc-500 bg-zinc-900 px-2 py-1 rounded-full border border-white/5'>
                    {event.tickets?.length || 0} Types
                  </span>
                </h3>

                <div className='grid grid-cols-1 gap-4'>
                  {event.tickets?.map((ticket, index) => (
                    <div
                      key={index}
                      className='group relative overflow-hidden bg-zinc-900/50 hover:bg-zinc-900 border border-white/5 hover:border-white/10 transition-all rounded-xl'
                    >
                      <div className='absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/50 to-primary/20' />

                      <div className='flex flex-col sm:flex-row'>
                        {/* Ticket Info */}
                        <div className='flex-1 p-5'>
                          <div className='flex items-center justify-between mb-2'>
                            <h4 className='font-bold text-lg text-white group-hover:text-primary transition-colors'>
                              {ticket.name}
                            </h4>
                            <span className='px-2 py-1 rounded text-xs font-medium bg-zinc-800 text-zinc-400 uppercase border border-white/5'>
                              {ticket.type}
                            </span>
                          </div>
                          {ticket.description && (
                            <p className='text-sm text-zinc-400 mb-3'>
                              {ticket.description}
                            </p>
                          )}
                          <div className='flex flex-wrap items-center gap-2 text-xs'>
                            <span className='flex items-center gap-1.5 rounded-md border border-white/5 bg-black/20 px-2.5 py-1.5 text-zinc-400'>
                              <Ticket className='h-3 w-3' />
                              Capacity{' '}
                              <strong className='text-white'>
                                {Number(ticket.quantity) || 0}
                              </strong>
                            </span>
                            <span className='rounded-md border border-white/5 bg-black/20 px-2.5 py-1.5 text-zinc-400'>
                              Sold{' '}
                              <strong className='text-white'>
                                {Number(ticket.sold) || 0}
                              </strong>
                            </span>
                            <span
                              className={`rounded-md border px-2.5 py-1.5 ${
                                (ticket.available ??
                                  Math.max(
                                    0,
                                    (Number(ticket.quantity) || 0) -
                                      (Number(ticket.sold) || 0)
                                  )) === 0
                                  ? 'border-primary/20 bg-primary/10 text-primary'
                                  : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                              }`}
                            >
                              Available{' '}
                              <strong>
                                {ticket.available ??
                                  Math.max(
                                    0,
                                    (Number(ticket.quantity) || 0) -
                                      (Number(ticket.sold) || 0)
                                  )}
                              </strong>
                            </span>
                            {ticket.group_size && (
                              <span className='flex items-center gap-1 rounded-md border border-white/5 bg-black/20 px-2.5 py-1.5 text-zinc-400'>
                                <Users className='h-3 w-3' />
                                Group of {ticket.group_size}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Ticket Price */}
                        <div className='relative p-5 sm:w-48 bg-zinc-950/30 flex flex-col items-center justify-center border-t sm:border-t-0 sm:border-l border-dashed border-white/10'>
                          <div className='absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-black hidden sm:block' />
                          <div className='absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-black hidden sm:block' />

                          <div className='text-center'>
                            <p className='text-xs text-zinc-500 uppercase tracking-wider mb-1'>
                              Price
                            </p>
                            {ticket.type === 'free' ||
                            ticket.type === 'complimentary' ? (
                              <span className='text-2xl font-bold text-emerald-400'>
                                FREE
                              </span>
                            ) : (
                              <span className='text-2xl font-bold text-white'>
                                KES {parseFloat(ticket.price).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lineup */}
              {event.lineup?.length > 0 && (
                <div className='space-y-4'>
                  <h3 className='text-xl font-semibold text-white'>
                    Lineup / Speakers
                  </h3>
                  <div className='bg-zinc-900/50 border border-white/5 rounded-2xl p-6'>
                    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
                      {event.lineup.map((artist, index) => (
                        <div
                          key={index}
                          className='text-center p-4 rounded-xl bg-zinc-800/30 border border-white/5 hover:border-primary/20 transition-colors'
                        >
                          <div className='w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center mb-3'>
                            <span className='text-lg font-bold text-zinc-400'>
                              {artist.charAt(0)}
                            </span>
                          </div>
                          <p className='font-medium text-zinc-200 text-sm truncate'>
                            {artist}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Sticky Sidebar */}
            <div className='lg:col-span-4 space-y-6'>
              <div className='sticky top-6 space-y-6'>
                {/* Event Timing Card */}
                <div className='bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden'>
                  <div className='p-4 bg-zinc-800/50 border-b border-white/5'>
                    <h3 className='font-semibold text-white flex items-center gap-2'>
                      <Calendar className='h-4 w-4 text-zinc-400' />
                      Date & Time
                    </h3>
                  </div>
                  <div className='p-5 space-y-4'>
                    <div className='flex gap-4'>
                      <div className='flex flex-col items-center justify-center w-14 h-14 bg-zinc-800 rounded-lg border border-white/5 text-center shrink-0'>
                        <span className='text-xs text-red-400 font-bold uppercase'>
                          {startDate.toLocaleDateString(undefined, {
                            month: 'short'
                          })}
                        </span>
                        <span className='text-xl font-bold text-white'>
                          {startDate.getDate()}
                        </span>
                      </div>
                      <div>
                        <p className='font-medium text-white'>
                          {startDate.toLocaleDateString(undefined, {
                            weekday: 'long'
                          })}
                        </p>
                        <p className='text-sm text-zinc-400'>
                          {event.from_time} - {event.to_time}
                        </p>
                      </div>
                    </div>
                    {event.to !== event.from && (
                      <div className='pl-[4.5rem] relative'>
                        <div className='absolute left-[1.65rem] -top-6 bottom-3 w-px border-l border-dashed border-zinc-700' />
                        <p className='text-xs text-zinc-500 uppercase tracking-wide mb-1'>
                          Ends
                        </p>
                        <p className='text-sm text-zinc-300'>
                          {endDate.toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    )}
                    <div className='pt-4 border-t border-white/5'>
                      <div className='flex items-start gap-3'>
                        <MapPin className='h-5 w-5 text-zinc-500 shrink-0 mt-0.5' />
                        <div>
                          <p className='text-sm font-medium text-white'>
                            Location
                          </p>
                          <p className='text-sm text-zinc-400 leading-snug mt-0.5'>
                            {event.location}
                          </p>
                          <Button
                            variant='link'
                            className='h-auto p-0 text-xs text-primary mt-1'
                          >
                            View on Map
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Organizer Card */}
                <div className='bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden'>
                  <div className='p-4 bg-zinc-800/50 border-b border-white/5'>
                    <h3 className='font-semibold text-white flex items-center gap-2'>
                      <Users className='h-4 w-4 text-zinc-400' />
                      Organizer
                    </h3>
                  </div>
                  <div className='p-5'>
                    <div className='flex items-center gap-3 mb-4'>
                      <div className='h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm'>
                        {event.owner?.charAt(0) || 'O'}
                      </div>
                      <div>
                        <p className='text-white font-medium'>{event.owner}</p>
                        <p className='text-xs text-zinc-500'>Event Host</p>
                      </div>
                    </div>
                    <div className='space-y-2'>
                      <div className='flex justify-between text-sm'>
                        <span className='text-zinc-500'>Email</span>
                        <span className='text-zinc-300 truncate max-w-[150px]'>
                          {event.email}
                        </span>
                      </div>
                      <div className='flex justify-between text-sm'>
                        <span className='text-zinc-500'>Phone</span>
                        <span className='text-zinc-300'>{event.phoneNo}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className='bg-gradient-to-b from-zinc-900 to-zinc-900/50 border border-zinc-800 rounded-xl p-5'>
                  <h3 className='text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4'>
                    Quick Actions
                  </h3>
                  <div className='space-y-2'>
                    <Button
                      variant='outline'
                      className='w-full justify-start border-zinc-700 hover:bg-zinc-800 text-zinc-300'
                      onClick={handleShare}
                    >
                      <Share2 className='h-4 w-4 mr-3 text-zinc-500' />
                      Share Event
                    </Button>
                    <Button
                      variant='outline'
                      className='w-full justify-start border-zinc-700 hover:bg-zinc-800 text-zinc-300'
                      onClick={handleAnalytics}
                    >
                      <BarChart3 className='h-4 w-4 mr-3 text-zinc-500' />
                      Analytics Report
                    </Button>
                    <Button
                      variant='outline'
                      className='w-full justify-start border-zinc-700 hover:bg-zinc-800 text-zinc-300'
                      onClick={handleExportData}
                    >
                      <Download className='h-4 w-4 mr-3 text-zinc-500' />
                      Export Attendee Data
                    </Button>
                  </div>
                </div>

                {/* Affiliate Status */}
                {event.affiliate_enabled && (
                  <div className='bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4'>
                    <div className='flex items-center justify-between mb-2'>
                      <h4 className='text-emerald-400 font-medium text-sm flex items-center gap-2'>
                        <Globe className='h-4 w-4' />
                        Affiliate Program
                      </h4>
                      <span className='flex h-2 w-2 rounded-full bg-emerald-500' />
                    </div>
                    <p className='text-xs text-emerald-500/60'>
                      Auto-approve is{' '}
                      <span className='font-bold'>
                        {event.affiliate_auto_approve ? 'ON' : 'OFF'}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* FLOATING SHARE BUTTON */}
          <div className='fixed bottom-6 right-6 z-50 lg:hidden'>
            <Button
              onClick={handleShare}
              className='bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-full p-4 h-auto'
            >
              <Share2 className='h-6 w-6' />
            </Button>
          </div>
        </div>
      </DashboardLayout>

      {/*    SHARE MODAL */}
      {shareModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200'>
          <div className='relative bg-zinc-900 rounded-2xl max-w-md w-full p-6 border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200'>
            {/* Close button */}
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

            {/* Copy Link */}
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

            <div className='relative mb-6'>
              <div className='absolute inset-0 flex items-center'>
                <span className='w-full border-t border-white/10' />
              </div>
              <div className='relative flex justify-center text-xs'>
                <span className='bg-zinc-900 px-2 text-zinc-500'>OR</span>
              </div>
            </div>

            {/* Share Buttons */}
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
                Twitter/X
              </Button>
              <Button
                onClick={() => shareToPlatform('email')}
                className='bg-zinc-700 hover:bg-zinc-600 text-white'
              >
                <Mail className='h-4 w-4 mr-2' />
                Email
              </Button>
            </div>

            {/* Native Share */}
            {navigator.share && (
              <div className='mt-4'>
                <Button
                  onClick={() => {
                    setShareModalOpen(false)
                    navigator
                      .share({
                        title: event?.title,
                        text: getShareText(),
                        url: getShareUrl()
                      })
                      .catch(() => {})
                  }}
                  variant='outline'
                  className='w-full border-white/10 hover:bg-white/5 text-white'
                >
                  <Share2 className='h-4 w-4 mr-2' />
                  More Share Options
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analytics Dialog */}
      <Dialog open={analyticsOpen} onOpenChange={setAnalyticsOpen}>
        <DialogContent className='max-w-4xl max-h-[80vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='text-white'>
              Event Analytics - {event?.title}
            </DialogTitle>
          </DialogHeader>

          {analyticsLoading ? (
            <div className='flex items-center justify-center py-8'>
              <Loader2 className='h-8 w-8 animate-spin text-primary' />
            </div>
          ) : analytics ? (
            <div className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='bg-zinc-900 border border-zinc-800 rounded-lg p-4'>
                  <div className='flex items-center gap-3'>
                    <Eye className='h-8 w-8 text-blue-500' />
                    <div>
                      <p className='text-2xl font-bold text-white'>
                        {analytics.summary.total_page_views}
                      </p>
                      <p className='text-sm text-zinc-400'>Total Views</p>
                    </div>
                  </div>
                </div>

                <div className='bg-zinc-900 border border-zinc-800 rounded-lg p-4'>
                  <div className='flex items-center gap-3'>
                    <Users className='h-8 w-8 text-green-500' />
                    <div>
                      <p className='text-2xl font-bold text-white'>
                        {analytics.summary.unique_page_views}
                      </p>
                      <p className='text-sm text-zinc-400'>Unique Visitors</p>
                    </div>
                  </div>
                </div>

                <div className='bg-zinc-900 border border-zinc-800 rounded-lg p-4'>
                  <div className='flex items-center gap-3'>
                    <TrendingUp className='h-8 w-8 text-purple-500' />
                    <div>
                      <p className='text-2xl font-bold text-white'>
                        {analytics.summary.conversion_rate}%
                      </p>
                      <p className='text-sm text-zinc-400'>Conversion Rate</p>
                    </div>
                  </div>
                </div>
              </div>

              {analytics.top_browsers && analytics.top_browsers.length > 0 && (
                <div className='bg-zinc-900 border border-zinc-800 rounded-lg p-4'>
                  <h3 className='text-lg font-semibold text-white mb-4'>
                    Top Browsers
                  </h3>
                  <div className='space-y-2'>
                    {analytics.top_browsers
                      .slice(0, 5)
                      .map((browser, index) => (
                        <div
                          key={index}
                          className='flex justify-between items-center'
                        >
                          <span className='text-zinc-300'>
                            {browser.browser}
                          </span>
                          <span className='text-zinc-400'>
                            {browser.views} views
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {analytics.recent_views && analytics.recent_views.length > 0 && (
                <div className='bg-zinc-900 border border-zinc-800 rounded-lg p-4'>
                  <h3 className='text-lg font-semibold text-white mb-4'>
                    Recent Views
                  </h3>
                  <div className='space-y-2 max-h-40 overflow-y-auto'>
                    {analytics.recent_views.slice(0, 10).map((view, index) => (
                      <div
                        key={index}
                        className='flex justify-between items-center text-sm'
                      >
                        <div>
                          <span className='text-zinc-300'>
                            {view.user_name || 'Anonymous'}
                          </span>
                          {view.user_email && (
                            <span className='text-zinc-500 ml-2'>
                              ({view.user_email})
                            </span>
                          )}
                        </div>
                        <span className='text-zinc-400'>
                          {new Date(view.viewed_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className='text-center text-sm text-zinc-500'>
                Analytics for {analytics.date_range.start} to{' '}
                {analytics.date_range.end}
              </div>
            </div>
          ) : (
            <div className='text-center py-8'>
              <p className='text-zinc-400'>No analytics data available</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ShowEventPage
