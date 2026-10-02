"use client"

import { Calendar } from 'lucide-react'

const DateTimeCard = ({ formData, handleInputChange }) => {
  return (
    <div className='bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden'>
      <div className='p-3 sm:p-4 bg-zinc-800/50 border-b border-white/5'>
        <h3 className='font-semibold text-white flex items-center gap-2 text-sm sm:text-base'>
          <Calendar className='h-4 w-4 text-zinc-400' />
          Date & Time
        </h3>
      </div>
      <div className='p-4 sm:p-5 space-y-4'>
        <div className='space-y-2'>
          <label className='text-[10px] sm:text-xs text-zinc-500 uppercase font-medium'>
            Starts
          </label>
          <div className='grid grid-cols-2 gap-2'>
            <input
              type='date'
              name='from'
              value={formData.from}
              onChange={handleInputChange}
              className='bg-zinc-800 border border-zinc-700 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-primary'
              required
            />
            <input
              type='time'
              name='from_time'
              value={formData.from_time}
              onChange={handleInputChange}
              className='bg-zinc-800 border border-zinc-700 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-primary'
              required
            />
          </div>
        </div>

        <div className='relative pl-3 sm:pl-4 space-y-2 border-l border-zinc-800'>
          <label className='text-[10px] sm:text-xs text-zinc-500 uppercase font-medium'>
            Ends
          </label>
          <div className='grid grid-cols-2 gap-2'>
            <input
              type='date'
              name='to'
              value={formData.to}
              onChange={handleInputChange}
              min={formData.from}
              className='bg-zinc-800 border border-zinc-700 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-primary'
              required
            />
            <input
              type='time'
              name='to_time'
              value={formData.to_time}
              onChange={handleInputChange}
              className='bg-zinc-800 border border-zinc-700 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-primary'
              required
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DateTimeCard
