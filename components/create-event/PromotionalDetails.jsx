"use client"

import { ExternalLink } from 'lucide-react'

const PromotionalDetails = ({ formData, handleInputChange }) => {
  return (
    <div className='bg-zinc-900 border border-zinc-800 rounded-xl p-6 sm:p-8 text-center space-y-3 sm:space-y-4'>
      <div className='h-12 w-12 sm:h-16 sm:w-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-2'>
        <ExternalLink className='h-6 w-6 sm:h-8 sm:w-8' />
      </div>
      <div className='max-w-md mx-auto'>
        <h3 className='text-base sm:text-lg font-medium text-white mb-1 sm:mb-2'>
          External Event Details
        </h3>
        <p className='text-xs sm:text-sm text-zinc-400 mb-4 sm:mb-6'>
          Add the external link and pricing information for promotional
          display.
        </p>

        {/* Price Information */}
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

        {/* External Link */}
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
  )
}

export default PromotionalDetails
