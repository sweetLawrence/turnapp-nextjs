"use client"

import { Plus, Upload } from 'lucide-react'

/**
 * Top hero block: blurred background from the current image, the image
 * upload/carousel box, and the category select + title + tagline fields.
 */
const EventHeroSection = ({
  imagePreviews,
  currentImageIndex,
  setCurrentImageIndex,
  handleImageChange,
  removeImage,
  categories,
  formData,
  handleInputChange
}) => {
  return (
    <div className='relative group rounded-2xl sm:rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-xl transition-all hover:border-zinc-700'>
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

      <div className='relative z-10 flex flex-col md:flex-row gap-6 sm:gap-8 p-4 sm:p-6 md:p-10 items-end'>
        {/* Image Upload Box */}
        <div className='w-full md:w-[350px] aspect-video md:aspect-square flex-shrink-0'>
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
              imagePreviews.length >= 3 ? 'cursor-not-allowed opacity-50' : ''
            }`}
          >
            <div className='w-full h-full rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-zinc-900/50 flex flex-col items-center justify-center relative transition-all hover:bg-zinc-800/50'>
              {imagePreviews.length > 0 ? (
                <>
                  {/* Main Image Display */}
                  <img
                    src={imagePreviews[currentImageIndex]?.url}
                    alt='Event Poster'
                    className='w-full h-full object-cover'
                  />

                  {/* Image Navigation for Mobile (Slideshow) */}
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

                      {/* Navigation Arrows for Mobile */}
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

                  {/* Upload More/Change Button */}
                  <div className='absolute inset-0 bg-black/40 opacity-0 group-hover/upload:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm'>
                    <div className='text-center'>
                      <Upload className='h-6 w-6 sm:h-8 sm:w-8 text-white mx-auto mb-2' />
                      <p className='text-white text-xs sm:text-sm font-medium'>
                        {imagePreviews.length < 3
                          ? 'Add More Images'
                          : 'Maximum Reached'}
                      </p>
                      <p className='text-white/70 text-[10px] sm:text-xs'>
                        {imagePreviews.length}/3 images
                      </p>
                    </div>
                  </div>

                  {/* Image Counter */}
                  <div className='absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-md text-xs font-medium'>
                    {imagePreviews.length}/3
                  </div>
                </>
              ) : (
                <div className='text-center p-4 sm:p-6'>
                  <div className='w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-white/10 group-hover/upload:scale-110 transition-transform'>
                    <Upload className='h-6 w-6 sm:h-8 sm:w-8 text-zinc-400' />
                  </div>
                  <p className='text-zinc-300 text-sm sm:text-lg font-medium mb-1'>
                    Upload Images
                  </p>
                  <p className='text-zinc-500 text-[10px] sm:text-xs'>
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

              {/* Add More Button */}
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
        <div className='flex-1 w-full space-y-3 sm:space-y-4 pb-0 sm:pb-2'>
          <div className='w-full sm:w-fit'>
            <select
              name='category_id'
              value={formData.category_id}
              onChange={handleInputChange}
              required
              className='w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium bg-white/5 text-zinc-300 border border-white/10 focus:outline-none focus:bg-white/10 focus:border-white/20 appearance-none cursor-pointer hover:bg-white/10 transition-colors'
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
            className='w-full bg-transparent text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight placeholder:text-zinc-600 focus:outline-none border-b border-transparent focus:border-zinc-700 transition-all pb-1 sm:pb-2'
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
              className='w-full bg-transparent text-sm sm:text-lg text-zinc-300 placeholder:text-zinc-600 focus:outline-none border-b border-transparent focus:border-zinc-700 transition-all pb-1 sm:pb-2 pr-10 sm:pr-12'
              placeholder='A short, catchy tagline...'
            />
            <span className='absolute right-0 bottom-1 sm:bottom-2 text-[10px] sm:text-xs text-zinc-500'>
              {formData.short_description.length}/50
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventHeroSection