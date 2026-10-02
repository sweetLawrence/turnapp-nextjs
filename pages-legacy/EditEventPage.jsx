"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { DashboardLayout } from '@/components/DashboardLayout'
import { organizerEventApi } from '@/lib/services/organizerEventApi'
import ImageSelector from '@/components/create-event/ImageSelector'
import {
  Plus,
  X,
  Loader2,
  Upload,
  Calendar,
  Clock,
  Users,
  Ticket,
  ArrowLeft,
  Save,
  Sparkles,
  UserCircle,
  Star,
  ExternalLink
} from 'lucide-react'
import { toast } from 'sonner'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import LocationCard from '@/components/create-event/LocationCard'

const EditEventPage = () => {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingEvent, setLoadingEvent] = useState(true)
  const [categories, setCategories] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [currentUser, setCurrentUser] = useState(null)
  const [eventStatus, setEventStatus] = useState('')
  const [isFeatured, setIsFeatured] = useState('no')
  const [coverImageIndex, setCoverImageIndex] = useState(0)

  // Quill configuration
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
      ['clean']
    ]
  }

  const quillFormats = [
    'header',
    'bold',
    'italic',
    'underline',
    'list',
    'bullet',
    'link'
  ]

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
    poster: null,
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
      description: '',
      status: 'Available',
      sales_status: 'open',
      sale_starts_at: null,
      sale_ends_at: null
    }
  ])

  // Add this useEffect to monitor coverImageIndex changes
  useEffect(() => {
    console.log('🔄 coverImageIndex state in EditEventPage:', coverImageIndex)
  }, [coverImageIndex])

  useEffect(() => {
    // Get current user from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    setCurrentUser(user)
    loadCategories()
    loadEvent()
  }, [id])

  useEffect(() => {
    console.log('eventStatus changed to:', eventStatus)
  }, [eventStatus])

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

  const loadEvent = async () => {
    try {
      setLoadingEvent(true)
      const response = await organizerEventApi.getEvent(id)
      if (response.success) {
        const event = response.data

        console.log(' Event loaded:', event)
        console.log(' Event status:', event.status)
        console.log(' cover_image_index:', event.cover_image_index)

        // Set status and featured
        setEventStatus(event.status)
        setIsFeatured(event.is_featured || 'no')

        // Populate Form Data
        setFormData({
          owner: event.owner,
          email: event.email,
          phoneNo: event.phoneNo,
          title: event.title,
          category_id: event.category_id,
          location: event.location,
          google_maps_location: event.google_maps_location || '',
          latitude: event.latitude || '',
          longitude: event.longitude || '',
          event_type: event.event_type || 'ticketed',
          external_link: event.external_link || '',
          price_from: event.price_from || '',
          currency: event.currency || 'KES',
          description: event.description || '',
          short_description: event.short_description || '',
          from: event.from ? event.from.split('T')[0] : '',
          to: event.to ? event.to.split('T')[0] : '',
          from_time: event.from_time,
          to_time: event.to_time,
          poster: [],
          event_highlights: event.event_highlights || [],
          lineup: event.lineup || [],
          affiliate_enabled: Boolean(event.affiliate_enabled),
          affiliate_auto_approve: Boolean(event.affiliate_auto_approve)
        })

        // Set Image Previews
        if (event.images && event.images.length > 0) {
          setImagePreviews(event.images.map(img => ({ url: img, file: null })))

          // ✅ Load existing cover image index
          const coverIndex = event.cover_image_index ?? 0
          console.log('🖼️ Setting cover index to:', coverIndex)
          setCoverImageIndex(coverIndex)
          setCurrentImageIndex(coverIndex)
        } else if (event.image) {
          setImagePreviews([{ url: event.image, file: null }])
          setCoverImageIndex(0)
          setCurrentImageIndex(0)
        }

        // Populate Tickets
        if (event.tickets && event.tickets.length > 0) {
          setTickets(
            event.tickets.map(t => ({
              id: t.id,
              name: t.name,
              type: t.type,
              price: t.price,
              quantity: t.quantity,
              sold: t.sold || 0,
              available: t.available ?? Math.max(0, t.quantity - (t.sold || 0)),
              group_size: t.group_size || '',
              description: t.description || '',
              status: t.status || 'Available',
              // 🆕 Sale Controls
              sales_status: t.sales_status || 'open',
              sale_starts_at: t.sale_starts_at || null,
              sale_ends_at: t.sale_ends_at || null
            }))
          )
        }
      }
    } catch (error) {
      console.error('Error loading event:', error)
      toast.error('Failed to load event details')
      router.push('/dashboard/events')
    } finally {
      setLoadingEvent(false)
    }
  }

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleImageChange = e => {
    const files = Array.from(e.target.files)

    if (!Array.isArray(formData.poster)) {
      setFormData(prev => ({ ...prev, poster: [] }))
      return
    }

    if (files.length === 0) return

    // Check if adding these files would exceed the limit
    const remainingSlots = 3 - imagePreviews.length
    if (files.length > remainingSlots) {
      toast.error(
        `You can only add ${remainingSlots} more image(s). Maximum is 3 total.`
      )
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

    if (validFiles.length === 0) return

    // Add new images
    const newPreviews = validFiles.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }))

    setImagePreviews(prev => [...prev, ...newPreviews])
    setFormData(prev => ({
      ...prev,
      poster: [...prev.poster, ...validFiles]
    }))

    //  If this is the first image, set it as cover
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

  const removeImage = index => {
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

    setFormData(prev => ({
      ...prev,
      poster: prev.poster.filter((_, i) => i !== index)
    }))

    // 🆕Adjust cover index if needed
    if (index === coverImageIndex) {
      setCoverImageIndex(0) // Default to first image
    } else if (index < coverImageIndex) {
      setCoverImageIndex(coverImageIndex - 1)
    }
  }

  const handleArrayInput = (e, setInput, field) => {
    const value = e.target.value
    if (value.includes(',')) {
      const items = value
        .split(',')
        .map(item => item.trim())
        .filter(item => item)
      if (items.length > 0) {
        // Limit highlights to 5 items
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
      // Limit highlights to 5 items
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

  const handleStatusChange = async newStatus => {
    try {
      const eventEndDate = new Date(formData.to)
      const now = new Date()

      if (newStatus === 'Ongoing' && eventEndDate < now) {
        toast.error('Cannot set past event to Ongoing')
        return
      }

      const response = await organizerEventApi.updateEventStatus(id, newStatus)
      if (response.success) {
        toast.success('Status updated')
        setEventStatus(newStatus)
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to update status'
      toast.error(errorMessage)
    }
  }

  const handleToggleFeatured = async () => {
    try {
      const response = await organizerEventApi.toggleFeatured(id)
      if (response.success) {
        toast.success(response.message)
        setIsFeatured(isFeatured === 'yes' ? 'no' : 'yes')
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to toggle featured status'
      toast.error(errorMessage)
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
        console.log('📸 Appending images to FormData:')
        formData.poster.forEach((file, index) => {
          console.log(`📸 Appending poster[${index}]:`, file.name)
          data.append(`poster[${index}]`, file)
        })
      } else {
        console.log('📸 No images in formData.poster')
      }

      console.log('📸 Sending cover_image_index:', coverImageIndex)
      data.append('cover_image_index', coverImageIndex)

      // Handle tickets - only for ticketed events
      if (formData.event_type === 'ticketed') {
        tickets.forEach((ticket, index) => {
          Object.keys(ticket).forEach(key => {
            if (key === 'sold' || key === 'available') {
              return
            }
            // Only send group_size if ticket type is 'group'
            if (key === 'group_size' && ticket.type !== 'group') {
              return
            }
            // 🆕 Send sale control fields
            data.append(`tickets[${index}][${key}]`, ticket[key] || '')
          })
        })
      }

      const response = await organizerEventApi.updateEvent(id, data)
      console.log('📸 API Response:', response)

      if (response.success) {
        toast.success('Event updated successfully!')
        router.push('/dashboard/events')
      }
    } catch (error) {
      console.error('Error updating event:', error)

      // Handle validation errors
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors
        const errorMessages = Object.values(errors).flat()

        // Show first 3 errors to avoid overwhelming the user
        errorMessages.slice(0, 3).forEach(msg => {
          toast.error(msg)
        })

        if (errorMessages.length > 3) {
          toast.error(
            `...and ${errorMessages.length - 3} more validation errors`
          )
        }
      } else {
        toast.error(error.response?.data?.message || 'Failed to update event')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loadingEvent) {
    return (
      <DashboardLayout>
        <div className='flex flex-col items-center justify-center min-h-[60vh]'>
          <Loader2 className='h-8 w-8 animate-spin text-primary mb-4' />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <form
        onSubmit={handleSubmit}
        className='max-w-7xl mx-auto pb-20 lg:pb-8 space-y-8 animate-in fade-in duration-500'
      >
        {/* Navigation Header */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
          <Button
            variant='ghost'
            type='button'
            onClick={() => router.push('/dashboard/events')}
            className='text-zinc-400 hover:text-white hover:bg-white/5 w-fit pl-0'
          >
            <ArrowLeft className='h-4 w-4 mr-2' />
            Cancel & Return
          </Button>

          <div className='flex items-center gap-2 flex-wrap'>
            {/* Status Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type='button'
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide border transition-all hover:scale-105 ${
                    eventStatus === 'Ongoing' || eventStatus === 'Active'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : eventStatus === 'Pending'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : eventStatus === 'Cancelled'
                      ? 'bg-red-500/10 text-red-400 border-red-500/20'
                      : eventStatus === 'Archived'
                      ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                      : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                  }`}
                >
                  <span className='w-1.5 h-1.5 rounded-full bg-current inline-block mr-1.5' />
                  {eventStatus || 'Loading...'}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className='bg-zinc-900 border-zinc-800'>
                {(currentUser?.user_type?.toLowerCase() === 'admin'
                  ? [
                      'Ongoing',
                      'Pending',
                      'Cancelled',
                      'Closed',
                      'Done',
                      'Archived'
                    ]
                  : ['Ongoing', 'Pending', 'Cancelled', 'Closed', 'Done']
                ).map(status => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className='text-zinc-300 hover:text-white hover:bg-white/10 cursor-pointer focus:bg-white/10'
                  >
                    {status}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Featured Badge/Button (Admin Only) */}
            {isFeatured === 'yes' &&
              currentUser?.user_type?.toLowerCase() !== 'admin' && (
                <span className='px-3 py-1.5 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 flex items-center gap-1.5'>
                  <Star className='h-3 w-3' />
                  FEATURED
                </span>
              )}
            {currentUser?.user_type?.toLowerCase() === 'admin' && (
              <button
                type='button'
                onClick={handleToggleFeatured}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide border transition-all hover:scale-105 ${
                  isFeatured === 'yes'
                    ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30'
                    : 'bg-zinc-800/50 text-zinc-400 border-zinc-700 hover:bg-zinc-700'
                }`}
              >
                <Star className='h-3 w-3 inline mr-1' />
                {isFeatured === 'yes' ? 'Unfeature' : 'Feature'}
              </button>
            )}

            <span className='text-sm text-zinc-500 hidden md:block'>
              Editing:{' '}
              <span className='text-zinc-300 font-medium'>
                {formData.title || 'Untitled Event'}
              </span>
            </span>
          </div>
        </div>

        {/* Hero Section / Image Upload */}
        <div className='relative group rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl transition-all hover:border-zinc-700'>
          <div className='absolute inset-0 z-0'>
            {imagePreviews.length > 0 ? (
              <img
                src={imagePreviews[currentImageIndex]?.url}
                alt=''
                className='w-full h-full object-cover opacity-30 blur-3xl scale-110'
              />
            ) : (
              <div className='w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950' />
            )}
            <div className='absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent' />
          </div>

          <div className='relative z-10 flex flex-col md:flex-row gap-8 p-6 md:p-10 items-end'>
            {/* Image Upload Box */}
            <div className='w-full md:w-[350px] aspect-[4/3] md:aspect-square flex-shrink-0'>
              <input
                type='file'
                accept='image/*'
                onChange={handleImageChange}
                className='hidden'
                id='hero-upload'
                multiple
              />
              <label
                htmlFor='hero-upload'
                className={`block w-full h-full cursor-pointer group/upload ${
                  imagePreviews.length >= 3
                    ? 'cursor-not-allowed opacity-50'
                    : ''
                }`}
              >
                <div className='w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-zinc-900/50 flex flex-col items-center justify-center relative transition-all hover:bg-zinc-800/50'>
                  {imagePreviews.length > 0 ? (
                    <>
                      <img
                        src={imagePreviews[currentImageIndex]?.url}
                        alt='Event Poster'
                        className='w-full h-full object-cover'
                      />

                      {imagePreviews.length > 1 && (
                        <>
                          <div className='absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 sm:hidden'>
                            {imagePreviews.map((_, index) => (
                              <button
                                key={index}
                                type='button'
                                onClick={e => {
                                  e.preventDefault()
                                  setCurrentImageIndex(index)
                                }}
                                className={`w-2 h-2 rounded-full transition-all ${
                                  index === currentImageIndex
                                    ? 'bg-white'
                                    : 'bg-white/40'
                                }`}
                              />
                            ))}
                          </div>

                          <button
                            type='button'
                            onClick={e => {
                              e.preventDefault()
                              setCurrentImageIndex(prev =>
                                prev > 0 ? prev - 1 : imagePreviews.length - 1
                              )
                            }}
                            className='absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center sm:hidden'
                          >
                            ‹
                          </button>
                          <button
                            type='button'
                            onClick={e => {
                              e.preventDefault()
                              setCurrentImageIndex(prev =>
                                prev < imagePreviews.length - 1 ? prev + 1 : 0
                              )
                            }}
                            className='absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center sm:hidden'
                          >
                            ›
                          </button>
                        </>
                      )}

                      <div className='absolute inset-0 bg-black/40 opacity-0 group-hover/upload:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm'>
                        <div className='text-center'>
                          <Upload className='h-8 w-8 text-white mx-auto mb-2' />
                          <p className='text-white text-sm font-medium'>
                            {imagePreviews.length < 3
                              ? 'Add More Images'
                              : 'Maximum Reached'}
                          </p>
                          <p className='text-white/70 text-xs'>
                            {imagePreviews.length}/3 images
                          </p>
                        </div>
                      </div>

                      <div className='absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-md text-xs font-medium'>
                        {imagePreviews.length}/3
                      </div>
                    </>
                  ) : (
                    <div className='text-center p-6'>
                      <div className='w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10 group-hover/upload:scale-110 transition-transform'>
                        <Upload className='h-8 w-8 text-zinc-400' />
                      </div>
                      <p className='text-zinc-300 text-lg font-medium mb-1'>
                        Upload Images
                      </p>
                      <p className='text-zinc-500 text-xs'>
                        Select one or multiple images
                        <br />
                        Up to 3 images, Max 2MB each
                      </p>
                    </div>
                  )}
                </div>
              </label>

              {/* Image Management (Desktop) */}
              {imagePreviews.length > 0 && (
                <div className='hidden sm:flex gap-2 mt-3 justify-center'>
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className='relative group/thumb'>
                      <img
                        src={preview.url}
                        alt={`Preview ${index + 1}`}
                        className={`w-12 h-12 object-cover rounded-lg cursor-pointer border-2 transition-all ${
                          index === currentImageIndex
                            ? 'border-primary'
                            : 'border-white/20 hover:border-white/40'
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                      <button
                        type='button'
                        onClick={() => removeImage(index)}
                        className='absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover/thumb:opacity-100 transition-opacity'
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {imagePreviews.length < 3 && (
                    <label
                      htmlFor='hero-upload'
                      className='w-12 h-12 border-2 border-dashed border-white/30 hover:border-white/50 rounded-lg flex items-center justify-center cursor-pointer transition-all hover:bg-white/5'
                    >
                      <Plus className='h-5 w-5 text-white/60' />
                    </label>
                  )}
                </div>
              )}
            </div>

            {/* Title & Tagline Inputs */}
            <div className='flex-1 w-full space-y-4 pb-2'>
              <div className='w-fit'>
                <select
                  name='category_id'
                  value={formData.category_id}
                  onChange={handleInputChange}
                  required
                  className='px-4 py-2 rounded-full text-sm font-medium bg-white/5 text-zinc-300 border border-white/10 focus:outline-none focus:bg-white/10 focus:border-white/20 appearance-none cursor-pointer hover:bg-white/10 transition-colors min-w-0 w-auto'
                  style={{ width: 'auto', minWidth: '120px' }}
                >
                  <option value='' className='bg-zinc-900 text-zinc-500'>
                    Select Category
                  </option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id} className='bg-zinc-900'>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <input
                type='text'
                name='title'
                value={formData.title}
                onChange={handleInputChange}
                required
                className='w-full bg-transparent text-2xl md:text-3xl font-bold text-white tracking-tight placeholder:text-zinc-600 focus:outline-none border-b border-transparent focus:border-zinc-700 transition-all pb-2'
                placeholder='Event Title'
              />

              <div className='relative'>
                <input
                  type='text'
                  name='short_description'
                  value={formData.short_description}
                  onChange={handleInputChange}
                  maxLength='50'
                  required
                  className='w-full bg-transparent text-lg text-zinc-300 placeholder:text-zinc-600 focus:outline-none border-b border-transparent focus:border-zinc-700 transition-all pb-2 pr-12'
                  placeholder='Summarize your event in a few words...'
                />
                <span className='absolute right-0 bottom-2 text-xs text-zinc-500'>
                  {formData.short_description.length}/50
                </span>
              </div>
            </div>
          </div>
        </div>

        {imagePreviews.length > 0 && (
          <div className='bg-zinc-900/50 border border-white/5 rounded-xl p-4'>
            <div className='flex items-center justify-between mb-3'>
              <h4 className='text-sm font-medium text-white'>Cover Image</h4>
              <span className='text-xs text-zinc-500'>
                Click on any image to set as cover
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
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
          {/* Left Column: Details & Tickets */}
          <div className='lg:col-span-8 space-y-8'>
            {/* Description Editor */}
            <div className='space-y-4'>
              <h3 className='text-xl font-semibold text-white flex items-center gap-2'>
                About Event
              </h3>
              <div className='bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden focus-within:ring-1 focus-within:ring-zinc-700 transition-all'>
                <div className='quill-wrapper-minimal'>
                  <ReactQuill
                    theme='snow'
                    value={formData.description}
                    onChange={value =>
                      setFormData(prev => ({ ...prev, description: value }))
                    }
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder='Tell the story of your event...'
                    className='text-zinc-300'
                  />
                </div>
              </div>
            </div>

            {/* Highlights & Lineup */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='bg-zinc-900 border border-zinc-800 rounded-xl p-6'>
                <div className='flex items-center justify-between mb-4'>
                  <div className='flex items-center gap-2 text-white font-medium'>
                    <Sparkles className='h-4 w-4 text-yellow-500' />
                    <span>
                      Highlights{' '}
                      <span className='text-xs text-zinc-500 font-normal'>
                        (Optional)
                      </span>
                    </span>
                  </div>
                  <span className='text-xs text-zinc-500'>
                    {formData.event_highlights.length}/5
                  </span>
                </div>
                <input
                  type='text'
                  value={highlightInput}
                  onChange={e =>
                    handleArrayInput(e, setHighlightInput, 'event_highlights')
                  }
                  onKeyDown={e =>
                    e.key === 'Enter' &&
                    (e.preventDefault(),
                    addArrayItem(
                      highlightInput,
                      setHighlightInput,
                      'event_highlights'
                    ))
                  }
                  className='w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500 mb-3 placeholder:text-zinc-600'
                  placeholder='Type & press Enter...'
                  disabled={formData.event_highlights.length >= 5}
                />
                <div className='flex flex-wrap gap-2'>
                  {formData.event_highlights.map((highlight, index) => (
                    <span
                      key={index}
                      className='inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-800 text-xs text-zinc-300 border border-zinc-700'
                    >
                      {highlight}
                      <X
                        className='h-3 w-3 cursor-pointer hover:text-white'
                        onClick={() =>
                          removeArrayItem(index, 'event_highlights')
                        }
                      />
                    </span>
                  ))}
                </div>
              </div>

              <div className='bg-zinc-900 border border-zinc-800 rounded-xl p-6'>
                <div className='flex items-center gap-2 mb-4 text-white font-medium'>
                  <Users className='h-4 w-4 text-blue-500' />
                  <span>
                    Lineup / Artists{' '}
                    <span className='text-xs text-zinc-500 font-normal'>
                      (Optional)
                    </span>
                  </span>
                </div>
                <input
                  type='text'
                  value={lineupInput}
                  onChange={e => handleArrayInput(e, setLineupInput, 'lineup')}
                  onKeyDown={e =>
                    e.key === 'Enter' &&
                    (e.preventDefault(),
                    addArrayItem(lineupInput, setLineupInput, 'lineup'))
                  }
                  className='w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500 mb-3 placeholder:text-zinc-600'
                  placeholder='Type & press Enter...'
                />
                <div className='flex flex-wrap gap-2'>
                  {formData.lineup.map((item, index) => (
                    <span
                      key={index}
                      className='inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-800 text-xs text-zinc-300 border border-zinc-700'
                    >
                      {item}
                      <X
                        className='h-3 w-3 cursor-pointer hover:text-white'
                        onClick={() => removeArrayItem(index, 'lineup')}
                      />
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Tickets Section */}
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <h3 className='text-xl font-semibold text-white flex items-center gap-2'>
                  {formData.event_type === 'ticketed'
                    ? 'Tickets'
                    : 'Event Link'}
                </h3>
                {formData.event_type === 'ticketed' && (
                  <Button
                    type='button'
                    onClick={() =>
                      setTickets([
                        ...tickets,
                        {
                          name: '',
                          type: 'single',
                          price: '',
                          quantity: '',
                          group_size: '',
                          description: '',
                          status: 'Available',
                          sales_status: 'open',
                          sale_starts_at: null,
                          sale_ends_at: null
                        }
                      ])
                    }
                    size='sm'
                    className='bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700'
                  >
                    <Plus className='h-4 w-4 mr-2' />
                    Add Ticket Type
                  </Button>
                )}
              </div>

              {formData.event_type === 'ticketed' && (
                <div className='bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-5'>
                  <h4 className='text-sm font-medium text-zinc-200 mb-3'>
                    Currency
                  </h4>
                  <select
                    name='currency'
                    value={formData.currency}
                    onChange={handleInputChange}
                    className='w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary'
                  >
                    <option value='KES'>KES - Kenyan Shilling</option>
                    <option value='USD'>USD - US Dollar</option>
                    <option value='EUR'>EUR - Euro</option>
                    <option value='GBP'>GBP - British Pound</option>
                  </select>
                </div>
              )}

              {formData.event_type === 'promotional' ? (
                <div className='bg-zinc-900 border border-zinc-800 rounded-xl p-6 sm:p-8 text-center space-y-3 sm:space-y-4'>
                  <div className='h-12 w-12 sm:h-16 sm:w-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-2'>
                    <ExternalLink className='h-6 w-6 sm:h-8 sm:w-8' />
                  </div>
                  <div className='max-w-md mx-auto'>
                    <h3 className='text-base sm:text-lg font-medium text-white mb-1 sm:mb-2'>
                      External Event Details
                    </h3>
                    <p className='text-xs sm:text-sm text-zinc-400 mb-4 sm:mb-6'>
                      Add the external link and pricing information for
                      promotional display.
                    </p>

                    <div className='grid grid-cols-2 gap-3 mb-4'>
                      <div>
                        <label className='text-xs text-zinc-500 uppercase font-medium mb-2 block'>
                          Price From
                        </label>
                        <input
                          type='number'
                          name='price_from'
                          value={formData.price_from}
                          onChange={handleInputChange}
                          placeholder='0.00'
                          className='w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500'
                        />
                      </div>
                      <div>
                        <label className='text-xs text-zinc-500 uppercase font-medium mb-2 block'>
                          Currency
                        </label>
                        <select
                          name='currency'
                          value={formData.currency}
                          onChange={handleInputChange}
                          className='w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500'
                        >
                          <option value='KES'>KES</option>
                          <option value='USD'>USD</option>
                          <option value='EUR'>EUR</option>
                          <option value='GBP'>GBP</option>
                        </select>
                      </div>
                    </div>

                    <div className='relative'>
                      <ExternalLink className='absolute left-3 sm:left-4 top-3 sm:top-3.5 h-4 w-4 sm:h-5 sm:w-5 text-zinc-500' />
                      <input
                        type='url'
                        name='external_link'
                        value={formData.external_link}
                        onChange={handleInputChange}
                        placeholder='https://example.com/event-registration'
                        className='w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-black/20 border border-zinc-700 rounded-lg text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-zinc-600 transition-all'
                        required
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className='grid grid-cols-1 gap-4'>
                  {tickets.map((ticket, index) => (
                    <div
                      key={index}
                      className={`group bg-zinc-900/80 border border-zinc-800/60 rounded-xl overflow-hidden hover:border-zinc-700 transition-all duration-200 ${
                        ticket.status === 'Sold Out' ? 'opacity-75' : ''
                      }`}
                    >
                      {/* Header */}
                      <div className='flex items-center justify-between gap-4 p-4 bg-zinc-800/30 border-b border-zinc-800/60'>
                        <div className='flex items-center gap-3 flex-1 min-w-0'>
                          <div className='w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0'>
                            <Ticket className='h-4 w-4' />
                          </div>
                          <div className='flex-1 min-w-0'>
                            <input
                              type='text'
                              value={ticket.name}
                              onChange={e =>
                                updateTicket(index, 'name', e.target.value)
                              }
                              className='w-full bg-zinc-800/50 hover:bg-zinc-800 focus:bg-zinc-800 text-base font-semibold text-white placeholder:text-zinc-500 focus:outline-none rounded-lg px-3 py-2 border border-transparent focus:border-primary/50 transition-all duration-200'
                              placeholder='Enter ticket name...'
                              required
                            />
                          </div>
                        </div>
                        <div className='flex items-center gap-2 flex-shrink-0'>
                          <select
                            value={ticket.type}
                            onChange={e =>
                              updateTicket(index, 'type', e.target.value)
                            }
                            className='bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs font-medium text-zinc-300 focus:outline-none focus:border-primary/50 transition-colors cursor-pointer appearance-none'
                          >
                            <option value='single'>Single</option>
                            <option value='group'>Group</option>
                            <option value='free'>Free</option>
                          </select>
                          {ticket.id && (
                            <span className='text-xs text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded'>
                              ID: {ticket.id}
                            </span>
                          )}
                          {tickets.length > 1 && (
                            <button
                              type='button'
                              onClick={() => {
                                const newTickets = tickets.filter(
                                  (_, i) => i !== index
                                )
                                setTickets(newTickets)
                              }}
                              className='p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors'
                            >
                              <X className='h-4 w-4' />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Body */}
                      <div className='p-4 space-y-4'>
                        <input
                          type='text'
                          value={ticket.description}
                          onChange={e =>
                            updateTicket(index, 'description', e.target.value)
                          }
                          className='w-full bg-zinc-800/30 hover:bg-zinc-800/50 focus:bg-zinc-800/50 text-sm text-zinc-400 placeholder:text-zinc-600 focus:outline-none rounded-lg px-3 py-2 border border-transparent focus:border-zinc-700 transition-all duration-200'
                          placeholder='Brief description of this ticket tier...'
                        />

                        <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
                          <div className='bg-zinc-800/30 rounded-lg p-3 border border-zinc-800/50'>
                            <label className='block text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-1'>
                              Price ({formData.currency})
                            </label>
                            {ticket.type === 'free' ? (
                              <span className='text-sm font-bold text-emerald-400'>
                                FREE
                              </span>
                            ) : (
                              <input
                                type='number'
                                value={ticket.price}
                                onChange={e =>
                                  updateTicket(index, 'price', e.target.value)
                                }
                                className='w-full bg-zinc-800/50 hover:bg-zinc-800 focus:bg-zinc-800 text-sm font-bold text-white placeholder:text-zinc-600 focus:outline-none rounded-lg px-3 py-2 border border-transparent focus:border-primary/50 transition-all duration-200'
                                placeholder='0.00'
                                required
                              />
                            )}
                          </div>

                          <div className='bg-zinc-800/30 rounded-lg p-3 border border-zinc-800/50'>
                            <label className='block text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-1'>
                              Capacity
                            </label>
                            <input
                              type='number'
                              value={ticket.quantity}
                              onChange={e =>
                                updateTicket(index, 'quantity', e.target.value)
                              }
                              className='w-full bg-zinc-800/50 hover:bg-zinc-800 focus:bg-zinc-800 text-sm font-bold text-white placeholder:text-zinc-600 focus:outline-none rounded-lg px-3 py-2 border border-transparent focus:border-primary/50 transition-all duration-200'
                              placeholder='Total'
                              required
                            />
                          </div>

                          {ticket.type === 'group' && (
                            <div className='bg-zinc-800/30 rounded-lg p-3 border border-zinc-800/50'>
                              <label className='block text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-1'>
                                Group Size
                              </label>
                              <div className='flex items-center gap-2'>
                                <Users className='h-3.5 w-3.5 text-zinc-500 flex-shrink-0' />
                                <input
                                  type='number'
                                  value={ticket.group_size}
                                  onChange={e =>
                                    updateTicket(
                                      index,
                                      'group_size',
                                      e.target.value
                                    )
                                  }
                                  className='flex-1 bg-zinc-800/50 hover:bg-zinc-800 focus:bg-zinc-800 text-sm font-bold text-white placeholder:text-zinc-600 focus:outline-none rounded-lg px-3 py-2 border border-transparent focus:border-primary/50 transition-all duration-200'
                                  placeholder='Min'
                                  required
                                />
                              </div>
                            </div>
                          )}

                          <div className='bg-zinc-800/30 rounded-lg p-3 border border-zinc-800/50'>
                            <label className='block text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-1'>
                              Status
                            </label>
                            <span
                              className={`text-sm font-bold ${
                                ticket.status === 'Sold Out'
                                  ? 'text-red-400'
                                  : 'text-emerald-400'
                              }`}
                            >
                              {ticket.status || 'Available'}
                            </span>
                          </div>
                        </div>

                        {/* 🆕 SALES CONTROLS SECTION */}
                        <div className='border-t border-zinc-800/50 pt-4 space-y-4'>
                          {/* Sales Status Toggle */}
                          <div className='flex items-center justify-between'>
                            <label className='text-sm text-zinc-300 font-medium'>
                              Sales Status
                            </label>
                            <div className='flex items-center gap-3'>
                              <button
                                type='button'
                                onClick={() =>
                                  updateTicket(index, 'sales_status', 'open')
                                }
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                  ticket.sales_status !== 'closed'
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                                }`}
                              >
                                Available
                              </button>
                              <button
                                type='button'
                                onClick={() =>
                                  updateTicket(index, 'sales_status', 'closed')
                                }
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                  ticket.sales_status === 'closed'
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                                }`}
                              >
                                Sales Closed
                              </button>
                            </div>
                          </div>

                          {/* Sale Period */}
                          <div className='space-y-3'>
                            <label className='text-sm text-zinc-300 font-medium block'>
                              Sale Period
                            </label>
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                              <div>
                                <label className='block text-[10px] text-zinc-500 uppercase tracking-wider mb-1'>
                                  Start
                                </label>
                                <div className='flex items-center gap-2 bg-zinc-800/30 rounded-lg p-2 border border-zinc-800/50'>
                                  <Calendar className='h-4 w-4 text-zinc-500 flex-shrink-0' />
                                  <input
                                    type='datetime-local'
                                    value={ticket.sale_starts_at || ''}
                                    onChange={e =>
                                      updateTicket(
                                        index,
                                        'sale_starts_at',
                                        e.target.value
                                      )
                                    }
                                    className='flex-1 bg-transparent text-sm text-white focus:outline-none'
                                  />
                                </div>
                              </div>
                              <div>
                                <label className='block text-[10px] text-zinc-500 uppercase tracking-wider mb-1'>
                                  End
                                </label>
                                <div className='flex items-center gap-2 bg-zinc-800/30 rounded-lg p-2 border border-zinc-800/50'>
                                  <Clock className='h-4 w-4 text-zinc-500 flex-shrink-0' />
                                  <input
                                    type='datetime-local'
                                    value={ticket.sale_ends_at || ''}
                                    onChange={e =>
                                      updateTicket(
                                        index,
                                        'sale_ends_at',
                                        e.target.value
                                      )
                                    }
                                    className='flex-1 bg-transparent text-sm text-white focus:outline-none'
                                  />
                                </div>
                              </div>
                            </div>
                            <p className='text-[10px] text-zinc-500'>
                              Leave empty for no start/end restriction
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Sidebar */}
          <div className='lg:col-span-4 space-y-6'>
            <div className='sticky top-6 space-y-6'>
              {/* Save Action Card - Hidden on mobile */}
              <div className='hidden lg:block bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='font-semibold text-white'>Save Changes</h3>
                  <div className='h-2 w-2 rounded-full bg-emerald-500 animate-pulse' />
                </div>
                <Button
                  type='submit'
                  className='w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-lg rounded-xl'
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className='h-5 w-5 animate-spin mr-2' />{' '}
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className='h-5 w-5 mr-2' /> Update Event
                    </>
                  )}
                </Button>
                <div className='mt-4 pt-4 border-t border-white/5 space-y-3'>
                  <label className='flex items-center justify-between cursor-pointer group'>
                    <span className='text-sm text-zinc-400 group-hover:text-zinc-300'>
                      Enable Affiliate Marketing
                    </span>
                    <input
                      type='checkbox'
                      name='affiliate_enabled'
                      checked={formData.affiliate_enabled}
                      onChange={handleInputChange}
                      className='accent-emerald-500 h-4 w-4 rounded'
                    />
                  </label>
                  {formData.affiliate_enabled && (
                    <label className='flex items-center justify-between cursor-pointer group ml-2'>
                      <span className='text-xs text-zinc-500 group-hover:text-zinc-400'>
                        ↳ Auto-approve affiliates
                      </span>
                      <input
                        type='checkbox'
                        name='affiliate_auto_approve'
                        checked={formData.affiliate_auto_approve}
                        onChange={handleInputChange}
                        className='accent-emerald-500 h-3.5 w-3.5 rounded'
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Date & Time Card */}
              <div className='bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden'>
                <div className='p-4 bg-zinc-800/50 border-b border-white/5'>
                  <h3 className='font-semibold text-white flex items-center gap-2'>
                    <Calendar className='h-4 w-4 text-zinc-400' />
                    Date & Time
                  </h3>
                </div>
                <div className='p-5 space-y-4'>
                  <div className='space-y-2'>
                    <label className='text-xs text-zinc-500 uppercase font-medium'>
                      Starts
                    </label>
                    <div className='grid grid-cols-2 gap-2'>
                      <input
                        type='date'
                        name='from'
                        value={formData.from}
                        onChange={handleInputChange}
                        className='bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary'
                        required
                      />
                      <input
                        type='time'
                        name='from_time'
                        value={formData.from_time}
                        onChange={handleInputChange}
                        className='bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary'
                        required
                      />
                    </div>
                  </div>

                  <div className='relative pl-4 space-y-2 border-l border-zinc-800'>
                    <label className='text-xs text-zinc-500 uppercase font-medium'>
                      Ends
                    </label>
                    <div className='grid grid-cols-2 gap-2'>
                      <input
                        type='date'
                        name='to'
                        value={formData.to}
                        onChange={handleInputChange}
                        min={formData.from}
                        className='bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary'
                        required
                      />
                      <input
                        type='time'
                        name='to_time'
                        value={formData.to_time}
                        onChange={handleInputChange}
                        className='bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary'
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Card (with map picker + lat/lng) */}
              <LocationCard
                formData={formData}
                handleInputChange={handleInputChange}
                handleLocationSelect={handleLocationSelect}
              />

              {/* Event Type Card */}
              <div className='bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden'>
                <div className='p-4 bg-zinc-800/50 border-b border-white/5'>
                  <h3 className='font-semibold text-white flex items-center gap-2'>
                    <Ticket className='h-4 w-4 text-zinc-400' />
                    Event Type
                  </h3>
                </div>
                <div className='p-5 space-y-3'>
                  <div className='space-y-2'>
                    <label className='flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-zinc-800 transition-colors border border-zinc-700 hover:border-primary'>
                      <input
                        type='radio'
                        name='event_type'
                        value='ticketed'
                        checked={formData.event_type === 'ticketed'}
                        onChange={handleInputChange}
                        className='accent-primary h-4 w-4'
                      />
                      <div className='flex-1'>
                        <p className='text-sm font-medium text-white'>
                          Ticketed Event
                        </p>
                        <p className='text-xs text-zinc-500'>
                          Sell tickets and collect payments
                        </p>
                      </div>
                    </label>

                    <label className='flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-zinc-800 transition-colors border border-zinc-700 hover:border-primary'>
                      <input
                        type='radio'
                        name='event_type'
                        value='promotional'
                        checked={formData.event_type === 'promotional'}
                        onChange={handleInputChange}
                        className='accent-primary h-4 w-4'
                      />
                      <div className='flex-1'>
                        <p className='text-sm font-medium text-white'>
                          Promotional Event
                        </p>
                        <p className='text-xs text-zinc-500'>
                          Share event info with external link
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Organizer Card */}
              <div className='bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden'>
                <div className='p-4 bg-zinc-800/50 border-b border-white/5'>
                  <h3 className='font-semibold text-white flex items-center gap-2'>
                    <UserCircle className='h-4 w-4 text-zinc-400' />
                    Organizer
                  </h3>
                </div>
                <div className='p-5 space-y-3'>
                  <input
                    type='text'
                    name='owner'
                    value={formData.owner}
                    onChange={handleInputChange}
                    placeholder='Organizer Name'
                    className='w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary'
                    required
                  />
                  <input
                    type='email'
                    name='email'
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder='Contact Email'
                    className='w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary'
                    required
                  />
                  <input
                    type='tel'
                    name='phoneNo'
                    value={formData.phoneNo}
                    onChange={handleInputChange}
                    placeholder='Contact Phone'
                    className='w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary'
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Update Button */}
        <div className='lg:hidden fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur-sm border-t border-zinc-800 p-4 z-50'>
          <Button
            type='submit'
            className='w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 text-base rounded-xl'
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className='h-5 w-5 animate-spin mr-2' /> Updating...
              </>
            ) : (
              <>
                <Save className='h-5 w-5 mr-2' /> Update Event
              </>
            )}
          </Button>
        </div>
      </form>
    </DashboardLayout>
  )
}

export default EditEventPage

// Inject shared styles for Quill Editor
if (typeof document !== 'undefined') {
  const styleId = 'quill-minimal-dark-theme'
  if (!document.getElementById(styleId)) {
    const styleElement = document.createElement('style')
    styleElement.id = styleId
    styleElement.textContent = `
      .quill-wrapper-minimal .ql-toolbar {
        border: none !important;
        border-bottom: 1px solid rgba(255,255,255,0.05) !important;
        padding: 12px 16px;
      }
      .quill-wrapper-minimal .ql-container {
        border: none !important;
        font-family: inherit;
        font-size: 0.95rem;
      }
      .quill-wrapper-minimal .ql-editor {
        min-height: 200px;
        padding: 16px;
      }
      .quill-wrapper-minimal .ql-editor.ql-blank::before {
        color: #52525b;
        font-style: normal;
      }
      .quill-wrapper-minimal .ql-stroke { stroke: #a1a1aa; }
      .quill-wrapper-minimal .ql-fill { fill: #a1a1aa; }
      .quill-wrapper-minimal .ql-picker-label { color: #a1a1aa; }
      
      .quill-wrapper-minimal .ql-active .ql-stroke { stroke: #dc2626 !important; }
      .quill-wrapper-minimal .ql-active .ql-fill { fill: #dc2626 !important; }

      input[type="date"]::-webkit-calendar-picker-indicator,
      input[type="time"]::-webkit-calendar-picker-indicator {
        filter: invert(1);
        cursor: pointer;
        opacity: 0.8;
      }
      input[type="date"]::-webkit-calendar-picker-indicator:hover,
      input[type="time"]::-webkit-calendar-picker-indicator:hover {
        opacity: 1;
      }
    `
    document.head.appendChild(styleElement)
  }
}
