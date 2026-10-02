"use client"

import { MapPin } from 'lucide-react'
import LocationSearch from '../LocationSearch'

const LocationCard = ({ formData, handleInputChange, handleLocationSelect }) => {
  return (
    <div className='bg-zinc-900 border border-zinc-800 rounded-xl'>
      <div className='p-3 sm:p-4 bg-zinc-800/50 border-b border-white/5'>
        <h3 className='font-semibold text-white flex items-center gap-2 text-sm sm:text-base'>
          <MapPin className='h-4 w-4 text-zinc-400' />
          Location
        </h3>
      </div>
      <div className='p-4 sm:p-5 space-y-3'>
        <div>
          <label className='text-[10px] sm:text-xs text-zinc-500 uppercase font-medium mb-1.5 sm:mb-2 block'>
            Venue Name
          </label>
          <input
            type='text'
            name='location'
            value={formData.location}
            onChange={handleInputChange}
            placeholder='e.g. Nairobi National Stadium'
            className='w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-primary'
            required
          />
        </div>
        <div>
          <label className='text-xs text-zinc-500 uppercase font-medium mb-2 block'>
            Search Location
          </label>
        </div>
        <LocationSearch
          // value={formData.google_maps_location}
           value=""
          onLocationSelect={handleLocationSelect}
        />
        {formData.google_maps_location && (
          <div className='mt-3 rounded-lg border border-zinc-700 bg-zinc-800 p-3 text-sm'>
            <p className='text-zinc-300'>
              <strong>Selected Address:</strong>
            </p>

            <p className='mt-2 text-zinc-400 break-words'>
              {formData.google_maps_location}
            </p>

          </div>
        )}
      </div>
    </div>
  )
}

export default LocationCard
