"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/DashboardLayout'
import { organizerEventApi } from '@/lib/services/organizerEventApi'

import ImageSelector from '@/components/create-event/ImageSelector'

import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

import EventHeroSection from '@/components/create-event/EventHeroSection'
import EventDescriptionEditor from '@/components/create-event/EventDescriptionEditor'
import HighlightsAndLineup from '@/components/create-event/HighlightsAndLineup'
import EventTypeSelector from '@/components/create-event/EventTypeSelector'
import TicketsEditor from '@/components/create-event/TicketsEditor'
import PromotionalDetails from '@/components/create-event/PromotionalDetails'
import PublishSidebarCard from '@/components/create-event/PublishSidebarCard'
import DateTimeCard from '@/components/create-event/DateTimeCard'
import LocationCard from '@/components/create-event/LocationCard'
import OrganizerCard from '@/components/create-event/OrganizerCard'
import MobileSubmitBar from '@/components/create-event/MobileSubmitBar'

const CreateEventPage = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [coverImageIndex, setCoverImageIndex] = useState(0)

  const [formData, setFormData] = useState({
    owner: '',
    email: '',
    phoneNo: '',
    title: '',
    category_id: '',
    location: '',
    google_maps_location: '',

    latitude: '',
    longitude: '',

    event_type: 'ticketed',
    external_link: '',
    price_from: '',
    currency: 'KES',
    description: '',
    short_description: '',
    from: '',
    to: '',
    from_time: '',
    to_time: '',
    poster: [],
    event_highlights: [],
    lineup: [],
    affiliate_enabled: false,
    affiliate_auto_approve: false
  })

  const [highlightInput, setHighlightInput] = useState('')
  const [lineupInput, setLineupInput] = useState('')

  const [tickets, setTickets] = useState([
    {
      name: '',
      type: 'single',
      price: '',
      quantity: '',
      group_size: '',
      description: ''
    }
  ])

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const response = await organizerEventApi.getCategories()
      if (response.success) {
        setCategories(response.data)
      }
    } catch (error) {
      console.error('Error loading categories:', error)
      toast.error('Failed to load categories')
    }
  }

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleEventTypeSelect = type => {
    setFormData(prev => ({ ...prev, event_type: type }))
  }

  //debug-test
  const handleImageChange = e => {
    const files = Array.from(e.target.files)

    if (files.length === 0) return

    // Check if adding these files would exceed the limit
    const remainingSlots = 3 - imagePreviews.length
    if (files.length > remainingSlots) {
      toast.error(
        `You can only add ${remainingSlots} more image(s). Maximum is 3 total.`
      )
      e.target.value = ''
      return
    }

    // Validate each file
    const validFiles = []
    for (const file of files) {
      if (file.size > 2048 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 2MB`)
        continue
      }
      validFiles.push(file)
    }

    if (validFiles.length === 0) {
      e.target.value = ''
      return
    }

    console.log(
      '📸 Valid files:',
      validFiles.map(f => f.name)
    )
    console.log('📸 Current poster count:', formData.poster?.length || 0)

    //  Create previews with unique ID
    const newPreviews = validFiles.map((file, idx) => ({
      id: `${Date.now()}-${idx}-${Math.random()}`,
      file,
      url: URL.createObjectURL(file)
    }))

    // Update imagePreviews
    setImagePreviews(prev => [...prev, ...newPreviews])

    //  Update formData.poster - ensure it's always an array
    setFormData(prev => {
      const currentPoster = Array.isArray(prev.poster) ? prev.poster : []
      const newPoster = [...currentPoster, ...validFiles]
      console.log('📸 New poster count:', newPoster.length)
      return {
        ...prev,
        poster: newPoster
      }
    })

    // If this is the first image, set it as cover
    if (imagePreviews.length === 0 && validFiles.length > 0) {
      setCoverImageIndex(0)
    }

    // Clear the input so files can be selected again
    e.target.value = ''

    const message =
      validFiles.length === 1
        ? 'Image added successfully!'
        : `${validFiles.length} images added successfully!`
    toast.success(message)
  }
  //debug-test

  //debug-test
  const removeImage = index => {
    console.log('📸 Removing image at index:', index)

    setImagePreviews(prev => {
      const newPreviews = prev.filter((_, i) => i !== index)
      // Adjust current index if needed
      if (index <= currentImageIndex && currentImageIndex > 0) {
        setCurrentImageIndex(currentImageIndex - 1)
      } else if (newPreviews.length === 0) {
        setCurrentImageIndex(0)
      } else if (currentImageIndex >= newPreviews.length) {
        setCurrentImageIndex(newPreviews.length - 1)
      }
      return newPreviews
    })

    setFormData(prev => {
      const currentPoster = Array.isArray(prev.poster) ? prev.poster : []
      const newPoster = currentPoster.filter((_, i) => i !== index)
      console.log('📸 After removal, poster count:', newPoster.length)
      return {
        ...prev,
        poster: newPoster
      }
    })

    if (index === coverImageIndex) {
      setCoverImageIndex(0) // Default to first image
    } else if (index < coverImageIndex) {
      setCoverImageIndex(coverImageIndex - 1)
    }
  }
  //debug-test

  const handleArrayInput = (e, setInput, field) => {
    const value = e.target.value
    if (value.includes(',')) {
      const items = value
        .split(',')
        .map(item => item.trim())
        .filter(item => item)
      if (items.length > 0) {
        if (field === 'event_highlights') {
          const availableSlots = 5 - formData[field].length
          if (availableSlots <= 0) {
            toast.error('Maximum 5 highlights allowed')
            setInput('')
            return
          }
          const itemsToAdd = items.slice(0, availableSlots)
          if (items.length > availableSlots) {
            toast.warning(
              `Only ${availableSlots} highlight(s) added. Maximum is 5.`
            )
          }
          setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], ...itemsToAdd]
          }))
        } else {
          setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], ...items]
          }))
        }
        setInput('')
      }
    } else {
      setInput(value)
    }
  }

  const addArrayItem = (input, setInput, field) => {
    if (input.trim()) {
      if (field === 'event_highlights' && formData[field].length >= 5) {
        toast.error('Maximum 5 highlights allowed')
        return
      }
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], input.trim()]
      }))
      setInput('')
    }
  }

  const removeArrayItem = (index, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const updateTicket = (index, field, value) => {
    const updated = [...tickets]
    updated[index][field] = value
    setTickets(updated)
  }

  const handleSubmit = async e => {
    e.preventDefault()

    setLoading(true)

    try {
      const data = new FormData()


      // Handle basic fields
      Object.keys(formData).forEach(key => {
        if (key === 'event_highlights' || key === 'lineup') {
          data.append(key, JSON.stringify(formData[key]))
        } else if (
          key === 'affiliate_enabled' ||
          key === 'affiliate_auto_approve'
        ) {
          data.append(key, formData[key] ? 1 : 0)
        } else if (key !== 'poster') {
          data.append(key, formData[key])
        }
      })

      // Handle images
      if (formData.poster && formData.poster.length > 0) {
        formData.poster.forEach((file, index) => {
          data.append(`poster[${index}]`, file)
        })
      }

          // 🆕 ADD COVER IMAGE INDEX
    data.append('cover_image_index', coverImageIndex)



      if (formData.event_type === 'ticketed') {
        tickets.forEach((ticket, index) => {
          Object.keys(ticket).forEach(key => {
            if (key === 'group_size' && ticket.type !== 'group') return
            data.append(`tickets[${index}][${key}]`, ticket[key] || '')
          })
        })
      }

      const response = await organizerEventApi.createEvent(data)
      if (response.success) {
        toast.success('Event created successfully!')
        router.push('/dashboard/events')
      }
    } catch (error) {
      console.log('STATUS:', error.response?.status)
      console.log('DATA:', error.response?.data)

      console.error('Error creating event:', error)
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors
        const errorMessages = Object.values(errors).flat()
        errorMessages.slice(0, 3).forEach(msg => toast.error(msg))
      } else {
        toast.error(error.response?.data?.message || 'Failed to create event')
      }
    } finally {
      setLoading(false)
    }
  }

  // LocationSearch's onLocationSelect fires { venue, latitude, longitude }.
  const handleLocationSelect = location => {
    setFormData(prev => ({
      ...prev,
      google_maps_location: location.venue,
      latitude: location.latitude,
      longitude: location.longitude
    }))
  }

  return (
    <DashboardLayout>
      <form
        onSubmit={handleSubmit}
        className='max-w-7xl mx-auto pb-16 sm:pb-20 lg:pb-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500'
      >
        {/* Navigation Header */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4'>
          <Button
            variant='ghost'
            type='button'
            onClick={() => router.push('/dashboard/events')}
            className='text-zinc-400 hover:text-white hover:bg-white/5 w-fit pl-0 h-8 sm:h-10 text-xs sm:text-sm'
          >
            <ArrowLeft className='h-3 w-3 sm:h-4 sm:w-4 mr-2' />
            Cancel & Return
          </Button>

          <div className='flex items-center gap-2'>
            <span className='text-xs sm:text-sm text-zinc-500 hidden sm:block mr-2'>
              Ready to launch?
            </span>
          </div>
        </div>

        <EventHeroSection
          imagePreviews={imagePreviews}
          currentImageIndex={currentImageIndex}
          setCurrentImageIndex={setCurrentImageIndex}
          handleImageChange={handleImageChange}
          removeImage={removeImage}
          categories={categories}
          formData={formData}
          handleInputChange={handleInputChange}
        />

        {/* 🆕 Image Selector - Cover Image Picker */}
        {imagePreviews.length > 0 && (
          <div className='bg-zinc-900/50 border border-white/5 rounded-xl p-4'>
            <div className='flex items-center justify-between mb-3'>
              <h4 className='text-sm font-medium text-white'>Cover Image</h4>
              <span className='text-xs text-zinc-500'>
                Select which image appears first
              </span>
            </div>
            <ImageSelector
              images={imagePreviews}
              currentIndex={currentImageIndex}
              setCurrentIndex={setCurrentImageIndex}
              coverIndex={coverImageIndex}
              onSelectCover={setCoverImageIndex}
            />
          </div>
        )}

        {/* Main Content Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8'>
          {/* Left Column: Details & Tickets */}
          <div className='lg:col-span-8 space-y-6 sm:space-y-8'>
            <EventDescriptionEditor
              value={formData.description}
              onChange={value =>
                setFormData(prev => ({ ...prev, description: value }))
              }
            />

            <HighlightsAndLineup
              formData={formData}
              highlightInput={highlightInput}
              setHighlightInput={setHighlightInput}
              lineupInput={lineupInput}
              setLineupInput={setLineupInput}
              handleArrayInput={handleArrayInput}
              addArrayItem={addArrayItem}
              removeArrayItem={removeArrayItem}
            />

            {/* Event Type & Tickets Container */}
            <div className='space-y-4 sm:space-y-6 pt-2 sm:pt-4 border-t border-zinc-800/50'>
              <EventTypeSelector
                eventType={formData.event_type}
                onSelect={handleEventTypeSelect}
              />

              <div className='animate-in fade-in slide-in-from-bottom-2 duration-300'>
                {formData.event_type === 'ticketed' ? (
                  <TicketsEditor
                    currency={formData.currency}
                    handleInputChange={handleInputChange}
                    tickets={tickets}
                    setTickets={setTickets}
                    updateTicket={updateTicket}
                  />
                ) : (
                  <PromotionalDetails
                    formData={formData}
                    handleInputChange={handleInputChange}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Sidebar */}
          <div className='lg:col-span-4 space-y-4 sm:space-y-6'>
            <div className='static lg:sticky lg:top-6 space-y-4 sm:space-y-6'>
              <PublishSidebarCard
                loading={loading}
                eventType={formData.event_type}
                formData={formData}
                handleInputChange={handleInputChange}
              />

              <DateTimeCard
                formData={formData}
                handleInputChange={handleInputChange}
              />

              <LocationCard
                formData={formData}
                handleInputChange={handleInputChange}
                handleLocationSelect={handleLocationSelect}
              />

              <OrganizerCard
                formData={formData}
                handleInputChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        <MobileSubmitBar loading={loading} />
      </form>
    </DashboardLayout>
  )
}

export default CreateEventPage
