"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/DashboardLayout'
import { organizerEventApi } from '@/lib/services/organizerEventApi'
// import { authService } from '@/lib/services/authService';
import { EventImagePlaceholder } from '@/components/EventImagePlaceholder'
import {
  Calendar,
  MapPin,
  DollarSign,
  Ticket,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Loader2,
  Star,
  MoreVertical,
  CheckCircle2,
  LayoutGrid,
  List as ListIcon,
  ArrowUpRight,
  BarChart3,
  Users
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

const EventsManagementPage = () => {
  const router = useRouter()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'

  // Pagination & Filtering State
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [perPage, setPerPage] = useState(12)
  const [totalEvents, setTotalEvents] = useState(0)
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')
  const [statusFilter, setStatusFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadEvents()
  }, [currentPage, perPage, sortBy, sortOrder, statusFilter, searchQuery])

  const loadEvents = async () => {
    setLoading(true)
    try {
      const params = {
        page: currentPage,
        per_page: perPage,
        sort_by: sortBy,
        sort_order: sortOrder,
        search: searchTerm,
        status: statusFilter
      }

      const response = await organizerEventApi.getEvents(params)

      if (response.success) {
        // console.log(' Dashboard Events Data:', response.data)

        // // DEBUG: Log each event's image data
        // response.data.forEach((event, index) => {
        //   console.log(` Event ${index + 1}:`, {
        //     title: event.title,
        //     image: event.image,
        //     images: event.images,
        //     cover_image_index: event.cover_image_index,
        //     folder: event.folder,
        //     filename: event.filename
        //   })
        // })

        setEvents(response.data)
        setTotalPages(response.meta.last_page)
        setTotalEvents(response.meta.total)
      }
    } catch (error) {
      console.error('Error loading events:', error)
      toast.error('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = e => {
    e.preventDefault()
    setCurrentPage(1)
    setSearchQuery(searchTerm)
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setSearchQuery('')
    setStatusFilter('')
    setCurrentPage(1)
  }

  const handleDelete = async (eventId, eventTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${eventTitle}"?`))
      return
    try {
      const response = await organizerEventApi.deleteEvent(eventId)
      if (response.success) {
        toast.success('Event deleted')
        loadEvents()
      }
    } catch (error) {
      toast.error('Failed to delete event')
    }
  }

  const handleStatusChange = async (eventId, newStatus, event) => {
    try {
      const eventEndDate = new Date(event.end_date || event.date)
      const now = new Date()

      if (newStatus === 'Ongoing' && eventEndDate < now) {
        toast.error('Cannot set past event to Ongoing')
        return
      }

      const response = await organizerEventApi.updateEventStatus(
        eventId,
        newStatus
      )
      if (response.success) {
        toast.success('Status updated')
        loadEvents()
      }
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  // --- Components ---

  const StatusBadge = ({ status, event, onStatusChange, compact = false }) => {
    const styles = {
      Ongoing: 'bg-emerald-600/90 text-white border-emerald-500/50 shadow-lg',
      Archived: 'bg-purple-600/90 text-white border-purple-500/50 shadow-lg',
      Closed: 'bg-slate-700/90 text-white border-slate-500/50 shadow-lg',
      Ended: 'bg-red-600/90 text-white border-red-500/50 shadow-lg'
    }

    const style = styles[status] || styles['Closed']
    const statusOptions = ['Ongoing', 'Archived', 'Closed', 'Ended']

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={`
            ${compact ? 'px-2.5 py-1 text-[10px]' : 'px-3 py-1 text-xs'} 
            rounded-full font-bold tracking-wider border ${style} 
            hover:scale-105 transition-all cursor-pointer flex items-center gap-1.5 backdrop-blur-md
          `}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full bg-white ${
                status === 'Ongoing' ? 'animate-pulse' : ''
              }`}
            />
            {status}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='bg-zinc-900 border-zinc-800'>
          {statusOptions.map(option => (
            <DropdownMenuItem
              key={option}
              onClick={() => onStatusChange(event.id, option, event)}
              className='text-zinc-300 hover:text-white hover:bg-white/10 cursor-pointer focus:bg-white/10'
            >
              {option}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  const EventPosterCard = ({ event }) => {
    //  Helper function to get the cover image
    const getCoverImage = () => {
      if (
        event.images &&
        Array.isArray(event.images) &&
        event.images.length > 0
      ) {
        const coverIndex = event.cover_image_index ?? 0
        if (event.images[coverIndex]) {
          // If the image path doesn't start with http, add the base URL
          const image = event.images[coverIndex]
          if (image.startsWith('http')) {
            return image
          }
          const baseUrl = (
            (process.env.NEXT_PUBLIC_API_URL || 'https://api.turnapp.events/api') || 'http://127.0.0.1:8000'
          )
            .replace(/\/api$/, '')
            .replace(/\/api\/$/, '')
          return `${baseUrl}/storage/${image}`
        }
      }
      return event.image || null
    }

    const coverImage = getCoverImage()

    return (
      <div className='group relative aspect-[3/4] bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-zinc-600 transition-all duration-500 shadow-xl'>
        {/* Background Image */}
        <div className='absolute inset-0'>
          {coverImage ? (
            <img
              src={coverImage}
              alt={event.title}
              className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-110'
            />
          ) : (
            <div className='w-full h-full bg-zinc-800 flex items-center justify-center'>
              <EventImagePlaceholder
                title={event.title}
                category={event.category}
              />
            </div>
          )}
          <div className='absolute inset-0 bg-gradient-to-t from-black from-0% via-black/70 via-40% to-transparent to-70% group-hover:from-black group-hover:via-black/80 transition-all duration-500' />
        </div>

        {/* 🆕 FEATURED BADGE */}
        {event.is_featured === 'yes' && (
          <div className='absolute top-3 left-3 z-20'>
            <span className='flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 backdrop-blur-sm shadow-lg'>
              <Star className='h-3 w-3 fill-yellow-400' />
              FEATURED
            </span>
          </div>
        )}

        {/* Status Top Right */}
        <div className='absolute top-3 right-3 z-10'>
          <StatusBadge
            status={event.status}
            event={event}
            onStatusChange={handleStatusChange}
            compact
          />
        </div>

        {/* Content Bottom */}
        <div className='absolute bottom-0 left-0 right-0 p-4 z-10 translate-y-2 group-hover:translate-y-0 transition-transform duration-300'>
          <div className='mb-2'>
            <p className='text-[10px] font-bold text-white/70 uppercase tracking-wider mb-1 truncate'>
              {new Date(event.date).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric'
              })}{' '}
              •{' '}
              {event.venue.length > 20
                ? event.venue.substring(0, 20) + '...'
                : event.venue}
            </p>
            <h3 className='text-base font-bold text-white leading-tight line-clamp-2 mb-1 drop-shadow-lg'>
              {event.title}
            </h3>
          </div>

          {/* Hover Reveal Actions */}
          <div className='relative z-20 grid grid-cols-2 gap-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0'>
            <Button
              size='sm'
              className='bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white'
              onClick={() =>
                router.push(
                  `/dashboard/events/${event.slug || event.uuid || event.id}`
                )
              }
            >
              View
            </Button>
            <Button
              size='sm'
              className='bg-primary hover:bg-primary/90 text-white border border-primary/20'
              onClick={() =>
                router.push(
                  `/dashboard/events/${
                    event.slug || event.uuid || event.id
                  }/edit`
                )
              }
            >
              Edit
            </Button>
          </div>

          {/* Quick Stats */}
          <div className='pointer-events-none flex items-center justify-between text-white text-[10px] mt-2 opacity-100 group-hover:opacity-0 transition-opacity duration-200 absolute w-full left-0 px-4 bottom-4'>
            <span className='flex items-center gap-1'>
              <Ticket className='h-3 w-3' /> {event.tickets_sold || 0} Sold
            </span>
            <span className='flex items-center gap-1'>
              <BarChart3 className='h-3 w-3' /> KES{' '}
              {(event.revenue || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    )
  }

  const EventListRow = ({ event }) => {
    // 🔍 DEBUG: Log the event in the list row
    console.log('📋 EventListRow event:', {
      id: event.id,
      uuid: event.uuid,
      slug: event.slug,
      title: event.title
    })

    const getIdentifier = () => {
      const identifier = event.slug || event.uuid || event.id
      console.log(
        '🔑 EventListRow identifier:',
        identifier,
        'for event:',
        event.title
      )
      return identifier
    }

    return (
      <div className='group flex flex-col sm:flex-row items-center gap-4 p-3 bg-zinc-900/40 hover:bg-zinc-900/80 backdrop-blur-sm border border-white/5 hover:border-white/10 rounded-xl transition-all mb-3'>
        {/* Thumbnail */}
        <div className='w-full sm:w-24 aspect-video sm:aspect-square rounded-lg overflow-hidden flex-shrink-0 bg-zinc-800 relative border border-white/5'>
          {event.image ? (
            <img
              src={event.image}
              alt=''
              className='w-full h-full object-cover'
            />
          ) : (
            <EventImagePlaceholder
              title={event.title}
              category={event.category}
            />
          )}
        </div>

        {/* Main Info */}
        <div className='flex-1 min-w-0 text-center sm:text-left w-full'>
          <div className='flex items-center justify-center sm:justify-start gap-2 mb-1'>
            <h3 className='font-bold text-white text-sm truncate group-hover:text-primary transition-colors'>
              {event.title}
            </h3>
            <StatusBadge
              status={event.status}
              event={event}
              onStatusChange={handleStatusChange}
              compact
            />
          </div>

          <div className='flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-[11px] text-zinc-400'>
            <span className='flex items-center gap-1.5'>
              <Calendar className='h-3 w-3 text-zinc-500' />
              {new Date(event.date).toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })}
            </span>
            <span className='hidden sm:inline text-zinc-700'>•</span>
            <span className='flex items-center gap-1.5'>
              <MapPin className='h-3 w-3 text-zinc-500' />
              {event.venue}
            </span>
          </div>
        </div>

        {/* Metrics */}
        <div className='grid grid-cols-2 gap-4 px-4 border-x border-white/5 mx-2 w-full sm:w-auto'>
          <div className='text-center'>
            <p className='text-[9px] text-zinc-500 uppercase tracking-wider font-semibold'>
              Revenue
            </p>
            <p className='text-xs font-bold text-emerald-400'>
              {(event.revenue || 0).toLocaleString()}
            </p>
          </div>
          <div className='text-center'>
            <p className='text-[9px] text-zinc-500 uppercase tracking-wider font-semibold'>
              Sold
            </p>
            <p className='text-xs font-bold text-white'>
              {event.tickets_sold || 0}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className='flex items-center justify-center gap-2 w-full sm:w-auto'>
          <Button
            size='icon'
            variant='ghost'
            className='h-8 w-8 hover:bg-white/10 hover:text-white text-zinc-400'
            onClick={() => {
              const identifier = getIdentifier()
              console.log('👁️ View clicked (list):', {
                title: event.title,
                identifier
              })
              router.push(`/dashboard/events/${identifier}`)
            }}
            title='View'
          >
            <Eye className='h-4 w-4' />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size='icon'
                variant='ghost'
                className='h-8 w-8 hover:bg-white/10 hover:text-white text-zinc-400'
              >
                <MoreVertical className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align='end'
              className='bg-zinc-900 border-zinc-800'
            >
              <DropdownMenuItem
                onClick={() => {
                  const identifier = getIdentifier()
                  console.log('✏️ Edit clicked (dropdown):', {
                    title: event.title,
                    identifier
                  })
                  router.push(`/dashboard/events/${identifier}/edit`)
                }}
                className='text-zinc-300 focus:text-white focus:bg-white/10 cursor-pointer'
              >
                <Edit className='mr-2 h-4 w-4' /> Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  const identifier = getIdentifier()
                  console.log('🌐 Public Page clicked:', {
                    title: event.title,
                    identifier
                  })
                  window.open(`/events/${identifier}`, '_blank')
                }}
                className='text-zinc-300 focus:text-white focus:bg-white/10 cursor-pointer'
              >
                <ArrowUpRight className='mr-2 h-4 w-4' /> Public Page
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDelete(event.id, event.title)}
                className='text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer'
              >
                <Trash2 className='mr-2 h-4 w-4' /> Delete Event
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className='space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20'>
        {/* --- Header Section --- */}
        <div className='flex flex-col md:flex-row md:items-end justify-between gap-4'>
          <div>
            <h1 className='text-2xl md:text-3xl font-bold text-white tracking-tight'>
              Events
            </h1>
            <p className='text-zinc-400 mt-1.5 text-xs md:text-sm'>
              Manage your portfolio, track sales, and update event details.
            </p>
          </div>
          <Button
            className='bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 h-10 px-5 rounded-xl font-medium text-sm'
            onClick={() => router.push('/dashboard/events/create')}
          >
            <Plus className='h-4 w-4 mr-2' />
            Create Event
          </Button>
        </div>

        {/* --- HUD Stats --- */}
        <div className='bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-2xl p-1 overflow-x-auto'>
          <div className='flex divide-x divide-white/5 min-w-max'>
            {[
              {
                label: 'Total Events',
                value: totalEvents,
                icon: Calendar,
                color: 'text-blue-400'
              },
              {
                label: 'Active Now',
                value: events.filter(e => e.status === 'Ongoing').length,
                icon: CheckCircle2,
                color: 'text-emerald-400'
              },
              {
                label: 'Total Attendees',
                value: events
                  .reduce(
                    (acc, curr) => acc + (parseInt(curr.tickets_sold) || 0),
                    0
                  )
                  .toLocaleString(),
                icon: Users,
                color: 'text-orange-400'
              },
              {
                label: 'Total Revenue',
                value:
                  'KES ' +
                  events
                    .reduce(
                      (acc, curr) => acc + (parseInt(curr.revenue) || 0),
                      0
                    )
                    .toLocaleString(),
                icon: DollarSign,
                color: 'text-white'
              }
            ].map((stat, idx) => (
              <div
                key={idx}
                className='px-6 py-3 flex items-center gap-3 group'
              >
                <div
                  className={`p-2.5 rounded-xl bg-white/5 ${stat.color} group-hover:bg-white/10 transition-colors`}
                >
                  <stat.icon className='h-4 w-4' />
                </div>
                <div>
                  <p className='text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-0.5'>
                    {stat.label}
                  </p>
                  <p className='text-lg font-bold text-white tracking-tight'>
                    {stat.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- Toolbar --- */}
        <div className='flex flex-col md:flex-row gap-3'>
          {/* Search & Filter Bar */}
          <form
            onSubmit={handleSearch}
            className='flex-1 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-xl p-2 flex items-center gap-2 shadow-xl'
          >
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500' />
              <input
                type='text'
                placeholder='Search by title...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-2 bg-transparent text-white placeholder-zinc-500 text-sm focus:outline-none'
              />
            </div>
            <div className='h-6 w-px bg-white/10 mx-1 hidden sm:block' />
            <div className='flex items-center gap-2'>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className='bg-zinc-800 text-xs text-zinc-300 rounded-lg px-3 py-2 border border-transparent focus:border-zinc-700 focus:outline-none cursor-pointer hover:bg-zinc-700 transition-colors appearance-none'
              >
                <option value=''>All Status</option>
                <option value='Ongoing'>Ongoing</option>
                <option value='Archived'>Archived</option>
                <option value='Closed'>Closed</option>
                <option value='Ended'>Ended</option>
              </select>
              <Button
                type='submit'
                className='h-9 bg-white text-black hover:bg-zinc-200 text-xs px-4'
              >
                Search
              </Button>
            </div>
          </form>

          {/* View Toggle */}
          <div className='bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-xl p-2 flex gap-1 shadow-xl shrink-0'>
            <button
              type='button'
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-zinc-700 text-white shadow'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
              }`}
              title='Grid View'
            >
              <LayoutGrid className='h-4 w-4' />
            </button>
            <button
              type='button'
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-zinc-700 text-white shadow'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
              }`}
              title='List View'
            >
              <ListIcon className='h-4 w-4' />
            </button>
          </div>
        </div>

        {/* --- Content Area --- */}
        <div className='min-h-[400px]'>
          {loading ? (
            <div className='flex flex-col items-center justify-center py-32'>
              <Loader2 className='h-8 w-8 animate-spin text-primary mb-3' />
            </div>
          ) : events.length > 0 ? (
            <>
              {viewMode === 'grid' ? (
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                  {events.map(event => (
                    <EventPosterCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <div className='flex flex-col'>
                  {/* List Header */}
                  <div className='hidden md:flex px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider border-b border-white/5 mb-2'>
                    <div className='w-24'>Image</div>
                    <div className='flex-1 text-left pl-4'>Event Details</div>
                    <div className='w-[200px] text-center'>Performance</div>
                    <div className='w-[100px] text-center'>Actions</div>
                  </div>
                  {events.map(event => (
                    <EventListRow key={event.id} event={event} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className='flex flex-col items-center justify-center py-24 border-2 border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20'>
              <div className='w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-5 shadow-xl border border-zinc-800'>
                <Search className='h-6 w-6 text-zinc-600' />
              </div>
              <h3 className='text-lg font-bold text-white mb-2'>
                No events found
              </h3>
              <p className='text-zinc-500 text-xs mb-6 max-w-sm text-center'>
                We couldn't find any events matching your criteria. Try clearing
                your filters or create a new one.
              </p>
              <Button
                variant='outline'
                onClick={handleClearFilters}
                className='border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 text-xs'
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>

        {/* --- Pagination --- */}
        {totalPages > 1 && (
          <div className='flex flex-col sm:flex-row items-center justify-between border-t border-white/10 pt-6 gap-4'>
            <p className='text-sm text-zinc-500'>
              Showing page{' '}
              <span className='text-white font-medium'>{currentPage}</span> of{' '}
              <span className='text-white font-medium'>{totalPages}</span>
            </p>
            <div className='flex items-center gap-2 bg-zinc-900 p-1 rounded-lg border border-white/5'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className='text-zinc-400 hover:text-white hover:bg-zinc-800'
              >
                Previous
              </Button>
              <div className='h-4 w-px bg-zinc-800' />
              <Button
                variant='ghost'
                size='sm'
                onClick={() =>
                  setCurrentPage(prev => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className='text-zinc-400 hover:text-white hover:bg-zinc-800'
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default EventsManagementPage
