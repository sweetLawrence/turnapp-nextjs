"use client"

import { Star, StarOff } from 'lucide-react'

const ImageSelector = ({
  images,
  currentIndex,
  setCurrentIndex,
  coverIndex,
  onSelectCover
}) => {
  if (!images || images.length === 0) return null

  return (
    <div className='flex flex-wrap gap-2 mt-3'>
      {images.map((image, index) => (
        <div
          key={index}
          className='relative group cursor-pointer'
          onClick={() => setCurrentIndex(index)}
        >
          {/* Thumbnail */}
          <div
            className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
              index === currentIndex
                ? 'border-primary'
                : 'border-white/10 hover:border-white/30'
            }`}
          >
            <img
              src={image.url}
              alt={`Image ${index + 1}`}
              className='w-full h-full object-cover'
            />
          </div>

          {/* Cover Badge - Shows star on cover image */}
          {index === coverIndex && (
            <div className='absolute -top-1 -right-1 bg-primary text-white rounded-full p-0.5 shadow-lg shadow-primary/30'>
              <Star className='h-3.5 w-3.5 fill-current' />
            </div>
          )}

          {/* Set Cover Button - Appears on hover */}
          <button
            type='button'
            onClick={e => {
              e.stopPropagation()
              onSelectCover(index)
            }}
            className={`absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 hover:opacity-100 transition-opacity rounded-lg ${
              index === coverIndex ? 'border-2 border-primary' : ''
            }`}
          >
            {index === coverIndex ? (
              <span className='text-xs text-white flex items-center gap-1 font-medium'>
                <Star className='h-3 w-3 fill-current' />
                Cover
              </span>
            ) : (
              <span className='text-xs text-white flex items-center gap-1'>
                <Star className='h-3 w-3' />
                Set as Cover
              </span>
            )}
          </button>
        </div>
      ))}
    </div>
  )
}

export default ImageSelector
