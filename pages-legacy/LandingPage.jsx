"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { HeroCarousel } from '@/components/HeroCarousel'
import { EventCard } from '@/components/EventCard'
import { FeaturedEventsCarousel } from '@/components/FeaturedEventsCarousel'
import { ContactActions } from '@/components/ContactActions'
import { eventApi } from '@/lib/services/eventApi'
import { transformEventList } from '@/lib/utils/eventTransformer'
import { Calendar, Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const LandingPage = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [featuredEvents, setFeaturedEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [upcomingLoading, setUpcomingLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // Load initial data
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    setLoading(true)
    try {
      // Load featured and upcoming events in parallel
      const [featuredResponse, upcomingResponse] = await Promise.all([
        eventApi.getFeaturedEvents(6).catch(err => {
          console.error('Featured events API error:', err)
          return { success: false, data: [] }
        }),
        eventApi.getUpcomingEvents(12).catch(err => {
          console.error('Upcoming events API error:', err)
          return { success: false, data: [] }
        })
      ])

      if (featuredResponse.success && featuredResponse.data) {
        // Handle the simplified response structure (direct array)
        const featuredData = Array.isArray(featuredResponse.data)
          ? featuredResponse.data
          : featuredResponse.data.items || []
        const transformedFeatured = transformEventList(featuredData, true)
        setFeaturedEvents(transformedFeatured)
      }

      if (upcomingResponse.success && upcomingResponse.data) {
        const transformedEvents = transformEventList(upcomingResponse.data)
        setUpcomingEvents(transformedEvents)

        // Show load more button if we got the full page of events (indicates more may exist)
        // or if the API response indicates there are more pages
        const hasMorePages =
          upcomingResponse.data.current_page < upcomingResponse.data.last_page
        setHasMore(transformedEvents.length >= 12 || hasMorePages)
      }
    } catch (error) {
      console.error('Error loading events:', error)
      toast.error('Failed to load events. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadMoreEvents = async () => {
    setUpcomingLoading(true)
    try {
      const response = await eventApi.getEvents({
        page: currentPage + 1,
        per_page: 12,
        sort_by: 'from',
        sort_order: 'asc'
      })

      console.log('Load more response:', response)

      if (response.success && response.data) {
        // Handle both possible response structures
        const eventsData = response.data.data || response.data
        const newEvents = transformEventList(eventsData)

        if (newEvents.length > 0) {
          setUpcomingEvents(prev => [...prev, ...newEvents])
          setCurrentPage(prev => prev + 1)

          // Check if there are more pages
          const hasMorePages =
            response.data.current_page < response.data.last_page
          setHasMore(hasMorePages)

          console.log(
            `Loaded ${newEvents.length} events. Has more: ${hasMorePages}`
          )
        } else {
          setHasMore(false)
        }
      }
    } catch (error) {
      console.error('Error loading more events:', error)
      toast.error('Failed to load more events.')
    } finally {
      setUpcomingLoading(false)
    }
  }

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-background'>
        <div className='text-center'>
          <Loader2 className='h-12 w-12 animate-spin text-primary mx-auto mb-4' />
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-background relative'>
      <Navbar />

      <ContactActions />

      {/* Hero Carousel */}
      <section className='container mx-auto px-4 sm:px-6 lg:px-8 pt-4'>
        <HeroCarousel />
      </section>

      {/* Featured Experiences Section */}
      {featuredEvents.length > 0 && (
        <section className='container mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-20'>
          <div className='flex items-center gap-3 mb-8'>
            <div className='bg-gradient-red p-2 rounded-lg red-glow'>
              <Sparkles className='h-5 w-5 md:h-6 md:w-6 text-white' />
            </div>
            <div>
              <h2 className='text-xl md:text-3xl font-bold text-foreground'>
                Featured Experiences
              </h2>
              <p className='text-muted-foreground mt-1 text-sm md:text-base'>
                Handpicked highlights from our community
              </p>
            </div>
          </div>

          {/* Pass events to the carousel */}
          <div className='relative'>
            <FeaturedEventsCarousel events={featuredEvents} />
          </div>
        </section>
      )}

      {/* Upcoming Experiences Section */}
      <section className='container mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-20 pb-20'>
        <div className='flex items-center justify-between mb-8'>
          <div className='flex items-center gap-3'>
            <div className='bg-gradient-red p-2 rounded-lg red-glow'>
              <Calendar className='h-5 w-5 md:h-6 md:w-6 text-white' />
            </div>
            <div>
              <h2 className='text-xl md:text-3xl font-bold text-foreground'>
                Happening Soon
              </h2>
              <p className='text-muted-foreground mt-1 text-sm md:text-base'>
                Plan for what's coming up next
              </p>
            </div>
          </div>
        </div>

        {upcomingEvents.length > 0 ? (
          <>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6'>
              {/* {upcomingEvents.map((event) => (
                <div key={event.id} className="animate-fadeIn">
                  <EventCard event={event} />
                </div>
              ))} */}

              {upcomingEvents.map(event => (
                <EventCard
                  key={event.id || event.uuid || event.slug}
                  event={event}
                />
              ))}
            </div>

            {/* Discover More Link */}
            <div className='flex justify-center mt-12'>
              <Link
                href='/events'
                className='bg-secondary/50 hover:bg-secondary/80 text-foreground px-8 py-3 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 border border-white/10'
              >
                Discover more events
              </Link>
            </div>
          </>
        ) : (
          <div className='text-center py-20 bg-card/30 rounded-xl border border-border/50'>
            <p className='text-muted-foreground text-lg'>
              No upcoming experiences at the moment.
            </p>
          </div>
        )}
      </section>

      <Footer />
    </div>
  )
}

export default LandingPage
